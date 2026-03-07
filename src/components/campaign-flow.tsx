"use client";
import { useState } from "react";

// ── Mock data ──────────────────────────────────────────────────────────────
const SEGMENTS = [
  { id:"all",       name:"Tüm Liste",           count:11624, color:"#64748B" },
  { id:"premium",   name:"Premium Üyeler",       count:4821,  color:"#8B5CF6" },
  { id:"active",    name:"Aktif Alıcılar",       count:2103,  color:"#0EA5E9" },
  { id:"eticaret",  name:"E-ticaret Pro",         count:3412,  color:"#F59E0B" },
  { id:"girisimci", name:"Girişimciler",          count:1290,  color:"#10B981" },
];

const TEMPLATES = [
  { id:"haftalik", name:"haftalik_eticaret_bulteni", status:"APPROVED", vars:2 },
  { id:"flash",    name:"flash_firsat_bildirimi",    status:"APPROVED", vars:3 },
  { id:"trend",    name:"pazar_trendleri_ozeti",     status:"APPROVED", vars:2 },
];

const STEPS = [
  { id:"details",  icon:"✏️",  label:"Kampanya Detayları" },
  { id:"audience", icon:"👥",  label:"Hedef Kitle" },
  { id:"content",  icon:"📝",  label:"İçerik" },
  { id:"schedule", icon:"🕐",  label:"Zamanlama" },
  { id:"review",   icon:"🔍",  label:"Önizleme & Gönder" },
];

const AI_TOPICS = [
  "E-ticaret lojistik trendleri",
  "Sosyal ticaret istatistikleri",
  "Q1 pazar özeti",
  "Yapay zeka e-ticarette",
];

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString("tr");

