-- SIPRAS Online | Initial schema for multi-school SaaS
-- Run once in Supabase SQL Editor. Never expose the service_role key in the browser.

create extension if not exists pgcrypto;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete restrict,
  full_name text not null,
  role text not null default 'warga_sekolah' check (role in ('admin', 'warga_sekolah')),
  class_or_department text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (school_id, name)
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  building text,
  floor text,
  description text,
  created_at timestamptz not null default now(),
  unique (school_id, name)
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  asset_code text not null,
  name text not null,
  category text not null,
  location text not null,
  quantity integer not null default 1 check (quantity > 0),
  condition text not null default 'baik' check (condition in ('baik','rusak_ringan','rusak_berat','tidak_berfungsi','dalam_perbaikan','hilang')),
  availability text not null default 'tersedia' check (availability in ('tersedia','dipinjam','dipesan','tidak_tersedia')),
  description text,
  photo_path text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, asset_code)
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  room_code text not null,
  name text not null,
  building text not null,
  capacity integer not null default 1 check (capacity > 0),
  room_type text not null default 'Ruang kelas',
  availability text not null default 'tersedia' check (availability in ('tersedia','digunakan','perawatan')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, room_code)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  report_code text not null,
  title text not null,
  report_type text not null check (report_type in ('kerusakan','kehilangan','fasilitas','lainnya')),
  asset_name text,
  location text not null,
  description text not null,
  priority text not null default 'sedang' check (priority in ('rendah','sedang','tinggi','darurat')),
  status text not null default 'menunggu_verifikasi' check (status in ('menunggu_verifikasi','terverifikasi','dalam_penanganan','selesai','ditolak')),
  reporter_name text not null,
  resolution_note text,
  photo_path text,
  created_by uuid not null references auth.users(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, report_code)
);

create table if not exists public.lost_found_items (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  item_code text not null,
  item_type text not null check (item_type in ('hilang','ditemukan')),
  item_name text not null,
  category text not null,
  location text not null,
  happened_on date not null,
  description text not null,
  status text not null default 'menunggu_verifikasi' check (status in ('menunggu_verifikasi','dipublikasikan','diklaim','dikembalikan','ditutup')),
  reporter_name text not null,
  photo_path text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, item_code)
);

create table if not exists public.loan_requests (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  request_code text not null,
  request_type text not null check (request_type in ('barang','ruangan')),
  item_name text not null,
  borrower_name text not null,
  purpose text not null,
  borrow_date date not null,
  return_date date not null,
  status text not null default 'menunggu' check (status in ('menunggu','disetujui','ditolak','dipinjam','dikembalikan')),
  reviewer_note text,
  created_by uuid not null references auth.users(id) on delete restrict,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, request_code),
  check (return_date >= borrow_date)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  href text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helper functions are SECURITY DEFINER to avoid recursive profile RLS evaluation.
create or replace function public.current_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid() limit 1;
$$;

create or replace function public.is_school_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- updated_at triggers
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['schools','profiles','assets','rooms','reports','lost_found_items','loan_requests'] LOOP
    EXECUTE format('drop trigger if exists set_%I_updated_at on public.%I', tbl, tbl);
    EXECUTE format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', tbl, tbl);
  END LOOP;
END $$;

-- Indexes used by school-scoped lists and dashboard counts.
create index if not exists profiles_school_id_idx on public.profiles(school_id);
create index if not exists assets_school_condition_idx on public.assets(school_id, condition);
create index if not exists reports_school_status_idx on public.reports(school_id, status, created_at desc);
create index if not exists lost_found_school_status_idx on public.lost_found_items(school_id, status, created_at desc);
create index if not exists loans_school_status_idx on public.loan_requests(school_id, status, created_at desc);
create index if not exists rooms_school_idx on public.rooms(school_id);

-- Enable Row Level Security on every tenant table.
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Schools and profiles
create policy "members can read their school" on public.schools for select
  using (id = public.current_school_id());
create policy "users can read profiles in their school" on public.profiles for select
  using (school_id = public.current_school_id() and (id = auth.uid() or public.is_school_admin()));
create policy "admins can update profiles in their school" on public.profiles for update
  using (school_id = public.current_school_id() and public.is_school_admin())
  with check (school_id = public.current_school_id() and public.is_school_admin());

