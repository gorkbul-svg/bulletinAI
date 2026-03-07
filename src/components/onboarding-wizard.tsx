"use client";
import { useState } from "react";

// ── Types & Config ─────────────────────────────────────────────────────────
const STEPS = [
  { id:"welcome",   icon:"👋", title:"Hoş Geldiniz",          short:"Başlangıç" },
  { id:"business",  icon:"🏢", title:"İşletme Bilgileri",      short:"İşletme" },
  { id:"whatsapp",  icon:"💬", title:"WhatsApp API Bağlantısı",short:"WhatsApp" },
  { id:"email",     icon:"📧", title:"E-posta Ayarları",       short:"E-posta" },
  { id:"template",  icon:"📋", title:"İlk Şablonunuz",         short:"Şablon" },
  { id:"test",      icon:"🧪", title:"Test Gönderimi",         short:"Test" },
  { id:"done",      icon:"🎉", title:"Hazırsınız!",            short:"Tamamlandı" },
];

const PLANS = [
  { id:"starter", name:"Starter", price:"₺990", period:"/ay", abone:"1.000", kanallar:"Sadece E-posta", ai:false,  color:"#64748b" },
  { id:"growth",  name:"Growth",  price:"₺2.490", period:"/ay", abone:"5.000", kanallar:"E-posta + WhatsApp", ai:false, color:"#0EA5E9", popular:true },
  { id:"scale",   name:"Scale",   price:"₺5.990", period:"/ay", abone:"25.000", kanallar:"Tümü + AI", ai:true, color:"#8B5CF6" },
];

