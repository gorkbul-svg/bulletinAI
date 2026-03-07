"use client";
import { useState } from "react";

const steps = ["İşletme Bilgileri", "API Kimlik Bilgileri", "Webhook", "Test & Doğrula"];

const fieldInfo = {
  phoneNumberId: {
    label: "Phone Number ID",
    placeholder: "123456789012345",
    hint: "Meta Business Suite → WhatsApp → API Kurulumu → Phone Number ID",
    sensitive: false,
    icon: "📱",
  },
  wabaId: {
    label: "WhatsApp Business Account ID (WABA ID)",
    placeholder: "987654321098765",
    hint: "Meta Business Suite → İşletme Ayarları → WhatsApp Hesapları → Hesap ID",
    sensitive: false,
    icon: "🏢",
  },
  accessToken: {
    label: "Permanent Access Token",
    placeholder: "EAAxxxxxxxxxxxxxxxx...",
    hint: "System User olarak üretilmiş kalıcı token. Sayfa token'ı değil!",
    sensitive: true,
    icon: "🔑",
  },
  appId: {
    label: "App ID",
    placeholder: "1234567890",
    hint: "developers.facebook.com → Uygulamanız → Uygulama Kimliği",
    sensitive: false,
    icon: "🧩",
  },
  appSecret: {
    label: "App Secret",
    placeholder: "abcdef1234567890abcdef1234567890",
    hint: "developers.facebook.com → Uygulamanız → Ayarlar → Temel → Uygulama Gizli Anahtarı",
    sensitive: true,
    icon: "🔒",
  },
  webhookVerifyToken: {
    label: "Webhook Verify Token",
    placeholder: "bulletinai_verify_xxxx",
    hint: "Kendinizin belirlediği rastgele bir string. Webhook doğrulamasında kullanılır.",
    sensitive: false,
    icon: "🛡️",
  },
};

const mockTenants = [
  { id: 1, name: "Trendyol Entegrasyon A.Ş.", status: "active", phone: "+90 212 555 01 01", configured: true },
  { id: 2, name: "E-Bazaar Ltd.", status: "pending", phone: "—", configured: false },
];

