"use client";
import { useState } from "react";

// ── Mock Data ──────────────────────────────────────────────────────────────
const CAMPAIGNS = [
  { id:1, name:"Haftalık E-ticaret #47", date:"3 Mar",  sent:4821, opened:4387, clicked:1639, unsub:12, wa:3472, email:1349, waOpen:91, emailOpen:74, status:"completed" },
  { id:2, name:"Flash Fırsat Bildirimi", date:"28 Şub", sent:2103, opened:1914, clicked:862,  unsub:5,  wa:2103, email:0,    waOpen:91, emailOpen:0,  status:"completed" },
  { id:3, name:"Pazar Trendleri #12",    date:"21 Şub", sent:6540, opened:5302, clicked:1744, unsub:21, wa:3800, email:2740, waOpen:88, emailOpen:68, status:"completed" },
  { id:4, name:"Startup Radar #8",       date:"14 Şub", sent:1290, opened:987,  clicked:312,  unsub:3,  wa:720,  email:570,  waOpen:86, emailOpen:72, status:"completed" },
  { id:5, name:"E-ticaret Pro Özeti",    date:"7 Şub",  sent:3412, opened:2900, clicked:1023, unsub:9,  wa:2100, email:1312, waOpen:89, emailOpen:70, status:"completed" },
];

const WEEKLY = [
  { week:"4 Şub", waOpen:86, emailOpen:68, sent:3200 },
  { week:"11 Şub", waOpen:88, emailOpen:70, sent:2800 },
  { week:"18 Şub", waOpen:84, emailOpen:65, sent:4100 },
  { week:"25 Şub", waOpen:91, emailOpen:74, sent:3900 },
  { week:"4 Mar",  waOpen:93, emailOpen:76, sent:4821 },
];

const GROWTH = [
  { month:"Eyl", total:5200 },
  { month:"Eki", total:6800 },
  { month:"Kas", total:7900 },
  { month:"Ara", total:8700 },
  { month:"Oca", total:9800 },
  { month:"Şub", total:11624 },
];

const TOP_LINKS = [
  { url:"bulten.link/eticaret-rapor", clicks:892, pct:54 },
  { url:"bulten.link/flash-kampanya", clicks:341, pct:21 },
  { url:"bulten.link/trend-analiz",   clicks:218, pct:13 },
  { url:"bulten.link/urunler",        clicks:188, pct:12 },
];

const DEVICE = [
  { label:"Mobil",  pct:72, color:"#0EA5E9" },
  { label:"Masaüstü", pct:21, color:"#8B5CF6" },
  { label:"Tablet", pct:7,  color:"#F59E0B" },
];

const fmt = n => n?.toLocaleString("tr") ?? "—";
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 36, width = 100 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow:"visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${height} ${pts} ${width},${height}`} fill={`${color}18`} stroke="none" />
    </svg>
  );
}

