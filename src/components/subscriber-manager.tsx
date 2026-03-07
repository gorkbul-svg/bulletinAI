"use client";
import { useState, useRef } from "react";

const mockSubscribers = [
  { id:1, name:"Ahmet Yılmaz", phone:"+90 532 111 22 33", email:"ahmet@ornek.com", tags:["premium","eticaret"], status:"active", channel:["whatsapp","email"], consent:"explicit", consentDate:"12 Oca 2025", addedAt:"10 Oca 2025", openRate:91 },
  { id:2, name:"Fatma Kaya", phone:"+90 542 333 44 55", email:"fatma@ornek.com", tags:["girişimci"], status:"active", channel:["email"], consent:"explicit", consentDate:"15 Oca 2025", addedAt:"14 Oca 2025", openRate:74 },
  { id:3, name:"Mehmet Demir", phone:"+90 555 666 77 88", email:"mehmet@ornek.com", tags:["premium","girişimci"], status:"active", channel:["whatsapp","email"], consent:"explicit", consentDate:"20 Oca 2025", addedAt:"18 Oca 2025", openRate:88 },
  { id:4, name:"Ayşe Çelik", phone:"+90 506 999 00 11", email:"ayse@ornek.com", tags:["eticaret"], status:"unsubscribed", channel:["whatsapp"], consent:"withdrawn", consentDate:"1 Şub 2025", addedAt:"25 Oca 2025", openRate:43 },
  { id:5, name:"Can Arslan", phone:"+90 532 222 33 44", email:"can@ornek.com", tags:["premium"], status:"active", channel:["whatsapp","email"], consent:"explicit", consentDate:"3 Şub 2025", addedAt:"1 Şub 2025", openRate:96 },
  { id:6, name:"Zeynep Yıldız", phone:"+90 543 444 55 66", email:"zeynep@ornek.com", tags:["girişimci","eticaret"], status:"bounced", channel:["email"], consent:"explicit", consentDate:"8 Şub 2025", addedAt:"7 Şub 2025", openRate:0 },
  { id:7, name:"Burak Şahin", phone:"+90 505 777 88 99", email:"burak@ornek.com", tags:["premium","eticaret"], status:"active", channel:["whatsapp"], consent:"explicit", consentDate:"14 Şub 2025", addedAt:"12 Şub 2025", openRate:82 },
  { id:8, name:"Selin Öztürk", phone:"+90 532 000 11 22", email:"selin@ornek.com", tags:["girişimci"], status:"active", channel:["whatsapp","email"], consent:"explicit", consentDate:"20 Şub 2025", addedAt:"18 Şub 2025", openRate:69 },
];

const allTags = ["premium","eticaret","girişimci","lojistik","teknoloji"];

const statusMeta = {
  active:       { label:"Aktif",         color:"#00FFB2", bg:"rgba(0,255,178,0.1)" },
  unsubscribed: { label:"Çıktı",         color:"#FF6B6B", bg:"rgba(255,107,107,0.1)" },
  bounced:      { label:"Bounced",       color:"#FF9500", bg:"rgba(255,149,0,0.1)" },
  pending:      { label:"Onay Bekliyor", color:"#FFD93D", bg:"rgba(255,217,61,0.1)" },
};

const inputBase = {
  width:"100%", background:"rgba(255,255,255,0.04)",
  border:"1px solid rgba(255,255,255,0.09)", borderRadius:9,
  padding:"11px 14px", color:"#E2E2EE", fontSize:13,
  fontFamily:"'Plus Jakarta Sans',sans-serif",
};

const selectBase = {
  background:"rgba(255,255,255,0.04)",
  border:"1px solid rgba(255,255,255,0.09)", borderRadius:9,
  padding:"10px 14px", color:"#E2E2EE", fontSize:12,
  fontFamily:"'Plus Jakarta Sans',sans-serif",
};

const demoRows = [
  { name:"Hasan Kılıç",   phone:"+90 532 100 20 30", email:"hasan@test.com",  valid:true },
  { name:"Merve Aktaş",   phone:"+90 542 200 30 40", email:"merve@test.com",  valid:true },
  { name:"",               phone:"+90 555 999",       email:"bozuk-email",     valid:false },
  { name:"Tarık Erdoğan", phone:"+90 505 300 40 50", email:"tarik@test.com",  valid:true },
];