-- Reference data
create policy "members can read categories" on public.categories for select using (school_id = public.current_school_id());
create policy "admins manage categories" on public.categories for all
  using (school_id = public.current_school_id() and public.is_school_admin())
  with check (school_id = public.current_school_id() and public.is_school_admin());
create policy "members can read locations" on public.locations for select using (school_id = public.current_school_id());
create policy "admins manage locations" on public.locations for all
  using (school_id = public.current_school_id() and public.is_school_admin())
  with check (school_id = public.current_school_id() and public.is_school_admin());

-- Inventory: all members can read; only admins can change inventory records.
create policy "members can read school assets" on public.assets for select using (school_id = public.current_school_id());
create policy "admins manage school assets" on public.assets for all
  using (school_id = public.current_school_id() and public.is_school_admin())
  with check (school_id = public.current_school_id() and public.is_school_admin());

-- Rooms: visible to members; managed by admins.
create policy "members can read school rooms" on public.rooms for select using (school_id = public.current_school_id());
create policy "admins manage school rooms" on public.rooms for all
  using (school_id = public.current_school_id() and public.is_school_admin())
  with check (school_id = public.current_school_id() and public.is_school_admin());

-- Reports: reporters can see their own reports; admins can see every report in their school.
create policy "reporter or admin can read reports" on public.reports for select
  using (school_id = public.current_school_id() and (created_by = auth.uid() or public.is_school_admin()));
create policy "members can submit reports" on public.reports for insert
  with check (school_id = public.current_school_id() and created_by = auth.uid());
create policy "admins can update reports" on public.reports for update
  using (school_id = public.current_school_id() and public.is_school_admin())
  with check (school_id = public.current_school_id() and public.is_school_admin());

-- Lost and Found: public listings are visible to all members; private/pending entries to owner/admin.
create policy "members can read published lost found" on public.lost_found_items for select
  using (school_id = public.current_school_id() and (status in ('dipublikasikan','diklaim','dikembalikan') or created_by = auth.uid() or public.is_school_admin()));
create policy "members can submit lost found" on public.lost_found_items for insert
  with check (school_id = public.current_school_id() and created_by = auth.uid());
create policy "admins can manage lost found" on public.lost_found_items for update
  using (school_id = public.current_school_id() and public.is_school_admin())
  with check (school_id = public.current_school_id() and public.is_school_admin());

-- Loans: user sees own requests; admin sees and updates all requests in their school.
create policy "borrower or admin can read loans" on public.loan_requests for select
  using (school_id = public.current_school_id() and (created_by = auth.uid() or public.is_school_admin()));
create policy "members can submit loan requests" on public.loan_requests for insert
  with check (school_id = public.current_school_id() and created_by = auth.uid());
create policy "admins can update loan requests" on public.loan_requests for update
  using (school_id = public.current_school_id() and public.is_school_admin())
  with check (school_id = public.current_school_id() and public.is_school_admin());

-- Notifications belong to their recipient; admins may create notifications for their school.
create policy "users can read own notifications" on public.notifications for select
  using (school_id = public.current_school_id() and recipient_id = auth.uid());
create policy "users can update own notifications" on public.notifications for update
  using (school_id = public.current_school_id() and recipient_id = auth.uid())
  with check (school_id = public.current_school_id() and recipient_id = auth.uid());
create policy "admins can create notifications" on public.notifications for insert
  with check (school_id = public.current_school_id() and public.is_school_admin());

create policy "admins can read activity logs" on public.activity_logs for select
  using (school_id = public.current_school_id() and public.is_school_admin());
create policy "members can append own activity" on public.activity_logs for insert
  with check (school_id = public.current_school_id() and actor_id = auth.uid());

-- Private bucket for school asset/report imagery. File path format: <school_uuid>/<folder>/<filename>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sipras-private', 'sipras-private', false, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

create policy "school members can read school media" on storage.objects for select
  using (bucket_id = 'sipras-private' and (storage.foldername(name))[1] = public.current_school_id()::text);
create policy "school members can upload school media" on storage.objects for insert
  with check (bucket_id = 'sipras-private' and (storage.foldername(name))[1] = public.current_school_id()::text);
create policy "admins or uploaders can delete school media" on storage.objects for delete
  using (bucket_id = 'sipras-private' and (storage.foldername(name))[1] = public.current_school_id()::text and (owner_id = auth.uid()::text or public.is_school_admin()));
