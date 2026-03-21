"use client";

import { useState, useEffect } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Google OAuth hash'ten token oku ve cookie'ye yaz
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const token = params.get("access_token");
      if (token) {
        document.cookie = `sb-access-token=${token}; path=/; max-age=3600; SameSite=Lax`;
        // Google login sonrası tenant ID'yi API'den al
        fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ token }),
        }).then(r => r.json()).then(d => {
          if (d.tenants?.[0]?.id) {
            document.cookie = `tenant_id=${d.tenants[0].id}; path=/; max-age=3600; SameSite=Lax`;
          }
        }).catch(() => {}).finally(() => {
          const next = new URLSearchParams(window.location.search).get("next") || "/demo/dashboard";
          window.location.href = next;
        });
      }
    }
  }, []);

  function getNext() {
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/demo/dashboard";
  }

  function handleGoogle() {
    const redirectTo = encodeURIComponent(`${window.location.origin}/auth/login?next=${getNext()}`);
    window.location.href = `https://hxgaksqbalqqhiqophcu.supabase.co/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Supabase'den token al
      const res = await fetch("https://hxgaksqbalqqhiqophcu.supabase.co/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2Frc3FiYWxxcWhpcW9waGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDA2MjIsImV4cCI6MjA1NzI3NjYyMn0.q0HVKGPX0QLxv6-WKtSqo2gsMv9xzJVNYT5DhCPG8LI",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.error || data.error_code) {
        setError(data.error_description || data.msg || "Giriş başarısız");
        setLoading(false);
      } else {
        // Token'ı cookie'ye yaz
        document.cookie = `sb-access-token=${data.access_token}; path=/; max-age=3600; SameSite=Lax`;
        // Tenant ID'yi API'den al ve cookie'ye kaydet
        try {
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const loginData = await loginRes.json();
          if (loginData.tenants?.[0]?.id) {
            document.cookie = `tenant_id=${loginData.tenants[0].id}; path=/; max-age=3600; SameSite=Lax`;
          }
        } catch {}
        window.location.href = getNext();
      }
    } catch {
      setError("Bağlantı hatası");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(56,189,248,0.10) 0%, #06090F 70%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: "44px 40px", width: "100%", maxWidth: 420,
        boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 8, color: "#F1F5F9" }}>
            bulletin<span style={{ color: "#38BDF8" }}>AI</span>
          </div>
          <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Hesabınıza giriş yapın</p>
        </div>

        <button onClick={handleGoogle} style={{
          width: "100%", padding: "12px 16px",
          background: "#FFFFFF", color: "#1E293B",
          border: "none", borderRadius: 10, cursor: "pointer",
          fontSize: 15, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          marginBottom: 20,
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google ile Giriş Yap
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: "#334155", fontSize: 13 }}>veya</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <form onSubmit={handleEmail}>
          <input type="email" placeholder="E-posta" value={email}
            onChange={e => setEmail(e.target.value)} required style={{
              width: "100%", padding: "12px 14px", marginBottom: 10,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 10, color: "#E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box",
            }}
          />
          <input type="password" placeholder="Şifre" value={password}
            onChange={e => setPassword(e.target.value)} required style={{
              width: "100%", padding: "12px 14px", marginBottom: 16,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 10, color: "#E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box",
            }}
          />
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "8px 12px", marginBottom: 12,
              color: "#FCA5A5", fontSize: 13,
            }}>{error}</div>
          )}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px", borderRadius: 10,
            background: "#38BDF8", color: "#06090F", border: "none",
            cursor: "pointer", fontSize: 15, fontWeight: 700,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#475569" }}>
          Hesabınız yok mu?{" "}
          <a href="/auth/register" style={{ color: "#38BDF8", textDecoration: "none", fontWeight: 600 }}>
            Kayıt Ol
          </a>
        </div>
      </div>
    </div>
  );
}
