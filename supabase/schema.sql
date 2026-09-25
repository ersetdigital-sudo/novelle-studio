-- ============================================================
-- NOVELLE STUDIO — skema Supabase
-- Jalankan sekali di Supabase → SQL Editor → New query → Run.
-- Semua akses lewat server (service key). anon/authenticated di-revoke.
-- ============================================================

-- ---------- katalog: pengaturan per kategori ----------
-- Kategori (8 layanan) tetap didefinisikan di kode supaya ikon & warna aman;
-- yang bisa diubah admin adalah data operasionalnya (biaya admin, nominal, dll).
create table if not exists public.category_settings (
  slug text primary key,
  admin_fee integer not null default 0 check (admin_fee >= 0),
  nom_label text,
  provider_label text,
  providers jsonb,
  field_label text,
  field_placeholder text,
  field_hint text,
  field_min_length integer,
  alt_provider text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------- katalog: daftar nominal / paket ----------
-- variant 'main' = daftar normal, 'alt' = daftar untuk provider alternatif (PLN pascabayar).
create table if not exists public.category_items (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null,
  variant text not null default 'main' check (variant in ('main', 'alt')),
  label text not null,
  note text not null default '',
  price integer not null check (price >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists category_items_lookup_idx
  on public.category_items (category_slug, variant, sort_order);

-- ---------- metode pembayaran ----------
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'qris' check (type in ('qris', 'transfer')),
  account_label text not null default 'Nomor Tujuan',
  account_number text not null default '',
  account_name text not null default '',
  qr_image text not null default '',
  instructions jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- pesanan ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  invoice text not null unique,
  category_slug text not null,
  category_label text not null,
  item_label text not null,
  account_id text not null,
  account_label text not null default 'Nomor Tujuan',
  payment_method_id uuid,
  payment_method_name text not null default '',
  subtotal integer not null check (subtotal >= 0),
  fee integer not null default 0 check (fee >= 0),
  total integer not null check (total >= 0),
  token text not null default '',
  status text not null default 'menunggu'
    check (status in ('menunggu', 'dibayar', 'selesai', 'batal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);

-- ---------- konten presentasi (satu dokumen JSON) ----------
create table if not exists public.site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- keamanan ----------
alter table public.category_settings enable row level security;
alter table public.category_items enable row level security;
alter table public.payment_methods enable row level security;
alter table public.orders enable row level security;
alter table public.site_content enable row level security;

revoke all on public.category_settings, public.category_items,
  public.payment_methods, public.orders, public.site_content
  from anon, authenticated;

grant all on public.category_settings, public.category_items,
  public.payment_methods, public.orders, public.site_content
  to service_role;

-- ---------- data awal (opsional, silakan hapus kalau tidak perlu) ----------
-- Kalau tabel dibiarkan kosong, aplikasi otomatis memakai default dari data/*.ts.
insert into public.site_content (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
