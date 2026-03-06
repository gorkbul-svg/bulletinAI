// src/app/api/whatsapp/templates/route.ts
// GET  /api/whatsapp/templates         — list tenant's templates
// POST /api/whatsapp/templates         — create + submit to Meta

import { NextRequest } from "next/server";
import { withAuth, json } from "@/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { decrypt } from "@/lib/crypto";
import { z } from "zod";

const ButtonSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("URL"),         text: z.string(), url: z.string().url() }),
  z.object({ type: z.literal("QUICK_REPLY"), text: z.string() }),
]);

const TemplateSchema = z.object({
  name:     z.string().regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and underscores only"),
  category: z.enum(["MARKETING","UTILITY","AUTHENTICATION"]).default("MARKETING"),
  language: z.string().default("tr"),
  header:   z.object({ type: z.literal("TEXT"), text: z.string().max(60) }).optional(),
  body:     z.string().min(1).max(1024),
  footer:   z.string().max(60).optional(),
  buttons:  z.array(ButtonSchema).max(3).default([]),
});

// ── GET ──────────────────────────────────────────────────────
export const GET = withAuth(async (_req, ctx) => {
  const { data, error } = await ctx.supabase
    .from("wa_templates")
    .select("*")
    .eq("tenant_id", ctx.tenantId)
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);
  return json(data);
});

// ── POST ─────────────────────────────────────────────────────
export const POST = withAuth(async (req, ctx) => {
  const body   = await req.json().catch(() => null);
  const parsed = TemplateSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Validation failed", issues: parsed.error.flatten() }, 400);

  const t = parsed.data;

  // 1. Fetch WA credentials
  const { data: creds } = await supabaseAdmin
    .from("whatsapp_credentials")
    .select("waba_id, access_token_enc")
    .eq("tenant_id", ctx.tenantId)
    .single();

  if (!creds) return json({ error: "WhatsApp credentials not configured" }, 400);

  const token = decrypt(creds.access_token_enc);

  // 2. Build Meta API payload
  const components: object[] = [];
  if (t.header) components.push({ type: "HEADER", format: "TEXT", text: t.header.text });
  components.push({ type: "BODY", text: t.body });
  if (t.footer) components.push({ type: "FOOTER", text: t.footer });
  if (t.buttons.length) {
    components.push({
      type:    "BUTTONS",
      buttons: t.buttons.map(b =>
        b.type === "URL"
          ? { type: "URL",         text: b.text, url: b.url }
          : { type: "QUICK_REPLY", text: b.text }
      ),
    });
  }

  // 3. Submit to Meta
  const metaRes = await fetch(
    `https://graph.facebook.com/v19.0/${creds.waba_id}/message_templates`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ name: t.name, category: t.category, language: t.language, components }),
    }
  );

  const metaData = await metaRes.json();
  if (!metaRes.ok) return json({ error: "Meta submission failed", detail: metaData?.error?.message }, 400);

  // 4. Save to DB
  const { data: template, error: dbErr } = await supabaseAdmin
    .from("wa_templates")
    .insert({
      tenant_id: ctx.tenantId,
      meta_id:   metaData.id,
      name:      t.name,
      category:  t.category,
      language:  t.language,
      header:    t.header ?? null,
      body:      t.body,
      footer:    t.footer ?? null,
      buttons:   t.buttons,
      status:    metaData.status ?? "PENDING",
    })
    .select()
    .single();

  if (dbErr) return json({ error: dbErr.message }, 500);
  return json(template, 201);
});
