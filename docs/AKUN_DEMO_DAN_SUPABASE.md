# Akun Demo dan Provisioning Supabase

## Akun lokal untuk demo

Akun ini hanya berjalan ketika `.env.local` tidak berisi konfigurasi Supabase:

| Role | Email | Password |
|---|---|---|
| Admin Sarpras | `admin@sipras.local` | `AdminSipras#2026` |
| Warga Sekolah | `warga@sipras.local` | `WargaSipras#2026` |

Pada halaman login, klik kartu akun untuk mengisi email dan password, lalu klik **Masuk ke dashboard**.

**Keamanan:** akun demo ini merupakan kredensial statis di source code dan hanya untuk pengujian lokal. Jangan deploy mode demo ke internet atau menggunakannya untuk data sekolah sungguhan.

## Akun Supabase untuk penggunaan sebenarnya

Akun Supabase tidak dapat diciptakan hanya dengan memasukkan email/password ke tabel `profiles`. Password dikelola oleh Supabase Auth.

1. Buat project Supabase.
2. Jalankan `supabase/migrations/001_initial_schema.sql`.
3. Jalankan `supabase/seed.sql` untuk membuat sekolah contoh.
4. Buka **Authentication → Users → Add user** dan buat:
   - `admin@sekolah.sch.id` dengan password kuat pilihan administrator.
   - `warga@sekolah.sch.id` dengan password kuat pilihan pengguna.
5. Ganti alamat email di `supabase/provision_demo_profiles.sql` jika berbeda.
6. Jalankan file SQL tersebut melalui **SQL Editor**.
7. Pastikan query konfirmasi menampilkan satu akun `admin` dan satu akun `warga_sekolah`.
8. Konfigurasikan `.env.local` berdasarkan `.env.example`, lalu jalankan aplikasi.

Sekolah contoh di seed memiliki UUID `11111111-1111-4111-8111-111111111111`. Ganti dengan sekolah yang benar untuk penggunaan nyata; jangan gunakan sekolah contoh lintas pelanggan.
