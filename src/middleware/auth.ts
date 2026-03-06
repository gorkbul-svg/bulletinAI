// src/middleware/auth.ts
// Validates Supabase JWT on every API route and injects { user, tenantId, supabase }

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseForRequest } from "@/lib/supabase";

export interface AuthContext {
  userId:   string;
  tenantId: string;
  role:     string;
  supabase: ReturnType<typeof supabaseForRequest>;
}

type RouteHandler = (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // 1. Extract Bearer token
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return json({ error: "Unauthorized" }, 401);

    // 2. Validate JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return json({ error: "Invalid token" }, 401);

    // 3. Resolve tenantId from header (X-Tenant-Id) or first membership
    let tenantId = req.headers.get("x-tenant-id") ?? "";
    let role     = "member";

    if (tenantId) {
      const { data: membership } = await supabaseAdmin
        .from("tenant_members")
        .select("role")
        .eq("tenant_id", tenantId)
        .eq("user_id", user.id)
        .single();
      if (!membership) return json({ error: "Forbidden" }, 403);
      role = membership.role;
    } else {
      // Auto-resolve: pick user's first tenant
      const { data: memberships } = await supabaseAdmin
        .from("tenant_members")
        .select("tenant_id, role")
        .eq("user_id", user.id)
        .limit(1);
      if (!memberships?.length) return json({ error: "No tenant found" }, 403);
      tenantId = memberships[0].tenant_id;
      role     = memberships[0].role;
    }

    return handler(req, {
      userId:   user.id,
      tenantId,
      role,
      supabase: supabaseForRequest(token),
    });
  };
}

export function requireRole(minRole: "owner" | "admin" | "member") {
  const hierarchy = { owner: 3, admin: 2, member: 1 };
  return (ctx: AuthContext): boolean => hierarchy[ctx.role as keyof typeof hierarchy] >= hierarchy[minRole];
}

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}
