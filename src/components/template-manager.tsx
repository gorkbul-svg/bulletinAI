"use client";
import { useState } from "react";

// ── Mock Data ──────────────────────────────────────────────────────────────
const mockTemplates = [
  {
    id: 1, name: "haftalik_eticaret_bulteni", category: "MARKETING",
    status: "APPROVED", language: "tr",
    header: { type: "TEXT", text: "📦 Haftalık E-Ticaret Özeti" },
    body: "Merhaba {{1}},\n\nBu haftanın öne çıkan e-ticaret gelişmeleri hazır! 🚀\n\n{{2}}\n\nDetaylar için aşağıdaki bağlantıya göz atabilirsiniz.",
    footer: "bulletinAI • Abonelikten çıkmak için DUR yazın",
    buttons: [{ type: "URL", text: "Bülteni Oku", url: "https://bulten.link/{{1}}" }],
    createdAt: "12 Şub 2025", approvedAt: "14 Şub 2025", usageCount: 2341,
  },
  {
    id: 2, name: "flash_firsat_bildirimi", category: "MARKETING",
    status: "APPROVED", language: "tr",
    header: { type: "TEXT", text: "⚡ Flash Fırsat: {{1}}" },
    body: "{{2}} kullanıcısı merhaba!\n\n{{3}} saatlik özel kampanya başladı.\n\nKaçırmayın 👇",
    footer: "bulletinAI",
    buttons: [{ type: "QUICK_REPLY", text: "Fırsatı Gör" }, { type: "QUICK_REPLY", text: "İlgilenmiyorum" }],
    createdAt: "20 Şub 2025", approvedAt: "22 Şub 2025", usageCount: 891,
  },
  {
    id: 3, name: "pazar_trendleri_ozeti", category: "MARKETING",
    status: "PENDING", language: "tr",
    header: { type: "TEXT", text: "📊 Pazar Trendleri" },
    body: "Merhaba {{1}},\n\nBu haftanın pazar trendleri analizimiz yayında.\n\n{{2}}",
    footer: "bulletinAI • Abonelikten çıkmak için DUR yazın",
    buttons: [{ type: "URL", text: "Analizi İncele", url: "https://bulten.link/trends" }],
    createdAt: "28 Şub 2025", approvedAt: null, usageCount: 0,
  },
  {
    id: 4, name: "hosgeldiniz_mesaji", category: "UTILITY",
    status: "REJECTED", language: "tr",
    header: { type: "TEXT", text: "Hoş Geldiniz! 👋" },
    body: "Merhaba {{1}},\n\nbulletinAI bültenine abone olduğunuz için teşekkürler.\n\nSizi aramıza bekliyoruz!",
    footer: "",
    buttons: [],
    createdAt: "5 Mar 2025", approvedAt: null, usageCount: 0,
    rejectionReason: "Template içeriği yeterince açık değil. Lütfen ürün/hizmet adını belirtin.",
  },
];

