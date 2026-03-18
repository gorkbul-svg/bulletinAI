// src/app/api/ai/generate/route.ts
// POST /api/ai/generate
// US-003-01: AI ile bülten içeriği üretimi

import { NextRequest } from "next/server";
import { withAuth, json } from "@/middleware/auth";
import { z } from "zod";

const GenerateSchema = z.object({
  topic:       z.string().min(2).max(200),
  tone:        z.enum(["professional", "friendly", "urgent", "informative", "creative"]).default("professional"),
  length:      z.enum(["short", "medium", "long"]).default("medium"),
  channels:    z.array(z.enum(["whatsapp", "email"])).min(1),
  audience:    z.string().optional(),
  businessName: z.string().optional(),
});

const TONE_PROMPTS: Record<string, string> = {
  professional: "resmi ve profesyonel bir dil kullanarak",
  friendly:     "sıcak, samimi ve arkadaşça bir dil kullanarak",
  urgent:       "aciliyet hissi yaratan, dikkat çekici ve harekete geçirici bir dil kullanarak",
  informative:  "bilgilendirici, açık ve net bir dil kullanarak",
  creative:     "yaratıcı, özgün ve ilgi çekici bir dil kullanarak",
};

const LENGTH_GUIDE: Record<string, string> = {
  short:  "WhatsApp için ideal, maksimum 200 karakter",
  medium: "Her kanal için uygun, 300-500 karakter",
  long:   "E-posta için ideal, 800-1200 karakter",
};

export const POST = withAuth(async (req, ctx) => {
  const body = await req.json().catch(() => null);
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Validation failed", issues: parsed.error.flatten() }, 400);

  const { topic, tone, length, channels, audience, businessName } = parsed.data;

  const results: Record<string, string> = {};

  for (const channel of channels) {
    const isWA = channel === "whatsapp";

    const systemPrompt = `Sen Türkiye'deki işletmeler için ${isWA ? "WhatsApp" : "e-posta"} bülten içeriği üreten uzman bir metin yazarısın. 
${businessName ? `İşletme adı: ${businessName}` : ""}
${audience ? `Hedef kitle: ${audience}` : ""}

Kurallar:
${isWA ? `- WhatsApp mesajı için ${LENGTH_GUIDE[length]} yaz
- WhatsApp formatını kullan: *kalın* için yıldız, emojiler uygun yerlerde
- {{1}} değişkenini alıcı adı için kullan
- Direkt ve öz ol` : `- E-posta içeriği için ${LENGTH_GUIDE[length]} yaz  
- Konu satırı dahil et (Konu: ... formatında)
- HTML yerine düz metin kullan
- {{1}} değişkenini alıcı adı için kullan
- Paragraflar halinde yaz`}
- Türkçe yaz
- Sadece içeriği yaz, açıklama ekleme`;

    const userPrompt = `Konu: "${topic}"
Ton: ${TONE_PROMPTS[tone]}
Kanal: ${isWA ? "WhatsApp" : "E-posta"}

Bu konu için ${isWA ? "WhatsApp bülteni" : "e-posta bülteni"} yaz.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        return json({ error: "AI API error", detail: err?.error?.message }, 500);
      }

      const data = await response.json();
      results[channel] = data.content?.[0]?.text ?? "";
    } catch (e: any) {
      return json({ error: "AI generation failed", detail: e.message }, 500);
    }
  }

  return json({
    success: true,
    content: results,
    metadata: { topic, tone, length, channels, generated_at: new Date().toISOString() },
  });
});
