# SIPRAS Online

**Sistem Informasi Pengelolaan Sarana dan Prasarana Sekolah**  
MVP web application berbasis Next.js dan Supabase untuk mengelola inventaris, laporan fasilitas, Lost and Found, peminjaman, dan data ruangan.

> Status proyek: **MVP starter untuk pengembangan tim**. Mode demo dapat dijalankan langsung. Mode Supabase membutuhkan konfigurasi project dan provisioning akun sekolah.

## Teknologi

- **Next.js 16.4.6** — App Router, TypeScript, React Server/Client Components.
- **Supabase** — PostgreSQL, Auth, Storage, Row Level Security.
- **Tailwind CSS 4** — fondasi styling; tampilan utama menggunakan CSS aplikasi.
- **Lucide React** — ikon.
- **qrcode.react** — QR Code inventaris.

## Fitur yang tersedia

### Warga Sekolah
- Dashboard ringkasan sarana dan prasarana.
- Melihat inventaris dan kondisi barang.
- Mengirim laporan kerusakan, kehilangan inventaris sekolah, dan fasilitas.
- Melaporkan barang hilang atau ditemukan.
- Mengajukan peminjaman barang dan ruangan.
- Melihat data ruangan dan ketersediaannya.

### Admin Sarpras
- Seluruh fitur Warga Sekolah.
- Menambahkan dan menghapus data inventaris.
- Memperbarui kondisi barang.
- Memverifikasi dan memperbarui status laporan.
- Memverifikasi status barang Lost and Found.
- Menyetujui atau menolak pengajuan peminjaman.
- Mengelola data ruangan.
- Melihat ringkasan administrasi dan status koneksi database.

### Teknis
- Dua role: `admin` dan `warga_sekolah`.
- Mode demo lokal menggunakan `localStorage`.
- Mode Supabase menggunakan `@supabase/ssr`.
- SQL migration berisi tabel tenant-aware dan kebijakan RLS.
- Upload gambar ke private Supabase Storage bucket (`sipras-private`).
- QR Code untuk identifikasi item inventaris.

## Menjalankan dalam mode demo

Mode demo tidak memerlukan akun Supabase. Jangan buat file `.env.local` dahulu.

```bash
npm install
npm run dev
```

Buka `http://localhost:3000/login` dan gunakan salah satu akun demo berikut:

| Role | Email | Password |
|---|---|---|
| Admin Sarpras | `admin@sipras.local` | `AdminSipras#2026` |
| Warga Sekolah | `warga@sipras.local` | `WargaSipras#2026` |

Tombol akun demo akan mengisikan email dan password secara otomatis. Klik **Masuk ke dashboard** untuk login.

**Penting:** kredensial ini hanya untuk mode demo lokal. Kredensial disimpan di kode frontend dan BUKAN akun aman untuk produksi. Data contoh disimpan di browser yang sedang digunakan. Untuk penggunaan sungguhan, hubungkan Supabase dan buat akun melalui Supabase Auth seperti dijelaskan di bagian berikutnya.

## Menghubungkan Supabase

### 1. Buat project Supabase

Buat project di Supabase Dashboard, lalu buka **Project Settings → API**. Salin Project URL dan Publishable Key.

### 2. Atur environment variable

Salin `.env.example` menjadi `.env.local`, lalu isi dengan kredensial project milik tim:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Aplikasi juga mendukung nama variabel `NEXT_PUBLIC_SUPABASE_ANON_KEY` sebagai alternatif. Jangan masukkan `service_role` key ke environment variable yang diawali `NEXT_PUBLIC_`, ke source code browser, atau ke Git.

### 3. Jalankan database migration

Buka **Supabase Dashboard → SQL Editor**, kemudian jalankan isi file berikut secara berurutan:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql` (opsional, membuat data sekolah contoh dan beberapa ruang)

Migration membuat tabel, indeks, helper function, trigger `updated_at`, kebijakan Row Level Security, dan private storage bucket.

### 4. Buat akun pengguna

Untuk MVP ini tidak ada pendaftaran publik. Akun produksi harus dibuat melalui **Authentication → Users → Add user** di Supabase Dashboard. Buat dua akun, misalnya:

| Role | Email contoh | Password |
|---|---|---|
| Admin Sarpras | `admin@sekolah.sch.id` | Buat password kuat di Supabase Auth |
| Warga Sekolah | `warga@sekolah.sch.id` | Buat password kuat di Supabase Auth |

Jangan memakai password demo di atas untuk akun produksi. Setelah kedua akun dibuat, jalankan `supabase/provision_demo_profiles.sql` melalui SQL Editor untuk memasangkan dua akun tersebut dengan role dan sekolah contoh. Jika menggunakan email berbeda, ubah alamat email pada file SQL sebelum menjalankannya.

`seed.sql` menyediakan sekolah contoh dengan ID:

```text
11111111-1111-4111-8111-111111111111
```

Masukkan profil Admin Sarpras melalui SQL Editor (ganti email jika berbeda):

```sql
insert into public.profiles (id, school_id, full_name, role, class_or_department)
select id,
       '11111111-1111-4111-8111-111111111111'::uuid,
       'Admin Sarpras',
       'admin',
       'Pengelola Sarpras'
