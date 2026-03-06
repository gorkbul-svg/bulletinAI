# bulletinAI — Backend

Next.js 14 App Router + Supabase (Postgres + Auth) + WhatsApp Cloud API + SendGrid

---

## Proje Yapısı

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts   POST — kullanıcı + tenant oluştur
│       │   └── login/route.ts      POST — JWT al
│       ├── whatsapp/
│       │   ├── credentials/route.ts  GET/POST — WA API kimlik bilgileri
│       │   └── templates/route.ts    GET/POST — şablon yönetimi
│       ├── campaigns/
│       │   └── route.ts            GET/POST — kampanya oluştur + gönder
│       └── webhooks/
│           └── meta/[slug]/route.ts  GET/POST — Meta webhook handler
├── lib/
│   ├── supabase.ts    Supabase client (admin + per-request)
│   └── crypto.ts      AES-256-GCM şifreleme
├── middleware/
│   └── auth.ts        JWT doğrulama + tenant context
└── types/
    └── database.ts    Supabase generated types

supabase/
└── migrations/
    └── 001_initial_schema.sql   Tüm tablolar + RLS politikaları
```

---

## Kurulum

### 1. Bağımlılıklar

```bash
npx create-next-app@latest bulletinai --typescript --app
cd bulletinai
npm install @supabase/supabase-js zod
```

### 2. Supabase

```bash
# Supabase CLI kur
npm install -g supabase

# Projeyi başlat
supabase init
supabase login

# Migrations uygula
supabase db push

# Ya da local dev için:
supabase start
supabase db reset
```

### 3. Environment

```bash
cp .env.example .env.local
# .env.local dosyasını düzenle
```

### 4. Geliştirme sunucusu

```bash
npm run dev
# → http://localhost:3000
```

---

## API Referansı

### Auth

```
POST /api/auth/register
Body: { email, password, businessName, phone?, sector?, plan? }
→ 201: { user, tenant }

POST /api/auth/login
Body: { email, password }
→ 200: { access_token, refresh_token, user, tenants[] }

GET /api/auth/me
Header: Authorization: Bearer <token>
→ 200: { userId, tenantId, role, tenants }
```

### WhatsApp

```
GET  /api/whatsapp/credentials
POST /api/whatsapp/credentials
Body: { phoneNumberId, wabaId, accessToken, appId? }
→ Credentials AES-256 ile şifrelenerek saklanır

POST /api/whatsapp/credentials/verify
→ Meta Graph API'ye bağlanarak doğrulama yapar

GET  /api/whatsapp/templates
POST /api/whatsapp/templates
Body: { name, category, language, header?, body, footer?, buttons[] }
→ Meta'ya gönderir, PENDING olarak kaydeder
```

### Kampanyalar

```
GET  /api/campaigns
POST /api/campaigns
Body: {
  name, channels[], segmentId?, waTemplateId?,
  waVars?, emailSubject?, emailBody?,
  scheduleType: "now"|"scheduled"|"ai",
  scheduledAt?
}
→ scheduleType="now" ise anında send_queue'ya ekler ve gönderimi başlatır
→ scheduleType="ai" ise Salı 10:15'e planlar (veriden hesaplanır)
```

### Webhooks

```
GET  /api/webhooks/meta/{tenant-slug}?hub.mode=subscribe&hub.challenge=...&hub.verify_token=...
POST /api/webhooks/meta/{tenant-slug}
→ Meta webhook URL: https://app.bulletinai.com/api/webhooks/meta/{tenant-slug}
→ Şablon onay/ret durumlarını ve delivery receipt'leri işler
```

---

## Mimari Notlar

### Güvenlik
- WhatsApp `access_token` asla plaintext saklanmaz — AES-256-GCM ile şifrelenir
- Her API route `withAuth()` middleware'inden geçer
- Supabase RLS tüm tablolarda aktif — kullanıcılar sadece kendi tenant verilerine erişir
- Webhook verify token her tenant için rastgele üretilir

### Gönderim Motoru
- `send_queue` tablosu iş kuyruğu olarak kullanılır
- `processQueue()` fonksiyonu MVP için in-process çalışır
- Üretimde: **BullMQ + Redis** veya **pg-boss** ile ayrı worker'a taşıyın
- Meta rate limit: ~80 mesaj/sn (TIER_10K) → 650ms batch delay

### Ölçeklenme
- Supabase ücretsiz katman: 500MB DB, 2GB bant genişliği → ~50K abone
- Büyüdükçe: Supabase Pro ($25/ay) → 8GB DB, sınırsız API
- Dedicated worker için: Railway ($5/ay) veya Fly.io

---

## Sonraki Adımlar (Sprint 2)

- [ ] Stripe ödeme entegrasyonu (`/api/billing`)
- [ ] Abone import API (CSV parse + bulk insert)
- [ ] Segment rule engine (SQL'e dönüştür)
- [ ] SendGrid webhook → open/click event'leri
- [ ] İYS (Türkiye) entegrasyonu
- [ ] Rate limiting (Upstash Redis)
- [ ] E2E testler (Playwright)
