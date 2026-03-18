// src/app/api/cron/process-queue/route.ts
// US-006-06: Mesaj kuyruklama ve dağıtım
// Vercel Cron: her dakika çalışır
// vercel.json'a ekleyin: { "crons": [{ "path": "/api/cron/process-queue", "schedule": "* * * * *" }] }

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/crypto";

const BATCH_SIZE = 50;
const MAX_RETRIES = 3;

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = { processed: 0, sent: 0, failed: 0, retried: 0 };

  // 1. Reset stuck "processing" items older than 5 minutes
  await supabaseAdmin
    .from("send_queue")
    .update({ status: "pending", attempts: supabaseAdmin.rpc("increment", { x: 1 }) as any })
    .eq("status", "processing")
    .lt("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .lt("attempts", MAX_RETRIES);

  // 2. Fetch pending batch
  const { data: items, error } = await supabaseAdmin
    .from("send_queue")
    .select("id, campaign_id, subscriber_id, channel, attempts")
    .eq("status", "pending")
    .lte("process_after", new Date().toISOString())
    .lt("attempts", MAX_RETRIES)
    .order("process_after", { ascending: true })
    .limit(BATCH_SIZE);

  if (error || !items?.length) {
    return NextResponse.json({ ...stats, message: "No items to process" });
  }

  // 3. Mark as processing
  const ids = items.map(i => i.id);
  await supabaseAdmin
    .from("send_queue")
    .update({ status: "processing", attempts: 1 })
    .in("id", ids);

  // 4. Process each item
  for (const item of items) {
    stats.processed++;
    try {
      if (item.channel === "whatsapp") {
        await sendWhatsApp(item.campaign_id, item.subscriber_id);
      } else if (item.channel === "email") {
        await sendEmail(item.campaign_id, item.subscriber_id);
      }
      await supabaseAdmin
        .from("send_queue")
        .update({ status: "sent" })
        .eq("id", item.id);
      stats.sent++;
    } catch (err: any) {
      const nextAttempt = item.attempts + 1;
      const shouldRetry = nextAttempt < MAX_RETRIES;

      await supabaseAdmin
        .from("send_queue")
        .update({
          status: shouldRetry ? "pending" : "failed",
          last_error: err.message,
          attempts: nextAttempt,
          process_after: shouldRetry
            ? new Date(Date.now() + nextAttempt * 60 * 1000).toISOString() // exponential backoff
            : new Date().toISOString(),
        })
        .eq("id", item.id);

      if (shouldRetry) stats.retried++;
      else stats.failed++;
    }
  }

  // 5. Update campaign statuses
  await updateCampaignStatuses();

  return NextResponse.json({ ...stats, timestamp: new Date().toISOString() });
}

async function sendWhatsApp(campaignId: string, subscriberId: string) {
  const [campRes, subRes] = await Promise.all([
    supabaseAdmin
      .from("campaigns")
      .select("wa_template_id, wa_vars, tenant_id, wa_templates(name, language)")
      .eq("id", campaignId)
      .single(),
    supabaseAdmin
      .from("subscribers")
      .select("phone, name, consent_type, status")
      .eq("id", subscriberId)
      .single(),
  ]);

  const camp = campRes.data;
  const sub  = subRes.data;

  if (!camp || !sub) throw new Error("Campaign or subscriber not found");
  if (!sub.phone) throw new Error("Subscriber has no phone number");
  if (sub.status !== "active") throw new Error("Subscriber is not active");
  if (sub.consent_type === "withdrawn") throw new Error("Subscriber has withdrawn consent");

  const credsRes = await supabaseAdmin
    .from("whatsapp_credentials")
    .select("phone_number_id, access_token_enc")
    .eq("tenant_id", camp.tenant_id)
    .single();

  const creds = credsRes.data;
  if (!creds) throw new Error("WhatsApp credentials not configured");

  const token = decrypt(creds.access_token_enc);
  const template = (camp as any).wa_templates;
  const vars = (camp.wa_vars || {}) as Record<string, string>;
  const varKeys = Object.keys(vars).sort();

  const components = varKeys.length
    ? [{ type: "body", parameters: varKeys.map(k => ({ type: "text", text: vars[k] || sub.name })) }]
    : [];

  const payload = {
    messaging_product: "whatsapp",
    to: sub.phone.replace(/\s+/g, ""),
    type: "template",
    template: {
      name:     template?.name || camp.wa_template_id,
      language: { code: template?.language || "tr" },
      components,
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${creds.phone_number_id}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Meta API error");

  await supabaseAdmin.from("campaign_events").insert({
    campaign_id:   campaignId,
    subscriber_id: subscriberId,
    channel:       "whatsapp",
    event_type:    "sent",
    meta:          { wa_message_id: data.messages?.[0]?.id },
  });
}

async function sendEmail(campaignId: string, subscriberId: string) {
  const [campRes, subRes] = await Promise.all([
    supabaseAdmin
      .from("campaigns")
      .select("email_subject, email_body, tenant_id, tenants(name)")
      .eq("id", campaignId)
      .single(),
    supabaseAdmin
      .from("subscribers")
      .select("email, name, consent_type, status")
      .eq("id", subscriberId)
      .single(),
  ]);

  const camp = campRes.data;
  const sub  = subRes.data;

  if (!camp || !sub) throw new Error("Campaign or subscriber not found");
  if (!sub.email) throw new Error("Subscriber has no email");
  if (sub.status !== "active") throw new Error("Subscriber is not active");
  if (sub.consent_type === "withdrawn") throw new Error("Subscriber has withdrawn consent");

  const html = (camp.email_body ?? "")
    .replace(/\{\{1\}\}/g, sub.name ?? "")
    .replace(/\n/g, "<br>") +
    `<br><br><hr><p style="font-size:11px;color:#999;">Bu e-postadan çıkmak için <a href="{{unsubscribe_url}}">buraya tıklayın</a>.</p>`;

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: sub.email, name: sub.name }] }],
      from: {
        email: process.env.FROM_EMAIL ?? "bulten@bulletinai.com",
        name: (camp as any).tenants?.name ?? "bulletinAI",
      },
      subject: camp.email_subject ?? "(Konu yok)",
      content: [{ type: "text/html", value: html }],
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking:  { enable: true },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid error: ${err}`);
  }

  await supabaseAdmin.from("campaign_events").insert({
    campaign_id:   campaignId,
    subscriber_id: subscriberId,
    channel:       "email",
    event_type:    "sent",
    meta:          {},
  });
}

async function updateCampaignStatuses() {
  // Find campaigns where all queue items are done
  const { data: sending } = await supabaseAdmin
    .from("campaigns")
    .select("id")
    .eq("status", "sending");

  if (!sending?.length) return;

  for (const camp of sending) {
    const { count: pending } = await supabaseAdmin
      .from("send_queue")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", camp.id)
      .in("status", ["pending", "processing"]);

    if (pending === 0) {
      await supabaseAdmin
        .from("campaigns")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", camp.id);
    }
  }
}
