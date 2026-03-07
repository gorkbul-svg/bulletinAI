// src/app/api/campaigns/route.ts
// GET  /api/campaigns  — list campaigns
// POST /api/campaigns  — create + enqueue if schedule_type=now

import { NextRequest } from "next/server";
import { withAuth, json } from "@/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const CampaignSchema = z.object({
  name:         z.string().min(1),
  channels:     z.array(z.enum(["whatsapp", "email"])).min(1),
  segmentId:    z.string().uuid().optional(),
  waTemplateId: z.string().uuid().optional(),
  waVars:       z.record(z.string()).default({}),
  emailSubject: z.string().optional(),
  emailBody:    z.string().optional(),
  scheduleType: z.enum(["now", "scheduled", "ai"]).default("now"),
  scheduledAt:  z.string().datetime().optional(),
});

// ── GET ──────────────────────────────────────────────────────
export const GET = withAuth(async (_req, ctx) => {
  const { data, error } = await ctx.supabase
    .from("campaigns")
    .select(`id, name, status, channels, schedule_type, scheduled_at,
             sent_at, recipient_count, created_at,
             segments(name), wa_templates(name)`)
    .eq("tenant_id", ctx.tenantId)
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);
  return json(data);
});

// ── POST ─────────────────────────────────────────────────────
export const POST = withAuth(async (req, ctx) => {
  const body   = await req.json().catch(() => null);
  const parsed = CampaignSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Validation failed", issues: parsed.error.flatten() }, 400);

  const d = parsed.data;

  if (d.channels.includes("whatsapp") && !d.waTemplateId)
    return json({ error: "waTemplateId required for WhatsApp channel" }, 400);
  if (d.channels.includes("email") && (!d.emailSubject || !d.emailBody))
    return json({ error: "emailSubject and emailBody required for email channel" }, 400);

  let scheduledAt: Date | null = d.scheduledAt ? new Date(d.scheduledAt) : null;
  if (d.scheduleType === "ai") scheduledAt = nextWeekday(2, 10, 15);

  const { data: campaign, error: campErr } = await supabaseAdmin
    .from("campaigns")
    .insert({
      tenant_id:      ctx.tenantId,
      name:           d.name,
      channels:       d.channels,
      segment_id:     d.segmentId ?? null,
      wa_template_id: d.waTemplateId ?? null,
      wa_vars:        d.waVars,
      email_subject:  d.emailSubject ?? null,
      email_body:     d.emailBody ?? null,
      schedule_type:  d.scheduleType,
      scheduled_at:   scheduledAt?.toISOString() ?? null,
      status:         d.scheduleType === "now" ? "sending" : "scheduled",
    })
    .select()
    .single();

  if (campErr) return json({ error: campErr.message }, 500);

  if (d.scheduleType === "now") {
    enqueueCampaign(campaign.id, ctx.tenantId, d.segmentId).catch(console.error);
  }

  return json(campaign, 201);
});

// ─────────────────────────────────────────────────────────────
// Send Engine
// ─────────────────────────────────────────────────────────────
async function enqueueCampaign(campaignId: string, tenantId: string, segmentId?: string | null) {
  let query = supabaseAdmin
    .from("subscribers")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("status", "active");

  if (segmentId) {
    const { data: seg } = await supabaseAdmin
      .from("segments").select("rules").eq("id", segmentId).single();
    if (seg?.rules) {
      for (const rule of seg.rules as any[]) {
        if (rule.field === "tags" && rule.op === "contains")
          query = query.contains("tags", [rule.value]);
      }
    }
  }

  const { data: subscribers } = await query;
  if (!subscribers?.length) return;

  const rows = subscribers.map((s: any) => ({
    campaign_id: campaignId, subscriber_id: s.id, channel: "whatsapp", status: "pending",
  }));

  await supabaseAdmin.from("send_queue").insert(rows);
  await supabaseAdmin.from("campaigns").update({ recipient_count: rows.length }).eq("id", campaignId);

  processQueue(campaignId, tenantId).catch(console.error);
}