from auth.users
where email = 'admin@sekolah.sch.id'
on conflict (id) do update set
  school_id = excluded.school_id,
  full_name = excluded.full_name,
  role = excluded.role,
  class_or_department = excluded.class_or_department;
```

Profil Warga Sekolah:

```sql
insert into public.profiles (id, school_id, full_name, role, class_or_department)
select id,
       '11111111-1111-4111-8111-111111111111'::uuid,
       'Nama Warga Sekolah',
       'warga_sekolah',
       'XI RPL 1'
from auth.users
where email = 'warga@sekolah.sch.id'
on conflict (id) do update set
  school_id = excluded.school_id,
  full_name = excluded.full_name,
  role = excluded.role,
  class_or_department = excluded.class_or_department;
```

Untuk sekolah sungguhan, buat baris `schools` sendiri dan gunakan UUID sekolah tersebut pada setiap profil. Jangan gunakan ID sekolah contoh untuk data sekolah lain.

### 5. Jalankan aplikasi

```bash
npm run dev
```

Gunakan akun yang dibuat di Supabase Authentication. Jika profil belum terdaftar di tabel `profiles`, aplikasi akan menolak login dan meminta pengguna menghubungi Admin Sarpras.

## Struktur folder

```text
sipras-online/
├── public/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── inventaris/
│   │   │   ├── laporan/
│   │   │   ├── lost-found/
│   │   │   ├── peminjaman/
│   │   │   ├── ruangan/
│   │   │   └── pengaturan/
│   │   ├── login/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── providers/auth-provider.tsx
│   │   ├── app-shell.tsx
│   │   └── ui.tsx
│   ├── lib/
│   │   ├── hooks/use-resource.ts
│   │   ├── supabase/
│   │   ├── constants.ts
│   │   ├── demo-data.ts
│   │   └── types.ts
│   └── proxy.ts
├── supabase/
│   ├── migrations/001_initial_schema.sql
│   └── seed.sql
├── .env.example
├── package.json
└── README.md
```

## Perintah pengembangan

```bash
npm run dev       # Menjalankan development server
npm run typecheck # Memeriksa TypeScript
npm run lint      # Memeriksa aturan ESLint
npm run build     # Membuat production build
npm run start     # Menjalankan production build
```

## Catatan penting sebelum production

Project ini merupakan fondasi MVP dan belum boleh dianggap siap dipakai sebagai sistem operasional sekolah tanpa pengujian serta hardening lebih lanjut.

1. **Validasi server-side:** beberapa aksi UI MVP menggunakan Supabase browser client. Tambahkan validasi input server-side/Route Handler atau Server Actions sebelum peluncuran publik. RLS tetap menjadi batas keamanan utama untuk query langsung dari browser.
2. **Profil dan onboarding:** provisioning sekolah serta akun masih dilakukan melalui Supabase Dashboard/SQL. Belum ada panel SaaS Super Admin untuk membuat tenant baru.
3. **Lampiran gambar:** file disimpan ke private bucket dan path disimpan pada record. Fitur signed URL/preview lampiran untuk menampilkan kembali gambar perlu dilengkapi.
4. **Peminjaman:** alur persetujuan dasar sudah ada. Pemeriksaan bentrok jadwal otomatis, pencatatan serah-terima, dan denda keterlambatan belum diimplementasikan.
5. **Lost and Found:** laporan dan status admin tersedia. Alur klaim kepemilikan dengan bukti verifikasi khusus perlu dikembangkan sebelum penggunaan nyata.
6. **Notifikasi:** struktur tabel disiapkan, tetapi pengiriman email/WhatsApp dan subscription realtime belum diaktifkan.
7. **Audit dan backup:** lengkapi audit log otomatis, backup terjadwal, monitoring, kebijakan retensi data, dan prosedur pemulihan.
8. **Privasi:** hindari menyimpan informasi pribadi yang tidak diperlukan. Tetapkan aturan akses, masa penyimpanan, dan prosedur penghapusan data sesuai kebijakan sekolah serta peraturan yang berlaku.
9. **Pengujian:** lakukan test lintas role dan lintas sekolah, uji RLS dengan akun berbeda, uji upload file, serta uji peminjaman bersamaan sebelum go-live.

## Catatan keamanan

- `NEXT_PUBLIC_*` adalah variabel yang dapat diakses browser; hanya isi dengan URL dan publishable/anon key.
- Jangan pernah commit `.env.local`.
- Jangan pernah menggunakan Supabase `service_role` key di client-side code.
- Jangan hanya mengandalkan menu yang disembunyikan berdasarkan role. Periksa izin di database melalui RLS.
- Review migration dan policy bersama penanggung jawab teknis sebelum menerapkannya ke project sekolah sebenarnya.
