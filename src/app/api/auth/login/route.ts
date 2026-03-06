// src/app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { json } from "@/middleware/auth";
import { z } from "zod";

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid credentials format" }, 400);

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email:    parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.session) return json({ error: "Invalid email or password" }, 401);

  // Fetch tenants for this user
  const { data: memberships } = await supabaseAdmin
    .from("tenant_members")
    .select("tenant_id, role, tenants(id, name, slug, plan)")
    .eq("user_id", data.user.id);

  return json({
    access_token:  data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in:    data.session.expires_in,
    user: {
      id:    data.user.id,
      email: data.user.email,
    },
    tenants: (memberships ?? []).map((m: any) => ({
      ...m.tenants,
      role: m.role,
    })),
  });
}


// src/app/api/auth/logout/route.ts
// ─────────────────────────────────────────────────────────────
// This lives in the same file for brevity — split to separate
// files when scaffolding the real project.

// import { withAuth, json } from "@/middleware/auth";
// export const POST = withAuth(async (_req, _ctx) => {
//   // Client is responsible for discarding the token.
//   // Server-side: revoke refresh token if needed.
//   return json({ ok: true });
// });


// src/app/api/auth/me/route.ts
// ─────────────────────────────────────────────────────────────
import { withAuth, json as authJson } from "@/middleware/auth";

export const GET = withAuth(async (_req, ctx) => {
  const { data: member } = await ctx.supabase
    .from("tenant_members")
    .select("role, tenants(id, name, slug, plan, plan_status)")
    .eq("user_id", ctx.userId)
    .eq("tenant_id", ctx.tenantId)
    .single();

  return authJson({ userId: ctx.userId, tenantId: ctx.tenantId, ...member });
});
