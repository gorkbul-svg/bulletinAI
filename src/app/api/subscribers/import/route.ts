// src/app/api/subscribers/import/route.ts
// POST /api/subscribers/import
// Parses CSV/Excel, validates, saves to subscribers table with consent tracking

import { NextRequest } from "next/server";
import { withAuth, json } from "@/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const RowSchema = z.object({
  name:           z.string().min(1),
  email:          z.string().email().optional().or(z.literal("")),
  phone:          z.string().optional(),
  tags:           z.string().optional(),
  consent_source: z.string().optional(),
  consent_given:  z.string().optional(),
});

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "+90" + digits.slice(1);
  if (digits.startsWith("90")) return "+" + digits;
  if (digits.startsWith("5") && digits.length === 10) return "+90" + digits;
  return digits.length > 6 ? "+" + digits : "";
}

export const POST = withAuth(async (req, ctx) => {
  const formData = await req.formData().catch(() => null);
  if (!formData) return json({ error: "Form data required" }, 400);

  const file = formData.get("file") as File | null;
  const consentSource = (formData.get("consent_source") as string) || "csv_import";

  if (!file) return json({ error: "No file uploaded" }, 400);

  const text = await file.text();
  const rows = parseCSV(text);

  if (!rows.length) return json({ error: "No data rows found" }, 400);

  const results = { imported: 0, skipped: 0, errors: [] as { row: number; reason: string }[] };

  const toInsert: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const parsed = RowSchema.safeParse(row);

    if (!parsed.success) {
      results.errors.push({ row: i + 2, reason: parsed.error.errors[0]?.message ?? "Validation failed" });
      results.skipped++;
      continue;
    }

    const d = parsed.data;

    // At least email or phone required
    if (!d.email && !d.phone) {
      results.errors.push({ row: i + 2, reason: "E-posta veya telefon gerekli" });
      results.skipped++;
      continue;
    }

    const phone = d.phone ? normalizePhone(d.phone) : null;
    const email = d.email || null;

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      results.errors.push({ row: i + 2, reason: `Geçersiz e-posta: ${email}` });
      results.skipped++;
      continue;
    }

    // Validate phone
    if (phone && phone.length < 10) {
      results.errors.push({ row: i + 2, reason: `Geçersiz telefon: ${d.phone}` });
      results.skipped++;
      continue;
    }

    const consentGiven = d.consent_given?.toLowerCase();
    const hasConsent = consentGiven === "evet" || consentGiven === "yes" || consentGiven === "1" || consentGiven === "true";

    const channels: string[] = [];
    if (email) channels.push("email");
    if (phone) channels.push("whatsapp");

    toInsert.push({
      tenant_id:      ctx.tenantId,
      name:           d.name,
      email,
      phone,
      tags:           d.tags ? d.tags.split(";").map((t: string) => t.trim()).filter(Boolean) : [],
      channels,
      status:         "active",
      consent_type:   hasConsent ? "explicit" : "implicit",
      consent_source: d.consent_source || consentSource,
      consent_date:   new Date().toISOString(),
    });
  }

  // Batch upsert in chunks of 100
  const CHUNK = 100;
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const chunk = toInsert.slice(i, i + CHUNK);
    const { error } = await supabaseAdmin
      .from("subscribers")
      .upsert(chunk, {
        onConflict: "tenant_id,email",
        ignoreDuplicates: false,
      });

    if (error) {
      // Try phone conflict upsert
      const { error: err2 } = await supabaseAdmin
        .from("subscribers")
        .upsert(chunk, {
          onConflict: "tenant_id,phone",
          ignoreDuplicates: true,
        });
      if (err2) {
        results.skipped += chunk.length;
        results.errors.push({ row: i + 2, reason: error.message });
        continue;
      }
    }
    results.imported += chunk.length;
  }

  return json({
    success: true,
    imported: results.imported,
    skipped: results.skipped,
    errors: results.errors.slice(0, 20), // max 20 errors
    total: rows.length,
  });
});
