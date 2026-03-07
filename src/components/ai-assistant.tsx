"use client";
import { useState, useRef, useEffect } from "react";

// ── Mock & Config ──────────────────────────────────────────────────────────
const TONES = [
  { id:"professional", label:"Profesyonel", emoji:"💼" },
  { id:"friendly",     label:"Samimi",      emoji:"😊" },
  { id:"urgent",       label:"Acil/Dikkat", emoji:"⚡" },
  { id:"informative",  label:"Bilgilendirici", emoji:"📊" },
  { id:"creative",     label:"Yaratıcı",    emoji:"🎨" },
];

const LENGTHS = [
  { id:"short",  label:"Kısa",   desc:"WhatsApp ideal", chars:"~200 karakter" },
  { id:"medium", label:"Orta",   desc:"Her kanal",       chars:"~500 karakter" },
  { id:"long",   label:"Uzun",   desc:"E-posta ideal",   chars:"~1200 karakter" },
];

const TOPICS = [
  { cat:"E-ticaret", items:["Haftalık pazar özeti","Flash indirim duyurusu","Yeni ürün lansmanı","Sepet terk analizi","Mobil alışveriş trendleri"] },
  { cat:"Girişim",   items:["Startup ekosistemi haberleri","Yatırım turları özeti","Ürün geliştirme ipuçları","SaaS büyüme taktikleri"] },
  { cat:"Lojistik",  items:["Teslimat trendleri","Son mil çözümleri","Depo teknolojileri","Tedarik zinciri güncellemesi"] },
];

const HISTORY = [
  { id:1, title:"Haftalık E-ticaret #47", tone:"Profesyonel", channel:"WhatsApp + E-posta", date:"3 Mar", score:92 },
  { id:2, title:"Flash Fırsat Duyurusu",  tone:"Acil/Dikkat", channel:"WhatsApp",           date:"28 Şub", score:88 },
  { id:3, title:"Pazar Trendleri Özeti",  tone:"Bilgilendirici", channel:"E-posta",          date:"21 Şub", score:85 },
];

const GENERATED = {
  wa: (topic, tone) => `📦 *${topic}*\n\nMerhaba {{1}},\n\n${
    tone === "urgent"
      ? "⚡ BUGÜN BİTİYOR! Kaçırmayın:\n\n• Pazar %18 büyüdü — rekabette geride kalmayın\n• Mobil satışlar %72'ye ulaştı\n• Same-day delivery talebi rekor kırdı\n\nHemen harekete geçin 👇"
      : tone === "friendly"
      ? "Bu haftanın e-ticaret dünyasından ilginç gelişmeler var! 🚀\n\n• Pazar %18 büyüdü, harika değil mi?\n• Mobil alışveriş artık trafiğin %72'si\n• Hızlı teslimat beklentisi her geçen gün artıyor\n\nDetaylar için aşağıya göz at 👇"
      : "Bu haftanın öne çıkan e-ticaret gelişmeleri:\n\n• Türkiye e-ticaret pazarı %18 büyüme kaydetti\n• Mobil alışveriş toplam trafiğin %72'sine ulaştı\n• Same-day delivery talebi %60 arttı\n\nDetaylar için bağlantıya göz atabilirsiniz."
  }`,
  email: (topic, tone) => `Konu: ${topic} — Haftalık Bülten\n\nMerhaba {{1}},\n\n${
    tone === "urgent"
      ? "⚡ Bu haftanın kritik e-ticaret gelişmelerini kaçırmayın!\n\nTürkiye e-ticaret sektörü Şubat ayında beklentilerin üzerinde, %18 büyüme kaydetti. Bu rakamın sizin için ne anlama geldiğini bu bültende ele aldık.\n\n📊 ÖNE ÇIKAN VERİLER\n• Mobil alışveriş payı: %72 (rekor)\n• Same-day delivery talebi: +%60\n• Ortalama sepet değeri: ₺847\n• TikTok Shop entegrasyonları: +%340\n\nBu verilere göre stratejinizi nasıl güncelleyeceğinizi öğrenmek için bülteni okuyun."
      : tone === "friendly"
      ? "Selam! 👋\n\nHaftalık bültenimizle yeniden karşınızdayız ve bu hafta gerçekten heyecan verici gelişmeler var!\n\nBiliyorsunuz, e-ticaret dünyası hiç durmuyor. Bu hafta pazar %18 büyüdü — bu rakam sektör ortalamasının oldukça üzerinde!\n\n🎯 Bu Hafta Neler Oldu?\n• Mobil alışveriş artık trafiğin %72'si — telefonsuz alışveriş neredeyse kalmadı\n• Hızlı teslimat talebi patladı — müşteriler artık \"yarın\" demiyor, \"bu gün\" istiyor\n• TikTok üzerinden alışveriş çılgınlığı devam ediyor\n\nUmarız işinize yarar!"
      : "Bu haftanın e-ticaret verilerini sizinle paylaşıyoruz.\n\nPazar Özeti\nTürkiye e-ticaret pazarı Şubat 2025'te bir önceki yılın aynı dönemine kıyasla %18 büyüme kaydetti. Bu büyüme, sektör beklentilerinin %6 üzerinde gerçekleşti.\n\nÖne Çıkan Veriler\n• Mobil alışveriş oranı: %72 (yeni rekor)\n• Same-day delivery talebi: %60 artış\n• Ortalama sepet değeri: ₺847\n• Sosyal ticaret büyümesi: %340\n\nDetaylı analiz için bağlantıya tıklayabilirsiniz."
  }`,
};