async function processQueue(campaignId: string, tenantId: string) {
  while (true) {
    const { data: items } = await supabaseAdmin
      .from("send_queue").select("id, subscriber_id, channel")
      .eq("campaign_id", campaignId).eq("status", "pending")
      .lte("process_after", new Date().toISOString()).limit(50);

    if (!items?.length) break;

    const ids = items.map((i: any) => i.id);
    await supabaseAdmin.from("send_queue").update({ status: "processing", attempts: 1 }).in("id", ids);

    for (const item of items) {
      try {
        if (item.channel === "whatsapp") await sendWhatsApp(campaignId, tenantId, item.subscriber_id);
        else await sendEmail(campaignId, tenantId, item.subscriber_id);
        await supabaseAdmin.from("send_queue").update({ status: "sent" }).eq("id", item.id);
      } catch (err: any) {
        await supabaseAdmin.from("send_queue").update({ status: "failed", last_error: err.message }).eq("id", item.id);
      }
    }
    await sleep(650);
  }

  await supabaseAdmin.from("campaigns")
    .update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", campaignId);
}

async function sendWhatsApp(campaignId: string, tenantId: string, subscriberId: string) {
  const [campRes, credsRes, subRes] = await Promise.all([
    supabaseAdmin.from("campaigns").select("wa_template_id, wa_vars").eq("id", campaignId).single(),
    supabaseAdmin.from("whatsapp_credentials").select("phone_number_id, access_token_enc").eq("tenant_id", tenantId).single(),
    supabaseAdmin.from("subscribers").select("phone, name").eq("id", subscriberId).single(),
  ]);

  const camp = campRes.data; const creds = credsRes.data; const sub = subRes.data;
  if (!camp || !creds || !sub?.phone) throw new Error("Missing data for WA send");

  const { decrypt } = await import("@/lib/crypto");
  const token = decrypt(creds.access_token_enc);
  const vars  = camp.wa_vars as Record<string, string>;
  const components = Object.keys(vars).length
    ? [{ type: "body", parameters: Object.keys(vars).sort().map(k => ({ type: "text", text: vars[k] || sub.name })) }]
    : [];

  const res = await fetch(`https://graph.facebook.com/v19.0/${creds.phone_number_id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: "whatsapp", to: sub.phone.replace(/\s+/g, ""),
      type: "template", template: { name: camp.wa_template_id, language: { code: "tr" }, components },
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Meta send failed");

  await supabaseAdmin.from("campaign_events").insert({
    campaign_id: campaignId, subscriber_id: subscriberId,
    channel: "whatsapp", event_type: "sent", meta: { wa_message_id: data.messages?.[0]?.id },
  });
}

async function sendEmail(campaignId: string, tenantId: string, subscriberId: string) {
  const [campRes, subRes, tenantRes] = await Promise.all([
    supabaseAdmin.from("campaigns").select("email_subject, email_body").eq("id", campaignId).single(),
    supabaseAdmin.from("subscribers").select("email, name").eq("id", subscriberId).single(),
    supabaseAdmin.from("tenants").select("name").eq("id", tenantId).single(),
  ]);

  const camp = campRes.data; const sub = subRes.data; const tenant = tenantRes.data;
  if (!camp || !sub?.email) throw new Error("Missing data for email send");

  const html = (camp.email_body ?? "").replace(/\{\{1\}\}/g, sub.name ?? "").replace(/\n/g, "<br>");

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: sub.email, name: sub.name }] }],
      from: { email: process.env.FROM_EMAIL ?? "bulten@bulletinai.com", name: tenant?.name ?? "bulletinAI" },
      subject: camp.email_subject ?? "(No subject)",
      content: [{ type: "text/html", value: html }],
      tracking_settings: { click_tracking: { enable: true }, open_tracking: { enable: true } },
    }),
  });

  if (!res.ok) throw new Error(`SendGrid error: ${await res.text()}`);

  await supabaseAdmin.from("campaign_events").insert({
    campaign_id: campaignId, subscriber_id: subscriberId,
    channel: "email", event_type: "sent", meta: {},
  });
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function nextWeekday(weekday: number, hour: number, minute: number): Date {
  const d = new Date();
  const daysAhead = ((weekday - d.getDay()) + 7) % 7 || 7;
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, minute, 0, 0);
  return d;
}
