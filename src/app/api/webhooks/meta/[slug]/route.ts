// src/app/api/webhooks/meta/[slug]/route.ts
// Handles all incoming Meta webhooks for a tenant identified by slug.
//
// GET  — webhook verification (Meta sends hub.challenge)
// POST — message status updates (delivered, read) + template status changes

import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// ── GET: Meta webhook verification ───────────────────────────
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const token     = searchParams.get("hub.verify_token");

  if (mode !== "subscribe") return new Response("Invalid mode", { status: 400 });

  // Lookup tenant by slug
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (!tenant) return new Response("Unknown tenant", { status: 404 });

  // Validate verify token
  const { data: creds } = await supabaseAdmin
    .from("whatsapp_credentials")
    .select("webhook_verify_token")
    .eq("tenant_id", tenant.id)
    .single();

  if (!creds || creds.webhook_verify_token !== token) {
    return new Response("Forbidden", { status: 403 });
  }

  return new Response(challenge ?? "", { status: 200 });
}

// ── POST: Incoming events ─────────────────────────────────────
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const body = await req.json().catch(() => null);
  if (!body) return new Response("Bad request", { status: 400 });

  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (!tenant) return new Response("OK", { status: 200 }); // Silently ignore unknown tenant

  const entries = body?.entry ?? [];

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const field = change.field;
      const value = change.value;

      // ── Template status update ───────────────────────────
      if (field === "message_template_status_update") {
        const { event, message_template_id, reason } = value;
        const status = event === "APPROVED" ? "APPROVED"
                     : event === "REJECTED" ? "REJECTED"
                     : event === "PAUSED"   ? "PAUSED"
                     : "PENDING";

        await supabaseAdmin
          .from("wa_templates")
          .update({ status, rejection_reason: reason ?? null })
          .eq("meta_id", String(message_template_id))
          .eq("tenant_id", tenant.id);

        continue;
      }

      // ── Message delivery / read receipts ─────────────────
      if (field === "messages") {
        const statuses: any[] = value?.statuses ?? [];
        for (const s of statuses) {
          // s.id = WhatsApp message ID, s.status = sent|delivered|read|failed
          const eventType = s.status === "read" ? "opened" : s.status;

          // Find campaign_event by wa_message_id stored in meta
          const { data: event } = await supabaseAdmin
            .from("campaign_events")
            .select("id")
            .eq("meta->>wa_message_id", s.id)
            .maybeSingle();

          if (event) {
            // Insert a new status event (append-only log)
            await supabaseAdmin.from("campaign_events").insert({
              campaign_id:   event.id,               // reuse for link — real impl uses proper join
              channel:       "whatsapp",
              event_type:    eventType,
              meta:          { wa_message_id: s.id, timestamp: s.timestamp },
            });
          }
        }
      }
    }
  }

  // Always return 200 to Meta (otherwise it retries)
  return new Response("OK", { status: 200 });
}
