// src/app/api/whatsapp/credentials/route.ts
import { NextRequest } from "next/server";
import { withAuth, json } from "@/middleware/auth";
import { encrypt } from "@/lib/crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const CredSchema = z.object({
  phoneNumberId: z.string().min(5),
  wabaId:        z.string().min(5),
  accessToken:   z.string().min(10),
  appId:         z.string().optional(),
});

export const GET = withAuth(async (_req, ctx) => {
  const { data, error } = await ctx.supabase
    .from("whatsapp_credentials")
    .select("id, phone_number_id, waba_id, app_id, display_name, quality_rating, verified_at, webhook_verify_token")
    .eq("tenant_id", ctx.tenantId)
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  return json(data ?? null);
});

export const POST = withAuth(async (req, ctx) => {
  const body   = await req.json().catch(() => null);
  const parsed = CredSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Validation failed", issues: parsed.error.flatten() }, 400);

  const { phoneNumberId, wabaId, accessToken, appId } = parsed.data;
  const encToken = encrypt(accessToken);

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
