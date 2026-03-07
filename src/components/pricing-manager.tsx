"use client";
import { useState } from "react";

const PLANS = [
  { id:"starter", name:"Starter", price:990, color:"#64748B", gradient:"linear-gradient(135deg,#475569,#64748B)", abone:1000, features:["1.000 abone","Sadece e-posta kanalı","5 kampanya/ay","Temel analitik","E-posta desteği"] },
  { id:"growth",  name:"Growth",  price:2490, color:"#0EA5E9", gradient:"linear-gradient(135deg,#0284C7,#0EA5E9)", abone:5000, popular:true, features:["5.000 abone","WhatsApp + E-posta","Sınırsız kampanya","Gelişmiş analitik","Segment oluşturma","Öncelikli destek"] },
  { id:"scale",   name:"Scale",   price:5990, color:"#8B5CF6", gradient:"linear-gradient(135deg,#7C3AED,#8B5CF6)", abone:25000, features:["25.000 abone","Tüm kanallar + SMS","AI İçerik Asistanı","A/B test","API erişimi","Dedicated hesap yöneticisi"] },
  { id:"enterprise", name:"Enterprise", price:null, color:"#F59E0B", gradient:"linear-gradient(135deg,#D97706,#F59E0B)", abone:null, features:["Sınırsız abone","Tüm kanallar","Özel entegrasyonlar","Beyaz etiket","SLA garantisi","7/24 telefon desteği"] },
];

const CURRENT_PLAN = "growth";

const USAGE = {
  abone:    { used:4821,  limit:5000, label:"Abone" },
  kampanya: { used:18,    limit:null, label:"Kampanya" },
  wa:       { used:38240, limit:null, label:"WA Mesajı" },
  email:    { used:14390, limit:null, label:"E-posta" },
};

const INVOICES = [
  { id:"INV-2025-003", date:"1 Mar 2025",  amount:"₺2.490" },
  { id:"INV-2025-002", date:"1 Şub 2025",  amount:"₺2.490" },
  { id:"INV-2025-001", date:"1 Oca 2025",  amount:"₺2.490" },
  { id:"INV-2024-012", date:"1 Ara 2024",  amount:"₺990" },
  { id:"INV-2024-011", date:"1 Kas 2024",  amount:"₺990" },
];

const ADDONS = [
  { id:"extra_wa",   name:"Ekstra WhatsApp Mesajı",  desc:"+10.000 mesaj/ay",  price:490,  icon:"💬", active:false },
  { id:"extra_sub",  name:"Ekstra Abone Kapasitesi", desc:"+2.000 abone",      price:390,  icon:"👥", active:true  },
  { id:"white_label",name:"Beyaz Etiket",            desc:"Kendi markanız",    price:1490, icon:"🏷️", active:false },
  { id:"api",        name:"API Erişimi",             desc:"REST API + Webhooks",price:790, icon:"⚙️", active:false },
];

const fmt = n => n != null ? n.toLocaleString("tr") : "—";

function Badge({ children, color="#22C55E" }) {
  return <span style={{ background:`${color}20`, color, border:`1px solid ${color}40`, padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:700 }}>{children}</span>;
}

function UsageBar({ used, limit, color="#0EA5E9" }) {
  const p = limit ? Math.min(Math.round(used/limit*100), 100) : null;
  const warn = p !== null && p > 80;
  const c = warn ? "#EF4444" : color;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:12 }}>
        <span style={{ fontFamily:"'Geist Mono',monospace", fontWeight:600, color:"#E2E8F0" }}>{fmt(used)}</span>
        <span style={{ color:"#475569" }}>{limit ? `/ ${fmt(limit)}` : "Sınırsız"}</span>
      </div>
      {limit && <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}><div style={{ width:`${p}%`, height:"100%", background:c, borderRadius:3 }} /></div>}
      {warn && <div style={{ fontSize:10, color:"#EF4444", marginTop:4 }}>⚠ Limite yaklaşıyorsunuz</div>}
    </div>
  );
}

