"use client";
// src/app/demo/billing/page.tsx

import { useState, useEffect } from "react";

const PLANS = [
  {
    id: "starter", name: "Starter", price: "$9.99", period: "/ay",
    color: "#64748B", abone: "1.000", kanallar: "E-posta",
    features: ["1.000 abone", "Sadece e-posta", "5 kampanya/ay", "Temel analitik"],
  },
  {
    id: "growth", name: "Growth", price: "$24.99", period: "/ay",
    color: "#0EA5E9", abone: "5.000", kanallar: "E-posta + WhatsApp",
    popular: true,
    features: ["5.000 abone", "WhatsApp + E-posta", "Sınırsız kampanya", "Gelişmiş analitik", "Segment oluşturma"],
  },
  {
    id: "scale", name: "Scale", price: "$59.99", period: "/ay",
    color: "#8B5CF6", abone: "25.000", kanallar: "Tümü + AI",
    features: ["25.000 abone", "Tüm kanallar", "AI içerik asistanı", "A/B test", "API erişimi"],
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("growth");

  const token = typeof window !== "undefined"
    ? document.cookie.split(";").find(c => c.trim().startsWith("sb-access-token="))?.split("=")[1]
    : null;

const tenantId = typeof window !== "undefined"
  ? document.cookie.split(";").find(c => c.trim().startsWith("tenant_id="))?.split("=")[1] || ""
  : "";
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "1") setSuccess(true);
    }
  }, []);

 async function handleCheckout(plan: string) {
  setLoading(plan);
  try {
    // Önce tenant ID'yi al
    const meRes = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    const resolvedTenantId = meData.tenantId;

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Tenant-Id": resolvedTenantId,
      },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Checkout oluşturulamadı: " + (data.error || "Bilinmeyen hata"));
    }
  } catch (e: any) {
    alert("Hata: " + e.message);
  }
  setLoading(null);
}
  return (
    <div style={{ padding: "28px 24px", fontFamily: "Calibri, sans-serif", color: "#E2E8F0", minHeight: "100vh", background: "#080810" }}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>💳 Fiyatlandırma</h1>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>İhtiyacınıza uygun planı seçin</p>
      </div>

      {success && (
        <div style={{
          marginBottom: 24, padding: "16px 20px",
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 12, color: "#22C55E", fontSize: 14, fontWeight: 600,
        }}>
          🎉 Ödemeniz başarıyla alındı! Planınız aktive edildi.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 900 }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            padding: "28px 22px", borderRadius: 16, position: "relative",
            background: plan.popular ? `${plan.color}08` : "rgba(255,255,255,0.03)",
            border: `2px solid ${plan.popular ? plan.color + "50" : "rgba(255,255,255,0.08)"}`,
            boxShadow: plan.popular ? `0 0 32px ${plan.color}15` : "none",
            display: "flex", flexDirection: "column",
          }}>
            {plan.popular && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: plan.color, color: "#fff", fontSize: 10, fontWeight: 700,
                padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap",
              }}>
                EN POPÜLER
              </div>
            )}

            <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>{plan.name}</div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: plan.color }}>{plan.price}</span>
              <span style={{ fontSize: 13, color: "#64748B" }}>{plan.period}</span>
            </div>

            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>{plan.abone} abone</div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>{plan.kanallar}</div>

            <div style={{ flex: 1, marginBottom: 20 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "#94A3B8" }}>
                  <span style={{ color: plan.color }}>✓</span> {f}
                </div>
              ))}
            </div>

            {currentPlan === plan.id ? (
              <div style={{
                padding: "12px", borderRadius: 10, textAlign: "center",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#475569", fontSize: 13, fontWeight: 600,
              }}>
                Mevcut Plan
              </div>
            ) : (
              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={!!loading}
                style={{
                  padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: plan.popular ? plan.color : "rgba(255,255,255,0.08)",
                  color: plan.popular ? "#fff" : "#E2E8F0",
                  fontSize: 14, fontWeight: 700, opacity: loading === plan.id ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {loading === plan.id ? "⏳ Yönlendiriliyor..." : plan.popular ? "Hemen Başla →" : "Seç"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, maxWidth: 900 }}>
        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
          🔒 Ödemeler <strong style={{ color: "#64748B" }}>Lemon Squeezy</strong> üzerinden güvenli şekilde işlenir.
          İstediğiniz zaman iptal edebilirsiniz. Faturalar otomatik oluşturulur.
        </div>
      </div>
    </div>
  );
}
