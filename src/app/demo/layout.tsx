"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/demo/dashboard",    label: "📊 Dashboard" },
  { href: "/demo/campaigns",    label: "📨 Kampanyalar" },
  { href: "/demo/subscribers",  label: "👥 Aboneler" },
  { href: "/demo/templates",    label: "💬 Şablonlar" },
  { href: "/demo/ai",           label: "✨ AI Asistan" },
  { href: "/demo/analytics",    label: "📈 Analitik" },
  { href: "/demo/onboarding",   label: "🚀 Onboarding" },
  { href: "/demo/billing",      label: "💳 Fiyatlandırma" },
  { href: "/demo/settings",     label: "⚙️ WA Ayarları" },
];

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#0D0D1A", borderRight: "1px solid rgba(255,255,255,0.07)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, position: "fixed", top: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: "8px 12px 20px", fontSize: 16, fontWeight: 700, color: "#F1F5F9", fontFamily: "monospace" }}>
          bulletin<span style={{ color: "#0EA5E9" }}>AI</span>
          <div style={{ fontSize: 10, color: "#334155", fontWeight: 400, marginTop: 2 }}>Demo</div>
        </div>
        {NAV.map(n => (
          <Link key={n.href} href={n.href} style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13, fontWeight: path === n.href ? 600 : 400, color: path === n.href ? "#0EA5E9" : "#64748B", background: path === n.href ? "rgba(14,165,233,0.1)" : "transparent", textDecoration: "none", transition: "all 0.12s" }}>
            {n.label}
          </Link>
        ))}
      </div>
      {/* Content */}
      <div style={{ marginLeft: 220, flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