export default function PricingManager() {
  const [tab, setTab]               = useState("plan");
  const [billing, setBilling]       = useState("monthly");
  const [upgrading, setUpgrading]   = useState(null);
  const [cancelFlow, setCancelFlow] = useState(false);
  const [addons, setAddons]         = useState(ADDONS);
  const [toggling, setToggling]     = useState(null);
  const [payModal, setPayModal]     = useState(false);
  const [cardNum, setCardNum]       = useState("");
  const [cardExp, setCardExp]       = useState("");
  const [cardCvc, setCardCvc]       = useState("");
  const [processing, setProcessing] = useState(false);
  const [payDone, setPayDone]       = useState(false);
  const [targetPlan, setTargetPlan] = useState(null);

  const yearlyDiscount = 0.20;
  const calcPrice = (p) => billing === "yearly" && p ? Math.round(p * (1-yearlyDiscount)) : p;

  const current = PLANS.find(p => p.id === CURRENT_PLAN);
  const currentIdx = PLANS.indexOf(current);

  const handleUpgrade = (plan) => {
    setUpgrading(plan.id);
    setTargetPlan(plan);
    setTimeout(() => { setUpgrading(null); setPayModal(true); }, 500);
  };

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setPayDone(true); setPayModal(false); }, 2200);
  };

  const toggleAddon = (id) => {
    setToggling(id);
    setTimeout(() => {
      setAddons(a => a.map(x => x.id === id ? { ...x, active: !x.active } : x));
      setToggling(null);
    }, 1000);
  };

  const activeAddonsTotal = addons.filter(a => a.active).reduce((s, a) => s + a.price, 0);

  return (
    <div style={{ fontFamily:"'Geist',sans-serif", background:"#0A0A14", minHeight:"100vh", color:"#E2E8F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input { outline:none; font-family:'Geist Mono',monospace; }
        input:focus { border-color:rgba(99,102,241,0.6)!important; box-shadow:0 0 0 3px rgba(99,102,241,0.12)!important; }
        .btn { transition:all 0.14s ease; cursor:pointer; }
        .btn:hover { opacity:0.82; }
        .btn:active { transform:scale(0.98); }
        .pcard { transition:all 0.2s ease; }
        .pcard:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.3); }
        .arow { transition:background 0.12s; }
        .arow:hover { background:rgba(255,255,255,0.05)!important; }
        .slide { animation:slide 0.28s ease forwards; }
        @keyframes slide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .spin { animation:spin 1s linear infinite; display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .mfade { animation:mfade 0.2s ease forwards; }
        @keyframes mfade { from{opacity:0} to{opacity:1} }
        .mpop { animation:mpop 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes mpop { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#1E293B; border-radius:2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding:"13px 28px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(10,10,20,0.96)", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#F59E0B,#EF4444)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>💳</div>
          <span style={{ fontFamily:"'Geist Mono',monospace", fontWeight:600, fontSize:15 }}>bulletin<span style={{ color:"#F59E0B" }}>AI</span></span>
          <span style={{ width:1, height:18, background:"rgba(255,255,255,0.1)", margin:"0 6px" }} />
          <span style={{ fontSize:12, color:"#475569" }}>Paket & Faturalama</span>
        </div>
        <div style={{ display:"flex", background:"rgba(255,255,255,0.05)", borderRadius:10, padding:3, gap:2 }}>
          {[{ id:"plan", label:"📦 Paket" }, { id:"addons", label:"🔌 Eklentiler" }, { id:"billing", label:"🧾 Faturalar" }].map(t => (
            <button key={t.id} className="btn" onClick={() => setTab(t.id)} style={{ background:tab===t.id?"rgba(245,158,11,0.18)":"transparent", border:tab===t.id?"1px solid rgba(245,158,11,0.3)":"1px solid transparent", color:tab===t.id?"#F59E0B":"#475569", padding:"7px 18px", borderRadius:8, fontSize:12, fontWeight:tab===t.id?600:400 }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ width:140 }} />
      </div>

      <div style={{ maxWidth:1080, margin:"0 auto", padding:"32px 24px" }}>

        {/* ── PLAN TAB ── */}
        {tab === "plan" && (
          <div className="slide">
            {/* Current plan banner */}
            <div style={{ background:`${current.color}0d`, border:`1px solid ${current.color}40`, borderRadius:16, padding:"22px 28px", marginBottom:28, display:"grid", gridTemplateColumns:"1fr auto", gap:24, alignItems:"center" }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Aktif Paketiniz</div>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                  <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:28, fontWeight:700, color:current.color }}>{current.name}</span>
                  <Badge color={current.color}>Aktif</Badge>
                  {payDone && <Badge color="#22C55E">✓ Ödeme Alındı</Badge>}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
                  {Object.entries(USAGE).map(([k, u]) => (
                    <div key={k}>
                      <div style={{ fontSize:10, color:"#475569", marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{u.label}</div>
                      <UsageBar used={u.used} limit={u.limit} color={current.color} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11, color:"#475569", marginBottom:4 }}>Sonraki ödeme</div>
                <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:28, fontWeight:700, color:"#F1F5F9" }}>₺2.490</div>
                <div style={{ fontSize:11, color:"#475569", marginBottom:18 }}>1 Nisan 2025</div>
                <button className="btn" onClick={() => setCancelFlow(c => !c)} style={{ background:"rgba(239,68,68,0.09)", border:"1px solid rgba(239,68,68,0.25)", color:"#EF4444", padding:"8px 16px", borderRadius:9, fontSize:12, fontWeight:500 }}>İptal Et</button>
              </div>
            </div>

            {/* Cancel confirm */}
            {cancelFlow && (
              <div className="slide" style={{ marginBottom:20, padding:"20px 24px", background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:14 }}>
                <div style={{ fontSize:15, fontWeight:700, color:"#EF4444", marginBottom:8 }}>⚠ Paketi İptal Et</div>
                <p style={{ fontSize:13, color:"#94A3B8", lineHeight:1.7, marginBottom:16 }}>Growth paketinizi iptal ederseniz <strong style={{ color:"#F1F5F9" }}>1 Nisan 2025</strong> itibarıyla Starter'a geçeceksiniz. WhatsApp kanalı erişiminiz kesilir, verileriniz korunur.</p>
                <div style={{ display:"flex", gap:10 }}>
                  <button className="btn" onClick={() => setCancelFlow(false)} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"#94A3B8", padding:"9px 22px", borderRadius:9, fontSize:13, fontWeight:500 }}>Vazgeç</button>
                  <button className="btn" onClick={() => setCancelFlow(false)} style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.35)", color:"#EF4444", padding:"9px 22px", borderRadius:9, fontSize:13, fontWeight:600 }}>Evet, İptal Et</button>
                </div>
              </div>
            )}

            {/* Billing toggle */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
              <div style={{ display:"flex", alignItems:"center", gap:2, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:50, padding:4 }}>
                <button className="btn" onClick={() => setBilling("monthly")} style={{ background:billing==="monthly"?"rgba(255,255,255,0.1)":"transparent", border:"none", color:billing==="monthly"?"#F1F5F9":"#475569", padding:"8px 22px", borderRadius:50, fontSize:13, fontWeight:billing==="monthly"?600:400 }}>Aylık</button>
                <button className="btn" onClick={() => setBilling("yearly")} style={{ background:billing==="yearly"?"rgba(34,197,94,0.15)":"transparent", border:"none", color:billing==="yearly"?"#22C55E":"#475569", padding:"8px 22px", borderRadius:50, fontSize:13, fontWeight:billing==="yearly"?600:400, display:"flex", alignItems:"center", gap:8 }}>
                  Yıllık <span style={{ background:"rgba(34,197,94,0.2)", color:"#22C55E", padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700 }}>%20 indirim</span>
                </button>
              </div>
            </div>

            {/* Plan cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
              {PLANS.map((plan, pi) => {
                const isCurrent = plan.id === CURRENT_PLAN;
                const p = calcPrice(plan.price);
                const isUpgrade = pi > currentIdx;
                return (
                  <div key={plan.id} className="pcard" style={{ background:isCurrent?`${plan.color}0c`:"rgba(255,255,255,0.03)", border:`2px solid ${isCurrent?plan.color:"rgba(255,255,255,0.08)"}`, borderRadius:16, padding:"22px 18px", position:"relative", display:"flex", flexDirection:"column" }}>
                    {plan.popular && !isCurrent && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:plan.gradient, color:"#fff", fontSize:10, fontWeight:700, padding:"4px 14px", borderRadius:20, whiteSpace:"nowrap" }}>En Popüler</div>}
                    {isCurrent && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:"rgba(10,10,20,0.95)", border:`1px solid ${plan.color}`, color:plan.color, fontSize:10, fontWeight:700, padding:"4px 14px", borderRadius:20, whiteSpace:"nowrap" }}>Mevcut Paket</div>}
                    <div style={{ width:36, height:36, background:plan.gradient, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, marginBottom:12 }}>
                      {plan.id==="starter"?"🌱":plan.id==="growth"?"🚀":plan.id==="scale"?"⚡":"🏢"}
                    </div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#F1F5F9", marginBottom:8 }}>{plan.name}</div>
                    {p != null ? (
                      <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:4 }}>
                        <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:26, fontWeight:700, color:plan.color }}>₺{fmt(p)}</span>
                        <span style={{ fontSize:12, color:"#475569" }}>/ay</span>
                      </div>
                    ) : (
                      <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:20, fontWeight:700, color:plan.color, marginBottom:4 }}>Özel Fiyat</div>
                    )}
                    {billing==="yearly" && p && <div style={{ fontSize:11, color:"#22C55E", marginBottom:12 }}>Yıllık ₺{fmt(p*12)} · ₺{fmt(Math.round(plan.price*12*yearlyDiscount))} tasarruf</div>}
                    <div style={{ flex:1, marginTop:8, marginBottom:18 }}>
                      {plan.features.map((f, i) => (
                        <div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}>
                          <span style={{ color:plan.color, fontSize:11, flexShrink:0, marginTop:1 }}>✓</span>
                          <span style={{ fontSize:12, color:"#94A3B8", lineHeight:1.4 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    {isCurrent ? (
                      <button disabled style={{ width:"100%", padding:"11px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#475569", borderRadius:10, fontSize:13, fontWeight:600 }}>Mevcut Paket</button>
                    ) : plan.id === "enterprise" ? (
                      <button className="btn" style={{ width:"100%", padding:"11px", background:plan.gradient, border:"none", color:"#fff", borderRadius:10, fontSize:13, fontWeight:600 }}>Satış Ekibini Ara</button>
                    ) : (
                      <button className="btn" onClick={() => handleUpgrade(plan)} style={{ width:"100%", padding:"11px", background:isUpgrade?plan.gradient:"rgba(255,255,255,0.07)", border:isUpgrade?"none":"1px solid rgba(255,255,255,0.1)", color:isUpgrade?"#fff":"#94A3B8", borderRadius:10, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                        {upgrading===plan.id?<span className="spin">⟳</span>:isUpgrade?"↑ Yükselt":"↓ Düşür"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ADDONS TAB ── */}
        {tab === "addons" && (
          <div className="slide">
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:"#F1F5F9", marginBottom:6 }}>Eklentiler</h2>
              <p style={{ fontSize:13, color:"#475569", lineHeight:1.6 }}>Paketinize ek özellik ve kapasite ekleyin. Değişiklikler bir sonraki fatura döneminde geçerli olur.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {addons.map(addon => (
                <div key={addon.id} className="arow" style={{ display:"grid", gridTemplateColumns:"52px 1fr auto auto", alignItems:"center", gap:18, padding:"18px 22px", background:"rgba(255,255,255,0.03)", border:`1px solid ${addon.active?"rgba(245,158,11,0.3)":"rgba(255,255,255,0.07)"}`, borderRadius:14 }}>
                  <div style={{ width:44, height:44, background:addon.active?"rgba(245,158,11,0.12)":"rgba(255,255,255,0.05)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{addon.icon}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:"#F1F5F9", marginBottom:3 }}>{addon.name}</div>
                    <div style={{ fontSize:12, color:"#475569" }}>{addon.desc}</div>
                  </div>
                  <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:14, fontWeight:700, color:"#F59E0B" }}>₺{fmt(addon.price)}/ay</div>
                  <button className="btn" onClick={() => toggleAddon(addon.id)} style={{ background:addon.active?"rgba(34,197,94,0.12)":"rgba(255,255,255,0.05)", border:`1.5px solid ${addon.active?"rgba(34,197,94,0.4)":"rgba(255,255,255,0.1)"}`, color:addon.active?"#22C55E":"#475569", padding:"8px 20px", borderRadius:9, fontSize:12, fontWeight:600, minWidth:110, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    {toggling===addon.id?<span className="spin">⟳</span>:addon.active?"✓ Aktif":"+ Ekle"}
                  </button>
                </div>
              ))}
            </div>
            {addons.some(a => a.active) && (
              <div className="slide" style={{ marginTop:20, padding:"18px 22px", background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#F59E0B", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Aktif Eklentiler</div>
                {addons.filter(a => a.active).map((a, i, arr) => (
                  <div key={a.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                    <span style={{ fontSize:13, color:"#94A3B8" }}>{a.icon} {a.name}</span>
                    <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:13, color:"#F59E0B", fontWeight:600 }}>₺{fmt(a.price)}/ay</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, marginTop:6 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:"#F1F5F9" }}>Eklenti Toplamı</span>
                  <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:16, fontWeight:700, color:"#F59E0B" }}>₺{fmt(activeAddonsTotal)}/ay</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BILLING TAB ── */}
        {tab === "billing" && (
          <div className="slide">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
              {/* Payment method */}
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"22px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:16 }}>Ödeme Yöntemi</div>
                <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, marginBottom:12 }}>
                  <div style={{ width:42, height:28, background:"linear-gradient(135deg,#1A1F71,#00A1E0)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"#fff", letterSpacing:1 }}>VISA</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:13, color:"#E2E8F0" }}>•••• •••• •••• 4242</div>
                    <div style={{ fontSize:11, color:"#475569" }}>Son kullanım: 12/27</div>
                  </div>
                  <Badge color="#22C55E">Varsayılan</Badge>
                </div>
                <button className="btn" onClick={() => setPayModal(true)} style={{ width:"100%", padding:"10px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", color:"#94A3B8", borderRadius:10, fontSize:12, fontWeight:500 }}>+ Yeni Kart Ekle</button>
              </div>
              {/* Monthly summary */}
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"22px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:16 }}>Aylık Özet</div>
                {[["Growth Paket","₺2.490"],["Ekstra Abone (+2K)","₺390"],["KDV (%18)","₺510"]].map(([l,v], i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:13 }}>
                    <span style={{ color:"#64748B" }}>{l}</span>
                    <span style={{ fontFamily:"'Geist Mono',monospace", color:"#E2E8F0" }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 4px" }}>
                  <span style={{ fontSize:14, fontWeight:700, color:"#F1F5F9" }}>Toplam</span>
                  <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:18, fontWeight:700, color:"#F59E0B" }}>₺3.390</span>
                </div>
                <div style={{ fontSize:11, color:"#334155", textAlign:"center", marginTop:6 }}>Sonraki ödeme: 1 Nisan 2025</div>
              </div>
            </div>
            {/* Invoice table */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
              <div style={{ padding:"16px 22px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#F1F5F9" }}>Fatura Geçmişi</div>
                <button className="btn" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", color:"#475569", padding:"6px 14px", borderRadius:8, fontSize:11 }}>Tümünü İndir</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr 1fr 80px", padding:"8px 22px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.02)" }}>
                {["Fatura No","Tarih","Tutar","Durum",""].map(h => <div key={h} style={{ fontSize:10, color:"#334155", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:600 }}>{h}</div>)}
              </div>
              {INVOICES.map((inv, i) => (
                <div key={inv.id} style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr 1fr 80px", padding:"13px 22px", borderBottom:i<INVOICES.length-1?"1px solid rgba(255,255,255,0.04)":"none", alignItems:"center" }}>
                  <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, color:"#94A3B8" }}>{inv.id}</span>
                  <span style={{ fontSize:12, color:"#64748B" }}>{inv.date}</span>
                  <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:13, fontWeight:600, color:"#E2E8F0" }}>{inv.amount}</span>
                  <Badge color="#22C55E">Ödendi</Badge>
                  <button className="btn" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#475569", padding:"5px 10px", borderRadius:7, fontSize:11 }}>⬇ PDF</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Payment Modal ── */}
      {payModal && (
        <div className="mfade" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }} onClick={e => e.target===e.currentTarget && setPayModal(false)}>
          <div className="mpop" style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"32px", width:420, boxShadow:"0 32px 80px rgba(0,0,0,0.7)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div style={{ fontSize:16, fontWeight:700, color:"#F1F5F9" }}>Ödeme Bilgileri</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", padding:"4px 12px", borderRadius:8 }}>
                <span style={{ fontSize:10, color:"#818CF8", fontWeight:600 }}>Powered by</span>
                <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, fontWeight:800, color:"#6366F1" }}>stripe</span>
              </div>
            </div>
            {targetPlan && (
              <div style={{ padding:"12px 16px", background:`${targetPlan.color}12`, border:`1px solid ${targetPlan.color}40`, borderRadius:10, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:"#94A3B8" }}>{targetPlan.name} Paket · Aylık</span>
                <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:18, fontWeight:700, color:targetPlan.color }}>₺{fmt(calcPrice(targetPlan.price))}</span>
              </div>
            )}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#475569", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.05em" }}>Kart Numarası</label>
              <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"12px 14px" }}>
                <span style={{ fontSize:18 }}>💳</span>
                <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim())} placeholder="1234 5678 9012 3456" maxLength={19} style={{ flex:1, background:"transparent", border:"none", color:"#E2E8F0", fontSize:14, letterSpacing:"0.08em" }} />
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:22 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#475569", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.05em" }}>Son Kullanım</label>
                <input value={cardExp} onChange={e => { const v=e.target.value.replace(/\D/g,""); setCardExp(v.length>=2?v.slice(0,2)+"/"+v.slice(2,4):v); }} placeholder="AA/YY" maxLength={5} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"12px 14px", color:"#E2E8F0", fontSize:14 }} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#475569", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.05em" }}>CVC</label>
                <input value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="•••" maxLength={4} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"12px 14px", color:"#E2E8F0", fontSize:14, letterSpacing:"0.2em" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn" onClick={() => setPayModal(false)} style={{ flex:1, padding:"12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", color:"#475569", borderRadius:10, fontSize:13, fontWeight:500 }}>İptal</button>
              <button className="btn" onClick={handlePay} disabled={processing} style={{ flex:2, padding:"12px", background:processing?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#6366F1,#8B5CF6)", border:"none", color:processing?"#475569":"#fff", borderRadius:10, fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {processing?<><span className="spin">⟳</span> İşleniyor...</>:"🔒 Güvenli Öde"}
              </button>
            </div>
            <div style={{ marginTop:12, textAlign:"center", fontSize:11, color:"#334155" }}>🔒 256-bit SSL şifrelemeli · PCI DSS uyumlu</div>
          </div>
        </div>
      )}
    </div>
  );
}