export default function OnboardingWizard() {
  const [step, setStep]         = useState(0);
  const [plan, setPlan]         = useState("growth");
  const [testing, setTesting]   = useState(false);
  const [testDone, setTestDone] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [waOk, setWaOk]         = useState(false);
  const [waChecking, setWaChecking] = useState(false);
  const [form, setForm]         = useState({
    businessName:"", sector:"", email:"", phone:"",
    phoneNumberId:"", wabaId:"", accessToken:"",
    smtpHost:"", smtpPort:"587", smtpUser:"", smtpPass:"",
    templateName:"haftalik_bulten", templateBody:"Merhaba {{1}},\n\nBu haftanın öne çıkan gelişmeleri hazır! 🚀\n\n{{2}}\n\nDetaylar için bağlantıya göz atabilirsiniz.",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const checkWA = () => {
    setWaChecking(true);
    setTimeout(() => { setWaChecking(false); setWaOk(true); }, 2000);
  };

  const runTest = () => {
    setTesting(true);
    setTimeout(() => { setTesting(false); setTestDone(true); }, 2500);
  };

  const canProceed = () => {
    if (step === 1) return form.businessName && form.email && form.phone;
    if (step === 2) return waOk;
    if (step === 5) return testDone;
    return true;
  };

  const progress = step / (STEPS.length - 1);

  return (
    <div style={{ fontFamily:"'Geist',sans-serif", background:"#F8FAFC", minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input,select,textarea { outline:none; font-family:'Geist',sans-serif; }
        input:focus, select:focus, textarea:focus {
          border-color:#0EA5E9!important;
          box-shadow:0 0 0 3px rgba(14,165,233,0.12)!important;
        }
        .btn { transition:all 0.15s ease; cursor:pointer; }
        .btn:hover { filter:brightness(0.94); }
        .btn:active { transform:scale(0.98); }
        .plan-card { transition:all 0.18s ease; cursor:pointer; }
        .plan-card:hover { transform:translateY(-2px); }
        .step-dot { transition:all 0.25s ease; }
        .slide { animation:slide 0.3s ease forwards; }
        @keyframes slide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        .spin { animation:spin 1s linear infinite; display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .check-pop { animation:checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes checkPop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        .progress-bar { transition:width 0.4s cubic-bezier(0.4,0,0.2,1); }
        textarea { resize:none; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:2px; }
        .field-group { transition:border-color 0.15s; }
        .field-row { border-bottom:1px solid #F1F5F9; transition:background 0.1s; }
        .field-row:last-child { border-bottom:none; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#0EA5E9,#6366F1)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📡</div>
          <span style={{ fontFamily:"'Geist Mono',monospace", fontWeight:600, fontSize:16, letterSpacing:"-0.5px", color:"#0F172A" }}>
            bulletin<span style={{ color:"#0EA5E9" }}>AI</span>
          </span>
          <span style={{ width:1, height:18, background:"#E2E8F0", display:"inline-block", margin:"0 4px" }} />
          <span style={{ fontSize:12, color:"#94A3B8", fontWeight:500 }}>Kurulum Sihirbazı</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#94A3B8" }}>Adım {step + 1} / {STEPS.length}</span>
          <div style={{ width:80, height:4, background:"#E2E8F0", borderRadius:2, overflow:"hidden" }}>
            <div className="progress-bar" style={{ width:`${progress * 100}%`, height:"100%", background:"linear-gradient(90deg,#0EA5E9,#6366F1)", borderRadius:2 }} />
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1 }}>

        {/* ── Step sidebar ── */}
        <div style={{ width:220, background:"#fff", borderRight:"1px solid #E2E8F0", padding:"28px 16px", display:"flex", flexDirection:"column", gap:4 }}>
          {STEPS.map((s, i) => {
            const done    = i < step;
            const current = i === step;
            const future  = i > step;
            return (
              <div key={s.id} className="step-dot" onClick={() => done && setStep(i)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background: current ? "#F0F9FF" : "transparent", cursor: done ? "pointer" : "default" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, background: done ? "#0EA5E9" : current ? "#0EA5E9" : "#F1F5F9", color: done || current ? "#fff" : "#94A3B8", fontWeight:700, transition:"all 0.2s" }}>
                  {done ? "✓" : i + 1}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight: current ? 600 : 500, color: current ? "#0EA5E9" : done ? "#334155" : "#94A3B8" }}>{s.short}</div>
                </div>
                {current && <div style={{ marginLeft:"auto", width:4, height:20, background:"#0EA5E9", borderRadius:2 }} />}
              </div>
            );
          })}
        </div>

        {/* ── Main content ── */}
        <div style={{ flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"40px 24px", overflowY:"auto" }}>
          <div style={{ width:"100%", maxWidth:640 }}>

            {/* Step icon + title */}
            <div className="slide" key={step} style={{ marginBottom:32 }}>
              <div style={{ display:"inline-flex", width:56, height:56, background: step === STEPS.length-1 ? "linear-gradient(135deg,#0EA5E9,#6366F1)" : "#F0F9FF", borderRadius:16, alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:16 }}>
                {STEPS[step].icon}
              </div>
              <h1 style={{ fontSize:26, fontWeight:700, color:"#0F172A", marginBottom:6, letterSpacing:"-0.5px" }}>{STEPS[step].title}</h1>

              {/* ══ WELCOME ══ */}
              {step === 0 && (
                <div>
                  <p style={{ fontSize:15, color:"#64748B", lineHeight:1.7, marginBottom:28 }}>
                    Merhaba! Bu sihirbaz sizi <strong style={{ color:"#0F172A" }}>10 dakika</strong> içinde ilk bülten gönderiminize hazır hale getirecek. Müşterinizin yanındasınız — birlikte adım adım ilerleyelim.
                  </p>

                  {/* Plan seçimi */}
                  <div style={{ marginBottom:28 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#334155", marginBottom:14, textTransform:"uppercase", letterSpacing:"0.05em" }}>Paket Seçimi</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                      {PLANS.map(p => (
                        <div key={p.id} className="plan-card" onClick={() => setPlan(p.id)} style={{ padding:"18px 16px", background: plan===p.id ? "#F0F9FF" : "#F8FAFC", border:`2px solid ${plan===p.id ? p.color : "#E2E8F0"}`, borderRadius:14, position:"relative", transition:"all 0.18s" }}>
                          {p.popular && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:p.color, color:"#fff", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>En Popüler</div>}
                          <div style={{ fontSize:13, fontWeight:700, color:"#0F172A", marginBottom:4 }}>{p.name}</div>
                          <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:20, fontWeight:700, color:p.color, marginBottom:10 }}>{p.price}<span style={{ fontSize:11, color:"#94A3B8", fontWeight:400 }}>{p.period}</span></div>
                          <div style={{ fontSize:11, color:"#64748B", lineHeight:1.6 }}>
                            <div>👥 {p.abone} abone</div>
                            <div>📡 {p.kanallar}</div>
                            {p.ai && <div>✨ AI Asistan</div>}
                          </div>
                          {plan===p.id && <div style={{ position:"absolute", top:12, right:12, width:18, height:18, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#fff", fontSize:10 }}>✓</span></div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding:"14px 16px", background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, fontSize:13, color:"#92400E", lineHeight:1.6 }}>
                    💡 Seçtiğiniz paketle devam edilecek. İstediğiniz zaman değiştirebilirsiniz.
                  </div>
                </div>
              )}

              {/* ══ BUSINESS ══ */}
              {step === 1 && (
                <div>
                  <p style={{ fontSize:14, color:"#64748B", marginBottom:24, lineHeight:1.6 }}>Müşterinizin işletme bilgilerini girin. Bu bilgiler tenant hesabı oluşturmak için kullanılacak.</p>
                  <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, overflow:"hidden", marginBottom:16 }}>
                    {[
                      { key:"businessName", label:"İşletme Adı",  placeholder:"Örn: Acme E-ticaret A.Ş.", type:"text", required:true },
                      { key:"sector",       label:"Sektör",        placeholder:"E-ticaret, Perakende, SaaS...", type:"text", required:false },
                      { key:"email",        label:"Yetkili E-posta", placeholder:"admin@isletme.com", type:"email", required:true },
                      { key:"phone",        label:"İşletme Telefonu", placeholder:"+90 212 555 00 00", type:"tel", required:true },
                    ].map((f, i) => (
                      <div key={f.key} className="field-row" style={{ display:"grid", gridTemplateColumns:"160px 1fr", alignItems:"center" }}>
                        <label style={{ fontSize:13, fontWeight:500, color:"#475569", padding:"14px 16px", borderRight:"1px solid #F1F5F9", display:"flex", alignItems:"center", gap:4 }}>
                          {f.label}
                          {f.required && <span style={{ color:"#EF4444", fontSize:10 }}>*</span>}
                        </label>
                        <input type={f.type} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={{ border:"none", background:"transparent", padding:"14px 16px", fontSize:13, color:"#0F172A", width:"100%" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:"12px 16px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, fontSize:12, color:"#166534" }}>
                    🔒 Bu bilgiler KVKK kapsamında güvenli şekilde saklanır ve yalnızca sizin erişiminize açıktır.
                  </div>
                </div>
              )}

              {/* ══ WHATSAPP ══ */}
              {step === 2 && (
                <div>
                  <p style={{ fontSize:14, color:"#64748B", marginBottom:24, lineHeight:1.6 }}>
                    Meta Business Suite'ten alınan API bilgilerini girin. Müşterinizle birlikte <a href="https://business.facebook.com" target="_blank" rel="noreferrer" style={{ color:"#0EA5E9" }}>business.facebook.com</a> adresini açın.
                  </p>

                  {/* Step-by-step Meta guide */}
                  <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, padding:"18px", marginBottom:16 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:14 }}>📍 Nerede bulunur?</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {[
                        { step:"1", where:"Meta Business Suite", action:"Sol menüden \"Ayarlar\" → \"WhatsApp hesapları\"" },
                        { step:"2", where:"Hesabınıza tıklayın", action:"\"API Kurulumu\" sekmesine gidin" },
                        { step:"3", where:"API Kurulumu",        action:"Phone Number ID ve WABA ID'yi kopyalayın" },
                        { step:"4", where:"Sistem Kullanıcıları", action:"Kalıcı token oluşturun (Ayarlar → Sistem Kullanıcıları)" },
                      ].map(g => (
                        <div key={g.step} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                          <div style={{ width:22, height:22, borderRadius:"50%", background:"#EFF6FF", border:"1.5px solid #BFDBFE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#3B82F6", flexShrink:0 }}>{g.step}</div>
                          <div>
                            <span style={{ fontSize:12, fontWeight:600, color:"#0F172A" }}>{g.where}: </span>
                            <span style={{ fontSize:12, color:"#64748B" }}>{g.action}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, overflow:"hidden", marginBottom:16 }}>
                    {[
                      { key:"phoneNumberId", label:"Phone Number ID", placeholder:"123456789012345" },
                      { key:"wabaId",        label:"WABA ID",         placeholder:"987654321098765" },
                      { key:"accessToken",   label:"Access Token",    placeholder:"EAAxxxx...", secret:true },
                    ].map(f => (
                      <div key={f.key} className="field-row" style={{ display:"grid", gridTemplateColumns:"160px 1fr", alignItems:"center" }}>
                        <label style={{ fontSize:13, fontWeight:500, color:"#475569", padding:"14px 16px", borderRight:"1px solid #F1F5F9" }}>{f.label}</label>
                        <input type={f.secret ? "password" : "text"} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={{ border:"none", background:"transparent", padding:"14px 16px", fontSize:13, color:"#0F172A", width:"100%", fontFamily: f.secret ? "inherit" : "'Geist Mono',monospace" }} />
                      </div>
                    ))}
                  </div>

                  {!waOk ? (
                    <button className="btn" onClick={checkWA} disabled={!form.phoneNumberId || !form.wabaId || !form.accessToken || waChecking} style={{ width:"100%", padding:"13px", background: (!form.phoneNumberId||!form.wabaId||!form.accessToken) ? "#F1F5F9" : "#0EA5E9", border:"none", borderRadius:11, color: (!form.phoneNumberId||!form.wabaId||!form.accessToken) ? "#94A3B8" : "#fff", fontSize:14, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      {waChecking ? <><span className="spin">⟳</span> Bağlantı kontrol ediliyor...</> : "🔌 Bağlantıyı Doğrula"}
                    </button>
                  ) : (
                    <div className="check-pop" style={{ padding:"16px 18px", background:"#F0FDF4", border:"1px solid #86EFAC", borderRadius:11, display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:"#22C55E", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>✓</div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, color:"#166534" }}>WhatsApp API bağlantısı başarılı</div>
                        <div style={{ fontSize:12, color:"#4ADE80", marginTop:2 }}>+90 212 555 01 01 · GREEN kalite puanı · TIER_10K</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ EMAIL ══ */}
              {step === 3 && (
                <div>
                  <p style={{ fontSize:14, color:"#64748B", marginBottom:20, lineHeight:1.6 }}>E-posta gönderim ayarlarını yapılandırın. SMTP veya hazır sağlayıcı seçebilirsiniz.</p>

                  {/* Quick providers */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
                    {[
                      { name:"SendGrid",  logo:"📨", note:"Ücretsiz 100/gün" },
                      { name:"Postmark",  logo:"📮", note:"Yüksek teslim" },
                      { name:"Mailgun",   logo:"📬", note:"Geliştiriciler için" },
                      { name:"SMTP",      logo:"⚙️", note:"Manuel ayar" },
                    ].map((p, i) => (
                      <div key={p.name} className="plan-card" style={{ padding:"12px", background: i===0 ? "#F0F9FF" : "#F8FAFC", border:`1.5px solid ${i===0?"#0EA5E9":"#E2E8F0"}`, borderRadius:10, textAlign:"center", cursor:"pointer" }}>
                        <div style={{ fontSize:20, marginBottom:4 }}>{p.logo}</div>
                        <div style={{ fontSize:12, fontWeight:600, color:"#0F172A" }}>{p.name}</div>
                        <div style={{ fontSize:10, color:"#94A3B8", marginTop:2 }}>{p.note}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, overflow:"hidden", marginBottom:14 }}>
                    {[
                      { key:"smtpHost", label:"SMTP Host",    placeholder:"smtp.sendgrid.net" },
                      { key:"smtpPort", label:"Port",          placeholder:"587" },
                      { key:"smtpUser", label:"Kullanıcı Adı", placeholder:"apikey" },
                      { key:"smtpPass", label:"Şifre / API Key", placeholder:"SG.xxxx...", secret:true },
                    ].map(f => (
                      <div key={f.key} className="field-row" style={{ display:"grid", gridTemplateColumns:"160px 1fr", alignItems:"center" }}>
                        <label style={{ fontSize:13, fontWeight:500, color:"#475569", padding:"14px 16px", borderRight:"1px solid #F1F5F9" }}>{f.label}</label>
                        <input type={f.secret ? "password" : "text"} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={{ border:"none", background:"transparent", padding:"14px 16px", fontSize:13, color:"#0F172A", width:"100%", fontFamily:"'Geist Mono',monospace" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:"12px 16px", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:10, fontSize:12, color:"#1D4ED8", lineHeight:1.6 }}>
                    💡 SendGrid için API Key'i kullanıcı adı olarak <code style={{ background:"#DBEAFE", padding:"1px 5px", borderRadius:4 }}>apikey</code> yazıp şifre alanına API anahtarını girin.
                  </div>
                </div>
              )}

              {/* ══ TEMPLATE ══ */}
              {step === 4 && (
                <div>
                  <p style={{ fontSize:14, color:"#64748B", marginBottom:20, lineHeight:1.6 }}>İlk WhatsApp şablonunuzu oluşturun. Meta'ya onay için gönderilecek — genellikle 1-2 gün sürer.</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    {/* Form */}
                    <div>
                      <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, overflow:"hidden", marginBottom:12 }}>
                        <div className="field-row" style={{ display:"grid", gridTemplateColumns:"120px 1fr", alignItems:"center" }}>
                          <label style={{ fontSize:13, fontWeight:500, color:"#475569", padding:"14px 16px", borderRight:"1px solid #F1F5F9" }}>Şablon Adı</label>
                          <input value={form.templateName} onChange={e => set("templateName", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))} placeholder="sablon_adi" style={{ border:"none", background:"transparent", padding:"14px 16px", fontSize:13, color:"#0F172A", width:"100%", fontFamily:"'Geist Mono',monospace" }} />
                        </div>
                      </div>
                      <div style={{ marginBottom:12 }}>
                        <label style={{ fontSize:12, fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:8 }}>Mesaj İçeriği</label>
                        <textarea value={form.templateBody} onChange={e => set("templateBody", e.target.value)} rows={7} style={{ width:"100%", background:"#fff", border:"1px solid #E2E8F0", borderRadius:10, padding:"14px", fontSize:13, color:"#0F172A", lineHeight:1.7, transition:"border-color 0.15s, box-shadow 0.15s" }} />
                        <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                          {["{{1}}","{{2}}","*kalın*","_italik_"].map(t => (
                            <button key={t} className="btn" onClick={() => set("templateBody", form.templateBody + t)} style={{ background:"#F0F9FF", border:"1px solid #BAE6FD", color:"#0369A1", padding:"3px 10px", borderRadius:6, fontSize:11, fontFamily:"'Geist Mono',monospace" }}>{t}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* WhatsApp preview */}
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8, textAlign:"center" }}>Önizleme</div>
                      <div style={{ background:"#1a1f2e", borderRadius:20, padding:"8px", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
                        <div style={{ background:"#0b141a", borderRadius:14, overflow:"hidden" }}>
                          <div style={{ background:"#128C7E", padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🏢</div>
                            <div>
                              <div style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{form.businessName || "İşletmeniz"}</div>
                              <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)" }}>Doğrulanmış İşletme ✓</div>
                            </div>
                          </div>
                          <div style={{ background:"#0b141a", padding:"12px 10px" }}>
                            <div style={{ background:"#1f2c34", borderRadius:"4px 10px 10px 10px", padding:"10px 12px", maxWidth:"88%" }}>
                              <div style={{ fontSize:11, color:"#E9EDEF", lineHeight:1.6, whiteSpace:"pre-wrap" }}>
                                {form.templateBody
                                  .replace(/\{\{1\}\}/g, "[Ad Soyad]")
                                  .replace(/\{\{2\}\}/g, "[İçerik]")
                                  .replace(/\*(.+?)\*/g, "$1")
                                  .replace(/_(.+?)_/g, "$1")}
                              </div>
                              <div style={{ textAlign:"right", fontSize:9, color:"#8696a0", marginTop:4 }}>12:00 ✓✓</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop:14, padding:"12px 16px", background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, fontSize:12, color:"#92400E" }}>
                    ⏱ Meta onayı <strong>1-3 iş günü</strong> sürebilir. Onay sonrası ilk gönderiminizi yapabilirsiniz. Beklerken abonelerinizi yükleyebilirsiniz.
                  </div>
                </div>
              )}

              {/* ══ TEST ══ */}
              {step === 5 && (
                <div>
                  <p style={{ fontSize:14, color:"#64748B", marginBottom:24, lineHeight:1.6 }}>Her şey hazır! Müşterinizin telefon numarasına test mesajı göndererek entegrasyonu doğrulayın.</p>

                  {/* Checklist */}
                  <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, padding:"18px", marginBottom:20 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:14 }}>Kurulum Özeti</div>
                    {[
                      { label:"İşletme hesabı",        ok:!!form.businessName, val:form.businessName },
                      { label:"WhatsApp API",           ok:waOk,               val:waOk ? "Bağlı ✓" : "Bağlı değil" },
                      { label:"E-posta SMTP",           ok:!!form.smtpHost,    val:form.smtpHost || "Yapılandırılmadı" },
                      { label:"WhatsApp şablonu",       ok:!!form.templateName,val:form.templateName },
                      { label:"Seçilen paket",          ok:true,               val:PLANS.find(p=>p.id===plan)?.name },
                    ].map((item, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom: i<4 ? "1px solid #F8FAFC" : "none" }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background: item.ok ? "#F0FDF4" : "#FEF2F2", border:`1.5px solid ${item.ok?"#86EFAC":"#FCA5A5"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, flexShrink:0 }}>
                          {item.ok ? <span style={{ color:"#22C55E" }}>✓</span> : <span style={{ color:"#EF4444" }}>!</span>}
                        </div>
                        <span style={{ fontSize:13, color:"#475569", flex:1 }}>{item.label}</span>
                        <span style={{ fontSize:12, color: item.ok ? "#22C55E" : "#EF4444", fontFamily:"'Geist Mono',monospace" }}>{item.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Test send */}
                  {!testDone ? (
                    <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, padding:"20px" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#334155", marginBottom:12 }}>Test Mesajı Gönder</div>
                      <div style={{ display:"flex", gap:10 }}>
                        <input value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="+90 5XX XXX XX XX" style={{ flex:1, background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:9, padding:"11px 14px", fontSize:13, color:"#0F172A", transition:"border-color 0.15s, box-shadow 0.15s" }} />
                        <button className="btn" onClick={runTest} disabled={!testPhone || testing} style={{ background: !testPhone ? "#F1F5F9" : "#25D366", border:"none", color: !testPhone ? "#94A3B8" : "#fff", padding:"11px 20px", borderRadius:9, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:7, whiteSpace:"nowrap" }}>
                          {testing ? <><span className="spin">⟳</span> Gönderiliyor...</> : "💬 WhatsApp'a Gönder"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="check-pop" style={{ padding:"20px", background:"#F0FDF4", border:"1px solid #86EFAC", borderRadius:14, display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:44, height:44, borderRadius:"50%", background:"#22C55E", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>✓</div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700, color:"#166534" }}>Test mesajı başarıyla gönderildi!</div>
                        <div style={{ fontSize:13, color:"#4ADE80", marginTop:3 }}>{testPhone} numarasına WhatsApp mesajı iletildi.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ DONE ══ */}
              {step === 6 && (
                <div className="slide">
                  <p style={{ fontSize:15, color:"#64748B", lineHeight:1.7, marginBottom:28 }}>
                    <strong style={{ color:"#0F172A" }}>{form.businessName || "Müşteriniz"}</strong> artık bulletinAI'ya bağlı! Dashboard'a geçerek ilk aboneleri ekleyebilir ve ilk kampanyanızı oluşturabilirsiniz.
                  </p>

                  {/* Summary card */}
                  <div style={{ background:"linear-gradient(135deg,#EFF6FF,#F5F3FF)", border:"1px solid #BFDBFE", borderRadius:16, padding:"24px", marginBottom:24 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                      {[
                        { icon:"🏢", label:"İşletme", val:form.businessName || "—" },
                        { icon:"📦", label:"Paket", val:PLANS.find(p=>p.id===plan)?.name },
                        { icon:"💬", label:"WhatsApp", val:"Bağlı" },
                        { icon:"📧", label:"E-posta", val:form.smtpHost ? "Yapılandırıldı" : "Atlandı" },
                      ].map((item, i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ fontSize:20 }}>{item.icon}</span>
                          <div>
                            <div style={{ fontSize:11, color:"#94A3B8" }}>{item.label}</div>
                            <div style={{ fontSize:13, fontWeight:600, color:"#1E40AF" }}>{item.val}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next steps */}
                  <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, padding:"18px", marginBottom:20 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:14 }}>Sonraki Adımlar</div>
                    {[
                      { num:"1", text:"Abone listesini CSV olarak yükleyin", icon:"👥" },
                      { num:"2", text:"WhatsApp şablon onayını bekleyin (1-2 gün)", icon:"⏱" },
                      { num:"3", text:"İlk kampanyanızı oluşturun ve gönderin", icon:"🚀" },
                    ].map(item => (
                      <div key={item.num} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 0", borderBottom: item.num<"3" ? "1px solid #F8FAFC" : "none" }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"#EFF6FF", border:"1.5px solid #BFDBFE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#3B82F6", flexShrink:0 }}>{item.num}</div>
                        <span style={{ fontSize:14 }}>{item.icon}</span>
                        <span style={{ fontSize:13, color:"#334155" }}>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <button className="btn" style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#0EA5E9,#6366F1)", border:"none", borderRadius:12, color:"#fff", fontSize:15, fontWeight:700, letterSpacing:"-0.2px" }}>
                    Dashboard'a Git →
                  </button>
                </div>
              )}
            </div>

            {/* ── Nav buttons ── */}
            {step < STEPS.length - 1 && (
              <div style={{ display:"flex", gap:10, justifyContent:"space-between", paddingTop:8 }}>
                {step > 0 ? (
                  <button className="btn" onClick={() => setStep(s => s - 1)} style={{ background:"#fff", border:"1px solid #E2E8F0", color:"#64748B", padding:"12px 22px", borderRadius:10, fontSize:14, fontWeight:500 }}>← Geri</button>
                ) : <span />}

                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  {step > 0 && step < STEPS.length - 2 && (
                    <button className="btn" onClick={() => setStep(s => s + 1)} style={{ background:"transparent", border:"none", color:"#94A3B8", padding:"12px 16px", borderRadius:10, fontSize:13, textDecoration:"underline" }}>
                      Atla
                    </button>
                  )}
                  <button className="btn" onClick={() => setStep(s => s + 1)} disabled={!canProceed()} style={{ background: !canProceed() ? "#F1F5F9" : "linear-gradient(135deg,#0EA5E9,#6366F1)", border:"none", color: !canProceed() ? "#94A3B8" : "#fff", padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                    {step === STEPS.length - 2 ? "Tamamla ✓" : "Devam Et →"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
