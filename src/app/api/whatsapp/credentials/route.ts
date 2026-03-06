// src/app/api/whatsapp/credentials/route.ts
// GET  /api/whatsapp/credentials      — fetch current tenant's WA config
// POST /api/whatsapp/credentials      — save / update credentials
// POST /api/whatsapp/credentials/verify — test connection against Meta API

import { NextRequest } from "next/server";
import { withAuth, json } from "@/middleware/auth";
import { encrypt, decrypt } from "@/lib/crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const CredSchema = z.object({
  phoneNumberId: z.string().min(5),
  wabaId:        z.string().min(5),
  accessToken:   z.string().min(10),
  appId:         z.string().optional(),
});

// ── GET ──────────────────────────────────────────────────────
export const GET = withAuth(async (_req, ctx) => {
  const { data, error } = await ctx.supabase
    .from("whatsapp_credentials")
    .select("id, phone_number_id, waba_id, app_id, display_name, quality_rating, verified_at, webhook_verify_token")
    .eq("tenant_id", ctx.tenantId)
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  return json(data ?? null);
});

// ── POST (save) ───────────────────────────────────────────────
export const POST = withAuth(async (req, ctx) => {
  const body   = await req.json().catch(() => null);
  const parsed = CredSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Validation failed", issues: parsed.error.flatten() }, 400);

  const { phoneNumberId, wabaId, accessToken, appId } = parsed.data;
  const encToken = encrypt(accessToken);

  // Upsert by tenant_id
  const { data, error } = await supabaseAdmin
    .from("whatsapp_credentials")
    .upsert({
      tenant_id:        ctx.tenantId,
      phone_number_id:  phoneNumberId,
      waba_id:          wabaId,
      access_token_enc: encToken,
      app_id:           appId ?? null,
    }, { onConflict: "tenant_id" })
    .select("id, phone_number_id, waba_id, webhook_verify_token")
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data, 201);
});


// src/app/api/whatsapp/credentials/verify/route.ts
// POST — call Meta Graph API to validate credentials
// ─────────────────────────────────────────────────────────────

export const POST_VERIFY = withAuth(async (_req, ctx) => {
  // Fetch stored credentials
  const { data: creds } = await supabaseAdmin
    .from("whatsapp_credentials")
    .select("phone_number_id, access_token_enc")
    .eq("tenant_id", ctx.tenantId)
    .single();

  if (!creds) return json({ error: "No credentials saved" }, 404);

  const token = decrypt(creds.access_token_enc);

  // Call Meta Graph API
  const metaRes = await fetch(
    `https://graph.facebook.com/v19.0/${creds.phone_number_id}?fields=display_phone_number,verified_name,quality_rating,messaging_limit_tier`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!metaRes.ok) {
    const err = await metaRes.json();
    return json({ error: "Meta API error", detail: err?.error?.message }, 400);
  }

  const meta = await metaRes.json();

  // Persist display info
  await supabaseAdmin
    .from("whatsapp_credentials")
    .update({
      display_name:   meta.verified_name,
      quality_rating: meta.quality_rating,
      verified_at:    new Date().toISOString(),
    })
    .eq("tenant_id", ctx.tenantId);

  return json({
    ok:             true,
    display_name:   meta.verified_name,
    phone:          meta.display_phone_number,
    quality_rating: meta.quality_rating,
    messaging_tier: meta.messaging_limit_tier,
  });
});
