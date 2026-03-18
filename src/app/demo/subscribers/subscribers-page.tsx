"use client";
// src/app/demo/subscribers/page.tsx — US-002-01 CSV Import + US-006-01 Opt-in

import { useState, useRef } from "react";

const SAMPLE_CSV = `name,email,phone,tags,consent_source,consent_given
Ayşe Yılmaz,ayse@example.com,05301234567,vip;musteri,web_form,evet
Mehmet Kaya,mehmet@example.com,05421234567,yeni,fiziksel_form,evet
Fatma Demir,,+905551234567,toptan,,hayır`;

type ImportResult = {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
  total: number;
};

type Subscriber = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  consent_type: string;
  consent_source?: string;
  channels: string[];
  tags: string[];
  created_at: string;
};

const CONSENT_COLORS: Record<string, string> = {
  explicit: "#22C55E",
  implicit: "#F59E0B",
  withdrawn: "#EF4444",
};

export default function SubscribersPage() {
  const [tab, setTab] = useState<"list" | "import">("list");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [consentSource, setConsentSource] = useState("web_form");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined"
    ? document.cookie.split(";").find(c => c.trim().startsWith("sb-access-token="))?.split("=")[1]
    : null;

  const tenantId = typeof window !== "undefined"
    ? localStorage.getItem("tenant_id") || ""
    : "";

  async function loadSubscribers() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribers", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-Id": tenantId,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data || []);
      }
    } catch {}
    setLoading(false);
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("consent_source", consentSource);
      const res = await fetch("/api/subscribers/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-Id": tenantId,
        },
        body: fd,
      });
      const data = await res.json();
      setResult(data);
      if (data.imported > 0) loadSubscribers();
    } catch (e: any) {
      setResult({ imported: 0, skipped: 0, errors: [{ row: 0, reason: e.message }], total: 0 });
    }
    setImporting(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx"))) setFile(f);
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ornek-abone-listesi.csv"; a.click();
  }

  const filtered = subscribers.filter(s =>
    !searchQ || s.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.email?.includes(searchQ) || s.phone?.includes(searchQ)
  );

  return (
    <div style={{ padding: "28px 24px", fontFamily: "Calibri, sans-serif", color: "#E2E8F0", minHeight: "100vh", background: "#080810" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>👥 Aboneler</h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
            {subscribers.length > 0 ? `${subscribers.length} abone` : "Henüz abone yok — CSV yükleyin"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadSubscribers} style={{
            padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94A3B8", cursor: "pointer",
          }}>
            🔄 Yenile
          </button>
          <button onClick={() => setTab("import")} style={{
            padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: "#0EA5E9", border: "none", color: "#fff", cursor: "pointer",
          }}>
            ⬆️ CSV Yükle
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[{ id: "list", label: "📋 Liste" }, { id: "import", label: "⬆️ İmport" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            background: tab === t.id ? "rgba(14,165,233,0.2)" : "transparent",
            border: tab === t.id ? "1px solid rgba(14,165,233,0.3)" : "1px solid transparent",
            color: tab === t.id ? "#0EA5E9" : "#64748B", cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── LIST TAB ── */}
      {tab === "list" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <input
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="İsim, e-posta veya telefon ara..."
              style={{
                width: "100%", maxWidth: 400, padding: "10px 14px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {filtered.length === 0 ? (
            <div style={{
              padding: "60px 24px", textAlign: "center",
              background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: 14,
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <div style={{ fontSize: 16, color: "#64748B", marginBottom: 12 }}>Henüz abone yok</div>
              <button onClick={() => setTab("import")} style={{
                padding: "10px 24px", borderRadius: 8, background: "#0EA5E9",
                border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                CSV ile Abone Yükle
              </button>
            </div>
          ) : (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                {["Ad Soyad", "E-posta", "Telefon", "Kanallar", "Onay", "Durum"].map(h => (
                  <div key={h} style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
                ))}
              </div>
              {filtered.slice(0, 100).map((s, i) => (
                <div key={s.id} style={{
                  display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 1fr",
                  padding: "12px 20px", alignItems: "center",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{s.email || "—"}</div>
                  <div style={{ fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>{s.phone || "—"}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {s.channels?.includes("whatsapp") && <span style={{ fontSize: 10, background: "rgba(37,211,102,0.15)", color: "#25D366", padding: "2px 6px", borderRadius: 4 }}>WA</span>}
                    {s.channels?.includes("email") && <span style={{ fontSize: 10, background: "rgba(14,165,233,0.15)", color: "#0EA5E9", padding: "2px 6px", borderRadius: 4 }}>Mail</span>}
                  </div>
                  <div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                      background: `${CONSENT_COLORS[s.consent_type] || "#64748B"}18`,
                      color: CONSENT_COLORS[s.consent_type] || "#64748B",
                      border: `1px solid ${CONSENT_COLORS[s.consent_type] || "#64748B"}40`,
                    }}>
                      {s.consent_type === "explicit" ? "✓ Açık" : s.consent_type === "implicit" ? "~ Örtük" : "✗ İptal"}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 20,
                      background: s.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                      color: s.status === "active" ? "#22C55E" : "#EF4444",
                    }}>
                      {s.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── IMPORT TAB ── */}
      {tab === "import" && (
        <div style={{ maxWidth: 720 }}>

          {/* Consent source */}
          <div style={{ marginBottom: 20, padding: "18px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", marginBottom: 12 }}>📋 Onay Kaynağı (KVKK)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { id: "web_form", label: "🌐 Web Formu" },
                { id: "fiziksel_form", label: "📄 Fiziksel Form" },
                { id: "sozlü_onay", label: "🗣 Sözlü Onay" },
                { id: "e-posta", label: "📧 E-posta" },
                { id: "iye", label: "🏛 İYS" },
              ].map(s => (
                <button key={s.id} onClick={() => setConsentSource(s.id)} style={{
                  padding: "7px 14px", borderRadius: 8, fontSize: 13,
                  background: consentSource === s.id ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)",
                  border: consentSource === s.id ? "1px solid rgba(14,165,233,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  color: consentSource === s.id ? "#0EA5E9" : "#64748B",
                  cursor: "pointer", fontWeight: consentSource === s.id ? 600 : 400,
                }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? "#0EA5E9" : file ? "#22C55E" : "rgba(255,255,255,0.15)"}`,
              borderRadius: 14, padding: "48px 24px", textAlign: "center",
              background: dragging ? "rgba(14,165,233,0.05)" : file ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)",
              cursor: "pointer", transition: "all 0.2s", marginBottom: 16,
            }}
          >
            <input ref={fileRef} type="file" accept=".csv,.xlsx" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] || null)} />
            <div style={{ fontSize: 40, marginBottom: 12 }}>{file ? "✅" : "📂"}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#E2E8F0", marginBottom: 6 }}>
              {file ? file.name : "CSV veya Excel dosyası sürükleyin"}
            </div>
            <div style={{ fontSize: 13, color: "#64748B" }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "ya da tıklayarak seçin (.csv, .xlsx)"}
            </div>
          </div>

          {/* Sample download */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#475569" }}>
              Sütunlar: <code style={{ background: "rgba(255,255,255,0.07)", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>name, email, phone, tags, consent_source, consent_given</code>
            </div>
            <button onClick={downloadSample} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#94A3B8", cursor: "pointer",
            }}>
              ⬇️ Örnek CSV İndir
            </button>
          </div>

          {/* Import button */}
          <button onClick={handleImport} disabled={!file || importing} style={{
            width: "100%", padding: "14px", borderRadius: 10, fontSize: 15, fontWeight: 700,
            background: !file ? "rgba(255,255,255,0.05)" : "#0EA5E9",
            border: "none", color: !file ? "#475569" : "#fff",
            cursor: !file ? "default" : "pointer",
            opacity: importing ? 0.7 : 1,
          }}>
            {importing ? "⏳ Yükleniyor..." : "⬆️ Aboneleri İçe Aktar"}
          </button>

          {/* Result */}
          {result && (
            <div style={{
              marginTop: 20, padding: "20px", borderRadius: 12,
              background: result.imported > 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${result.imported > 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: result.imported > 0 ? "#22C55E" : "#EF4444", marginBottom: 12 }}>
                {result.imported > 0 ? "✅ İçe Aktarma Tamamlandı" : "❌ İçe Aktarma Başarısız"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: result.errors.length ? 16 : 0 }}>
                {[
                  { label: "Toplam", val: result.total, color: "#94A3B8" },
                  { label: "Aktarıldı", val: result.imported, color: "#22C55E" },
                  { label: "Atlandı", val: result.skipped, color: "#F59E0B" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center", padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {result.errors.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", marginBottom: 8 }}>Hatalı Satırlar:</div>
                  {result.errors.map((e, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#94A3B8", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "#F59E0B", fontWeight: 600 }}>Satır {e.row}:</span> {e.reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
