"use client";
// src/app/page.tsx — bulletinAI Landing Page

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: "%90+", label: "WhatsApp Açılma Oranı" },
  { value: "%21", label: "E-posta Açılma Ort." },
  { value: "4.2M", label: "Türkiye KOBİ" },
  { value: "3 dk", label: "Kurulum Süresi" },
];

const FEATURES = [
  {
    icon: "📱",
    title: "WhatsApp Business API",
    desc: "Meta onaylı şablonlarla günlük binlerce mesaj. 24-48 saatlik onay süreciyle güvenli toplu gönderim.",
  },
  {
    icon: "📧",
    title: "E-posta Kampanyaları",
    desc: "SendGrid altyapısı, otomatik ısınma rehberi ve deliverability izleme ile spam klasörünü aşın.",
  },
  {
    icon: "✨",
    title: "AI İçerik Üretimi",
    desc: "Claude API destekli metin asistanı. Saniyeler içinde kanal uyumlu, dönüşüm odaklı içerik.",
  },
  {
    icon: "📊",
    title: "Gerçek Zamanlı Analitik",
    desc: "Açılma, tıklama ve dönüşüm verilerini anlık takip edin. Kampanya performansınızı optimize edin.",
  },
  {
    icon: "🔒",
    title: "KVKK & İYS Uyumu",
    desc: "Türkiye mevzuatına tam uyumlu. Onay tarihleri otomatik kaydedilir, İYS'e entegre çalışır.",
  },
  {
    icon: "⚡",
    title: "Kolay Entegrasyon",
    desc: "WhatsApp credentials'larınızı 3 dakikada bağlayın. Teknik ekip gerektirmeyen sezgisel arayüz.",
  },
];

const PRICING = [
  { name: "Starter", price: "₺990", period: "/ay", subs: "1.000", channels: "E-posta", cta: "Başla", highlight: false },
  { name: "Growth", price: "₺2.490", period: "/ay", subs: "5.000", channels: "E-posta + WhatsApp", cta: "En Popüler", highlight: true },
  { name: "Scale", price: "₺5.990", period: "/ay", subs: "25.000", channels: "Tümü + AI", cta: "Büyü", highlight: false },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#06090F", color: "#E2E8F0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(6,9,15,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s",
      }}>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
          bulletin<span style={{ color: "#38BDF8" }}>AI</span>
        </span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/auth/login" style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 14, color: "#94A3B8",
            textDecoration: "none", transition: "color 0.2s",
          }}>
            Giriş Yap
          </Link>
          <Link href="/demo/dashboard" style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: "#38BDF8", color: "#06090F", textDecoration: "none",
            transition: "opacity 0.2s",
          }}>
            Demo →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div ref={heroRef} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "100px 24px 60px",
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(56,189,248,0.12) 0%, transparent 70%)",
        position: "relative",
      }}>
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 0%, transparent 100%)",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 100,
          background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)",
          fontSize: 13, color: "#38BDF8", marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38BDF8", display: "inline-block" }} />
          Türkiye'nin İlk AI Destekli WhatsApp Bülten Platformu
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 7vw, 80px)", fontWeight: 900, textAlign: "center",
          lineHeight: 1.05, letterSpacing: "-2px", maxWidth: 800,
          margin: "0 0 24px",
        }}>
          Müşterilerinize{" "}
          <span style={{
            background: "linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            WhatsApp
          </span>{" "}
          ile Ulaşın
        </h1>

        <p style={{
          fontSize: 18, color: "#94A3B8", textAlign: "center",
          maxWidth: 560, lineHeight: 1.7, margin: "0 0 40px",
        }}>
          E-postalar açılmıyor. SMS pahalı. WhatsApp'ta açılma oranı %90'ın üzerinde.
          bulletinAI ile Meta onaylı toplu mesaj gönderimi artık 3 dakikada hazır.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/auth/login" style={{
            padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700,
            background: "#38BDF8", color: "#06090F", textDecoration: "none",
            boxShadow: "0 0 32px rgba(56,189,248,0.3)",
          }}>
            Ücretsiz Başla
          </Link>
          <Link href="/demo/dashboard" style={{
            padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 600,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#E2E8F0", textDecoration: "none",
          }}>
            Demo İncele →
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
          marginTop: 80, width: "100%", maxWidth: 700,
          background: "rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: "24px 16px", textAlign: "center",
              background: "rgba(6,9,15,0.6)",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#38BDF8", letterSpacing: "-1px" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 16px" }}>
            Her Şey Tek Platformda
          </h2>
          <p style={{ color: "#64748B", fontSize: 17, maxWidth: 480, margin: "0 auto" }}>
            WhatsApp, e-posta ve AI içerik üretimini ayrı araçlara gerek kalmadan yönetin.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              padding: "28px 24px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              transition: "border-color 0.2s, background 0.2s",
            }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "#F1F5F9" }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ── */}
      <div style={{ padding: "80px 24px 100px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 16px" }}>
            Şeffaf Fiyatlandırma
          </h2>
          <p style={{ color: "#64748B", fontSize: 17 }}>Büyüdükçe planınızı yükseltin.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {PRICING.map((plan, i) => (
            <div key={i} style={{
              padding: "32px 24px",
              background: plan.highlight ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.03)",
              border: plan.highlight ? "1px solid rgba(56,189,248,0.4)" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, textAlign: "center", position: "relative",
              boxShadow: plan.highlight ? "0 0 40px rgba(56,189,248,0.12)" : "none",
            }}>
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  padding: "4px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                  background: "#38BDF8", color: "#06090F",
                }}>
                  EN POPÜLER
                </div>
              )}
              <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>{plan.name}</div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: "#38BDF8" }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: "#64748B" }}>{plan.period}</span>
              </div>
              <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>
                {plan.subs} abone
              </div>
              <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24 }}>
                {plan.channels}
              </div>
              <Link href="/auth/login" style={{
                display: "block", padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: plan.highlight ? "#38BDF8" : "rgba(255,255,255,0.08)",
                color: plan.highlight ? "#06090F" : "#E2E8F0",
                textDecoration: "none",
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{
        margin: "0 24px 100px", maxWidth: 900, marginLeft: "auto", marginRight: "auto",
        padding: "60px 40px", borderRadius: 24, textAlign: "center",
        background: "linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(129,140,248,0.12) 100%)",
        border: "1px solid rgba(56,189,248,0.2)",
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 16px" }}>
          Bugün Başlayın
        </h2>
        <p style={{ color: "#94A3B8", fontSize: 16, margin: "0 0 32px" }}>
          Demo hesabı oluşturun, WhatsApp API'nizi 3 dakikada bağlayın.
        </p>
        <Link href="/auth/login" style={{
          padding: "14px 40px", borderRadius: 10, fontSize: 16, fontWeight: 700,
          background: "#38BDF8", color: "#06090F", textDecoration: "none",
          boxShadow: "0 0 32px rgba(56,189,248,0.3)",
        }}>
          Ücretsiz Hesap Oluştur
        </Link>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "32px 40px", textAlign: "center",
        color: "#334155", fontSize: 13,
      }}>
        © 2026 bulletinAI — KVKK Uyumlu · Türkiye yapımı 🇹🇷
      </footer>
    </div>
  );
}
