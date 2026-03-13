"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/demo/dashboard",   label: "📊 Dashboard",      section: "main" },
  { href: "/demo/campaigns",   label: "📨 Kampanyalar",     section: "main" },
  { href: "/demo/subscribers", label: "👥 Aboneler",        section: "main" },
  { href: "/demo/templates",   label: "💬 Şablonlar",       section: "main" },
  { href: "/demo/ai",          label: "✨ AI Asistan",      section: "main" },
  { href: "/demo/analytics",   label: "📈 Analitik",        section: "main" },
  { href: "/demo/onboarding",  label: "🚀 Onboarding",      section: "settings" },
  { href: "/demo/billing",     label: "💳 Fiyatlandırma",   section: "settings" },
  { href: "/demo/settings",    label: "⚙️ WA Ayarları",     section: "settings" },
];

// Demo limit data — gerçek sistemde API'den gelecek
const LIMITS = {
  wa:    { used: 847,  total: 1000,  label: "WhatsApp" },
  email: { used: 2340, total: 5000,  label: "E-posta" },
};

// Uyarı banner'ları
const WARNINGS = [
  {
    id: "wa-template",
    icon: "⚠️",
    color: "#F59E0B",
    bg: "#F59E0B15",
    border: "#F59E0B40",
    title: "Meta Şablon Onayı Gerekli",
    body: "WhatsApp kampanyaları yalnızca Meta onaylı şablonlarla gönderilebilir. Onaysız gönderim hesap yasağına yol açabilir.",
    link: "/demo/templates",
    linkLabel: "Şablon oluştur →",
  },
  {
    id: "email-warmup",
    icon: "🔥",
    color: "#0EA5E9",
    bg: "#0EA5E915",
    border: "#0EA5E940",
    title: "E-posta Isınma Süreci",
    body: "Yeni e-posta hesapları spam'e düşmemek için kademeli gönderim gerektirir. İlk hafta günlük 50, ikinci hafta 200 ile başlayın.",
    link: "/demo/settings",
    linkLabel: "Isınma ayarları →",
  },
];

function LimitBar({ used, total, label, color }: { used: number; total: number; label: string; color: string }) {
  const pct = Math.round((used / total) * 100);
  const isHigh = pct >= 80;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#64748B" }}>{label}</span>
        <span style={{ fontSize: 11, color: isHigh ? "#EF4444" : "#64748B", fontWeight: isHigh ? 600 : 400 }}>
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div style={{ height: 4, background: "#1E293B", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: isHigh ? "#EF4444" : color,
          borderRadius: 2, transition: "width 0.3s",
        }} />
      </div>
    </div>
  );
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const activeWarnings = WARNINGS.filter(w => !dismissed.includes(w.id));
  const mainNav = NAV.filter(n => n.section === "main");
  const settingsNav = NAV.filter(n => n.section === "settings");

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Calibri, sans-serif", background: "#080810" }}>

      {/* ── Tek Sidebar ─────────────────────────────────── */}
      <div style={{
        width: 220, background: "#0D0D1A",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        padding: "0 12px 20px", display: "flex", flexDirection: "column",
        position: "fixed", top: 0, bottom: 0, zIndex: 100, overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 12px 16px", fontSize: 16, fontWeight: 700, color: "#F1F5F9", fontFamily: "monospace" }}>
          bulletin<span style={{ color: "#0EA5E9" }}>AI</span>
          <div style={{ fontSize: 10, color: "#334155", fontWeight: 400, marginTop: 2 }}>Demo</div>
        </div>

        {/* Ana Menü */}
        <div style={{ marginBottom: 8 }}>
          {mainNav.map(n => (
            <Link key={n.href} href={n.href} style={{
              display: "block", padding: "9px 12px", borderRadius: 8, fontSize: 13,
              fontWeight: path === n.href ? 600 : 400,
              color: path === n.href ? "#0EA5E9" : "#64748B",
              background: path === n.href ? "rgba(14,165,233,0.1)" : "transparent",
              textDecoration: "none", transition: "all 0.12s", marginBottom: 2,
            }}>
              {n.label}
            </Link>
          ))}
        </div>

        {/* Ayarlar Grubu */}
        <div style={{ borderTop: "1px solid #1E293B", paddingTop: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#334155", fontWeight: 600, padding: "4px 12px 6px", letterSpacing: 1, textTransform: "uppercase" }}>
            Ayarlar
          </div>
          {settingsNav.map(n => (
            <Link key={n.href} href={n.href} style={{
              display: "block", padding: "9px 12px", borderRadius: 8, fontSize: 13,
              fontWeight: path === n.href ? 600 : 400,
              color: path === n.href ? "#0EA5E9" : "#64748B",
              background: path === n.href ? "rgba(14,165,233,0.1)" : "transparent",
              textDecoration: "none", transition: "all 0.12s", marginBottom: 2,
            }}>
              {n.label}
            </Link>
          ))}
        </div>

        {/* Günlük Limit Göstergesi */}
        <div style={{
          marginTop: "auto", borderTop: "1px solid #1E293B",
          paddingTop: 14, paddingLeft: 4, paddingRight: 4,
        }}>
          <div style={{ fontSize: 10, color: "#334155", fontWeight: 600, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
            Günlük Limitler
          </div>
          <LimitBar {...LIMITS.wa}    color="#22C55E" />
          <LimitBar {...LIMITS.email} color="#0EA5E9" />
          <div style={{ fontSize: 10, color: "#334155", marginTop: 6, textAlign: "center" }}>
            Sıfırlanma: 00:00 UTC
          </div>
        </div>
      </div>

      {/* ── İçerik Alanı ─────────────────────────────────── */}
      <div style={{ marginLeft: 220, flex: 1, minWidth: 0 }}>

        {/* Uyarı Banner'ları */}
        {activeWarnings.length > 0 && (
          <div style={{ padding: "12px 20px 0" }}>
            {activeWarnings.map(w => (
              <div key={w.id} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                background: w.bg, border: `1px solid ${w.border}`,
                borderRadius: 10, padding: "12px 16px", marginBottom: 10,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{w.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: w.color, marginBottom: 2 }}>
                    {w.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>
                    {w.body}{" "}
                    <Link href={w.link} style={{ color: w.color, textDecoration: "none", fontWeight: 600 }}>
                      {w.linkLabel}
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => setDismissed(d => [...d, w.id])}
                  style={{
                    background: "none", border: "none", color: "#475569",
                    cursor: "pointer", fontSize: 16, flexShrink: 0,
                    padding: "0 4px", lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