function Tag({ children, color = "#0EA5E9" }) {
  return (
    <span style={{ background:`${color}18`, color, border:`1px solid ${color}30`, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>
      {children}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>{children}</div>;
}

function FieldRow({ label, children, last }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"150px 1fr", alignItems:"center", borderBottom: last ? "none" : "1px solid #F1F5F9" }}>
      <label style={{ fontSize:13, fontWeight:500, color:"#64748B", padding:"13px 16px", borderRight:"1px solid #F1F5F9" }}>{label}</label>
      <div style={{ padding:"8px 14px" }}>{children}</div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function CampaignFlow() {
  const [step, setStep]         = useState(0);
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);

  // form state
  const [name, setName]           = useState("");
  const [channels, setChannels]   = useState({ whatsapp:true, email:true });
  const [segmentId, setSegmentId] = useState("premium");
  const [templateId, setTemplateId] = useState("haftalik");
  const [subject, setSubject]     = useState("");
  const [body, setBody]           = useState("");
  const [vars, setVars]           = useState({ "1":"", "2":"" });
  const [aiTopic, setAiTopic]     = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [scheduleType, setScheduleType] = useState("now"); // now | scheduled | ai
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("10:00");

  const segment  = SEGMENTS.find(s => s.id === segmentId);
  const template = TEMPLATES.find(t => t.id === templateId);

  const toggleChannel = (ch) => setChannels(c => ({ ...c, [ch]: !c[ch] }));

  const generateAI = () => {
    if (!aiTopic) return;
    setAiLoading(true);
    setTimeout(() => {
      setBody(`📦 **${aiTopic}**\n\nMerhaba {{1}},\n\nBu haftanın öne çıkan gelişmeleri hazır!\n\n${
        aiTopic.includes("lojistik")
          ? "• Same-day delivery talebi %60 arttı\n• Drone teslimat pilotları genişliyor\n• Son mil maliyetleri %18 düştü"
          : aiTopic.includes("sosyal")
          ? "• TikTok Shop entegrasyonları %340 büyüdü\n• Instagram checkout dönüşüm oranı 2.4x\n• Live commerce GMV rekoru kırıldı"
          : "• Pazar büyümesi %18 ile beklentilerin üzerinde\n• Mobil alışveriş toplam trafiğin %72'sine ulaştı\n• Ortalama sepet değeri ₺847'ye yükseldi"
      }\n\nDetaylar için bağlantıya göz atabilirsiniz. 👇`);
      setSubject(`${aiTopic} — Haftalık Bülten`);
      setAiLoading(false);
    }, 2000);
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 2800);
  };

  const canNext = () => {
    if (step === 0) return name.trim() && (channels.whatsapp || channels.email);
    if (step === 2) return body.trim();
    return true;
  };

  const reachCount = segment?.count || 0;
  const waCount    = channels.whatsapp ? Math.round(reachCount * 0.72) : 0;
  const emailCount = channels.email    ? Math.round(reachCount * 0.95) : 0;

  if (sent) return <SentScreen name={name} segment={segment} waCount={waCount} emailCount={emailCount} onNew={() => { setSent(false); setStep(0); setName(""); setBody(""); setSubject(""); }} />;

  return (
    <div style={{ fontFamily:"'Geist',sans-serif", background:"#F8FAFC", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input,select,textarea { outline:none; font-family:'Geist',sans-serif; }
        input:focus,select:focus,textarea:focus { border-color:#0EA5E9!important; box-shadow:0 0 0 3px rgba(14,165,233,0.1)!important; }
        .btn { transition:all 0.14s ease; cursor:pointer; }
        .btn:hover { filter:brightness(0.93); }
        .btn:active { transform:scale(0.98); }
        .seg-card { transition:all 0.15s ease; cursor:pointer; }
        .seg-card:hover { border-color:#0EA5E9!important; }
        .ch-card { transition:all 0.15s ease; cursor:pointer; }
        .ch-card:hover { transform:translateY(-1px); }
        .slide { animation:slide 0.25s ease forwards; }
        @keyframes slide { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        .spin { animation:spin 1s linear infinite; display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fadeup { animation:fadeup 0.35s ease forwards; }
        @keyframes fadeup { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        textarea { resize:vertical; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:2px; }
        .progress-fill { transition:width 0.4s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0", padding:"13px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#0EA5E9,#6366F1)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>📡</div>
          <span style={{ fontFamily:"'Geist Mono',monospace", fontWeight:600, fontSize:15, color:"#0F172A" }}>bulletin<span style={{ color:"#0EA5E9" }}>AI</span></span>
          <span style={{ width:1, height:18, background:"#E2E8F0", margin:"0 6px" }} />
          <span style={{ fontSize:12, color:"#94A3B8" }}>Yeni Kampanya</span>
        </div>
        {/* Step progress bar */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:20, background: i === step ? "#EFF6FF" : i < step ? "#F0FDF4" : "transparent" }}>
                <span style={{ fontSize:12, width:20, height:20, borderRadius:"50%", background: i < step ? "#22C55E" : i === step ? "#0EA5E9" : "#E2E8F0", color: i <= step ? "#fff" : "#94A3B8", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:10, flexShrink:0 }}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span style={{ fontSize:12, fontWeight: i === step ? 600 : 400, color: i < step ? "#22C55E" : i === step ? "#0EA5E9" : "#94A3B8", whiteSpace:"nowrap" }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <span style={{ color:"#E2E8F0", fontSize:14 }}>›</span>}
            </div>
          ))}
        </div>
        <div style={{ width:120 }} />
      </div>

      {/* Body */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"36px 24px" }}>
        <div className="slide" key={step}>

          {/* ══ STEP 0: Details ══ */}
          {step === 0 && (
            <div>
              <StepTitle icon="✏️" title="Kampanya Detayları" sub="Kampanyanıza bir isim verin ve hangi kanallardan göndereceğinizi seçin." />
              <Card style={{ marginBottom:16 }}>
                <FieldRow label="Kampanya Adı">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Haftalık E-ticaret #48" style={{ width:"100%", border:"none", background:"transparent", fontSize:14, color:"#0F172A", padding:"4px 0" }} />
                </FieldRow>
                <FieldRow label="Gönderim Kanalı" last>
                  <div style={{ display:"flex", gap:10 }}>
                    {[
                      { id:"whatsapp", label:"WhatsApp", icon:"💬", color:"#25D366", note:"~%91 açılma" },
                      { id:"email",    label:"E-posta",  icon:"📧", color:"#0EA5E9", note:"~%44 açılma" },
                    ].map(ch => {
                      const on = channels[ch.id];
                      return (
                        <div key={ch.id} className="ch-card" onClick={() => toggleChannel(ch.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background: on ? `${ch.color}0f` : "#F8FAFC", border:`1.5px solid ${on ? ch.color : "#E2E8F0"}`, borderRadius:10, cursor:"pointer" }}>
                          <span style={{ fontSize:18 }}>{ch.icon}</span>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color: on ? ch.color : "#94A3B8" }}>{ch.label}</div>
                            <div style={{ fontSize:11, color:"#94A3B8" }}>{ch.note}</div>
                          </div>
                          <div style={{ marginLeft:8, width:18, height:18, borderRadius:4, background: on ? ch.color : "#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            {on && <span style={{ color:"#fff", fontSize:10 }}>✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </FieldRow>
              </Card>
              {/* Reach estimate */}
              {(channels.whatsapp || channels.email) && (
                <div className="fadeup" style={{ padding:"14px 18px", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:12, display:"flex", gap:20, alignItems:"center" }}>
                  <span style={{ fontSize:13, color:"#3B82F6" }}>📊 Tahmini erişim:</span>
                  {channels.whatsapp && <span style={{ fontSize:13, fontWeight:600, color:"#25D366" }}>💬 {fmt(waCount)} WhatsApp</span>}
                  {channels.email    && <span style={{ fontSize:13, fontWeight:600, color:"#0EA5E9" }}>📧 {fmt(emailCount)} E-posta</span>}
                  <span style={{ fontSize:12, color:"#94A3B8", marginLeft:"auto" }}>Seçili segmente göre</span>
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 1: Audience ══ */}
          {step === 1 && (
            <div>
              <StepTitle icon="👥" title="Hedef Kitle" sub="Kampanyanın gönderileceği segmenti seçin. AI en uygun segmenti önerebilir." />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                {SEGMENTS.map(seg => (
                  <div key={seg.id} className="seg-card" onClick={() => setSegmentId(seg.id)} style={{ padding:"16px 18px", background: segmentId===seg.id ? `${seg.color}0c` : "#fff", border:`1.5px solid ${segmentId===seg.id ? seg.color : "#E2E8F0"}`, borderRadius:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:seg.color, marginTop:3 }} />
                      {segmentId===seg.id && <span style={{ fontSize:10, background:`${seg.color}20`, color:seg.color, padding:"2px 8px", borderRadius:20, fontWeight:600 }}>Seçildi</span>}
                    </div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:4 }}>{seg.name}</div>
                    <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:22, fontWeight:600, color:seg.color }}>{fmt(seg.count)}</div>
                    <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>abone</div>
                  </div>
                ))}
              </div>
              {/* AI suggestion */}
              <Card style={{ padding:"16px 18px", borderColor:"#E0E7FF", background:"#F5F3FF" }}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#8B5CF6,#6366F1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>✨</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#4C1D95", marginBottom:4 }}>AI Segment Önerisi</div>
                    <div style={{ fontSize:12, color:"#6D28D9", lineHeight:1.6 }}>
                      Son 3 kampanyanın verilerine göre <strong>"Premium Üyeler"</strong> segmenti bu içerik türü için %94 açılma oranıyla en yüksek performansı gösterdi. Bu segmenti öneririz.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ══ STEP 2: Content ══ */}
          {step === 2 && (
            <div>
              <StepTitle icon="📝" title="İçerik" sub="AI ile içerik üretin veya kendiniz yazın. WhatsApp için şablon seçin." />

              {/* AI generator */}
              <Card style={{ padding:"20px", marginBottom:16, borderColor:"#E0E7FF" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#8B5CF6,#6366F1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>✨</div>
                  <span style={{ fontSize:13, fontWeight:700, color:"#4C1D95" }}>AI İçerik Üretici</span>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Konu girin... (örn: e-ticaret lojistik trendleri)" style={{ flex:1, background:"#F5F3FF", border:"1px solid #DDD6FE", borderRadius:9, padding:"10px 14px", fontSize:13, color:"#0F172A" }} />
                  <button className="btn" onClick={generateAI} disabled={!aiTopic || aiLoading} style={{ background: !aiTopic ? "#F1F5F9" : "linear-gradient(135deg,#8B5CF6,#6366F1)", border:"none", color: !aiTopic ? "#94A3B8" : "#fff", padding:"10px 18px", borderRadius:9, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:7, whiteSpace:"nowrap" }}>
                    {aiLoading ? <><span className="spin">⟳</span> Üretiyor...</> : "✨ Üret"}
                  </button>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {AI_TOPICS.map(t => (
                    <button key={t} className="btn" onClick={() => setAiTopic(t)} style={{ background:"#EDE9FE", border:"1px solid #DDD6FE", color:"#6D28D9", padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:500 }}>{t}</button>
                  ))}
                </div>
              </Card>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {/* Left: content editor */}
                <div>
                  {channels.whatsapp && (
                    <div style={{ marginBottom:14 }}>
                      <SectionLabel>💬 WhatsApp Şablonu</SectionLabel>
                      <Card>
                        {TEMPLATES.map(t => (
                          <div key={t.id} onClick={() => setTemplateId(t.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderBottom:"1px solid #F1F5F9", cursor:"pointer", background: templateId===t.id ? "#F0F9FF" : "transparent", transition:"background 0.12s" }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background: templateId===t.id ? "#0EA5E9" : "#E2E8F0", flexShrink:0 }} />
                            <div style={{ flex:1 }}>
                              <code style={{ fontSize:12, color: templateId===t.id ? "#0EA5E9" : "#64748B", fontFamily:"'Geist Mono',monospace" }}>{t.name}</code>
                            </div>
                            <Tag color="#22C55E">{t.status}</Tag>
                          </div>
                        ))}
                      </Card>
                      {/* Variables */}
                      {template && (
                        <div style={{ marginTop:10 }}>
                          <SectionLabel>Şablon Değişkenleri</SectionLabel>
                          <Card>
                            {Array.from({ length: template.vars }, (_, i) => (
                              <FieldRow key={i} label={`{{${i+1}}}`} last={i === template.vars - 1}>
                                <input value={vars[String(i+1)] || ""} onChange={e => setVars(v => ({ ...v, [String(i+1)]: e.target.value }))} placeholder={i===0 ? "Ad Soyad (kişiselleştirme)" : "Bülten içeriği veya özet"} style={{ width:"100%", border:"none", background:"transparent", fontSize:13, color:"#0F172A", padding:"4px 0" }} />
                              </FieldRow>
                            ))}
                          </Card>
                        </div>
                      )}
                    </div>
                  )}

                  {channels.email && (
                    <div>
                      <SectionLabel>📧 E-posta İçeriği</SectionLabel>
                      <Card style={{ padding:0, overflow:"hidden" }}>
                        <FieldRow label="Konu Satırı">
                          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="E-posta konu satırı" style={{ width:"100%", border:"none", background:"transparent", fontSize:13, color:"#0F172A", padding:"4px 0" }} />
                        </FieldRow>
                        <div style={{ padding:"12px 14px" }}>
                          <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} placeholder={"Merhaba {{1}},\n\nBülten içeriğiniz buraya..."} style={{ width:"100%", border:"1px solid #E2E8F0", borderRadius:8, padding:"12px", fontSize:13, color:"#0F172A", lineHeight:1.7, background:"#FAFAFA" }} />
                          <div style={{ fontSize:11, color:"#94A3B8", marginTop:6 }}>{body.length} karakter</div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Right: phone preview */}
                <div>
                  <SectionLabel style={{ textAlign:"center" }}>Önizleme</SectionLabel>
                  <div style={{ background:"#1a1f2e", borderRadius:22, padding:"8px", boxShadow:"0 12px 40px rgba(0,0,0,0.25)", maxWidth:280, margin:"0 auto" }}>
                    <div style={{ background:"#0b141a", borderRadius:16, overflow:"hidden" }}>
                      <div style={{ background:"#128C7E", padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🏢</div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:"#fff" }}>İşletme Adı</div>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)" }}>Doğrulanmış ✓</div>
                        </div>
                      </div>
                      <div style={{ background:"#0b141a", padding:"12px 10px", minHeight:180 }}>
                        <div style={{ background:"#1f2c34", borderRadius:"4px 10px 10px 10px", padding:"10px 12px", maxWidth:"92%" }}>
                          {body ? (
                            <div style={{ fontSize:11, color:"#E9EDEF", lineHeight:1.65, whiteSpace:"pre-wrap" }}>
                              {body.replace(/\{\{1\}\}/g, vars["1"]||"[Ad]").replace(/\{\{2\}\}/g, vars["2"]||"[İçerik]").replace(/\*(.+?)\*/g,"$1").replace(/_(.+?)_/g,"$1").slice(0,320)}
                              {body.length>320 && "..."}
                            </div>
                          ) : (
                            <div style={{ fontSize:11, color:"#4A5568", fontStyle:"italic" }}>İçerik girildiğinde burada görünecek...</div>
                          )}
                          <div style={{ textAlign:"right", fontSize:9, color:"#8696a0", marginTop:4 }}>12:00 ✓✓</div>
                        </div>
                      </div>
                      <div style={{ background:"#1f2c34", padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ flex:1, background:"#2a3942", borderRadius:20, padding:"7px 12px", fontSize:10, color:"#8696a0" }}>Mesaj yazın...</div>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"#00a3af", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🎤</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 3: Schedule ══ */}
          {step === 3 && (
            <div>
              <StepTitle icon="🕐" title="Zamanlama" sub="Kampanyanızı hemen gönderin, planlayın veya AI'ın en iyi zamanı seçmesine izin verin." />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
                {[
                  { id:"now",       icon:"⚡", title:"Hemen Gönder",    desc:"Onaylamanın ardından anında gönderilir", color:"#EF4444" },
                  { id:"scheduled", icon:"📅", title:"Planla",          desc:"Belirli bir tarih ve saat seçin",        color:"#0EA5E9" },
                  { id:"ai",        icon:"✨", title:"AI Zamanlama",    desc:"Açılma verisine göre en iyi saati seçer", color:"#8B5CF6" },
                ].map(opt => (
                  <div key={opt.id} className="seg-card" onClick={() => setScheduleType(opt.id)} style={{ padding:"20px 18px", background: scheduleType===opt.id ? `${opt.color}0c` : "#fff", border:`2px solid ${scheduleType===opt.id ? opt.color : "#E2E8F0"}`, borderRadius:14, cursor:"pointer" }}>
                    <div style={{ fontSize:28, marginBottom:10 }}>{opt.icon}</div>
                    <div style={{ fontSize:14, fontWeight:700, color: scheduleType===opt.id ? opt.color : "#0F172A", marginBottom:6 }}>{opt.title}</div>
                    <div style={{ fontSize:12, color:"#64748B", lineHeight:1.5 }}>{opt.desc}</div>
                  </div>
                ))}
              </div>

              {scheduleType === "scheduled" && (
                <Card style={{ padding:"20px", marginBottom:16 }} className="fadeup">
                  <SectionLabel>Gönderim Zamanı</SectionLabel>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div>
                      <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6 }}>Tarih</label>
                      <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ width:"100%", background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:9, padding:"10px 12px", fontSize:13, color:"#0F172A" }} />
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6 }}>Saat</label>
                      <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} style={{ width:"100%", background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:9, padding:"10px 12px", fontSize:13, color:"#0F172A" }} />
                    </div>
                  </div>
                </Card>
              )}

              {scheduleType === "ai" && (
                <Card style={{ padding:"20px", borderColor:"#E0E7FF", background:"#F5F3FF" }}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#8B5CF6,#6366F1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>✨</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:"#4C1D95", marginBottom:6 }}>AI Öneri: Salı 10:15</div>
                      <div style={{ fontSize:12, color:"#6D28D9", lineHeight:1.6, marginBottom:12 }}>
                        <strong>Premium Üyeler</strong> segmenti için son 8 kampanya verisi analiz edildi. Salı sabahı 10:00–11:30 arası %94 açılma oranıyla en yüksek performans penceresini oluşturuyor.
                      </div>
                      <div style={{ display:"flex", gap:10 }}>
                        <div style={{ padding:"8px 14px", background:"rgba(139,92,246,0.12)", border:"1px solid #DDD6FE", borderRadius:8, fontSize:12, color:"#6D28D9" }}>📊 %94 tahmini açılma</div>
                        <div style={{ padding:"8px 14px", background:"rgba(139,92,246,0.12)", border:"1px solid #DDD6FE", borderRadius:8, fontSize:12, color:"#6D28D9" }}>⏱ Salı 10:15</div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {scheduleType === "now" && (
                <div style={{ padding:"14px 18px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:12, fontSize:13, color:"#991B1B" }}>
                  ⚠️ Hemen gönder seçeneğinde gönderim geri alınamaz. Devam etmeden önce içeriği kontrol edin.
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 4: Review & Send ══ */}
          {step === 4 && (
            <div>
              <StepTitle icon="🔍" title="Önizleme & Gönder" sub="Her şey doğru mu? Onaylayın ve gönderin." />

              {/* Summary grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                {[
                  { label:"Kampanya Adı",  val:name || "—",         icon:"✏️" },
                  { label:"Segment",       val:segment?.name,        icon:"👥" },
                  { label:"Kanallar",      val:[channels.whatsapp&&"WhatsApp",channels.email&&"E-posta"].filter(Boolean).join(" + "), icon:"📡" },
                  { label:"Zamanlama",     val:scheduleType==="now"?"Hemen":scheduleType==="ai"?"AI Önerisi (Salı 10:15)":scheduleDate?`${scheduleDate} ${scheduleTime}`:"Belirtilmedi", icon:"🕐" },
                ].map((item, i) => (
                  <Card key={i} style={{ padding:"14px 16px", display:"flex", gap:12, alignItems:"center" }}>
                    <span style={{ fontSize:20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize:11, color:"#94A3B8", marginBottom:2 }}>{item.label}</div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#0F172A" }}>{item.val}</div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Reach breakdown */}
              <Card style={{ padding:"18px 20px", marginBottom:16 }}>
                <SectionLabel>Erişim Tahmini</SectionLabel>
                <div style={{ display:"flex", gap:16 }}>
                  {channels.whatsapp && (
                    <div style={{ flex:1, padding:"14px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, textAlign:"center" }}>
                      <div style={{ fontSize:11, color:"#166534", marginBottom:4 }}>💬 WhatsApp</div>
                      <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:26, fontWeight:600, color:"#25D366" }}>{fmt(waCount)}</div>
                      <div style={{ fontSize:11, color:"#4ADE80", marginTop:2 }}>~%91 açılma bekleniyor</div>
                    </div>
                  )}
                  {channels.email && (
                    <div style={{ flex:1, padding:"14px", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:10, textAlign:"center" }}>
                      <div style={{ fontSize:11, color:"#1D4ED8", marginBottom:4 }}>📧 E-posta</div>
                      <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:26, fontWeight:600, color:"#0EA5E9" }}>{fmt(emailCount)}</div>
                      <div style={{ fontSize:11, color:"#60A5FA", marginTop:2 }}>~%44 açılma bekleniyor</div>
                    </div>
                  )}
                  <div style={{ flex:1, padding:"14px", background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:10, textAlign:"center" }}>
                    <div style={{ fontSize:11, color:"#64748B", marginBottom:4 }}>📊 Toplam Erişim</div>
                    <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:26, fontWeight:600, color:"#0F172A" }}>{fmt(waCount + emailCount)}</div>
                    <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>kişiye ulaşacak</div>
                  </div>
                </div>
              </Card>

              {/* Content preview */}
              {body && (
                <Card style={{ padding:"18px 20px", marginBottom:20 }}>
                  <SectionLabel>İçerik Önizlemesi</SectionLabel>
                  <div style={{ fontSize:13, color:"#334155", lineHeight:1.7, whiteSpace:"pre-wrap", background:"#F8FAFC", borderRadius:8, padding:"14px", fontFamily:"'Geist Mono',monospace", fontSize:12 }}>
                    {body.slice(0, 300)}{body.length > 300 && "\n..."}
                  </div>
                </Card>
              )}

              {/* Send button */}
              <button className="btn" onClick={handleSend} disabled={sending} style={{ width:"100%", padding:"17px", background: sending ? "#E2E8F0" : scheduleType==="now" ? "linear-gradient(135deg,#EF4444,#F97316)" : "linear-gradient(135deg,#0EA5E9,#6366F1)", border:"none", borderRadius:12, color: sending ? "#94A3B8" : "#fff", fontSize:16, fontWeight:700, letterSpacing:"-0.2px", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                {sending ? (
                  <><span className="spin">⟳</span> Gönderiliyor...</>
                ) : scheduleType === "now" ? (
                  `⚡ Hemen Gönder — ${fmt(waCount+emailCount)} kişiye`
                ) : scheduleType === "ai" ? (
                  "✨ AI Zamanlamasıyla Planla"
                ) : (
                  `📅 ${scheduleDate} ${scheduleTime} için Planla`
                )}
              </button>
            </div>
          )}

        </div>

        {/* ── Nav ── */}
        {!sent && step < STEPS.length && (
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
            {step > 0
              ? <button className="btn" onClick={() => setStep(s=>s-1)} style={{ background:"#fff", border:"1px solid #E2E8F0", color:"#64748B", padding:"11px 22px", borderRadius:10, fontSize:14, fontWeight:500 }}>← Geri</button>
              : <span />}
            {step < STEPS.length - 1 && (
              <button className="btn" onClick={() => setStep(s=>s+1)} disabled={!canNext()} style={{ background: !canNext() ? "#F1F5F9" : "linear-gradient(135deg,#0EA5E9,#6366F1)", border:"none", color: !canNext() ? "#94A3B8" : "#fff", padding:"11px 28px", borderRadius:10, fontSize:14, fontWeight:600 }}>
                Devam Et →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sent success screen ────────────────────────────────────────────────────
function SentScreen({ name, segment, waCount, emailCount, onNew }) {
  const [t, setT] = useState(0);
  useState(() => { const id = setInterval(() => setT(p => p < 100 ? p + 2 : 100), 40); return () => clearInterval(id); });
  return (
    <div style={{ fontFamily:"'Geist',sans-serif", background:"#F8FAFC", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ maxWidth:520, width:"100%", padding:"0 24px", textAlign:"center" }}>
        <div style={{ fontSize:64, marginBottom:20, animation:"fadeup 0.5s ease" }}>🚀</div>
        <h1 style={{ fontSize:28, fontWeight:700, color:"#0F172A", marginBottom:8, letterSpacing:"-0.5px" }}>Kampanya Gönderildi!</h1>
        <p style={{ fontSize:15, color:"#64748B", marginBottom:32, lineHeight:1.6 }}><strong style={{ color:"#0F172A" }}>{name}</strong> kampanyası <strong style={{ color:"#0F172A" }}>{segment?.name}</strong> segmentine iletildi.</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
          <div style={{ padding:"18px", background:"#F0FDF4", border:"1px solid #86EFAC", borderRadius:12 }}>
            <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:28, fontWeight:600, color:"#22C55E", marginBottom:4 }}>{(waCount/1000).toFixed(1)}K</div>
            <div style={{ fontSize:12, color:"#166534" }}>💬 WhatsApp gönderildi</div>
          </div>
          <div style={{ padding:"18px", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:12 }}>
            <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:28, fontWeight:600, color:"#0EA5E9", marginBottom:4 }}>{(emailCount/1000).toFixed(1)}K</div>
            <div style={{ fontSize:12, color:"#1D4ED8" }}>📧 E-posta gönderildi</div>
          </div>
        </div>
        {/* Delivery progress */}
        <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:12, padding:"16px 20px", marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#64748B", marginBottom:8 }}>
            <span>İletim durumu</span>
            <span style={{ fontWeight:600, color:"#0EA5E9" }}>%{t}</span>
          </div>
          <div style={{ height:6, background:"#E2E8F0", borderRadius:3, overflow:"hidden" }}>
            <div className="progress-fill" style={{ width:`${t}%`, height:"100%", background:"linear-gradient(90deg,#0EA5E9,#22C55E)", borderRadius:3, transition:"width 0.05s linear" }} />
          </div>
          <div style={{ fontSize:11, color:"#94A3B8", marginTop:8 }}>Gerçek zamanlı teslim raporu için Analizler sayfasını takip edin</div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onNew} style={{ flex:1, padding:"13px", background:"#fff", border:"1px solid #E2E8F0", borderRadius:10, fontSize:14, fontWeight:500, color:"#64748B", cursor:"pointer" }}>+ Yeni Kampanya</button>
          <button style={{ flex:1, padding:"13px", background:"linear-gradient(135deg,#0EA5E9,#6366F1)", border:"none", borderRadius:10, fontSize:14, fontWeight:600, color:"#fff", cursor:"pointer" }}>📊 Analizlere Git</button>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ icon, title, sub }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
      <h2 style={{ fontSize:22, fontWeight:700, color:"#0F172A", marginBottom:6, letterSpacing:"-0.4px" }}>{title}</h2>
      <p style={{ fontSize:14, color:"#64748B", lineHeight:1.6 }}>{sub}</p>
    </div>
  );
}
