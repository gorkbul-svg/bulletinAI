// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/demo/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Token'ı cookie'ye yaz — middleware okuyacak
  const response = NextResponse.redirect(new URL(next, req.url));
  response.cookies.set("sb-access-token", data.session.access_token, {
    path: "/",
    maxAge: 3600,
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}
