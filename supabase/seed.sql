-- Optional starter data for a local/demo school. Run after 001_initial_schema.sql.
insert into public.schools (id, name, slug, address)
values ('11111111-1111-4111-8111-111111111111', 'SMK Nusantara Digital', 'smk-nusantara-digital', 'Alamat contoh — ganti dengan alamat sekolah')
on conflict (id) do nothing;

insert into public.categories (school_id, name) values
('11111111-1111-4111-8111-111111111111', 'Elektronik'),
('11111111-1111-4111-8111-111111111111', 'Komputer'),
('11111111-1111-4111-8111-111111111111', 'Mebel'),
('11111111-1111-4111-8111-111111111111', 'Audio'),
('11111111-1111-4111-8111-111111111111', 'Peralatan praktik'),
('11111111-1111-4111-8111-111111111111', 'Perangkat kantor')
on conflict (school_id, name) do nothing;

insert into public.locations (school_id, name, building, floor) values
('11111111-1111-4111-8111-111111111111', 'Lab RPL', 'Gedung A', 'Lantai 2'),
('11111111-1111-4111-8111-111111111111', 'Ruang Tata Usaha', 'Gedung Utama', 'Lantai 1'),
('11111111-1111-4111-8111-111111111111', 'Aula', 'Gedung Utama', 'Lantai 1'),
('11111111-1111-4111-8111-111111111111', 'Perpustakaan', 'Gedung C', 'Lantai 1')
on conflict (school_id, name) do nothing;

insert into public.rooms (school_id, room_code, name, building, capacity, room_type, availability) values
('11111111-1111-4111-8111-111111111111', 'R-001', 'Lab RPL', 'Gedung A · Lantai 2', 36, 'Laboratorium', 'tersedia'),
('11111111-1111-4111-8111-111111111111', 'R-002', 'Aula', 'Gedung Utama', 150, 'Aula', 'tersedia'),
('11111111-1111-4111-8111-111111111111', 'R-003', 'Ruang Multimedia', 'Gedung B · Lantai 1', 30, 'Ruang khusus', 'tersedia')
on conflict (school_id, room_code) do nothing;
