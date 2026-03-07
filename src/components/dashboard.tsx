"use client";
import { useState, useEffect } from "react";

const mockCampaigns = [
  { id: 1, name: "E-ticaret Haftalık #47", status: "sent", channel: ["whatsapp", "email"], reach: 4821, openRate: 87, clickRate: 34, sentAt: "3 Mart, 14:00", segment: "Premium Üyeler" },
  { id: 2, name: "Flash Fırsatlar Bülteni", status: "sending", channel: ["whatsapp"], reach: 2103, openRate: 91, clickRate: 41, sentAt: "Bugün, 09:30", segment: "Aktif Alıcılar" },
  { id: 3, name: "Pazar Trendleri Özeti", status: "scheduled", channel: ["email", "whatsapp"], reach: 6540, openRate: null, clickRate: null, sentAt: "8 Mart, 10:00", segment: "Tüm Liste" },
  { id: 4, name: "Startup Radar #12", status: "draft", channel: ["email"], reach: 1290, openRate: null, clickRate: null, sentAt: "—", segment: "Girişimciler" },
];

const mockSegments = [
  { name: "Premium Üyeler", count: 4821, growth: "+12%", color: "#00FFB2" },
  { name: "Aktif Alıcılar", count: 2103, growth: "+7%", color: "#FF6B35" },
  { name: "Girişimciler", count: 1290, growth: "+22%", color: "#7B61FF" },
  { name: "E-ticaret Pro", count: 3412, growth: "+5%", color: "#FFD93D" },
];

const weeklyData = [
  { day: "Pzt", whatsapp: 82, email: 41 },
  { day: "Sal", whatsapp: 88, email: 52 },
  { day: "Çar", whatsapp: 91, email: 48 },
  { day: "Per", whatsapp: 76, email: 39 },
  { day: "Cum", whatsapp: 94, email: 61 },
  { day: "Cmt", whatsapp: 70, email: 35 },
  { day: "Paz", whatsapp: 65, email: 29 },
];

const aiSuggestions = [
  { icon: "🕐", label: "En iyi gönderim saati", value: "Salı 10:00 – 11:30", confidence: 94 },
  { icon: "🎯", label: "Önerilen segment", value: "E-ticaret Pro + Premium", confidence: 88 },
  { icon: "✍️", label: "Konu satırı skoru", value: "Mevcut: 7.2 / 10", confidence: null },
];

const statusConfig = {
  sent: { label: "Gönderildi", color: "#00FFB2", bg: "rgba(0,255,178,0.1)" },
  sending: { label: "Gönderiliyor", color: "#FFD93D", bg: "rgba(255,217,61,0.1)" },
  scheduled: { label: "Planlandı", color: "#7B61FF", bg: "rgba(123,97,255,0.1)" },
  draft: { label: "Taslak", color: "#888", bg: "rgba(136,136,136,0.1)" },
};

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

