-- SIPRAS Online: assign roles to Auth users already created in Supabase Dashboard.
-- Prerequisites:
-- 1) Run migrations/001_initial_schema.sql
-- 2) Run seed.sql
-- 3) Create these users in Authentication > Users > Add user:
--      admin@sekolah.sch.id
--      warga@sekolah.sch.id
-- 4) Change the email addresses below if you used different ones.
-- Passwords are created in Supabase Auth, never in this SQL file.

do $$
declare
  target_school_id uuid := '11111111-1111-4111-8111-111111111111';
begin
  if not exists (select 1 from public.schools where id = target_school_id) then
    raise exception 'School seed not found. Run supabase/seed.sql first.';
  end if;

  if not exists (select 1 from auth.users where email = 'admin@sekolah.sch.id') then
    raise exception 'Auth user admin@sekolah.sch.id not found. Create it in Supabase Authentication first.';
  end if;

  if not exists (select 1 from auth.users where email = 'warga@sekolah.sch.id') then
    raise exception 'Auth user warga@sekolah.sch.id not found. Create it in Supabase Authentication first.';
  end if;

  insert into public.profiles (id, school_id, full_name, role, class_or_department)
  select id, target_school_id, 'Admin Sarpras', 'admin', 'Pengelola Sarpras'
  from auth.users
  where email = 'admin@sekolah.sch.id'
  on conflict (id) do update set
    school_id = excluded.school_id,
    full_name = excluded.full_name,
    role = excluded.role,
    class_or_department = excluded.class_or_department;

  insert into public.profiles (id, school_id, full_name, role, class_or_department)
  select id, target_school_id, 'Warga Sekolah', 'warga_sekolah', 'XI RPL 1'
  from auth.users
  where email = 'warga@sekolah.sch.id'
  on conflict (id) do update set
    school_id = excluded.school_id,
    full_name = excluded.full_name,
    role = excluded.role,
    class_or_department = excluded.class_or_department;
end $$;

-- Confirm the two profiles and their roles.
select p.full_name, u.email, p.role, s.name as school
from public.profiles p
join auth.users u on u.id = p.id
join public.schools s on s.id = p.school_id
where u.email in ('admin@sekolah.sch.id', 'warga@sekolah.sch.id')
order by p.role;