export default function SubscriberManager() {
  const [view, setView]               = useState("list");
  const [subscribers, setSubscribers] = useState(mockSubscribers);
  const [selected, setSelected]       = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterTag, setFilterTag]     = useState("ALL");
  const [filterChannel, setFilterChannel] = useState("ALL");
  const [search, setSearch]           = useState("");
  const [checkedIds, setCheckedIds]   = useState([]);
  const [importStep, setImportStep]   = useState(0);
  const [importRows, setImportRows]   = useState([]);
  const [importing, setImporting]     = useState(false);
  const [bulkTag, setBulkTag]         = useState("");
  const fileRef = useRef();

  const filtered = subscribers.filter(s => {
    const q = search.toLowerCase();
    return (
      (!search || s.name.toLowerCase().includes(q) || s.phone.includes(search) || s.email.toLowerCase().includes(q)) &&
      (filterStatus  === "ALL" || s.status === filterStatus) &&
      (filterTag     === "ALL" || s.tags.includes(filterTag)) &&
      (filterChannel === "ALL" || s.channel.includes(filterChannel))
    );
  });

  const toggleCheck = (id) =>
    setCheckedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  const toggleAll = () =>
    setCheckedIds(checkedIds.length === filtered.length ? [] : filtered.map(s => s.id));

  const loadDemo = () => { setImportRows(demoRows); setImportStep(1); };

  const handleImportFinish = () => {
    setImporting(true);
    setTimeout(() => {
      const valid = importRows.filter(r => r.valid);
      const today = new Date().toLocaleDateString("tr-TR", { day:"numeric", month:"short", year:"numeric" });
      setSubscribers(prev => [
        ...prev,
        ...valid.map((r, i) => ({
          id: prev.length + i + 1,
          name: r.name, phone: r.phone, email: r.email,
          tags: [], status: "pending", channel: ["whatsapp","email"],
          consent: "pending", consentDate: "—", addedAt: today, openRate: 0,
        })),
      ]);
      setImporting(false);
      setImportStep(3);
    }, 2000);
  };

  const goBack = () => { setView("list"); setImportStep(0); setSelected(null); };

  const stats = {
    total:  subscribers.length,
    active: subscribers.filter(s => s.status === "active").length,
    wa:     subscribers.filter(s => s.channel.includes("whatsapp")).length,
    email:  subscribers.filter(s => s.channel.includes("email")).length,
  };

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#090912", minHeight:"100vh", color:"#E2E2EE" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input,textarea,select { outline:none; font-family:'Plus Jakarta Sans',sans-serif; }
        input:focus, select:focus { border-color:rgba(251,146,60,0.5)!important; box-shadow:0 0 0 3px rgba(251,146,60,0.08)!important; }
        .trow { transition:background 0.12s; }
        .trow:hover { background:rgba(255,255,255,0.025)!important; }
        .btn { transition:all 0.15s ease; cursor:pointer; }
        .btn:hover { opacity:0.82; }
        .chip { transition:opacity 0.15s; cursor:pointer; }
        .chip:hover { opacity:0.7; }
        .slide { animation:slide 0.28s ease forwards; }
        @keyframes slide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .spin { animation:spin 1s linear infinite; display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .dzone:hover { border-color:rgba(251,146,60,0.5)!important; background:rgba(251,146,60,0.03)!important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#222; border-radius:2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding:"13px 28px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(9,9,18,0.96)", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#FB923C,#F43F5E)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>👥</div>
          <span style={{ fontFamily:"'Fira Code',monospace", fontWeight:500, fontSize:15 }}>bulletin<span style={{ color:"#FB923C" }}>AI</span></span>
          <span style={{ width:1, height:18, background:"rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize:12, color:"#444" }}>Abone Yönetimi</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {view !== "list" && (
            <button className="btn" onClick={goBack} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", color:"#777", padding:"8px 16px", borderRadius:9, fontSize:12 }}>← Geri</button>
          )}
          {view === "list" && <>
            <button className="btn" onClick={() => setView("segment")} style={{ background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.25)", color:"#FB923C", padding:"8px 16px", borderRadius:9, fontSize:12, fontWeight:600 }}>🎯 Segment Oluştur</button>
            <button className="btn" onClick={() => { setView("import"); setImportStep(0); }} style={{ background:"linear-gradient(135deg,#FB923C,#F43F5E)", border:"none", color:"#fff", padding:"8px 16px", borderRadius:9, fontSize:12, fontWeight:600 }}>⬆ Liste İçe Aktar</button>
          </>}
        </div>
      </div>

      <div style={{ maxWidth:1140, margin:"0 auto", padding:"26px 24px" }}>

        {/* ═══════ LIST ═══════ */}
        {view === "list" && (
          <div className="slide">
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
              {[
                { label:"Toplam Abone", value:stats.total,  icon:"👥", color:"#FB923C" },
                { label:"Aktif",        value:stats.active, icon:"✅", color:"#00FFB2" },
                { label:"WhatsApp",     value:stats.wa,     icon:"💬", color:"#25D366" },
                { label:"E-posta",      value:stats.email,  icon:"📧", color:"#60A5FA" },
              ].map((s,i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:13, padding:"18px 20px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:-8, right:-4, fontSize:44, opacity:0.07 }}>{s.icon}</div>
                  <div style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontFamily:"'Fira Code',monospace", fontSize:30, fontWeight:500, color:s.color }}>{s.value.toLocaleString("tr")}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:200, position:"relative" }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"#444" }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim, telefon veya e-posta ara..." style={{ ...inputBase, paddingLeft:34 }} />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectBase}>
                <option value="ALL" style={{ background:"#111" }}>Tüm Durumlar</option>
                {Object.entries(statusMeta).map(([k,v]) => <option key={k} value={k} style={{ background:"#111" }}>{v.label}</option>)}
              </select>
              <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={selectBase}>
                <option value="ALL" style={{ background:"#111" }}>Tüm Etiketler</option>
                {allTags.map(t => <option key={t} value={t} style={{ background:"#111" }}>{t}</option>)}
              </select>
              <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)} style={selectBase}>
                <option value="ALL"      style={{ background:"#111" }}>Tüm Kanallar</option>
                <option value="whatsapp" style={{ background:"#111" }}>WhatsApp</option>
                <option value="email"    style={{ background:"#111" }}>E-posta</option>
              </select>
            </div>

            {/* Bulk bar */}
            {checkedIds.length > 0 && (
              <div className="slide" style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"rgba(251,146,60,0.08)", border:"1px solid rgba(251,146,60,0.2)", borderRadius:10, marginBottom:12 }}>
                <span style={{ fontSize:13, color:"#FB923C", fontWeight:600 }}>{checkedIds.length} seçildi</span>
                <span style={{ flex:1 }} />
                <input value={bulkTag} onChange={e => setBulkTag(e.target.value)} placeholder="Etiket ekle..." style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:7, padding:"6px 12px", color:"#E2E2EE", fontSize:12, width:150 }} />
                <button className="btn" style={{ background:"rgba(251,146,60,0.15)", border:"1px solid rgba(251,146,60,0.3)", color:"#FB923C", padding:"6px 14px", borderRadius:7, fontSize:12, fontWeight:600 }}>+ Etiket Ekle</button>
                <button className="btn" style={{ background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.25)", color:"#FF6B6B", padding:"6px 14px", borderRadius:7, fontSize:12, fontWeight:600 }}>🚫 Pasife Al</button>
                <button className="btn" onClick={() => setCheckedIds([])} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#666", padding:"6px 10px", borderRadius:7, fontSize:14 }}>✕</button>
              </div>
            )}

            {/* Table */}
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
              {/* Head */}
              <div style={{ display:"grid", gridTemplateColumns:"36px 2fr 1.4fr 1.6fr 1fr 1fr 80px 64px", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
                <input type="checkbox" checked={checkedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ accentColor:"#FB923C", cursor:"pointer" }} />
                {["İsim","Telefon","E-posta","Etiketler","Kanal","Açılma",""].map((h,i) => (
                  <div key={i} style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:0.8, fontWeight:600, padding:"0 8px" }}>{h}</div>
                ))}
              </div>
              {/* Body */}
              {filtered.map((s, i) => {
                const sm = statusMeta[s.status] || statusMeta.pending;
                return (
                  <div key={s.id} className="trow" style={{ display:"grid", gridTemplateColumns:"36px 2fr 1.4fr 1.6fr 1fr 1fr 80px 64px", padding:"12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems:"center" }}>
                    <input type="checkbox" checked={checkedIds.includes(s.id)} onChange={() => toggleCheck(s.id)} style={{ accentColor:"#FB923C", cursor:"pointer" }} />
                    <div style={{ padding:"0 8px" }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                      <span style={{ background:sm.bg, color:sm.color, padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:500, marginTop:3, display:"inline-block" }}>{sm.label}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#666", padding:"0 8px", fontFamily:"'Fira Code',monospace" }}>{s.phone}</div>
                    <div style={{ fontSize:12, color:"#555", padding:"0 8px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.email}</div>
                    <div style={{ padding:"0 8px", display:"flex", gap:4, flexWrap:"wrap" }}>
                      {s.tags.map(t => <span key={t} className="chip" style={{ background:"rgba(251,146,60,0.1)", color:"#FB923C", padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:500 }}>{t}</span>)}
                    </div>
                    <div style={{ padding:"0 8px", display:"flex", gap:5 }}>
                      {s.channel.includes("whatsapp") && <span style={{ background:"rgba(37,211,102,0.1)", color:"#25D366", padding:"3px 7px", borderRadius:6, fontSize:10 }}>WA</span>}
                      {s.channel.includes("email")    && <span style={{ background:"rgba(96,165,250,0.1)",  color:"#60A5FA", padding:"3px 7px", borderRadius:6, fontSize:10 }}>Mail</span>}
                    </div>
                    <div style={{ padding:"0 8px" }}>
                      {s.status === "active" ? (
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color: s.openRate > 80 ? "#00FFB2" : s.openRate > 50 ? "#FFD93D" : "#FF6B6B" }}>%{s.openRate}</div>
                          <div style={{ marginTop:4, width:50, height:2, background:"rgba(255,255,255,0.06)", borderRadius:1, overflow:"hidden" }}>
                            <div style={{ width:`${s.openRate}%`, height:"100%", background: s.openRate > 80 ? "#00FFB2" : s.openRate > 50 ? "#FFD93D" : "#FF6B6B" }} />
                          </div>
                        </div>
                      ) : <span style={{ color:"#333", fontSize:12 }}>—</span>}
                    </div>
                    <div style={{ padding:"0 8px" }}>
                      <button className="btn" onClick={() => { setSelected(s); setView("detail"); }} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", color:"#666", padding:"5px 10px", borderRadius:7, fontSize:11 }}>Detay</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:10, fontSize:11, color:"#333", textAlign:"right" }}>{filtered.length} / {subscribers.length} abone</div>
          </div>
        )}

        {/* ═══════ DETAIL ═══════ */}
        {view === "detail" && selected && (
          <div className="slide">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:24 }}>
              <div>
                {/* Avatar + name */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
                  <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#FB923C,#F43F5E)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:700, color:"#fff", flexShrink:0 }}>
                    {selected.name[0]}
                  </div>
                  <div>
                    <h2 style={{ fontSize:20, fontWeight:700 }}>{selected.name}</h2>
                    <span style={{ background:statusMeta[selected.status]?.bg, color:statusMeta[selected.status]?.color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>
                      {statusMeta[selected.status]?.label}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                  {[
                    ["📱 Telefon",      selected.phone,       true],
                    ["📧 E-posta",      selected.email,       true],
                    ["📅 Eklenme",      selected.addedAt,     false],
                    ["✅ Rıza Tarihi",  selected.consentDate, false],
                    ["🔒 Rıza Türü",    selected.consent === "explicit" ? "Açık Rıza (KVKK)" : selected.consent === "withdrawn" ? "Geri Çekildi" : "Bekliyor", false],
                    ["📊 Açılma Oranı", selected.openRate ? `%${selected.openRate}` : "—", false],
                  ].map(([k, v, mono], i) => (
                    <div key={i} style={{ padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10 }}>
                      <div style={{ fontSize:11, color:"#444", marginBottom:4 }}>{k}</div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#CCCCEE", fontFamily: mono ? "'Fira Code',monospace" : "inherit" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div style={{ padding:"16px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, marginBottom:14 }}>
                  <div style={{ fontSize:11, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Etiketler</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {selected.tags.map(t => (
                      <span key={t} className="chip" style={{ background:"rgba(251,146,60,0.1)", color:"#FB923C", border:"1px solid rgba(251,146,60,0.2)", padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:500, display:"flex", alignItems:"center", gap:6 }}>
                        {t} <span style={{ opacity:0.5 }}>×</span>
                      </span>
                    ))}
                    <button className="btn" style={{ background:"rgba(255,255,255,0.05)", border:"1px dashed rgba(255,255,255,0.15)", color:"#555", padding:"5px 12px", borderRadius:20, fontSize:12 }}>+ Ekle</button>
                  </div>
                </div>

                {/* Channels */}
                <div style={{ padding:"16px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, marginBottom:14 }}>
                  <div style={{ fontSize:11, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Kanal Tercihleri</div>
                  <div style={{ display:"flex", gap:10 }}>
                    {[["whatsapp","💬 WhatsApp","#25D366","37,211,102"],["email","📧 E-posta","#60A5FA","96,165,250"]].map(([ch, lbl, clr, rgb]) => {
                      const on = selected.channel.includes(ch);
                      return (
                        <div key={ch} style={{ flex:1, padding:"12px", background: on ? `rgba(${rgb},0.08)` : "rgba(255,255,255,0.02)", border:`1px solid ${on ? clr + "40" : "rgba(255,255,255,0.07)"}`, borderRadius:10, textAlign:"center" }}>
                          <div style={{ fontSize:13, fontWeight:600, color: on ? clr : "#444" }}>{lbl}</div>
                          <div style={{ fontSize:11, color: on ? "#666" : "#333", marginTop:4 }}>{on ? "Etkin" : "Pasif"}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* KVKK */}
                <div style={{ padding:"16px 18px", background:"rgba(96,165,250,0.05)", border:"1px solid rgba(96,165,250,0.15)", borderRadius:12 }}>
                  <div style={{ fontSize:12, color:"#60A5FA", fontWeight:600, marginBottom:8 }}>🔒 KVKK / Veri Yönetimi</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button className="btn" style={{ background:"rgba(96,165,250,0.1)",  border:"1px solid rgba(96,165,250,0.2)",  color:"#60A5FA", padding:"7px 14px", borderRadius:8, fontSize:12 }}>📄 Rıza Belgesi İndir</button>
                    <button className="btn" style={{ background:"rgba(255,217,61,0.08)", border:"1px solid rgba(255,217,61,0.2)",  color:"#FFD93D", padding:"7px 14px", borderRadius:8, fontSize:12 }}>📤 Veri Dışa Aktar</button>
                    <button className="btn" style={{ background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.2)", color:"#FF6B6B", padding:"7px 14px", borderRadius:8, fontSize:12 }}>🗑 Veriyi Sil (KVKK 7)</button>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div style={{ padding:"20px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, height:"fit-content" }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#888", marginBottom:16, textTransform:"uppercase", letterSpacing:1 }}>Son Aktiviteler</div>
                {[
                  { icon:"📬", text:"Haftalık E-ticaret #47 açıldı",    time:"3 Mar, 14:22" },
                  { icon:"🔗", text:"Bülten linkine tıkladı",            time:"3 Mar, 14:23" },
                  { icon:"📬", text:"Flash Fırsat bülteni açıldı",       time:"28 Şub, 09:45" },
                  { icon:"📨", text:"Haftalık E-ticaret #46 gönderildi", time:"24 Şub, 10:00" },
                  { icon:"📬", text:"Haftalık E-ticaret #46 açıldı",    time:"24 Şub, 10:08" },
                ].map((a, i) => (
                  <div key={i} style={{ display:"flex", gap:10, paddingBottom:14, marginBottom:14, borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <span style={{ fontSize:16, minWidth:24, textAlign:"center" }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize:12, color:"#AAAACC", lineHeight:1.4 }}>{a.text}</div>
                      <div style={{ fontSize:10, color:"#444", marginTop:3 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ IMPORT ═══════ */}
        {view === "import" && (
          <div className="slide">
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Liste İçe Aktar</h2>
            <p style={{ fontSize:13, color:"#555", marginBottom:28 }}>CSV veya Excel dosyasından abone listesi yükleyin.</p>

            {/* Steps */}
            <div style={{ display:"flex", marginBottom:32, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:4 }}>
              {["Dosya Yükle","Kolon Eşleştir","Önizleme","Tamamlandı"].map((lbl, i) => (
                <div key={i} style={{ flex:1, padding:"9px 6px", borderRadius:8, background: importStep === i ? "rgba(251,146,60,0.12)" : "transparent", textAlign:"center", fontSize:12, fontWeight:600, color: importStep === i ? "#FB923C" : importStep > i ? "#00FFB2" : "#444", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <span style={{ width:18, height:18, borderRadius:"50%", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", background: importStep === i ? "rgba(251,146,60,0.2)" : importStep > i ? "rgba(0,255,178,0.15)" : "rgba(255,255,255,0.05)" }}>
                    {importStep > i ? "✓" : i + 1}
                  </span>
                  {lbl}
                </div>
              ))}
            </div>

            {/* Step 0 */}
            {importStep === 0 && (
              <div>
                <div className="dzone" onClick={() => fileRef.current && fileRef.current.click()} style={{ border:"2px dashed rgba(255,255,255,0.1)", borderRadius:16, padding:"60px 40px", textAlign:"center", cursor:"pointer", transition:"all 0.2s" }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>📂</div>
                  <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>CSV veya Excel dosyanızı sürükleyin</div>
                  <div style={{ fontSize:13, color:"#555", marginBottom:20 }}>veya dosya seçmek için tıklayın</div>
                  <span style={{ background:"rgba(251,146,60,0.12)", border:"1px solid rgba(251,146,60,0.3)", color:"#FB923C", padding:"10px 22px", borderRadius:9, fontSize:13, fontWeight:600 }}>Dosya Seç</span>
                  <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={() => loadDemo()} style={{ display:"none" }} />
                </div>
                <div style={{ marginTop:20, padding:"16px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12 }}>
                  <div style={{ fontSize:12, color:"#555", fontWeight:600, marginBottom:10 }}>📋 Beklenen CSV Formatı</div>
                  <code style={{ fontFamily:"'Fira Code',monospace", fontSize:12, color:"#FB923C", display:"block", lineHeight:1.8 }}>
                    ad_soyad, telefon, email, etiketler<br />
                    Ahmet Yılmaz, +905321112233, ahmet@mail.com, "premium,eticaret"
                  </code>
                </div>
                <button className="btn" onClick={loadDemo} style={{ marginTop:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#555", padding:"9px 18px", borderRadius:9, fontSize:12, width:"100%" }}>
                  Demo: Örnek CSV yükle →
                </button>
              </div>
            )}

            {/* Step 1 */}
            {importStep === 1 && (
              <div>
                <div style={{ padding:"20px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, marginBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#888", marginBottom:16 }}>Kolon Eşleştirme</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 40px 1fr", gap:12, alignItems:"center" }}>
                    <div style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:1 }}>CSV Kolonu</div>
                    <div />
                    <div style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:1 }}>bulletinAI Alanı</div>
                    {[["ad_soyad","İsim"],["telefon","Telefon"],["email","E-posta"],["etiketler","Etiketler"]].map(([csv, field]) => [
                      <div key={csv+"_csv"} style={{ background:"rgba(251,146,60,0.08)", border:"1px solid rgba(251,146,60,0.2)", borderRadius:8, padding:"9px 14px", fontSize:13, color:"#FB923C", fontFamily:"'Fira Code',monospace" }}>{csv}</div>,
                      <div key={csv+"_arr"} style={{ textAlign:"center", color:"#444", fontSize:16 }}>→</div>,
                      <select key={csv+"_sel"} defaultValue={field} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#E2E2EE", fontSize:13 }}>
                        {["İsim","Telefon","E-posta","Etiketler","— Atla"].map(o => <option key={o} style={{ background:"#111" }}>{o}</option>)}
                      </select>,
                    ])}
                  </div>
                </div>
                <button className="btn" onClick={() => setImportStep(2)} style={{ background:"linear-gradient(135deg,#FB923C,#F43F5E)", border:"none", color:"#fff", padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:700 }}>
                  Önizlemeye Geç →
                </button>
              </div>
            )}

            {/* Step 2 */}
            {importStep === 2 && (
              <div>
                <div style={{ display:"flex", gap:12, marginBottom:16 }}>
                  <div style={{ padding:"12px 18px", background:"rgba(0,255,178,0.08)", border:"1px solid rgba(0,255,178,0.2)", borderRadius:10, fontSize:13, color:"#00FFB2", fontWeight:600 }}>✓ {importRows.filter(r=>r.valid).length} geçerli kayıt</div>
                  <div style={{ padding:"12px 18px", background:"rgba(255,107,107,0.08)", border:"1px solid rgba(255,107,107,0.2)", borderRadius:10, fontSize:13, color:"#FF6B6B", fontWeight:600 }}>✕ {importRows.filter(r=>!r.valid).length} hatalı kayıt</div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden", marginBottom:20 }}>
                  {importRows.map((r, i) => (
                    <div key={i} style={{ display:"grid", gridTemplateColumns:"28px 1fr 1fr 1fr 64px", padding:"12px 16px", borderBottom: i < importRows.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: !r.valid ? "rgba(255,107,107,0.04)" : "transparent", alignItems:"center" }}>
                      <span style={{ fontSize:14 }}>{r.valid ? "✅" : "❌"}</span>
                      <span style={{ fontSize:13, color: r.valid ? "#E2E2EE" : "#FF6B6B", padding:"0 8px" }}>{r.name || <em style={{ color:"#FF6B6B" }}>İsim yok</em>}</span>
                      <span style={{ fontSize:12, color:"#666", padding:"0 8px", fontFamily:"'Fira Code',monospace" }}>{r.phone}</span>
                      <span style={{ fontSize:12, color:"#555", padding:"0 8px" }}>{r.email}</span>
                      <span style={{ fontSize:10, color: r.valid ? "#555" : "#FF6B6B", padding:"0 8px" }}>{r.valid ? "Geçerli" : "Hata"}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"16px 18px", background:"rgba(96,165,250,0.05)", border:"1px solid rgba(96,165,250,0.15)", borderRadius:12, marginBottom:20, display:"flex", gap:12, alignItems:"flex-start" }}>
                  <input type="checkbox" defaultChecked style={{ accentColor:"#60A5FA", marginTop:2, cursor:"pointer" }} />
                  <div style={{ fontSize:12, color:"#60A5FA", lineHeight:1.6 }}>
                    <strong>KVKK Onayı:</strong> Bu listedeki kişilerin ticari elektronik ileti almaya açık, yazılı ya da dijital rızası mevcuttur. Rıza kayıtlarını saklamak ve talep halinde ibraz etmek müşterinin sorumluluğundadır.
                  </div>
                </div>
                <button className="btn" onClick={handleImportFinish} disabled={importing} style={{ background: importing ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#FB923C,#F43F5E)", border:"none", color: importing ? "#444" : "#fff", padding:"14px", width:"100%", borderRadius:11, fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  {importing ? <><span className="spin">⟳</span> İçe aktarılıyor...</> : `⬆ İçe Aktar (${importRows.filter(r=>r.valid).length} kayıt)`}
                </button>
              </div>
            )}

            {/* Step 3 */}
            {importStep === 3 && (
              <div className="slide" style={{ textAlign:"center", padding:"60px 40px" }}>
                <div style={{ fontSize:64, marginBottom:20 }}>🎉</div>
                <h3 style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>İçe Aktarma Tamamlandı!</h3>
                <p style={{ fontSize:14, color:"#555", marginBottom:28 }}>{importRows.filter(r=>r.valid).length} yeni abone listenize eklendi.</p>
                <button className="btn" onClick={goBack} style={{ background:"linear-gradient(135deg,#FB923C,#F43F5E)", border:"none", color:"#fff", padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:700 }}>Listeye Dön →</button>
              </div>
            )}
          </div>
        )}

        {/* ═══════ SEGMENT ═══════ */}
        {view === "segment" && (
          <div className="slide">
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>AI Destekli Segment Oluştur</h2>
            <p style={{ fontSize:13, color:"#555", marginBottom:28 }}>Koşulları birleştirerek hedef kitle oluşturun.</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:24 }}>
              <div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:7 }}>Segment Adı</label>
                  <input placeholder="Örn: Premium E-ticaret Aktifler" style={inputBase} />
                </div>
                <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Filtre Kuralları</div>
                {[
                  { field:"Durum",        op:"eşittir", val:"Aktif" },
                  { field:"Etiket",       op:"içerir",  val:"premium" },
                  { field:"Kanal",        op:"eşittir", val:"WhatsApp" },
                  { field:"Açılma Oranı", op:">",       val:"%60" },
                ].map((rule, i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 100px 1fr 36px", gap:8, marginBottom:10, alignItems:"center" }}>
                    <select defaultValue={rule.field} style={selectBase}>
                      {["Durum","Etiket","Kanal","Açılma Oranı","Eklenme Tarihi"].map(f => <option key={f} style={{ background:"#111" }}>{f}</option>)}
                    </select>
                    <select defaultValue={rule.op} style={{ ...selectBase, color:"#888" }}>
                      {["eşittir","içerir",">","<"].map(o => <option key={o} style={{ background:"#111" }}>{o}</option>)}
                    </select>
                    <input defaultValue={rule.val} style={{ ...inputBase, color:"#FB923C", fontFamily:"'Fira Code',monospace", padding:"9px 12px" }} />
                    <button className="btn" style={{ background:"rgba(255,107,107,0.08)", border:"1px solid rgba(255,107,107,0.2)", color:"#FF6B6B", borderRadius:8, padding:"9px", fontSize:14 }}>×</button>
                  </div>
                ))}
                <button className="btn" style={{ background:"rgba(255,255,255,0.04)", border:"1px dashed rgba(255,255,255,0.12)", color:"#555", padding:"9px 18px", borderRadius:9, fontSize:12, width:"100%", marginBottom:20 }}>+ Kural Ekle</button>
                <div style={{ padding:"16px 18px", background:"rgba(251,146,60,0.05)", border:"1px solid rgba(251,146,60,0.15)", borderRadius:12, marginBottom:20 }}>
                  <div style={{ fontSize:12, color:"#FB923C", fontWeight:600, marginBottom:6 }}>✨ AI Öneri</div>
                  <div style={{ fontSize:12, color:"#886633", lineHeight:1.6 }}>Bu kurallara göre <strong style={{ color:"#FB923C" }}>3 segmenti</strong> birleştirerek daha geniş ama kaliteli bir kitle oluşturabilirsiniz. "Premium" + "Açılma &gt;%70" kombinasyonu geçmişte %94 açılma oranı sağladı.</div>
                </div>
                <button className="btn" style={{ background:"linear-gradient(135deg,#FB923C,#F43F5E)", border:"none", color:"#fff", padding:"14px", width:"100%", borderRadius:11, fontSize:14, fontWeight:700 }}>💾 Segmenti Kaydet</button>
              </div>

              {/* Preview */}
              <div style={{ padding:"20px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, height:"fit-content", position:"sticky", top:80 }}>
                <div style={{ fontSize:11, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:16 }}>Segment Önizleme</div>
                <div style={{ fontFamily:"'Fira Code',monospace", fontSize:36, fontWeight:500, color:"#FB923C", marginBottom:4 }}>4</div>
                <div style={{ fontSize:12, color:"#555", marginBottom:20 }}>bu kurallara uyan abone</div>
                {mockSubscribers.filter(s => s.status === "active" && s.tags.includes("premium")).slice(0, 4).map((s, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#FB923C,#F43F5E)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{s.name[0]}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:500 }}>{s.name}</div>
                      <div style={{ fontSize:10, color:"#444" }}>{s.tags.join(", ")}</div>
                    </div>
                    <div style={{ marginLeft:"auto", fontSize:11, color:"#00FFB2" }}>%{s.openRate}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
