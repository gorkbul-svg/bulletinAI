-- ============================================================
-- bulletinAI — Initial Schema
-- Run: supabase db push
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── TENANTS ─────────────────────────────────────────────────
create table public.tenants (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text unique not null,           -- used in webhook URLs
  email         text not null,
  phone         text,
  sector        text,
  plan          text not null default 'starter' check (plan in ('starter','growth','scale','enterprise')),
  plan_status   text not null default 'active'  check (plan_status in ('active','cancelled','past_due')),
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── TENANT MEMBERS (user ↔ tenant many-to-many) ─────────────
create table public.tenant_members (
  id         uuid primary key default uuid_generate_v4(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  unique(tenant_id, user_id)
);

-- ── WHATSAPP CREDENTIALS (encrypted at rest via pgcrypto) ───
create table public.whatsapp_credentials (
  id               uuid primary key default uuid_generate_v4(),
  tenant_id        uuid not null unique references public.tenants(id) on delete cascade,
  phone_number_id  text not null,
  waba_id          text not null,
  access_token_enc text not null,   -- AES-256 encrypted, never plaintext
  app_id           text,
  webhook_verify_token text not null default encode(gen_random_bytes(32), 'hex'),
  display_name     text,
  quality_rating   text,
  verified_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── SUBSCRIBERS ──────────────────────────────────────────────
create table public.subscribers (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  name          text not null,
  phone         text,
  email         text,
  tags          text[] not null default '{}',
  status        text not null default 'active' check (status in ('active','unsubscribed','bounced','pending')),
  channels      text[] not null default '{}',  -- ['whatsapp','email']
  consent_type  text check (consent_type in ('explicit','implicit','withdrawn')),
  consent_date  timestamptz,
  open_rate     numeric(5,2) default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(tenant_id, email),
  unique(tenant_id, phone)
);

create index idx_subscribers_tenant   on public.subscribers(tenant_id);
create index idx_subscribers_status   on public.subscribers(tenant_id, status);
create index idx_subscribers_tags     on public.subscribers using gin(tags);

-- ── SEGMENTS ────────────────────────────────────────────────
create table public.segments (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null,
  rules       jsonb not null default '[]',  -- [{field, op, value}]
  cached_count int default 0,
  created_at  timestamptz not null default now()
);

-- ── WA TEMPLATES ────────────────────────────────────────────
create table public.wa_templates (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  meta_id     text,                          -- returned by Meta after submit
  name        text not null,
  category    text not null default 'MARKETING' check (category in ('MARKETING','UTILITY','AUTHENTICATION')),
  language    text not null default 'tr',
  header      jsonb,                         -- {type: 'TEXT', text: '...'}
  body        text not null,
  footer      text,
  buttons     jsonb default '[]',
  status      text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED','PAUSED')),
  rejection_reason text,
  send_count  int default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── CAMPAIGNS ───────────────────────────────────────────────
create table public.campaigns (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  name          text not null,
  status        text not null default 'draft' check (status in ('draft','scheduled','sending','sent','failed','cancelled')),
  channels      text[] not null default '{}',
  segment_id    uuid references public.segments(id),
  wa_template_id uuid references public.wa_templates(id),
  wa_vars       jsonb default '{}',          -- {1: 'value', 2: 'value'}
  email_subject text,
  email_body    text,
  schedule_type text not null default 'now' check (schedule_type in ('now','scheduled','ai')),
  scheduled_at  timestamptz,
  sent_at       timestamptz,
  recipient_count int default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_campaigns_tenant  on public.campaigns(tenant_id);
create index idx_campaigns_status  on public.campaigns(tenant_id, status);
create index idx_campaigns_sched   on public.campaigns(scheduled_at) where status = 'scheduled';

-- ── CAMPAIGN EVENTS (open / click / delivered / failed) ─────
create table public.campaign_events (
  id            uuid primary key default uuid_generate_v4(),
  campaign_id   uuid not null references public.campaigns(id) on delete cascade,
  subscriber_id uuid references public.subscribers(id) on delete set null,
  channel       text not null check (channel in ('whatsapp','email')),
  event_type    text not null check (event_type in ('sent','delivered','opened','clicked','bounced','failed','unsubscribed')),
  meta          jsonb default '{}',          -- {url, error_code, ...}
  created_at    timestamptz not null default now()
);

create index idx_events_campaign on public.campaign_events(campaign_id);
create index idx_events_type     on public.campaign_events(campaign_id, event_type);
create index idx_events_sub      on public.campaign_events(subscriber_id);

-- ── SEND QUEUE (processed by background worker) ─────────────
create table public.send_queue (
  id            uuid primary key default uuid_generate_v4(),
  campaign_id   uuid not null references public.campaigns(id) on delete cascade,
  subscriber_id uuid not null references public.subscribers(id) on delete cascade,
  channel       text not null,
  status        text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  attempts      int not null default 0,
  last_error    text,
  process_after timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index idx_queue_pending on public.send_queue(process_after, status) where status = 'pending';

-- ── UPDATED_AT TRIGGER ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_tenants_updated_at              before update on public.tenants              for each row execute function public.set_updated_at();
create trigger trg_wa_credentials_updated_at       before update on public.whatsapp_credentials for each row execute function public.set_updated_at();
create trigger trg_subscribers_updated_at          before update on public.subscribers          for each row execute function public.set_updated_at();
create trigger trg_wa_templates_updated_at         before update on public.wa_templates         for each row execute function public.set_updated_at();
create trigger trg_campaigns_updated_at            before update on public.campaigns            for each row execute function public.set_updated_at();

-- ── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.tenants               enable row level security;
alter table public.tenant_members        enable row level security;
alter table public.whatsapp_credentials  enable row level security;
alter table public.subscribers           enable row level security;
alter table public.segments              enable row level security;
alter table public.wa_templates          enable row level security;
alter table public.campaigns             enable row level security;
alter table public.campaign_events       enable row level security;
alter table public.send_queue            enable row level security;

-- Helper: is the current user a member of this tenant?
create or replace function public.is_tenant_member(tid uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.tenant_members
    where tenant_id = tid and user_id = auth.uid()
  );
$$;

-- Tenants: members can read their own tenants
create policy "tenant_members_select" on public.tenants
  for select using (public.is_tenant_member(id));

create policy "tenant_members_update" on public.tenants
  for update using (public.is_tenant_member(id));

-- All tenant-scoped tables: same pattern
create policy "member_select" on public.whatsapp_credentials for select using (public.is_tenant_member(tenant_id));
create policy "member_all"    on public.whatsapp_credentials for all    using (public.is_tenant_member(tenant_id));
create policy "member_select" on public.subscribers          for select using (public.is_tenant_member(tenant_id));
create policy "member_all"    on public.subscribers          for all    using (public.is_tenant_member(tenant_id));
create policy "member_select" on public.segments             for select using (public.is_tenant_member(tenant_id));
create policy "member_all"    on public.segments             for all    using (public.is_tenant_member(tenant_id));
create policy "member_select" on public.wa_templates         for select using (public.is_tenant_member(tenant_id));
create policy "member_all"    on public.wa_templates         for all    using (public.is_tenant_member(tenant_id));
create policy "member_select" on public.campaigns            for select using (public.is_tenant_member(tenant_id));
create policy "member_all"    on public.campaigns            for all    using (public.is_tenant_member(tenant_id));
create policy "member_select" on public.campaign_events      for select using (exists (select 1 from public.campaigns c where c.id = campaign_id and public.is_tenant_member(c.tenant_id)));
create policy "member_select" on public.send_queue           for select using (exists (select 1 from public.campaigns c where c.id = campaign_id and public.is_tenant_member(c.tenant_id)));
