// src/app/api/webhooks/lemonsqueezy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import * as crypto from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

const PLAN_MAP: Record<string, string> = {
  [process.env.LEMONSQUEEZY_STARTER_VARIANT!]: "starter",
  [process.env.LEMONSQUEEZY_GROWTH_VARIANT!]:  "growth",
  [process.env.LEMONSQUEEZY_SCALE_VARIANT!]:   "scale",
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventName = event.meta?.event_name;
  const data = event.data?.attributes;
  const customData = event.meta?.custom_data;
  const tenantId = customData?.tenant_id;

  if (!tenantId) {
    return NextResponse.json({ error: "No tenant_id" }, { status: 400 });
  }

  switch (eventName) {
    case "order_created":
    case "subscription_created": {
      const variantId = String(data?.variant_id ?? data?.first_subscription_item?.variant_id ?? "");
      const plan = PLAN_MAP[variantId] ?? "starter";
      const subscriptionId = String(event.data?.id ?? "");
      const customerId = String(data?.customer_id ?? "");

      await supabaseAdmin
        .from("tenants")
        .update({
          plan,
          plan_status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        })
        .eq("id", tenantId);
      break;
    }

    case "subscription_updated": {
      const variantId = String(data?.first_subscription_item?.variant_id ?? "");
      const plan = PLAN_MAP[variantId] ?? "starter";
      const status = data?.status === "active" ? "active" : data?.status === "cancelled" ? "cancelled" : "active";

      await supabaseAdmin
        .from("tenants")
        .update({ plan, plan_status: status })
        .eq("id", tenantId);
      break;
    }

    case "subscription_cancelled":
    case "subscription_expired": {
      await supabaseAdmin
        .from("tenants")
        .update({ plan_status: "cancelled" })
        .eq("id", tenantId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