const categories = ["MARKETING", "UTILITY", "AUTHENTICATION"];
const languages = [{ code: "tr", label: "Türkçe" }, { code: "en", label: "English" }, { code: "ar", label: "العربية" }];
const statusMeta = {
  APPROVED: { label: "Onaylandı", color: "#00FFB2", bg: "rgba(0,255,178,0.1)", icon: "✓" },
  PENDING:  { label: "İncelemede", color: "#FFD93D", bg: "rgba(255,217,61,0.1)", icon: "⏳" },
  REJECTED: { label: "Reddedildi", color: "#FF6B6B", bg: "rgba(255,107,107,0.1)", icon: "✕" },
  DRAFT:    { label: "Taslak", color: "#888", bg: "rgba(136,136,136,0.1)", icon: "○" },
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function TemplateManager() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [view, setView] = useState("list"); // list | create | detail
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // New template form state
  const [form, setForm] = useState({
    name: "", category: "MARKETING", language: "tr",
    headerType: "TEXT", headerText: "",
    body: "", footer: "",
    buttons: [],
    newBtnType: "URL", newBtnText: "", newBtnUrl: "",
  });

  const filtered = filter === "ALL" ? templates : templates.filter(t => t.status === filter);

  const handleAddButton = () => {
    if (!form.newBtnText) return;
    const btn = form.newBtnType === "URL"
      ? { type: "URL", text: form.newBtnText, url: form.newBtnUrl }
      : { type: "QUICK_REPLY", text: form.newBtnText };
    setForm(f => ({ ...f, buttons: [...f.buttons, btn], newBtnText: "", newBtnUrl: "" }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const newT = {
        id: templates.length + 1,
        name: form.name.toLowerCase().replace(/\s+/g, "_"),
        category: form.category,
        status: "PENDING",
        language: form.language,
        header: { type: form.headerType, text: form.headerText },
        body: form.body,
        footer: form.footer,
        buttons: form.buttons,
        createdAt: new Date().toLocaleDateString("tr-TR", { day:"numeric", month:"short", year:"numeric" }),
        approvedAt: null,
        usageCount: 0,
      };
      setTemplates(ts => [newT, ...ts]);
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setView("list"); }, 2000);
    }, 2000);
  };

  const varCount = (str) => (str.match(/\{\{\d+\}\}/g) || []).length;

  return (
    <div style={{ fontFamily:"'Outfit', sans-serif", background:"#080810", minHeight:"100vh", color:"#E4E4F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input,textarea,select { outline:none; }
        input:focus, textarea:focus, select:focus { border-color:rgba(139,92,246,0.6)!important; box-shadow:0 0 0 3px rgba(139,92,246,0.1)!important; }
        .card { transition:all 0.18s ease; }
        .card:hover { transform:translateY(-1px); box-shadow:0 4px 24px rgba(0,0,0,0.3); }
        .btn { transition:all 0.15s ease; cursor:pointer; }
        .btn:hover { opacity:0.85; }
        .tab { transition:all 0.15s ease; cursor:pointer; }
        .slide { animation:slide 0.3s ease forwards; }
        @keyframes slide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .spin { animation:spin 1s linear infinite; display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .pulse { animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#222; border-radius:2px; }
        textarea { resize:vertical; }
        .remove-btn:hover { color:#FF6B6B!important; }
      `}</style>

      {/* Header */}
      <div style={{ padding:"14px 28px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(8,8,16,0.96)", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#8B5CF6,#00FFB2)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>📋</div>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:600, fontSize:15, letterSpacing:"-0.3px" }}>bulletin<span style={{ color:"#8B5CF6" }}>AI</span></span>
          <span style={{ width:1, height:18, background:"rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize:12, color:"#444" }}>Şablon Yönetimi</span>
        </div>
        {view === "list" && (
          <button className="btn" onClick={() => { setView("create"); setForm({ name:"", category:"MARKETING", language:"tr", headerType:"TEXT", headerText:"", body:"", footer:"", buttons:[], newBtnType:"URL", newBtnText:"", newBtnUrl:"" }); }} style={{ background:"linear-gradient(135deg,#8B5CF6,#6D28D9)", border:"none", color:"#fff", padding:"9px 18px", borderRadius:10, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6, fontFamily:"'Outfit',sans-serif" }}>
            + Yeni Şablon
          </button>
        )}
        {view !== "list" && (
          <button className="btn" onClick={() => setView("list")} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#888", padding:"9px 16px", borderRadius:10, fontSize:13, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
            ← Listeye Dön
          </button>
        )}
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px" }}>

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <div className="slide">
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
              {[
                { label:"Toplam Şablon", value:templates.length, color:"#8B5CF6" },
                { label:"Onaylı", value:templates.filter(t=>t.status==="APPROVED").length, color:"#00FFB2" },
                { label:"İncelemede", value:templates.filter(t=>t.status==="PENDING").length, color:"#FFD93D" },
                { label:"Reddedilen", value:templates.filter(t=>t.status==="REJECTED").length, color:"#FF6B6B" },
              ].map((s,i) => (
                <div key={i} className="card" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"18px 20px" }}>
                  <div style={{ fontSize:11, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:30, fontWeight:600, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display:"flex", gap:4, marginBottom:20, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:4, width:"fit-content" }}>
              {["ALL","APPROVED","PENDING","REJECTED"].map(f => (
                <button key={f} className="tab" onClick={() => setFilter(f)} style={{ background:filter===f?"rgba(139,92,246,0.15)":"transparent", border:filter===f?"1px solid rgba(139,92,246,0.3)":"1px solid transparent", color:filter===f?"#8B5CF6":"#555", padding:"7px 16px", borderRadius:8, fontSize:12, fontWeight:500, fontFamily:"'Outfit',sans-serif" }}>
                  {f === "ALL" ? "Tümü" : statusMeta[f].label}
                </button>
              ))}
            </div>

            {/* Template Cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {filtered.map(t => {
                const st = statusMeta[t.status];
                return (
                  <div key={t.id} className="card" onClick={() => { setSelected(t); setView("detail"); }} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"20px 24px", cursor:"pointer", display:"grid", gridTemplateColumns:"1fr auto", gap:16, alignItems:"center" }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                        <code style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:"#8B5CF6", background:"rgba(139,92,246,0.1)", padding:"2px 8px", borderRadius:6 }}>{t.name}</code>
                        <span style={{ background:st.bg, color:st.color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{st.icon} {st.label}</span>
                        <span style={{ background:"rgba(255,255,255,0.05)", color:"#555", padding:"3px 10px", borderRadius:20, fontSize:11 }}>{t.category}</span>
                        <span style={{ background:"rgba(255,255,255,0.05)", color:"#555", padding:"3px 10px", borderRadius:20, fontSize:11 }}>{t.language.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize:13, color:"#666", lineHeight:1.5, maxWidth:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {t.body.replace(/\n/g," ")}
                      </div>
                      {t.rejectionReason && (
                        <div style={{ marginTop:8, fontSize:11, color:"#FF6B6B", background:"rgba(255,107,107,0.07)", padding:"6px 10px", borderRadius:6 }}>
                          ⚠ {t.rejectionReason}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign:"right", display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
                      {t.status === "APPROVED" && (
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:600, color:"#00FFB2" }}>{t.usageCount.toLocaleString("tr")}<span style={{ fontSize:10, color:"#444", fontWeight:400, marginLeft:4 }}>gönderim</span></div>
                      )}
                      <div style={{ fontSize:11, color:"#333" }}>{t.createdAt}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DETAIL VIEW ── */}
        {view === "detail" && selected && (
          <div className="slide">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:24 }}>
              {/* Left: Details */}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
                  <code style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, color:"#8B5CF6" }}>{selected.name}</code>
                  <span style={{ background:statusMeta[selected.status].bg, color:statusMeta[selected.status].color, padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                    {statusMeta[selected.status].icon} {statusMeta[selected.status].label}
                  </span>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:24 }}>
                  {[
                    ["Kategori", selected.category],
                    ["Dil", selected.language.toUpperCase()],
                    ["Oluşturulma", selected.createdAt],
                    ["Onay Tarihi", selected.approvedAt || "—"],
                    ["Toplam Gönderim", selected.usageCount.toLocaleString("tr")],
                    ["Değişken Sayısı", varCount(selected.body)],
                  ].map(([k,v],i) => (
                    <div key={i} style={{ padding:"12px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10 }}>
                      <div style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:0.8, marginBottom:4 }}>{k}</div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#CCCCEE" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Template Parts */}
                {[
                  { label:"HEADER", content:selected.header?.text, show:!!selected.header?.text },
                  { label:"BODY", content:selected.body, show:true },
                  { label:"FOOTER", content:selected.footer, show:!!selected.footer },
                ].filter(p=>p.show).map((part,i) => (
                  <div key={i} style={{ marginBottom:14, padding:"16px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12 }}>
                    <div style={{ fontSize:10, color:"#8B5CF6", fontWeight:700, letterSpacing:1, marginBottom:8 }}>{part.label}</div>
                    <pre style={{ fontFamily:"'Outfit',sans-serif", fontSize:13, color:"#AAAACC", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{part.content}</pre>
                  </div>
                ))}

                {selected.buttons.length > 0 && (
                  <div style={{ padding:"16px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, marginBottom:14 }}>
                    <div style={{ fontSize:10, color:"#8B5CF6", fontWeight:700, letterSpacing:1, marginBottom:10 }}>BUTONLAR</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {selected.buttons.map((b,i) => (
                        <div key={i} style={{ padding:"8px 14px", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:8, fontSize:12, color:"#8B5CF6" }}>
                          {b.type === "URL" ? "🔗" : "💬"} {b.text}
                          {b.url && <span style={{ fontSize:10, color:"#444", marginLeft:6 }}>{b.url}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.rejectionReason && (
                  <div style={{ padding:"16px 18px", background:"rgba(255,107,107,0.06)", border:"1px solid rgba(255,107,107,0.2)", borderRadius:12 }}>
                    <div style={{ fontSize:11, color:"#FF6B6B", fontWeight:600, marginBottom:6 }}>⚠ Meta Red Gerekçesi</div>
                    <div style={{ fontSize:13, color:"#AA7777", lineHeight:1.6 }}>{selected.rejectionReason}</div>
                    <button className="btn" style={{ marginTop:12, background:"rgba(255,107,107,0.12)", border:"1px solid rgba(255,107,107,0.25)", color:"#FF6B6B", padding:"8px 16px", borderRadius:8, fontSize:12, fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>
                      ✏ Düzenle & Tekrar Gönder
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Phone Preview */}
              <PhonePreview template={selected} />
            </div>
          </div>
        )}

        {/* ── CREATE VIEW ── */}
        {view === "create" && (
          <div className="slide">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:24 }}>
              {/* Form */}
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Yeni Şablon Oluştur</h2>
                <p style={{ fontSize:13, color:"#555", marginBottom:24 }}>Şablon Meta'ya gönderilir, onay 1–3 iş günü sürer.</p>

                {/* Basic Info */}
                <Section title="Temel Bilgiler">
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                    <div style={{ gridColumn:"span 3" }}>
                      <FieldLabel>Şablon Adı <Tip>Küçük harf, alt çizgi, rakam. Boşluk yok.</Tip></FieldLabel>
                      <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"")}))} placeholder="ornek_sablon_adi" style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>Kategori</FieldLabel>
                      <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={inputStyle}>
                        {categories.map(c=><option key={c} style={{background:"#111"}}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Dil</FieldLabel>
                      <select value={form.language} onChange={e=>setForm(f=>({...f,language:e.target.value}))} style={inputStyle}>
                        {languages.map(l=><option key={l.code} value={l.code} style={{background:"#111"}}>{l.label}</option>)}
                      </select>
                    </div>
                  </div>
                </Section>

                {/* Header */}
                <Section title="Header (Opsiyonel)">
                  <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                    {["YOK","TEXT"].map(t=>(
                      <button key={t} className="tab" onClick={()=>setForm(f=>({...f,headerType:t}))} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${form.headerType===t?"rgba(139,92,246,0.4)":"rgba(255,255,255,0.08)"}`, background:form.headerType===t?"rgba(139,92,246,0.12)":"transparent", color:form.headerType===t?"#8B5CF6":"#555", fontSize:12, fontWeight:500, fontFamily:"'Outfit',sans-serif" }}>{t}</button>
                    ))}
                  </div>
                  {form.headerType === "TEXT" && (
                    <input value={form.headerText} onChange={e=>setForm(f=>({...f,headerText:e.target.value}))} placeholder="Başlık metni (maks 60 karakter)" maxLength={60} style={inputStyle} />
                  )}
                </Section>

                {/* Body */}
                <Section title="Body (Zorunlu)">
                  <FieldLabel>Mesaj İçeriği <Tip>Değişken için {"{{1}}"}, {"{{2}}"} kullanın</Tip></FieldLabel>
                  <textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder={"Merhaba {{1}},\n\nBu haftanın içeriği: {{2}}"} rows={5} style={{ ...inputStyle, lineHeight:1.7 }} />
                  <div style={{ display:"flex", gap:12, marginTop:8 }}>
                    <span style={{ fontSize:11, color:"#555" }}>{form.body.length}/1024 karakter</span>
                    {varCount(form.body) > 0 && <span style={{ fontSize:11, color:"#8B5CF6" }}>🔀 {varCount(form.body)} değişken</span>}
                  </div>
                  <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:6 }}>
                    {["{{1}}","{{2}}","{{3}}","*kalın*","_italik_"].map(tag=>(
                      <button key={tag} className="btn" onClick={()=>setForm(f=>({...f,body:f.body+tag}))} style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", color:"#8B5CF6", padding:"4px 10px", borderRadius:6, fontSize:11, fontFamily:"'JetBrains Mono',monospace", cursor:"pointer" }}>{tag}</button>
                    ))}
                  </div>
                </Section>

                {/* Footer */}
                <Section title="Footer (Opsiyonel)">
                  <input value={form.footer} onChange={e=>setForm(f=>({...f,footer:e.target.value}))} placeholder="bulletinAI • Abonelikten çıkmak için DUR yazın" maxLength={60} style={inputStyle} />
                </Section>

                {/* Buttons */}
                <Section title={`Butonlar (${form.buttons.length}/3)`}>
                  {form.buttons.map((b,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8, marginBottom:8 }}>
                      <span style={{ fontSize:12, color:"#8B5CF6" }}>{b.type === "URL" ? "🔗" : "💬"}</span>
                      <span style={{ fontSize:13, flex:1, color:"#CCCCEE" }}>{b.text}</span>
                      {b.url && <span style={{ fontSize:11, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>{b.url}</span>}
                      <button className="remove-btn" onClick={()=>setForm(f=>({...f,buttons:f.buttons.filter((_,j)=>j!==i)}))} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:16, transition:"color 0.15s" }}>×</button>
                    </div>
                  ))}

                  {form.buttons.length < 3 && (
                    <div style={{ display:"grid", gridTemplateColumns:"120px 1fr auto", gap:8, alignItems:"flex-end" }}>
                      <div>
                        <FieldLabel>Tür</FieldLabel>
                        <select value={form.newBtnType} onChange={e=>setForm(f=>({...f,newBtnType:e.target.value}))} style={{ ...inputStyle, padding:"9px 10px" }}>
                          <option style={{background:"#111"}}>URL</option>
                          <option style={{background:"#111"}}>QUICK_REPLY</option>
                        </select>
                      </div>
                      <div>
                        <FieldLabel>Buton Metni</FieldLabel>
                        <input value={form.newBtnText} onChange={e=>setForm(f=>({...f,newBtnText:e.target.value}))} placeholder="Bülteni Oku" style={{ ...inputStyle, padding:"9px 12px" }} />
                      </div>
                      <button className="btn" onClick={handleAddButton} style={{ background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", color:"#8B5CF6", padding:"9px 16px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif", whiteSpace:"nowrap" }}>+ Ekle</button>
                    </div>
                  )}
                  {form.newBtnType === "URL" && form.buttons.length < 3 && (
                    <div style={{ marginTop:8 }}>
                      <FieldLabel>URL</FieldLabel>
                      <input value={form.newBtnUrl} onChange={e=>setForm(f=>({...f,newBtnUrl:e.target.value}))} placeholder="https://bulten.link/{{1}}" style={inputStyle} />
                    </div>
                  )}
                </Section>

                {/* Guidelines */}
                <div style={{ padding:"16px 18px", background:"rgba(255,217,61,0.05)", border:"1px solid rgba(255,217,61,0.12)", borderRadius:12, marginBottom:20 }}>
                  <div style={{ fontSize:12, color:"#AA9900", fontWeight:600, marginBottom:8 }}>📋 Meta Onay Kuralları</div>
                  {[
                    "Şablon adı küçük harf ve alt çizgi içerebilir, boşluk olamaz",
                    "Spam içerikli, yanıltıcı veya uygunsuz dil reddedilir",
                    "Değişkenler {{1}}, {{2}} sıralı olmalı, atlanmamalı",
                    "URL butonunda gerçek bir domain kullanılmalı",
                    "MARKETING şablonları 24 saat penceresi dışında gönderilebilir",
                  ].map((rule,i) => (
                    <div key={i} style={{ fontSize:11, color:"#776600", display:"flex", gap:8, marginBottom:4 }}>
                      <span>•</span>{rule}
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <button className="btn" onClick={handleSubmit} disabled={submitting || submitted || !form.name || !form.body} style={{ width:"100%", padding:"16px", background:submitted?"rgba(0,255,178,0.12)":!form.name||!form.body?"rgba(255,255,255,0.04)":"linear-gradient(135deg,#8B5CF6,#6D28D9)", border:submitted?"1px solid rgba(0,255,178,0.3)":"none", borderRadius:12, color:submitted?"#00FFB2":!form.name||!form.body?"#333":"#fff", fontSize:15, fontWeight:700, cursor:!form.name||!form.body?"not-allowed":"pointer", fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  {submitting ? <><span className="spin">⟳</span> Meta'ya gönderiliyor...</> : submitted ? "✓ Gönderildi — İnceleme bekleniyor" : "📤 Meta'ya Gönder & Onay İste"}
                </button>
              </div>

              {/* Right: Preview */}
              <PhonePreview template={{ name:form.name||"onizleme", category:form.category, status:"DRAFT", language:form.language, header:{ type:form.headerType, text:form.headerText }, body:form.body, footer:form.footer, buttons:form.buttons }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Phone Preview ──────────────────────────────────────────────────────────
function PhonePreview({ template }) {
  const renderBody = (text) => text.replace(/\*(.+?)\*/g,"<b>$1</b>").replace(/_(.+?)_/g,"<em>$1</em>").replace(/\{\{(\d+)\}\}/g,"<span style='color:#8B5CF6;font-weight:600'>{{$1}}</span>");
  return (
    <div style={{ position:"sticky", top:80 }}>
      <div style={{ fontSize:11, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:12, textAlign:"center" }}>Önizleme</div>
      {/* Phone shell */}
      <div style={{ width:340, margin:"0 auto", background:"#1a1a2e", borderRadius:36, padding:"10px", boxShadow:"0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }}>
        {/* Screen */}
        <div style={{ background:"#111827", borderRadius:28, overflow:"hidden" }}>
          {/* Status bar */}
          <div style={{ background:"#0d1117", padding:"10px 18px 6px", display:"flex", justifyContent:"space-between", fontSize:11, color:"#555" }}>
            <span>9:41</span><span>●●●</span>
          </div>
          {/* WA header */}
          <div style={{ background:"#128C7E", padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🏢</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>bulletinAI Business</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)" }}>Doğrulanmış İşletme ✓</div>
            </div>
          </div>
          {/* Chat area */}
          <div style={{ background:"#0b141a", backgroundImage:"radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize:"20px 20px", padding:"16px 12px", minHeight:380 }}>
            {/* Message bubble */}
            <div style={{ background:"#1f2c34", borderRadius:"4px 12px 12px 12px", padding:"10px 12px", maxWidth:"88%", marginLeft:4 }}>
              {template.header?.text && (
                <div style={{ fontWeight:700, fontSize:13, color:"#E9EDEF", marginBottom:6, paddingBottom:6, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                  {template.header.text}
                </div>
              )}
              {template.body ? (
                <div style={{ fontSize:13, color:"#E9EDEF", lineHeight:1.6 }} dangerouslySetInnerHTML={{ __html: renderBody(template.body) }} />
              ) : (
                <div style={{ fontSize:13, color:"#555", fontStyle:"italic" }}>Mesaj içeriği buraya gelecek...</div>
              )}
              {template.footer && (
                <div style={{ marginTop:6, paddingTop:6, borderTop:"1px solid rgba(255,255,255,0.07)", fontSize:11, color:"#8696a0" }}>{template.footer}</div>
              )}
              <div style={{ textAlign:"right", fontSize:10, color:"#8696a0", marginTop:4 }}>12:00 ✓✓</div>
            </div>

            {/* Buttons */}
            {template.buttons?.length > 0 && (
              <div style={{ marginTop:4, marginLeft:4, display:"flex", flexDirection:"column", gap:3 }}>
                {template.buttons.map((b,i) => (
                  <div key={i} style={{ background:"#1f2c34", borderRadius:8, padding:"10px", textAlign:"center", fontSize:12, color:"#00a3af", fontWeight:500 }}>
                    {b.type === "URL" ? "🔗 " : "💬 "}{b.text}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Input bar */}
          <div style={{ background:"#1f2c34", padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ flex:1, background:"#2a3942", borderRadius:20, padding:"8px 14px", fontSize:12, color:"#8696a0" }}>Mesaj yazın...</div>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"#00a3af", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎤</div>
          </div>
        </div>
      </div>

      {/* Meta status badge */}
      <div style={{ marginTop:16, padding:"12px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, textAlign:"center" }}>
        <div style={{ fontSize:11, color:"#444", marginBottom:4 }}>Meta Durumu</div>
        <span style={{ background:statusMeta[template.status]?.bg || statusMeta.DRAFT.bg, color:statusMeta[template.status]?.color || statusMeta.DRAFT.color, padding:"4px 14px", borderRadius:20, fontSize:12, fontWeight:600 }}>
          {statusMeta[template.status]?.icon || "○"} {statusMeta[template.status]?.label || "Taslak"}
        </span>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
const inputStyle = { width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:9, padding:"11px 14px", color:"#E4E4F0", fontSize:13, fontFamily:"'Outfit',sans-serif", transition:"border-color 0.15s, box-shadow 0.15s" };

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:11, color:"#8B5CF6", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ flex:1, height:1, background:"rgba(139,92,246,0.2)" }} />
        {title}
        <span style={{ flex:1, height:1, background:"rgba(139,92,246,0.2)" }} />
      </div>
      {children}
    </div>
  );
}
function FieldLabel({ children }) {
  return <label style={{ fontSize:11, color:"#555", fontWeight:600, textTransform:"uppercase", letterSpacing:0.8, display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>{children}</label>;
}
function Tip({ children }) {
  return <span style={{ fontSize:10, color:"#8B5CF6", background:"rgba(139,92,246,0.1)", padding:"1px 6px", borderRadius:4, fontWeight:400, textTransform:"none", letterSpacing:0 }}>{children}</span>;
}