export default function BulletinAI() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [composing, setComposing] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [topic, setTopic] = useState("");
  const [animatedStats, setAnimatedStats] = useState({ total: 0, openRate: 0, segments: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({ total: 11624, openRate: 87, segments: 4 });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleAiGenerate = () => {
    if (!topic) return;
    setAiGenerating(true);
    setGeneratedContent("");
    setTimeout(() => {
      setGeneratedContent(`📦 **Bu Haftanın E-Ticaret Özeti**\n\nTürkiye e-ticaret pazarı Şubat ayında %18 büyüme kaydetti. Öne çıkan 3 trend:\n\n1. **Sosyal Ticaret** — TikTok Shop entegrasyonları %340 arttı\n2. **Hızlı Teslimat** — Same-day delivery talebi yüzde 60 yükseldi  \n3. **AI Kişiselleştirme** — Dönüşüm oranlarını 2.3x artırıyor\n\n💡 Öneri: Bu hafta lojistik çözümlerine odaklanın.`);
      setAiGenerating(false);
    }, 2200);
  };

  const maxBar = Math.max(...weeklyData.map(d => Math.max(d.whatsapp, d.email)));

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#0A0A0F",
      minHeight: "100vh",
      color: "#E8E8F0",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,255,178,0.08); }
        .campaign-row { transition: background 0.15s ease; }
        .campaign-row:hover { background: rgba(255,255,255,0.03) !important; }
        .nav-btn { transition: all 0.15s ease; cursor: pointer; }
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .ai-btn { transition: all 0.2s ease; cursor: pointer; }
        .ai-btn:hover { opacity: 0.85; transform: scale(0.98); }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .blink { animation: blink 1.2s infinite; }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        .slide-in { animation: slideIn 0.4s ease forwards; }
        @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        textarea { resize: none; outline: none; }
        textarea:focus { border-color: #00FFB2 !important; }
        .bar-fill { transition: height 0.8s cubic-bezier(0.34,1.56,0.64,1); }
        .compose-panel { animation: slideIn 0.35s ease; }
      `}</style>

      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #00FFB2, #7B61FF)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📡</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>
            bulletin<span style={{ color: "#00FFB2" }}>AI</span>
          </span>
          <span style={{ fontSize: 10, background: "rgba(123,97,255,0.2)", color: "#7B61FF", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>BETA</span>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {["dashboard", "kampanyalar", "segmentler", "ayarlar"].map(tab => (
            <button key={tab} className="nav-btn" onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? "rgba(0,255,178,0.1)" : "transparent", border: "none", color: activeTab === tab ? "#00FFB2" : "#888", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, textTransform: "capitalize", fontFamily: "'DM Sans', sans-serif" }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <button className="ai-btn" onClick={() => setComposing(true)} style={{ background: "linear-gradient(135deg, #00FFB2, #00D4FF)", color: "#0A0A0F", border: "none", padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
          <SparkleIcon /> Yeni Bülten
        </button>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: 220, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { icon: "⚡", label: "Genel Bakış", tab: "dashboard" },
            { icon: "📨", label: "Kampanyalar", tab: "kampanyalar" },
            { icon: "👥", label: "Segmentler", tab: "segmentler" },
            { icon: "🤖", label: "AI Asistan", tab: "ai" },
            { icon: "📊", label: "Analizler", tab: "analiz" },
            { icon: "⚙️", label: "Ayarlar", tab: "ayarlar" },
          ].map(item => (
            <button key={item.tab} className="nav-btn" onClick={() => setActiveTab(item.tab)} style={{ background: activeTab === item.tab ? "rgba(0,255,178,0.08)" : "transparent", border: activeTab === item.tab ? "1px solid rgba(0,255,178,0.2)" : "1px solid transparent", color: activeTab === item.tab ? "#00FFB2" : "#666", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 10, textAlign: "left", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}

          <div style={{ marginTop: "auto", padding: "16px 12px", background: "rgba(123,97,255,0.08)", border: "1px solid rgba(123,97,255,0.2)", borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#7B61FF", fontWeight: 600, marginBottom: 6 }}>BAĞLI KANALLAR</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#00FFB2", fontSize: 12, marginBottom: 6 }}>
              <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FFB2", display: "inline-block" }} />
              <WhatsAppIcon /> WhatsApp API
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#00FFB2", fontSize: 12 }}>
              <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FFB2", display: "inline-block" }} />
              <EmailIcon /> E-posta SMTP
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Toplam Abone", value: animatedStats.total.toLocaleString("tr"), icon: "👥", delta: "+8% bu ay", color: "#00FFB2" },
              { label: "Ort. Açılma Oranı", value: `%${animatedStats.openRate}`, icon: "📬", delta: "WA: %91 / Email: %44", color: "#FFD93D" },
              { label: "Aktif Segment", value: animatedStats.segments, icon: "🎯", delta: "AI destekli", color: "#7B61FF" },
              { label: "Bu Hafta Gönderim", value: "3", icon: "📡", delta: "1 planlı", color: "#FF6B35" },
            ].map((stat, i) => (
              <div key={i} className="stat-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -10, right: -10, fontSize: 48, opacity: 0.06 }}>{stat.icon}</div>
                <div style={{ fontSize: 11, color: "#666", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>{stat.delta}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
            {/* Chart */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>Haftalık Açılma Oranı</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Son 7 gün ortalaması</div>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                  <span style={{ color: "#00FFB2", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#00FFB2", display: "inline-block" }} /> WhatsApp</span>
                  <span style={{ color: "#7B61FF", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "#7B61FF", display: "inline-block" }} /> Email</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                {weeklyData.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 2, width: "100%" }}>
                      <div className="bar-fill" style={{ flex: 1, height: `${(d.whatsapp / maxBar) * 100}%`, background: "linear-gradient(180deg, #00FFB2, rgba(0,255,178,0.3))", borderRadius: "3px 3px 0 0" }} />
                      <div className="bar-fill" style={{ flex: 1, height: `${(d.email / maxBar) * 100}%`, background: "linear-gradient(180deg, #7B61FF, rgba(123,97,255,0.3))", borderRadius: "3px 3px 0 0" }} />
                    </div>
                    <span style={{ fontSize: 10, color: "#444" }}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 24, height: 24, background: "linear-gradient(135deg, #7B61FF, #00FFB2)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✨</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>AI Önerileri</div>
              </div>
              {aiSuggestions.map((s, i) => (
                <div key={i} style={{ padding: "14px 16px", background: "rgba(123,97,255,0.05)", border: "1px solid rgba(123,97,255,0.12)", borderRadius: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{s.icon} {s.label}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#E8E8F0" }}>{s.value}</div>
                  {s.confidence && (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${s.confidence}%`, height: "100%", background: "linear-gradient(90deg, #00FFB2, #7B61FF)", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 10, color: "#00FFB2" }}>%{s.confidence}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Campaigns */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>Son Kampanyalar</div>
              <button style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#888", padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Tümünü Gör →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 0 }}>
              {["Kampanya", "Kanal", "Durum", "Erişim", "Açılma"].map(h => (
                <div key={h} style={{ fontSize: 10, color: "#444", fontWeight: 600, padding: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</div>
              ))}
              {mockCampaigns.map((c, i) => {
                const st = statusConfig[c.status];
                return [
                  <div key={`n${i}`} className="campaign-row" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "14px 0", display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: "#555" }}>{c.segment}</span>
                  </div>,
                  <div key={`ch${i}`} className="campaign-row" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "14px 0", display: "flex", gap: 6, alignItems: "center" }}>
                    {c.channel.includes("whatsapp") && <span style={{ background: "rgba(0,255,178,0.1)", color: "#00FFB2", padding: "3px 7px", borderRadius: 6, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><WhatsAppIcon/>WA</span>}
                    {c.channel.includes("email") && <span style={{ background: "rgba(123,97,255,0.1)", color: "#7B61FF", padding: "3px 7px", borderRadius: 6, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><EmailIcon/>Mail</span>}
                  </div>,
                  <div key={`st${i}`} className="campaign-row" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "14px 0" }}>
                    <span style={{ background: st.bg, color: st.color, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      {c.status === "sending" && <span className="pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: st.color, display: "inline-block" }} />}
                      {st.label}
                    </span>
                  </div>,
                  <div key={`r${i}`} className="campaign-row" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "14px 0", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>
                    {c.reach.toLocaleString("tr")}
                  </div>,
                  <div key={`o${i}`} className="campaign-row" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "14px 0" }}>
                    {c.openRate ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: c.openRate > 80 ? "#00FFB2" : "#FFD93D" }}>%{c.openRate}</div>
                        <div style={{ marginTop: 6, width: 60, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${c.openRate}%`, height: "100%", background: c.openRate > 80 ? "#00FFB2" : "#FFD93D", borderRadius: 2 }} />
                        </div>
                      </div>
                    ) : <span style={{ color: "#333" }}>—</span>}
                  </div>
                ];
              })}
            </div>
          </div>

          {/* Segments */}
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {mockSegments.map((seg, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px", cursor: "pointer" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: seg.color, marginBottom: 10 }} />
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{seg.name}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: seg.color }}>{seg.count.toLocaleString("tr")}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{seg.growth} büyüme</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compose Panel */}
      {composing && (
        <div className="compose-panel" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#0F0F18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: 560, maxHeight: "85vh", overflowY: "auto", padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20 }}>Yeni Bülten <span style={{ color: "#00FFB2" }}>Oluştur</span></div>
              <button onClick={() => setComposing(false)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#888", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>×</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Kanal Seçimi</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[["whatsapp", "WhatsApp", "#00FFB2"], ["email", "E-posta", "#7B61FF"]].map(([val, label, color]) => (
                  <div key={val} style={{ flex: 1, background: `rgba(${val==="whatsapp"?"0,255,178":"123,97,255"},0.1)`, border: `1px solid ${color}40`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Segment</label>
              <select style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#E8E8F0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }}>
                {mockSegments.map(s => <option key={s.name} style={{ background: "#111" }}>{s.name} ({s.count.toLocaleString("tr")} kişi)</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>AI ile İçerik Üret</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Konu girin... (örn: e-ticaret lojistik trendleri)" style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#E8E8F0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
                <button className="ai-btn" onClick={handleAiGenerate} disabled={aiGenerating} style={{ background: "linear-gradient(135deg, #7B61FF, #00FFB2)", border: "none", borderRadius: 10, padding: "12px 18px", color: "#0A0A0F", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
                  {aiGenerating ? "Üretiyor..." : "✨ Üret"}
                </button>
              </div>
            </div>

            {aiGenerating && (
              <div style={{ padding: "16px", background: "rgba(123,97,255,0.08)", border: "1px solid rgba(123,97,255,0.2)", borderRadius: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>🤖</span>
                <span style={{ fontSize: 13, color: "#7B61FF" }}>AI içeriği hazırlıyor<span className="blink">▋</span></span>
              </div>
            )}

            {generatedContent && !aiGenerating && (
              <div className="slide-in" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Oluşturulan İçerik</label>
                <textarea value={generatedContent} onChange={e => setGeneratedContent(e.target.value)} rows={8} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,255,178,0.3)", borderRadius: 10, padding: "14px", color: "#E8E8F0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }} />
                <div style={{ marginTop: 8, display: "flex", gap: 8, fontSize: 11 }}>
                  <span style={{ background: "rgba(0,255,178,0.1)", color: "#00FFB2", padding: "4px 10px", borderRadius: 20 }}>✓ WhatsApp formatı uyumlu</span>
                  <span style={{ background: "rgba(123,97,255,0.1)", color: "#7B61FF", padding: "4px 10px", borderRadius: 20 }}>✓ Kişiselleştirme hazır</span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setComposing(false)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", padding: "13px", borderRadius: 12, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>İptal</button>
              <button style={{ flex: 1, background: "rgba(255,217,61,0.12)", border: "1px solid rgba(255,217,61,0.3)", color: "#FFD93D", padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>📅 Planla</button>
              <button style={{ flex: 2, background: "linear-gradient(135deg, #00FFB2, #00D4FF)", color: "#0A0A0F", border: "none", padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>📡 Gönder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
