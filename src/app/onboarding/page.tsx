"use client";
// src/app/auth/onboarding/page.tsx — US-001-02: Organizasyon Onboarding Süreci

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: "org",      label: "Organizasyon", icon: "🏢" },
  { id: "channels", label: "Kanallar",     icon: "📡" },
  { id: "goals",    label: "Hedefler",     icon: "🎯" },
  { id: "done",     label: "Hazır!",       icon: "🚀" },
];

const ORG_TYPES = [
  { id: "ecommerce",   label: "E-Ticaret",       icon: "🛒" },
  { id: "agency",      label: "Ajans",            icon: "🏭" },
  { id: "association", label: "Dernek/STK",       icon: "🤝" },
  { id: "retail",      label: "Perakende",        icon: "🏪" },
  { id: "education",   label: "Eğitim",           icon: "📚" },
  { id: "other",       label: "Diğer",            icon: "💼" },
];

const GOALS = [
  { id: "newsletter",   label: "Bülten Göndermek" },
  { id: "promotions",   label: "Kampanya Duyuruları" },
  { id: "reminders",    label: "Hatırlatıcılar" },
  { id: "support",      label: "Müşteri İletişimi" },
  { id: "events",       label: "Etkinlik Bildirimleri" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    orgType:  "",
    channels: [] as string[],
    goals:    [] as string[],
    listSize: "",
  });

  const token = typeof window !== "undefined"
    ? document.cookie.split(";").find(c => c.trim().startsWith("sb-access-token="))?.split("=")[1]
    : null;
  const tenantId = typeof window !== "undefined"
    ? localStorage.getItem("tenant_id") || ""
    : "";

  function toggleArr(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  }

  async function complete() {
    setSaving(true);
    try {
      await fetch("/api/tenants/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Tenant-Id": tenantId,
        },
        body: JSON.stringify(form),
      });
    } catch {}
    setSaving(false);
    window.location.href = "/demo/dashboard";
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#06090F",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#F1F5F9" }}>
            bulletin<span style={{ color: "#38BDF8" }}>AI</span>
          </div>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 6 }}>Hesabınızı yapılandıralım</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
                background: i < step ? "#22C55E" : i === step ? "#38BDF8" : "rgba(255,255,255,0.05)",
                color: i <= step ? "#fff" : "#475569",
                border: i === step ? "2px solid #38BDF8" : "2px solid transparent",
                transition: "all 0.2s",
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 40, height: 2, background: i < step ? "#22C55E" : "rgba(255,255,255,0.08)", borderRadius: 1 }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "36px 32px",
        }}>

          {/* Step 0: Org Type */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>
                🏢 Organizasyon Tipi
              </h2>
              <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
                İşletmenizi en iyi tanımlayan kategoriyi seçin.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {ORG_TYPES.map(o => (
                  <button key={o.id} onClick={() => setForm(f => ({ ...f, orgType: o.id }))} style={{
                    padding: "16px 12px", borderRadius: 12, textAlign: "center",
                    background: form.orgType === o.id ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.04)",
                    border: form.orgType === o.id ? "2px solid rgba(56,189,248,0.5)" : "2px solid rgba(255,255,255,0.07)",
                    color: form.orgType === o.id ? "#38BDF8" : "#94A3B8",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{o.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: form.orgType === o.id ? 700 : 400 }}>{o.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Channels */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>
                📡 İletişim Kanalları
              </h2>
              <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
                Hangi kanalları kullanmak istiyorsunuz?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { id: "whatsapp", label: "WhatsApp Business", icon: "📱", desc: "%90+ açılma oranı, Meta onaylı şablonlar" },
                  { id: "email",    label: "E-posta",           icon: "📧", desc: "SendGrid altyapısı, kademeli ısınma desteği" },
                  { id: "sms",      label: "SMS",               icon: "💬", desc: "Yakında — Scale planında" },
                ].map(ch => (
                  <button key={ch.id} onClick={() => ch.id !== "sms" && setForm(f => ({ ...f, channels: toggleArr(f.channels, ch.id) }))} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                    borderRadius: 12, textAlign: "left",
                    background: form.channels.includes(ch.id) ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.03)",
                    border: form.channels.includes(ch.id) ? "2px solid rgba(56,189,248,0.35)" : "2px solid rgba(255,255,255,0.07)",
                    cursor: ch.id === "sms" ? "default" : "pointer",
                    opacity: ch.id === "sms" ? 0.4 : 1,
                    transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 28 }}>{ch.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: form.channels.includes(ch.id) ? "#38BDF8" : "#E2E8F0" }}>{ch.label}</div>
                      <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{ch.desc}</div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: form.channels.includes(ch.id) ? "#38BDF8" : "rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#fff", fontWeight: 700,
                    }}>
                      {form.channels.includes(ch.id) ? "✓" : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>
                🎯 Kullanım Hedefleri
              </h2>
              <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
                Platformu ağırlıklı olarak ne için kullanacaksınız?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => setForm(f => ({ ...f, goals: toggleArr(f.goals, g.id) }))} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "13px 16px", borderRadius: 10,
                    background: form.goals.includes(g.id) ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.03)",
                    border: form.goals.includes(g.id) ? "1px solid rgba(56,189,248,0.35)" : "1px solid rgba(255,255,255,0.07)",
                    color: form.goals.includes(g.id) ? "#38BDF8" : "#94A3B8",
                    cursor: "pointer", fontSize: 14, fontWeight: form.goals.includes(g.id) ? 600 : 400,
                    transition: "all 0.15s",
                  }}>
                    <span>{g.label}</span>
                    {form.goals.includes(g.id) && <span style={{ fontSize: 16 }}>✓</span>}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 8 }}>
                  Mevcut abone/müşteri listeniz yaklaşık kaç kişi?
                </label>
                <select value={form.listSize} onChange={e => setForm(f => ({ ...f, listSize: e.target.value }))} style={{
                  width: "100%", padding: "11px 14px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, color: "#E2E8F0", fontSize: 14, outline: "none",
                }}>
                  <option value="">Seçin...</option>
                  <option value="0-500">0 – 500</option>
                  <option value="500-2000">500 – 2.000</option>
                  <option value="2000-10000">2.000 – 10.000</option>
                  <option value="10000+">10.000+</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", marginBottom: 10 }}>
                Hazırsınız!
              </h2>
              <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                bulletinAI hesabınız yapılandırıldı.
                {form.channels.includes("whatsapp") && " WhatsApp bağlantısı için WA Ayarları ekranına gidin."}
                {form.channels.includes("email") && " İlk e-posta kampanyanızı oluşturmaya hazırsınız."}
              </p>
              <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
                {form.channels.includes("whatsapp") && (
                  <div style={{ padding: "12px 16px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, fontSize: 13, color: "#94A3B8", textAlign: "left" }}>
                    <span style={{ fontWeight: 700, color: "#38BDF8" }}>Sonraki adım:</span> WA Ayarları → Meta credentials ekleyin → İlk şablonunuzu oluşturun
                  </div>
                )}
                {form.channels.includes("email") && (
                  <div style={{ padding: "12px 16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, fontSize: 13, color: "#94A3B8", textAlign: "left" }}>
                    <span style={{ fontWeight: 700, color: "#22C55E" }}>Sonraki adım:</span> CSV ile abone listesi yükleyin → İlk kampanyanızı oluşturun
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                padding: "11px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#64748B", cursor: step === 0 ? "default" : "pointer",
                opacity: step === 0 ? 0 : 1, pointerEvents: step === 0 ? "none" : "auto",
              }}
            >
              ← Geri
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={
                  (step === 0 && !form.orgType) ||
                  (step === 1 && !form.channels.length)
                }
                style={{
                  padding: "11px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: "#38BDF8", border: "none", color: "#06090F",
                  cursor: "pointer", opacity: (step === 0 && !form.orgType) || (step === 1 && !form.channels.length) ? 0.4 : 1,
                }}
              >
                Devam Et →
              </button>
            ) : (
              <button onClick={complete} disabled={saving} style={{
                padding: "11px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: "#22C55E", border: "none", color: "#fff",
                cursor: "pointer", opacity: saving ? 0.7 : 1,
                boxShadow: "0 0 24px rgba(34,197,94,0.25)",
              }}>
                {saving ? "Kaydediliyor..." : "🚀 Dashboard'a Geç"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