// ── Bar chart ──────────────────────────────────────────────────────────────
function BarGroup({ data, keys, colors, labels }) {
  const max = Math.max(...data.flatMap(d => keys.map(k => d[k])));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:140 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:120, width:"100%" }}>
            {keys.map((k, j) => (
              <div key={k} style={{ flex:1, background:`linear-gradient(180deg,${colors[j]},${colors[j]}88)`, borderRadius:"3px 3px 0 0", height:`${(d[k]/max)*100}%`, minHeight:2, transition:"height 0.6s cubic-bezier(0.34,1.56,0.64,1)" }} />
            ))}
          </div>
          <span style={{ fontSize:9, color:"#64748B", whiteSpace:"nowrap" }}>{d.week || d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut ──────────────────────────────────────────────────────────────────
function Donut({ segments, size = 80 }) {
  const r = size / 2 - 8;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size}>
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={10}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset * circ / 100}
            style={{ transform:"rotate(-90deg)", transformOrigin:"center", transition:"stroke-dasharray 0.6s ease" }} />
        );
        offset += s.pct;
        return el;
      })}
      <circle cx={cx} cy={cy} r={r - 6} fill="#0D0D18" />
    </svg>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [range, setRange]         = useState("30d");
  const [activeMetric, setActiveMetric] = useState("open");
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported]   = useState(false);

  const totals = CAMPAIGNS.reduce((acc, c) => ({
    sent:   acc.sent   + c.sent,
    opened: acc.opened + c.opened,
    clicked:acc.clicked+ c.clicked,
    unsub:  acc.unsub  + c.unsub,
  }), { sent:0, opened:0, clicked:0, unsub:0 });

  const avgWaOpen    = Math.round(CAMPAIGNS.reduce((a,c) => a + c.waOpen, 0) / CAMPAIGNS.length);
  const avgEmailOpen = Math.round(CAMPAIGNS.reduce((a,c) => a + (c.emailOpen||0), 0) / CAMPAIGNS.filter(c=>c.email>0).length);

  const doExport = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setExported(true); setTimeout(() => setExported(false), 2500); }, 1800);
  };

  return (
    <div style={{ fontFamily:"'Geist',sans-serif", background:"#0A0A14", minHeight:"100vh", color:"#E2E8F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .btn { transition:all 0.14s ease; cursor:pointer; }
        .btn:hover { opacity:0.82; }
        .row { transition:background 0.12s; cursor:pointer; }
        .row:hover { background:rgba(255,255,255,0.04)!important; }
        .metric-card { transition:all 0.18s ease; cursor:pointer; }
        .metric-card:hover { transform:translateY(-2px); }
        .slide { animation:slide 0.28s ease forwards; }
        @keyframes slide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .spin { animation:spin 1s linear infinite; display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#1E293B; border-radius:2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding:"13px 28px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(10,10,20,0.95)", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#0EA5E9,#22C55E)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>📊</div>
          <span style={{ fontFamily:"'Geist Mono',monospace", fontWeight:600, fontSize:15, color:"#F1F5F9" }}>bulletin<span style={{ color:"#0EA5E9" }}>AI</span></span>
          <span style={{ width:1, height:18, background:"rgba(255,255,255,0.1)", margin:"0 6px" }} />
          <span style={{ fontSize:12, color:"#475569" }}>Analitik & Raporlama</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Range selector */}
          <div style={{ display:"flex", background:"rgba(255,255,255,0.05)", borderRadius:9, padding:3 }}>
            {["7d","30d","90d","1y"].map(r => (
              <button key={r} className="btn" onClick={() => setRange(r)} style={{ background: range===r ? "rgba(14,165,233,0.2)" : "transparent", border: range===r ? "1px solid rgba(14,165,233,0.3)" : "1px solid transparent", color: range===r ? "#0EA5E9" : "#475569", padding:"5px 12px", borderRadius:7, fontSize:12, fontWeight: range===r ? 600 : 400 }}>
                {r}
              </button>
            ))}
          </div>
          <button className="btn" onClick={doExport} style={{ background: exported ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", border:`1px solid ${exported ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`, color: exported ? "#22C55E" : "#94A3B8", padding:"7px 16px", borderRadius:9, fontSize:12, fontWeight:500, display:"flex", alignItems:"center", gap:6 }}>
            {exporting ? <><span className="spin">⟳</span> Hazırlanıyor...</> : exported ? "✓ İndirildi" : "⬇ Rapor İndir"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px" }}>

        {/* ── KPI Cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Toplam Gönderim",   value:fmt(totals.sent),    delta:"+14%",  color:"#0EA5E9", spark:WEEKLY.map(w=>w.sent),          icon:"📨" },
            { label:"Ort. WA Açılma",    value:`%${avgWaOpen}`,     delta:"+3pt",  color:"#25D366", spark:WEEKLY.map(w=>w.waOpen),         icon:"💬" },
            { label:"Ort. Mail Açılma",  value:`%${avgEmailOpen}`,  delta:"+5pt",  color:"#8B5CF6", spark:WEEKLY.map(w=>w.emailOpen),      icon:"📧" },
            { label:"Toplam Tıklama",    value:fmt(totals.clicked), delta:"+22%",  color:"#F59E0B", spark:CAMPAIGNS.map(c=>c.clicked),     icon:"🖱️" },
            { label:"Abonelik İptali",   value:fmt(totals.unsub),   delta:"-8%",   color:"#EF4444", spark:CAMPAIGNS.map(c=>c.unsub).reverse(), icon:"🚫", reverse:true },
          ].map((k, i) => (
            <div key={i} className="metric-card" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:13, padding:"16px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:600 }}>{k.label}</div>
                <span style={{ fontSize:13 }}>{k.icon}</span>
              </div>
              <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:24, fontWeight:700, color:k.color, marginBottom:6 }}>{k.value}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                <span style={{ fontSize:11, color: k.reverse ? (k.delta.startsWith("-") ? "#22C55E" : "#EF4444") : (k.delta.startsWith("+") ? "#22C55E" : "#EF4444"), fontWeight:600 }}>
                  {k.delta} <span style={{ color:"#334155", fontWeight:400 }}>vs önceki dönem</span>
                </span>
                <Sparkline data={k.spark} color={k.color} width={60} height={28} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:16, marginBottom:16 }}>

          {/* Weekly performance chart */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"22px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"#F1F5F9", marginBottom:2 }}>Haftalık Açılma Oranı</div>
                <div style={{ fontSize:11, color:"#475569" }}>Son 5 hafta · Kanal karşılaştırması</div>
              </div>
              <div style={{ display:"flex", gap:14, fontSize:11 }}>
                <span style={{ display:"flex", alignItems:"center", gap:5, color:"#25D366" }}><span style={{ width:8, height:8, background:"#25D366", borderRadius:2, display:"inline-block" }} />WhatsApp</span>
                <span style={{ display:"flex", alignItems:"center", gap:5, color:"#8B5CF6" }}><span style={{ width:8, height:8, background:"#8B5CF6", borderRadius:2, display:"inline-block" }} />E-posta</span>
              </div>
            </div>
            <BarGroup data={WEEKLY} keys={["waOpen","emailOpen"]} colors={["#25D366","#8B5CF6"]} />
            <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { label:"WA Ort. Açılma", val:`%${avgWaOpen}`, sub:"Sektör ort. %35", color:"#25D366" },
                { label:"Mail Ort. Açılma", val:`%${avgEmailOpen}`, sub:"Sektör ort. %21", color:"#8B5CF6" },
              ].map((s,i) => (
                <div key={i} style={{ padding:"10px 12px", background:"rgba(255,255,255,0.03)", borderRadius:8, borderLeft:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:18, fontWeight:700, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:10, color:"#22C55E", marginTop:2 }}>{s.sub} ↑</div>
                </div>
              ))}
            </div>
          </div>

          {/* Abone büyümesi */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"22px" }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#F1F5F9", marginBottom:2 }}>Abone Büyümesi</div>
              <div style={{ fontSize:11, color:"#475569" }}>Son 6 ay · Toplam liste</div>
            </div>
            <BarGroup data={GROWTH} keys={["total"]} colors={["#0EA5E9"]} />
            <div style={{ marginTop:14, padding:"12px", background:"rgba(14,165,233,0.07)", border:"1px solid rgba(14,165,233,0.15)", borderRadius:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>6 Aylık Büyüme</div>
                  <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:22, fontWeight:700, color:"#0EA5E9" }}>+123%</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>Aylık Ort.</div>
                  <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:16, fontWeight:600, color:"#38BDF8" }}>+1.404</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr 1fr", gap:16, marginBottom:16 }}>

          {/* Campaign table */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"18px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#F1F5F9" }}>Kampanya Performansı</div>
              <span style={{ fontSize:11, color:"#475569" }}>Son {CAMPAIGNS.length} kampanya</span>
            </div>
            {/* Head */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", padding:"8px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              {["Kampanya","Gönderim","Açılma","Tıklama","İptal"].map(h => (
                <div key={h} style={{ fontSize:10, color:"#334155", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:600 }}>{h}</div>
              ))}
            </div>
            {CAMPAIGNS.map((c, i) => {
              const openRate  = pct(c.opened,  c.sent);
              const clickRate = pct(c.clicked, c.sent);
              const unsubRate = pct(c.unsub,   c.sent);
              const isSelected = selectedCamp === c.id;
              return (
                <div key={c.id} className="row" onClick={() => setSelectedCamp(isSelected ? null : c.id)} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", padding:"12px 20px", borderBottom: i<CAMPAIGNS.length-1?"1px solid rgba(255,255,255,0.04)":"none", background: isSelected ? "rgba(14,165,233,0.06)" : "transparent", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#E2E8F0", marginBottom:2 }}>{c.name}</div>
                    <div style={{ fontSize:10, color:"#475569" }}>{c.date} · {[c.wa>0&&"WA",c.email>0&&"Mail"].filter(Boolean).join(" + ")}</div>
                  </div>
                  <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:13, color:"#94A3B8" }}>{fmt(c.sent)}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color: openRate>80?"#22C55E":openRate>60?"#F59E0B":"#EF4444" }}>%{openRate}</div>
                    <div style={{ marginTop:4, width:44, height:2, background:"rgba(255,255,255,0.08)", borderRadius:1, overflow:"hidden" }}>
                      <div style={{ width:`${openRate}%`, height:"100%", background: openRate>80?"#22C55E":openRate>60?"#F59E0B":"#EF4444" }} />
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#0EA5E9" }}>%{clickRate}</div>
                  <div style={{ fontSize:13, color: unsubRate>1?"#EF4444":"#475569" }}>%{unsubRate.toFixed(1)}</div>
                </div>
              );
            })}
          </div>

          {/* Top links */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"20px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#F1F5F9", marginBottom:4 }}>En Çok Tıklanan</div>
            <div style={{ fontSize:11, color:"#475569", marginBottom:18 }}>Bağlantı performansı</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {TOP_LINKS.map((l, i) => (
                <div key={i}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:11, color:"#94A3B8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:140, fontFamily:"'Geist Mono',monospace" }}>{l.url}</span>
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:11, fontWeight:600, color:"#0EA5E9" }}>{fmt(l.clicks)}</span>
                      <span style={{ fontSize:11, color:"#334155" }}>%{l.pct}</span>
                    </div>
                  </div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ width:`${l.pct}%`, height:"100%", background:`linear-gradient(90deg,#0EA5E9,#22C55E)`, borderRadius:2, transition:"width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device + Funnel */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Device breakdown */}
            <div style={{ flex:1, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"18px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#F1F5F9", marginBottom:14 }}>Cihaz Dağılımı</div>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <Donut segments={DEVICE} size={72} />
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {DEVICE.map((d, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:d.color, flexShrink:0 }} />
                      <span style={{ fontSize:11, color:"#94A3B8" }}>{d.label}</span>
                      <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:11, fontWeight:600, color:d.color, marginLeft:"auto" }}>%{d.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Funnel */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"18px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#F1F5F9", marginBottom:14 }}>Dönüşüm Hunisi</div>
              {[
                { label:"Gönderildi",  val:totals.sent,    color:"#334155", pct:100 },
                { label:"Açıldı",      val:totals.opened,  color:"#0EA5E9", pct:pct(totals.opened,totals.sent) },
                { label:"Tıklandı",    val:totals.clicked, color:"#22C55E", pct:pct(totals.clicked,totals.sent) },
                { label:"İptal Etti",  val:totals.unsub,   color:"#EF4444", pct:pct(totals.unsub,totals.sent) },
              ].map((f, i) => (
                <div key={i} style={{ marginBottom:i<3?10:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:11, color:"#94A3B8" }}>{f.label}</span>
                    <div style={{ display:"flex", gap:8 }}>
                      <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:11, color:f.color, fontWeight:600 }}>{fmt(f.val)}</span>
                      <span style={{ fontSize:11, color:"#334155" }}>%{f.pct}</span>
                    </div>
                  </div>
                  <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ width:`${f.pct}%`, height:"100%", background:f.color, borderRadius:3, transition:"width 1s ease", opacity: i===3?0.7:1 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Campaign Detail (conditional) ── */}
        {selectedCamp && (() => {
          const c = CAMPAIGNS.find(x => x.id === selectedCamp);
          if (!c) return null;
          return (
            <div className="slide" style={{ background:"rgba(14,165,233,0.04)", border:"1px solid rgba(14,165,233,0.15)", borderRadius:14, padding:"22px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:"#F1F5F9" }}>{c.name}</div>
                  <div style={{ fontSize:12, color:"#475569", marginTop:2 }}>{c.date} · Detaylı Rapor</div>
                </div>
                <button className="btn" onClick={() => setSelectedCamp(null)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#475569", padding:"6px 12px", borderRadius:8, fontSize:12 }}>Kapat</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
                {[
                  { label:"Toplam Gönderim", val:fmt(c.sent),                color:"#94A3B8" },
                  { label:"WA Gönderim",     val:fmt(c.wa),                  color:"#25D366" },
                  { label:"Mail Gönderim",   val:fmt(c.email)||"—",          color:"#8B5CF6" },
                  { label:"WA Açılma",       val:`%${c.waOpen}`,             color:"#22C55E" },
                  { label:"Mail Açılma",     val:c.emailOpen?`%${c.emailOpen}`:"—", color:"#0EA5E9" },
                  { label:"Tıklama",         val:`%${pct(c.clicked,c.sent)}`,color:"#F59E0B" },
                ].map((item, i) => (
                  <div key={i} style={{ padding:"12px 14px", background:"rgba(255,255,255,0.04)", borderRadius:10, borderTop:`2px solid ${item.color}` }}>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:18, fontWeight:700, color:item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── AI Insights ── */}
        <div style={{ background:"rgba(139,92,246,0.05)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:14, padding:"20px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:32, height:32, background:"linear-gradient(135deg,#8B5CF6,#6366F1)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>✨</div>
            <div style={{ fontSize:14, fontWeight:700, color:"#C4B5FD" }}>AI Performans Analizi</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { icon:"🏆", title:"En İyi Kampanya", body:`"Haftalık E-ticaret #47" bu dönemin en yüksek performanslı kampanyasıydı. %91 WA açılma ve %34 tıklama oranıyla diğer kampanyaları geride bıraktı.`, color:"#F59E0B" },
              { icon:"📈", title:"Büyüme Fırsatı",  body:`E-posta kanalı son 4 haftada %5 büyüme kaydetti. Mail listesi genişletilirse WhatsApp maliyetlerini dengelemek için güçlü bir kanal haline gelebilir.`, color:"#22C55E" },
              { icon:"⚡", title:"Optimizasyon",    body:`Salı 10:15 gönderim saati bu segmentte en yüksek açılma oranını üretiyor. Perşembe sabahları da ikinci en iyi pencere olarak öne çıkıyor.`, color:"#0EA5E9" },
            ].map((ins, i) => (
              <div key={i} style={{ padding:"16px", background:"rgba(255,255,255,0.03)", borderRadius:12, borderLeft:`3px solid ${ins.color}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:16 }}>{ins.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:ins.color }}>{ins.title}</span>
                </div>
                <div style={{ fontSize:12, color:"#64748B", lineHeight:1.7 }}>{ins.body}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
