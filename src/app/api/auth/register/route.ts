// src/app/api/auth/register/route.ts
// POST /api/auth/register
// Creates Supabase user + tenant + owner membership in a single transaction

import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { json } from "@/middleware/auth";
import { z } from "zod";

const RegisterSchema = z.object({
  email:        z.string().email(),
  password:     z.string().min(8),
  businessName: z.string().min(2),
  phone:        z.string().optional(),
  sector:       z.string().optional(),
  plan:         z.enum(["starter","growth","scale"]).default("growth"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Validation failed", issues: parsed.error.flatten() }, 400);

  const { email, password, businessName, phone, sector, plan } = parsed.data;

  // 1. Create auth user
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // skip confirmation email in dev; set false in prod
  });
  if (authErr || !user) return json({ error: authErr?.message ?? "User creation failed" }, 400);

  // 2. Generate tenant slug
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    + "-" + Math.random().toString(36).slice(2, 7);

  // 3. Create tenant
  const { data: tenant, error: tenantErr } = await supabaseAdmin
    .from("tenants")
    .insert({ name: businessName, slug, email, phone, sector, plan })
    .select()
    .single();

  if (tenantErr) {
    // Rollback: delete the auth user we just created
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    return json({ error: "Tenant creation failed" }, 500);
  }

  // 4. Create owner membership
  await supabaseAdmin
    .from("tenant_members")
    .insert({ tenant_id: tenant.id, user_id: user.id, role: "owner" });

  return json({ user: { id: user.id, email }, tenant: { id: tenant.id, slug: tenant.slug, plan } }, 201);
}
