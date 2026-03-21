// src/app/api/billing/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, json } from "@/middleware/auth";
import { z } from "zod";

const VARIANT_MAP: Record<string, string> = {
  starter: process.env.LEMONSQUEEZY_STARTER_VARIANT!,
  growth:  process.env.LEMONSQUEEZY_GROWTH_VARIANT!,
  scale:   process.env.LEMONSQUEEZY_SCALE_VARIANT!,
};

const CheckoutSchema = z.object({
  plan: z.enum(["starter", "growth", "scale"]),
});

export const POST = withAuth(async (req: NextRequest, ctx) => {
  const body = await req.json().catch(() => null);
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid plan" }, 400);

  const variantId = VARIANT_MAP[parsed.data.plan];
  if (!variantId) return json({ error: "Variant not configured" }, 500);

  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const apiKey  = process.env.LEMONSQUEEZY_API_KEY!;

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
      "Accept": "application/vnd.api+json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: { tenant_id: ctx.tenantId },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://bulletin-ai.vercel.app"}/demo/billing?success=1`,
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: storeId },
          },
          variant: {
            data: { type: "variants", id: variantId },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return json({ error: "Checkout creation failed", detail: err }, 500);
  }

  const data = await res.json();
  const checkoutUrl = data?.data?.attributes?.url;

  return json({ url: checkoutUrl });
});