const scoreContent = (text) => {
  if (!text) return 0;
  let s = 50;
  if (text.length > 100) s += 10;
  if (text.length > 300) s += 10;
  if (/\{\{1\}\}/.test(text)) s += 10;
  if (/[🚀📦⚡💡📊]/.test(text)) s += 8;
  if (/\*.*\*/.test(text)) s += 6;
  if (text.split("\n").length > 4) s += 6;
  return Math.min(s, 100);
};

// ── Main ───────────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [topic, setTopic]       = useState("");
  const [tone, setTone]         = useState("professional");
  const [length, setLength]     = useState("medium");
  const [channels, setChannels] = useState({ wa:true, email:true });
  const [loading, setLoading]   = useState(false);
  const [waText, setWaText]     = useState("");
  const [emailText, setEmailText] = useState("");
  const [activeTab, setActiveTab] = useState("wa");
  const [copied, setCopied]     = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveNote, setImproveNote] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const promptRef = useRef();

  const hasContent = waText || emailText;
  const waScore    = scoreContent(waText);
  const emailScore = scoreContent(emailText);

  const generate = (t = topic) => {
    if (!t.trim()) return;
    setLoading(true);
    setWaText("");
    setEmailText("");
    setTimeout(() => {
      if (channels.wa)    setWaText(GENERATED.wa(t, tone));
      if (channels.email) setEmailText(GENERATED.email(t, tone));
      setLoading(false);
    }, 2000);
  };

  const improve = () => {
    if (!improveNote.trim()) return;
    setImproveLoading(true);
    setTimeout(() => {
      if (activeTab === "wa") setWaText(t => t + `\n\n💡 ${improveNote} eklendi.`);
      else setEmailText(t => t + `\n\n[İyileştirme: ${improveNote}]`);
      setImproveNote("");
      setImproveLoading(false);
    }, 1400);
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const ScoreBadge = ({ score }) => {
    const color = score >= 85 ? "#22C55E" : score >= 65 ? "#F59E0B" : "#EF4444";
    const label = score >= 85 ? "Mükemmel" : score >= 65 ? "İyi" : "Zayıf";
    return (
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:`${color}18`, border:`2px solid ${color}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Geist Mono',monospace", fontSize:11, fontWeight:700, color }}>{score}</div>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
          <div style={{ fontSize:9, color:"#94A3B8" }}>İçerik Skoru</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily:"'Geist',sans-serif", background:"#0D0D18", minHeight:"100vh", color:"#E2E8F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input,select,textarea { outline:none; font-family:'Geist',sans-serif; }
        input:focus,select:focus,textarea:focus { border-color:rgba(139,92,246,0.6)!important; box-shadow:0 0 0 3px rgba(139,92,246,0.1)!important; }
        .btn { transition:all 0.15s ease; cursor:pointer; }
        .btn:hover { opacity:0.85; }
        .btn:active { transform:scale(0.98); }
        .topic-chip { transition:all 0.12s; cursor:pointer; }
        .topic-chip:hover { background:rgba(139,92,246,0.15)!important; border-color:rgba(139,92,246,0.4)!important; }
        .tab-btn { transition:all 0.15s; cursor:pointer; }
        .slide { animation:slide 0.28s ease forwards; }
        @keyframes slide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .spin { animation:spin 1s linear infinite; display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .pulse-ring { animation:pulseRing 2s ease infinite; }
        @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.4)} 50%{box-shadow:0 0 0 8px rgba(139,92,246,0)} }
        .gen-cursor { animation:blink 1s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        textarea { resize:none; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#2D2D3F; border-radius:2px; }
        .hist-row:hover { background:rgba(255,255,255,0.04)!important; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(13,13,24,0.95)", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#8B5CF6,#6366F1)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>✨</div>
          <span style={{ fontFamily:"'Geist Mono',monospace", fontWeight:600, fontSize:15, letterSpacing:"-0.3px" }}>bulletin<span style={{ color:"#8B5CF6" }}>AI</span></span>
          <span style={{ width:1, height:18, background:"rgba(255,255,255,0.1)", margin:"0 6px" }} />
          <span style={{ fontSize:12, color:"#4B5563" }}>AI İçerik Asistanı</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn" onClick={() => setShowHistory(h => !h)} style={{ background: showHistory ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)", border:`1px solid ${showHistory ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.09)"}`, color: showHistory ? "#8B5CF6" : "#6B7280", padding:"7px 14px", borderRadius:9, fontSize:12, fontWeight:500 }}>
            📂 Geçmiş ({HISTORY.length})
          </button>
          {hasContent && (
            <button className="btn" style={{ background:"linear-gradient(135deg,#0EA5E9,#6366F1)", border:"none", color:"#fff", padding:"7px 16px", borderRadius:9, fontSize:12, fontWeight:600 }}>
              🚀 Kampanyaya Ekle
            </button>
          )}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: showHistory ? "1fr 380px 260px" : "1fr 380px", gap:0, minHeight:"calc(100vh - 57px)" }}>

        {/* ── LEFT: Controls ── */}
        <div style={{ padding:"28px 24px", borderRight:"1px solid rgba(255,255,255,0.06)", overflowY:"auto" }}>

          {/* Topic input */}
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:10 }}>
              Konu / Bülten Başlığı
            </label>
            <div style={{ display:"flex", gap:8 }}>
              <input
                ref={promptRef}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generate()}
                placeholder="Örn: Haftalık e-ticaret pazar özeti..."
                style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"12px 16px", fontSize:14, color:"#E2E8F0", transition:"border-color 0.15s, box-shadow 0.15s" }}
              />
              <button className="btn" onClick={() => generate()} disabled={!topic.trim() || loading} style={{ background: !topic.trim() ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#8B5CF6,#6366F1)", border:"none", color: !topic.trim() ? "#4B5563" : "#fff", padding:"12px 20px", borderRadius:10, fontSize:14, fontWeight:700, display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap" }}>
                {loading ? <><span className="spin">⟳</span> Yazıyor...</> : "✨ Üret"}
              </button>
            </div>
          </div>

          {/* Quick topics */}
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:10 }}>
              Hızlı Konular
            </label>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {TOPICS.map(cat => (
                <div key={cat.cat}>
                  <div style={{ fontSize:10, color:"#4B5563", fontWeight:600, marginBottom:6 }}>{cat.cat.toUpperCase()}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {cat.items.map(item => (
                      <button key={item} className="topic-chip btn" onClick={() => { setTopic(item); generate(item); }} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", color:"#9CA3AF", padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500 }}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:10 }}>Ton</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {TONES.map(t => (
                <button key={t.id} className="btn" onClick={() => setTone(t.id)} style={{ background: tone===t.id ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)", border:`1.5px solid ${tone===t.id ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.09)"}`, color: tone===t.id ? "#A78BFA" : "#6B7280", padding:"7px 14px", borderRadius:9, fontSize:12, fontWeight: tone===t.id ? 600 : 400, display:"flex", alignItems:"center", gap:6 }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:10 }}>Uzunluk</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {LENGTHS.map(l => (
                <button key={l.id} className="btn" onClick={() => setLength(l.id)} style={{ background: length===l.id ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)", border:`1.5px solid ${length===l.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`, color: length===l.id ? "#A78BFA" : "#6B7280", padding:"10px 12px", borderRadius:10, textAlign:"left" }}>
                  <div style={{ fontSize:13, fontWeight: length===l.id ? 600 : 400, marginBottom:2 }}>{l.label}</div>
                  <div style={{ fontSize:10, color:"#4B5563" }}>{l.desc}</div>
                  <div style={{ fontSize:10, color: length===l.id ? "#8B5CF6" : "#374151", marginTop:2 }}>{l.chars}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:10 }}>Kanallar</label>
            <div style={{ display:"flex", gap:8 }}>
              {[
                { id:"wa",    label:"WhatsApp", icon:"💬", color:"#25D366" },
                { id:"email", label:"E-posta",  icon:"📧", color:"#0EA5E9" },
              ].map(ch => {
                const on = channels[ch.id];
                return (
                  <button key={ch.id} className="btn" onClick={() => setChannels(c => ({ ...c, [ch.id]: !c[ch.id] }))} style={{ flex:1, background: on ? `${ch.color}12` : "rgba(255,255,255,0.03)", border:`1.5px solid ${on ? ch.color + "50" : "rgba(255,255,255,0.08)"}`, color: on ? ch.color : "#4B5563", padding:"10px 14px", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:13, fontWeight: on ? 600 : 400 }}>
                    {ch.icon} {ch.label}
                    <div style={{ width:16, height:16, borderRadius:4, background: on ? ch.color : "rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", marginLeft:4 }}>
                      {on && <span style={{ color:"#fff", fontSize:9 }}>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Improve existing */}
          {hasContent && (
            <div style={{ padding:"16px", background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#8B5CF6", marginBottom:10 }}>🔧 İçeriği İyileştir</div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={improveNote} onChange={e => setImproveNote(e.target.value)} onKeyDown={e => e.key==="Enter" && improve()} placeholder="Daha kısa yap, CTA ekle, emoji azalt..." style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", fontSize:12, color:"#E2E8F0" }} />
                <button className="btn" onClick={improve} disabled={!improveNote.trim() || improveLoading} style={{ background: !improveNote.trim() ? "rgba(255,255,255,0.04)" : "rgba(139,92,246,0.2)", border:`1px solid ${!improveNote.trim() ? "rgba(255,255,255,0.08)" : "rgba(139,92,246,0.4)"}`, color: !improveNote.trim() ? "#374151" : "#A78BFA", padding:"9px 14px", borderRadius:8, fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>
                  {improveLoading ? <span className="spin">⟳</span> : "→ Uygula"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── CENTER: Output ── */}
        <div style={{ display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
          {/* Tab bar */}
          <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
            {[
              { id:"wa",    label:"💬 WhatsApp", active: channels.wa },
              { id:"email", label:"📧 E-posta",  active: channels.email },
            ].filter(t => t.active).map(tab => (
              <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{ flex:1, padding:"13px 16px", background: activeTab===tab.id ? "rgba(139,92,246,0.08)" : "transparent", border:"none", borderBottom:`2px solid ${activeTab===tab.id ? "#8B5CF6" : "transparent"}`, color: activeTab===tab.id ? "#A78BFA" : "#4B5563", fontSize:13, fontWeight: activeTab===tab.id ? 600 : 400, transition:"all 0.15s" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div style={{ flex:1, padding:"20px", display:"flex", flexDirection:"column", gap:12 }}>

            {/* Score + actions */}
            {(activeTab==="wa" ? waText : emailText) && (
              <div className="slide" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <ScoreBadge score={activeTab==="wa" ? waScore : emailScore} />
                <div style={{ display:"flex", gap:6 }}>
                  <button className="btn" onClick={() => copy(activeTab==="wa" ? waText : emailText, activeTab)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", color: copied===activeTab ? "#22C55E" : "#6B7280", padding:"6px 12px", borderRadius:8, fontSize:11, fontWeight:500 }}>
                    {copied===activeTab ? "✓ Kopyalandı" : "📋 Kopyala"}
                  </button>
                  <button className="btn" onClick={() => generate()} style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.25)", color:"#A78BFA", padding:"6px 12px", borderRadius:8, fontSize:11, fontWeight:500 }}>
                    🔄 Yeniden Üret
                  </button>
                </div>
              </div>
            )}

            {/* Text area */}
            {loading ? (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
                <div className="pulse-ring" style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#6366F1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>✨</div>
                <div style={{ fontSize:14, color:"#6B7280" }}>İçerik yazılıyor<span className="gen-cursor">▋</span></div>
                <div style={{ fontSize:12, color:"#374151" }}>Ton: {TONES.find(t=>t.id===tone)?.label} · Kanal: {activeTab === "wa" ? "WhatsApp" : "E-posta"}</div>
              </div>
            ) : (activeTab==="wa" ? waText : emailText) ? (
              <textarea
                className="slide"
                value={activeTab==="wa" ? waText : emailText}
                onChange={e => activeTab==="wa" ? setWaText(e.target.value) : setEmailText(e.target.value)}
                style={{ flex:1, minHeight:360, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"16px", fontSize:13, color:"#E2E8F0", lineHeight:1.8, fontFamily: activeTab==="wa" ? "'Geist',sans-serif" : "'Geist Mono',monospace" }}
              />
            ) : (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, opacity:0.4 }}>
                <div style={{ fontSize:48 }}>✨</div>
                <div style={{ fontSize:14, color:"#6B7280", textAlign:"center" }}>Konu girin ve üret butonuna basın<br />ya da hızlı konu seçin</div>
              </div>
            )}

            {/* Score breakdown */}
            {(activeTab==="wa" ? waText : emailText) && !loading && (
              <div className="slide" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>İçerik Analizi</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
                  {[
                    { label:"Kişiselleştirme", ok:/\{\{1\}\}/.test(activeTab==="wa"?waText:emailText), tip:"{{1}} değişkeni" },
                    { label:"Emoji kullanımı",  ok:/[\u{1F300}-\u{1F9FF}]/u.test(activeTab==="wa"?waText:emailText), tip:"İlgi çekici" },
                    { label:"Aksiyon çağrısı",  ok:/(tıkla|göz at|incele|hemen|detay)/i.test(activeTab==="wa"?waText:emailText), tip:"CTA mevcut" },
                    { label:"Uzunluk uyumu",    ok:(activeTab==="wa"?waText:emailText).length > 80, tip:"Yeterli içerik" },
                  ].map((c,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:12, color: c.ok ? "#22C55E" : "#EF4444" }}>{c.ok ? "✓" : "✗"}</span>
                      <div>
                        <div style={{ fontSize:11, color: c.ok ? "#4ADE80" : "#F87171", fontWeight:500 }}>{c.label}</div>
                        <div style={{ fontSize:10, color:"#374151" }}>{c.tip}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: History (conditional) ── */}
        {showHistory && (
          <div className="slide" style={{ padding:"20px 16px", borderLeft:"1px solid rgba(255,255,255,0.06)", overflowY:"auto" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:16 }}>Geçmiş İçerikler</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {HISTORY.map(h => (
                <div key={h.id} className="hist-row btn" onClick={() => { setTopic(h.title); }} style={{ padding:"12px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, cursor:"pointer", transition:"background 0.12s" }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"#E2E8F0", marginBottom:4, lineHeight:1.4 }}>{h.title}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
                    <span style={{ fontSize:10, background:"rgba(139,92,246,0.1)", color:"#A78BFA", padding:"2px 7px", borderRadius:6 }}>{h.tone}</span>
                    <span style={{ fontSize:10, background:"rgba(255,255,255,0.06)", color:"#6B7280", padding:"2px 7px", borderRadius:6 }}>{h.channel}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:10, color:"#374151" }}>{h.date}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <div style={{ width:28, height:4, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ width:`${h.score}%`, height:"100%", background: h.score>=85?"#22C55E":h.score>=65?"#F59E0B":"#EF4444", borderRadius:2 }} />
                      </div>
                      <span style={{ fontSize:10, color: h.score>=85?"#4ADE80":h.score>=65?"#FCD34D":"#F87171", fontWeight:600 }}>{h.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div style={{ marginTop:20, padding:"14px", background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#8B5CF6", marginBottom:10 }}>💡 İpuçları</div>
              {[
                "{{1}} ile kişiselleştirme açılma oranını %30 artırır",
                "WhatsApp için 200 karakter altı en iyi performansı verir",
                "Emoji kullanımı tıklama oranını %12 yükseltir",
                "Salı–Perşembe 10–11:30 arası en iyi gönderim penceresi",
              ].map((tip, i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:8, fontSize:11, color:"#6B7280", lineHeight:1.5 }}>
                  <span style={{ color:"#8B5CF6", flexShrink:0 }}>•</span> {tip}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