export default function WhatsAppConfig() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showTenantList, setShowTenantList] = useState(true);
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied] = useState("");
  const [testStatus, setTestStatus] = useState(null); // null | "testing" | "success" | "fail"
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    appId: "",
    appSecret: "",
    webhookVerifyToken: "",
  });

  const webhookUrl = `https://api.bulletinai.com/webhook/${form.businessName?.toLowerCase().replace(/\s+/g, "-") || "tenant-slug"}`;

  const handleReveal = (field) => setRevealed(r => ({ ...r, [field]: !r[field] }));

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleTest = () => {
    setTestStatus("testing");
    setTimeout(() => setTestStatus("success"), 2400);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const selectTenant = (t) => {
    setSelectedTenant(t);
    setShowTenantList(false);
    setActiveStep(0);
    if (t.configured) {
      setForm(f => ({ ...f, businessName: t.name, businessPhone: t.phone, phoneNumberId: "112233445566778", wabaId: "998877665544332", accessToken: "EAAxxxxxxxxxxxMOCKTOKEN", appId: "9988776655", appSecret: "mock_secret_key_xx99", webhookVerifyToken: "bulletinai_verify_abc123" }));
    } else {
      setForm(f => ({ ...f, businessName: t.name, businessPhone: "", phoneNumberId: "", wabaId: "", accessToken: "", appId: "", appSecret: "", webhookVerifyToken: "" }));
    }
  };

  const stepComplete = (s) => {
    if (s === 0) return form.businessName && form.businessEmail && form.businessPhone;
    if (s === 1) return form.phoneNumberId && form.wabaId && form.accessToken && form.appId && form.appSecret;
    if (s === 2) return true;
    return false;
  };

  return (
    <div style={{ fontFamily: "'Figtree', sans-serif", background: "#0C0C14", minHeight: "100vh", color: "#EAEAF5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { outline: none; }
        input:focus { border-color: rgba(0,229,255,0.5) !important; box-shadow: 0 0 0 3px rgba(0,229,255,0.08) !important; }
        .tenant-card { transition: all 0.18s ease; cursor: pointer; }
        .tenant-card:hover { background: rgba(0,229,255,0.06) !important; border-color: rgba(0,229,255,0.25) !important; }
        .step-btn { transition: all 0.15s ease; cursor: pointer; }
        .action-btn { transition: all 0.18s ease; cursor: pointer; }
        .action-btn:hover { opacity: 0.85; }
        .field-row { transition: background 0.15s; }
        .field-row:hover { background: rgba(255,255,255,0.01); }
        .copy-btn { transition: all 0.15s; cursor: pointer; }
        .copy-btn:hover { opacity: 0.7; }
        .slide-in { animation: slideIn 0.3s ease forwards; }
        @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.25s ease; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(12,12,20,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #00E5FF, #00FFB2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📡</div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 16, letterSpacing: "-0.5px" }}>bulletin<span style={{ color: "#00E5FF" }}>AI</span></span>
          <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>Tenant Yönetimi</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#555" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FFB2", display: "inline-block" }} />
          Super Admin
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 57px)" }}>

        {/* Tenant Sidebar */}
        <div style={{ width: 260, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "#444", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Tenantlar</span>
            <button className="action-btn" style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00E5FF", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Figtree', sans-serif" }}>+ Yeni</button>
          </div>

          {mockTenants.map(t => (
            <div key={t.id} className="tenant-card" onClick={() => selectTenant(t)} style={{ background: selectedTenant?.id === t.id ? "rgba(0,229,255,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedTenant?.id === t.id ? "rgba(0,229,255,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: selectedTenant?.id === t.id ? "#00E5FF" : "#EAEAF5", lineHeight: 1.3 }}>{t.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.configured ? "#00FFB2" : "#FF6B35", display: "inline-block" }} />
                <span style={{ fontSize: 11, color: t.configured ? "#00FFB2" : "#FF6B35" }}>{t.configured ? "Yapılandırıldı" : "Bekliyor"}</span>
              </div>
            </div>
          ))}

          <div style={{ marginTop: "auto", padding: "14px", background: "rgba(255,107,53,0.07)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#FF6B35", fontWeight: 600, marginBottom: 6 }}>⚠️ Dikkat</div>
            <div style={{ fontSize: 11, color: "#664", lineHeight: 1.5, color: "#886655" }}>API bilgileri şifreli saklanır. Müşteri onayı olmadan erişilmez.</div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>

          {!selectedTenant ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, opacity: 0.4 }}>
              <div style={{ fontSize: 48 }}>🏢</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Sol taraftan bir tenant seçin</div>
              <div style={{ fontSize: 13, color: "#555" }}>veya yeni tenant oluşturun</div>
            </div>
          ) : (
            <div className="slide-in">
              {/* Tenant Header */}
              <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Yapılandırma</div>
                  <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, color: "#EAEAF5" }}>{selectedTenant.name}</h1>
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <span style={{ background: selectedTenant.configured ? "rgba(0,255,178,0.1)" : "rgba(255,107,53,0.1)", color: selectedTenant.configured ? "#00FFB2" : "#FF6B35", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                      {selectedTenant.configured ? "✓ WhatsApp Bağlı" : "○ Yapılandırılmadı"}
                    </span>
                    <span style={{ background: "rgba(255,255,255,0.05)", color: "#555", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>
                      Tenant #{selectedTenant.id}
                    </span>
                  </div>
                </div>
                {saved && (
                  <div className="fade-in" style={{ background: "rgba(0,255,178,0.12)", border: "1px solid rgba(0,255,178,0.3)", color: "#00FFB2", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
                    ✓ Kaydedildi
                  </div>
                )}
              </div>

              {/* Step Progress */}
              <div style={{ display: "flex", gap: 0, marginBottom: 32, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4 }}>
                {steps.map((s, i) => (
                  <button key={i} className="step-btn" onClick={() => setActiveStep(i)} style={{ flex: 1, padding: "10px 8px", borderRadius: 9, border: "none", background: activeStep === i ? "rgba(0,229,255,0.12)" : "transparent", color: activeStep === i ? "#00E5FF" : stepComplete(i) ? "#00FFB2" : "#444", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Figtree', sans-serif", cursor: "pointer", transition: "all 0.15s" }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: activeStep === i ? "rgba(0,229,255,0.2)" : stepComplete(i) ? "rgba(0,255,178,0.15)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: activeStep === i ? "#00E5FF" : stepComplete(i) ? "#00FFB2" : "#444" }}>
                      {stepComplete(i) && activeStep !== i ? "✓" : i + 1}
                    </span>
                    {s}
                  </button>
                ))}
              </div>

              {/* Step 0: Business Info */}
              {activeStep === 0 && (
                <div className="slide-in">
                  <SectionTitle icon="🏢" title="İşletme Bilgileri" sub="Tenant'ın genel bilgilerini girin" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                    <FormField label="İşletme Adı" value={form.businessName} onChange={v => setForm(f => ({ ...f, businessName: v }))} placeholder="Örn: Trendyol Entegrasyon A.Ş." />
                    <FormField label="Yetkili E-posta" value={form.businessEmail} onChange={v => setForm(f => ({ ...f, businessEmail: v }))} placeholder="admin@sirket.com" type="email" />
                    <FormField label="İşletme Telefonu" value={form.businessPhone} onChange={v => setForm(f => ({ ...f, businessPhone: v }))} placeholder="+90 212 555 00 00" />
                    <FormField label="Sektör" value={form.sector || ""} onChange={v => setForm(f => ({ ...f, sector: v }))} placeholder="E-ticaret, Perakende..." />
                  </div>

                  <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: "#00E5FF", fontWeight: 600, marginBottom: 8 }}>📋 Müşteri Yanında Yapılacaklar</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {["Meta Business Suite'e giriş yapın (business.facebook.com)", "İşletme doğrulamasının tamamlandığını kontrol edin", "WhatsApp Business hesabının \"Verified\" durumda olduğunu doğrulayın"].map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, fontSize: 12, color: "#666" }}>
                          <span style={{ color: "#00E5FF", minWidth: 16 }}>{i + 1}.</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <StepNav onNext={() => setActiveStep(1)} nextDisabled={!stepComplete(0)} />
                </div>
              )}

              {/* Step 1: API Credentials */}
              {activeStep === 1 && (
                <div className="slide-in">
                  <SectionTitle icon="🔑" title="API Kimlik Bilgileri" sub="Meta Developer Console'dan alınan bilgiler" />

                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                    {["phoneNumberId", "wabaId", "accessToken", "appId", "appSecret"].map(key => {
                      const f = fieldInfo[key];
                      const isSensitive = f.sensitive;
                      const isRevealed = revealed[key];
                      return (
                        <div key={key} className="field-row" style={{ padding: "16px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "#AAAACC", display: "flex", alignItems: "center", gap: 6 }}>
                              {f.icon} {f.label}
                              {isSensitive && <span style={{ fontSize: 10, background: "rgba(255,107,53,0.1)", color: "#FF6B35", padding: "1px 6px", borderRadius: 6 }}>GİZLİ</span>}
                            </label>
                            {form[key] && (
                              <button className="copy-btn" onClick={() => handleCopy(form[key], key)} style={{ background: "none", border: "none", color: copied === key ? "#00FFB2" : "#444", fontSize: 11, cursor: "pointer", fontFamily: "'Figtree', sans-serif" }}>
                                {copied === key ? "✓ Kopyalandı" : "📋 Kopyala"}
                              </button>
                            )}
                          </div>
                          <div style={{ position: "relative" }}>
                            <input
                              type={isSensitive && !isRevealed ? "password" : "text"}
                              value={form[key]}
                              onChange={e => setForm(f2 => ({ ...f2, [key]: e.target.value }))}
                              placeholder={f.placeholder}
                              style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 40px 10px 12px", color: "#EAEAF5", fontSize: 13, fontFamily: "'Space Mono', monospace", transition: "border-color 0.15s, box-shadow 0.15s" }}
                            />
                            {isSensitive && (
                              <button onClick={() => handleReveal(key)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#444" }}>
                                {isRevealed ? "🙈" : "👁️"}
                              </button>
                            )}
                          </div>
                          <div style={{ marginTop: 6, fontSize: 11, color: "#444", display: "flex", alignItems: "flex-start", gap: 6 }}>
                            <span style={{ color: "#00E5FF", minWidth: 12 }}>→</span>
                            {f.hint}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(255,217,61,0.05)", border: "1px solid rgba(255,217,61,0.15)", borderRadius: 12, fontSize: 12, color: "#AA9933", lineHeight: 1.6 }}>
                    ⚠️ <strong>System User Token kullanın.</strong> Sayfa admini kişisel token'ı kullanmayın — kişi hesaptan ayrılırsa entegrasyon kopar. Meta Business Suite → Sistem Kullanıcıları → Yeni Sistem Kullanıcısı oluşturun ve token üretin.
                  </div>

                  <StepNav onBack={() => setActiveStep(0)} onNext={() => setActiveStep(2)} nextDisabled={!stepComplete(1)} />
                </div>
              )}

              {/* Step 2: Webhook */}
              {activeStep === 2 && (
                <div className="slide-in">
                  <SectionTitle icon="🔗" title="Webhook Yapılandırması" sub="Meta'nın bildirimleri göndereceği endpoint" />

                  <div style={{ marginTop: 20, padding: "20px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 14 }}>
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Webhook URL (Meta'ya girilecek)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <code style={{ flex: 1, fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#00E5FF", background: "rgba(0,229,255,0.06)", padding: "10px 14px", borderRadius: 8, wordBreak: "break-all" }}>
                        {webhookUrl}
                      </code>
                      <button className="copy-btn" onClick={() => handleCopy(webhookUrl, "webhook")} style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00E5FF", padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Figtree', sans-serif", whiteSpace: "nowrap" }}>
                        {copied === "webhook" ? "✓ Kopyalandı" : "Kopyala"}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }} className="field-row">
                    <div style={{ padding: "16px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#AAAACC", display: "block", marginBottom: 8 }}>🛡️ {fieldInfo.webhookVerifyToken.label}</label>
                      <input
                        value={form.webhookVerifyToken}
                        onChange={e => setForm(f => ({ ...f, webhookVerifyToken: e.target.value }))}
                        placeholder={fieldInfo.webhookVerifyToken.placeholder}
                        style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 12px", color: "#EAEAF5", fontSize: 13, fontFamily: "'Space Mono', monospace" }}
                      />
                      <div style={{ marginTop: 6, fontSize: 11, color: "#444" }}>→ {fieldInfo.webhookVerifyToken.hint}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, padding: "16px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: "#AAAACC", fontWeight: 600, marginBottom: 12 }}>📋 Meta'da Webhook Kurulum Adımları</div>
                    {[
                      ["developers.facebook.com", "Uygulamanıza gidin"],
                      ["Sol menü", "WhatsApp → Yapılandırma"],
                      ["Webhook bölümü", "\"Düzenle\" butonuna tıklayın"],
                      ["Geri Arama URL'si", "Yukarıdaki URL'yi yapıştırın"],
                      ["Doğrulama Token'ı", "Yukarıdaki token'ı yapıştırın"],
                      ["Abonelik Alanları", "messages, message_deliveries, message_reads seçin"],
                    ].map(([loc, action], i) => (
                      <div key={i} style={{ display: "flex", gap: 14, padding: "8px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <span style={{ fontSize: 11, color: "#00E5FF", fontFamily: "'Space Mono', monospace", minWidth: 140 }}>{loc}</span>
                        <span style={{ fontSize: 12, color: "#666" }}>{action}</span>
                      </div>
                    ))}
                  </div>

                  <StepNav onBack={() => setActiveStep(1)} onNext={() => setActiveStep(3)} />
                </div>
              )}

              {/* Step 3: Test */}
              {activeStep === 3 && (
                <div className="slide-in">
                  <SectionTitle icon="🧪" title="Test & Doğrulama" sub="Bağlantıyı test etmeden kaydetmeyin" />

                  <div style={{ marginTop: 24 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                      {[
                        { label: "Phone Number ID", value: form.phoneNumberId, ok: !!form.phoneNumberId },
                        { label: "WABA ID", value: form.wabaId, ok: !!form.wabaId },
                        { label: "Access Token", value: form.accessToken ? "••••••••••••••••" : "—", ok: !!form.accessToken },
                        { label: "Webhook Token", value: form.webhookVerifyToken || "—", ok: !!form.webhookVerifyToken },
                      ].map((item, i) => (
                        <div key={i} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: `1px solid ${item.ok ? "rgba(0,255,178,0.2)" : "rgba(255,107,53,0.2)"}`, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{item.label}</div>
                            <div style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: "#AAAACC" }}>{item.value ? (item.value.length > 20 ? item.value.slice(0, 20) + "…" : item.value) : "—"}</div>
                          </div>
                          <span style={{ fontSize: 16 }}>{item.ok ? "✅" : "❌"}</span>
                        </div>
                      ))}
                    </div>

                    <button className="action-btn" onClick={handleTest} disabled={testStatus === "testing"} style={{ width: "100%", padding: "16px", background: testStatus === "success" ? "rgba(0,255,178,0.12)" : "rgba(0,229,255,0.1)", border: `1px solid ${testStatus === "success" ? "rgba(0,255,178,0.3)" : "rgba(0,229,255,0.25)"}`, borderRadius: 12, color: testStatus === "success" ? "#00FFB2" : "#00E5FF", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Figtree', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      {testStatus === "testing" ? (
                        <><span className="spin" style={{ display: "inline-block" }}>⟳</span> API bağlantısı test ediliyor...</>
                      ) : testStatus === "success" ? (
                        <>✅ Bağlantı başarılı — WhatsApp API yanıt verdi</>
                      ) : testStatus === "fail" ? (
                        <>❌ Bağlantı başarısız — Token veya ID hatalı</>
                      ) : (
                        <>🔌 Bağlantıyı Test Et</>
                      )}
                    </button>

                    {testStatus === "success" && (
                      <div className="fade-in" style={{ marginTop: 14, padding: "16px 18px", background: "rgba(0,255,178,0.06)", border: "1px solid rgba(0,255,178,0.2)", borderRadius: 12 }}>
                        <div style={{ fontSize: 12, color: "#00FFB2", fontWeight: 600, marginBottom: 8 }}>✓ Test Başarılı — Dönen Bilgiler</div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#446655", lineHeight: 1.8 }}>
                          phone_number: +90 212 555 01 01<br />
                          display_name: {form.businessName || "Test İşletme"}<br />
                          quality_rating: GREEN<br />
                          messaging_limit: TIER_10K
                        </div>
                      </div>
                    )}

                    <button className="action-btn" onClick={handleSave} disabled={testStatus !== "success"} style={{ marginTop: 16, width: "100%", padding: "16px", background: testStatus === "success" ? "linear-gradient(135deg, #00E5FF, #00FFB2)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 12, color: testStatus === "success" ? "#0C0C14" : "#333", fontSize: 15, fontWeight: 700, cursor: testStatus === "success" ? "pointer" : "not-allowed", fontFamily: "'Figtree', sans-serif" }}>
                      💾 Yapılandırmayı Kaydet
                    </button>
                  </div>

                  <StepNav onBack={() => setActiveStep(2)} showNext={false} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, sub }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, fontWeight: 700 }}>{title}</h2>
      </div>
      <p style={{ fontSize: 13, color: "#555", marginTop: 6, marginLeft: 30 }}>{sub}</p>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 8 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", color: "#EAEAF5", fontSize: 13, fontFamily: "'Figtree', sans-serif", transition: "border-color 0.15s, box-shadow 0.15s" }}
      />
    </div>
  );
}

function StepNav({ onBack, onNext, nextDisabled, showNext = true }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 28, justifyContent: "flex-end" }}>
      {onBack && (
        <button className="action-btn" onClick={onBack} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", padding: "11px 20px", borderRadius: 10, fontSize: 13, cursor: "pointer", fontFamily: "'Figtree', sans-serif" }}>
          ← Geri
        </button>
      )}
      {showNext && onNext && (
        <button className="action-btn" onClick={onNext} disabled={nextDisabled} style={{ background: nextDisabled ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #00E5FF, #00FFB2)", border: "none", color: nextDisabled ? "#333" : "#0C0C14", padding: "11px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: nextDisabled ? "not-allowed" : "pointer", fontFamily: "'Figtree', sans-serif" }}>
          İleri →
        </button>
      )}
    </div>
  );
}
