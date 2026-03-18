"use client";
import { useState } from "react";

const TONES = [
  { id: "professional", label: "💼 Profesyonel" },
  { id: "friendly",     label: "😊 Samimi" },
  { id: "urgent",       label: "⚡ Acil/Dikkat" },
  { id: "informative",  label: "📊 Bilgilendirici" },
  { id: "creative",     label: "🎨 Yaratıcı" },
];

export default function AIPage() {
  const [topic, setTopic]     = useState("");
  const [tone, setTone]       = useState("professional");
  const [length, setLength]   = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<any>(null);
  const [error, setError]     = useState("");
  const [activeTab, setActiveTab] = useState("whatsapp");

  const token = typeof window !== "undefined"
    ? document.cookie.split(";").find(c => c.trim().startsWith("sb-access-token="))?.split("=")[1]
    : null;

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic, tone, length,
          channels: ["whatsapp", "email"],
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Hata oluştu");
      else setResult(data);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }

  return (
    <div style={{ padding: "28px 24px", fontFamily: "Calibri, sans-serif", color: "#E2E8F0", minHeight: "100vh", background: "#080810" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>✨ AI İçerik Asistanı</h1>
      <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>Claude API ile gerçek zamanlı içerik üretimi</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 1000 }}>
        {/* Sol: Kontroller */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Konu</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()}
                placeholder="Örn: Haftalık e-ticaret özeti..." style={{
                  flex: 1, padding: "12px 14px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                  color: "#E2E8F0", fontSize: 14, outline: "none",
                }} />
              <button onClick={generate} disabled={!topic.trim() || loading} style={{
                padding: "12px 20px", borderRadius: 10, background: loading || !topic.trim() ? "rgba(255,255,255,0.05)" : "#8B5CF6",
                border: "none", color: loading || !topic.trim() ? "#475569" : "#fff",
                fontSize: 14, fontWeight: 700, cursor: topic.trim() && !loading ? "pointer" : "default",
              }}>
                {loading ? "⏳" : "✨ Üret"}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ton</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} style={{
                  padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                  background: tone === t.id ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                  border: tone === t.id ? "1.5px solid rgba(139,92,246,0.5)" : "1.5px solid rgba(255,255,255,0.08)",
                  color: tone === t.id ? "#A78BFA" : "#64748B", fontWeight: tone === t.id ? 600 : 400,
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Uzunluk</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { id: "short",  label: "Kısa",  desc: "~200 karakter" },
                { id: "medium", label: "Orta",  desc: "~500 karakter" },
                { id: "long",   label: "Uzun",  desc: "~1200 karakter" },
              ].map(l => (
                <button key={l.id} onClick={() => setLength(l.id)} style={{
                  padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                  background: length === l.id ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                  border: length === l.id ? "1.5px solid rgba(139,92,246,0.4)" : "1.5px solid rgba(255,255,255,0.08)",
                  color: length === l.id ? "#A78BFA" : "#64748B",
                }}>
                  <div style={{ fontSize: 13, fontWeight: length === l.id ? 600 : 400 }}>{l.label}</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ: Sonuç */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {["whatsapp", "email"].map(ch => (
              <button key={ch} onClick={() => setActiveTab(ch)} style={{
                flex: 1, padding: "12px", background: activeTab === ch ? "rgba(139,92,246,0.08)" : "transparent",
                border: "none", borderBottom: activeTab === ch ? "2px solid #8B5CF6" : "2px solid transparent",
                color: activeTab === ch ? "#A78BFA" : "#475569", fontSize: 13, fontWeight: activeTab === ch ? 600 : 400, cursor: "pointer",
              }}>
                {ch === "whatsapp" ? "💬 WhatsApp" : "📧 E-posta"}
              </button>
            ))}
          </div>

          <div style={{ padding: 20, minHeight: 300 }}>
            {loading && (
              <div style={{ textAlign: "center", paddingTop: 60, color: "#64748B" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                <div>Claude içerik yazıyor...</div>
              </div>
            )}
            {error && (
              <div style={{ padding: 16, background: "rgba(239,68,68,0.1)", borderRadius: 10, color: "#FCA5A5", fontSize: 13 }}>
                ❌ {error}
              </div>
            )}
            {result && (
              <div>
                <textarea
                  value={result.content?.[activeTab] || ""}
                  onChange={() => {}}
                  style={{
                    width: "100%", height: 280, background: "transparent", border: "none",
                    color: "#E2E8F0", fontSize: 13, lineHeight: 1.8, resize: "none", outline: "none", boxSizing: "border-box",
                  }}
                />
                <button onClick={() => navigator.clipboard.writeText(result.content?.[activeTab] || "")} style={{
                  padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: 12, cursor: "pointer",
                }}>
                  📋 Kopyala
                </button>
              </div>
            )}
            {!loading && !result && !error && (
              <div style={{ textAlign: "center", paddingTop: 60, color: "#334155" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                <div>Konu girin ve Üret butonuna basın</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
