import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function requireAuth(req: NextRequest) {
  const token =
    req.cookies.get("sb-access-token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return { user: null, error: "Unauthorized", response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "Unauthorized", response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, error: null, response: null };
}
