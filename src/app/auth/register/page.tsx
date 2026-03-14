"use client";
// src/app/auth/register/page.tsx

import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", businessName: "", phone: "" });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, businessName: form.businessName, tenantName: form.businessName, phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Kayıt başarısız"); setLoading(false); return; }
      window.location.href = "/auth/login?registered=1";
    } catch { setError("Bağlantı hatası"); setLoading(false); }
  }

  function handleGoogle() {
    const redirectTo = encodeURIComponent(`${window.location.origin}/auth/login?next=/demo/dashboard`);
    window.location.href = `https://hxgaksqbalqqhiqophcu.supabase.co/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
  }

  const inp = (ph: string, type: string, key: string, req = true) => (
    <input type={type} placeholder={ph} value={(form as any)[key]} onChange={e => set(key, e.target.value)} required={req}
      style={{ width: "100%", padding: "12px 14px", marginBottom: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "#E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
  );

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(56,189,248,0.10) 0%, #06090F 70%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "40px 24px" }}>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "44px 40px", width: "100%", maxWidth: 420, boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 8, color: "#F1F5F9" }}>bulletin<span style={{ color: "#38BDF8" }}>AI</span></div>
          <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Ücretsiz hesap oluşturun</p>
        </div>
        <button onClick={handleGoogle} style={{ width: "100%", padding: "12px 16px", background: "#FFFFFF", color: "#1E293B", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Google ile Kayıt Ol
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: "#334155", fontSize: 13 }}>veya e-posta ile</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>
        <form onSubmit={handleSubmit}>
          {inp("İşletme adı", "text", "businessName")}
          {inp("E-posta", "email", "email")}
          {inp("Şifre (min. 8 karakter)", "password", "password")}
          {inp("Telefon (opsiyonel)", "tel", "phone", false)}
          {error && <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, color: "#FCA5A5", fontSize: 13 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 10, background: "#38BDF8", color: "#06090F", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1, boxShadow: "0 0 24px rgba(56,189,248,0.25)" }}>
            {loading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#475569" }}>
          Zaten hesabınız var mı?{" "}<a href="/auth/login" style={{ color: "#38BDF8", textDecoration: "none", fontWeight: 600 }}>Giriş Yap</a>
        </div>
      </div>
    </div>
  );
}
