// src/app/api/whatsapp/credentials/verify/route.ts
import { withAuth, json } from "@/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/crypto";

export const POST = withAuth(async (_req, ctx) => {
  const { data: creds } = await supabaseAdmin
    .from("whatsapp_credentials")
    .select("phone_number_id, access_token_enc")
    .eq("tenant_id", ctx.tenantId)
    .single();

  if (!creds) return json({ error: "No credentials saved" }, 404);

  const token = decrypt(creds.access_token_enc);

  const metaRes = await fetch(
    `https://graph.facebook.com/v19.0/${creds.phone_number_id}?fields=display_phone_number,verified_name,quality_rating,messaging_limit_tier`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!metaRes.ok) {
    const err = await metaRes.json();
    return json({ error: "Meta API error", detail: err?.error?.message }, 400);
  }

  const meta = await metaRes.json();

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
