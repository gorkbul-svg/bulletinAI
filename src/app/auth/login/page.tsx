"use client";
// src/app/auth/login/page.tsx

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/demo/dashboard`,
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/demo/dashboard";
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A1E",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Calibri, sans-serif",
    }}>
      <div style={{
        background: "#111827", border: "1px solid #1E293B",
        borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 420,
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-block", background: "#0EA5E915",
            border: "1px solid #0EA5E940", borderRadius: 8,
            padding: "6px 16px", marginBottom: 16,
          }}>
            <span style={{ color: "#0EA5E9", fontWeight: 700, fontSize: 18 }}>bulletinAI</span>
          </div>
          <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "12px 16px",
            background: "#FFFFFF", color: "#1E293B",
            border: "none", borderRadius: 8, cursor: "pointer",
            fontSize: 15, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 20, transition: "opacity 0.2s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Google ile Giriş Yap
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#1E293B" }} />
          <span style={{ color: "#475569", fontSize: 13 }}>veya e-posta ile</span>
          <div style={{ flex: 1, height: 1, background: "#1E293B" }} />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmail}>
          <input
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: "100%", padding: "11px 14px", marginBottom: 12,
              background: "#1E293B", border: "1px solid #334155",
              borderRadius: 8, color: "#E2E8F0", fontSize: 14,
              outline: "none", boxSizing: "border-box",
            }}
          />
          <input
            type="password"
            placeholder="Şifreniz"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: "100%", padding: "11px 14px", marginBottom: 16,
              background: "#1E293B", border: "1px solid #334155",
              borderRadius: 8, color: "#E2E8F0", fontSize: 14,
              outline: "none", boxSizing: "border-box",
            }}
          />

          {error && (
            <div style={{
              background: "#EF444420", border: "1px solid #EF4444",
              borderRadius: 6, padding: "8px 12px", marginBottom: 12,
              color: "#EF4444", fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px 16px",
              background: "#0EA5E9", color: "#FFFFFF",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontSize: 15, fontWeight: 600, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        {/* Demo link */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/demo/dashboard" style={{ color: "#475569", fontSize: 13, textDecoration: "none" }}>
            Demo'yu dene →
          </a>
        </div>
      </div>
    </div>
  );
}
