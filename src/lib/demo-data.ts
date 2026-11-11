import type { Asset, FacilityReport, LoanRequest, LostFoundItem, SchoolRoom } from "@/lib/types";

export const demoAssets: Asset[] = [
  { id: "a1", asset_code: "INV-001", name: "Proyektor Epson EB-X06", category: "Elektronik", location: "Ruang XI RPL 1", quantity: 1, condition: "baik", availability: "dipinjam", description: "Proyektor untuk kegiatan pembelajaran." },
  { id: "a2", asset_code: "INV-002", name: "Komputer Lab RPL", category: "Komputer", location: "Lab RPL", quantity: 24, condition: "rusak_ringan", availability: "tersedia", description: "Satu unit perlu pemeriksaan keyboard." },
  { id: "a3", asset_code: "INV-003", name: "Kipas Angin Dinding", category: "Elektronik", location: "Ruang X RPL 2", quantity: 2, condition: "tidak_berfungsi", availability: "tidak_tersedia", description: "Kipas di sisi belakang ruangan tidak berputar." },
  { id: "a4", asset_code: "INV-004", name: "Printer Epson L3210", category: "Perangkat kantor", location: "Ruang Tata Usaha", quantity: 1, condition: "dalam_perbaikan", availability: "tidak_tersedia", description: "Sedang diperiksa bagian tinta." },
  { id: "a5", asset_code: "INV-005", name: "Kursi Siswa", category: "Mebel", location: "Ruang XI RPL 1", quantity: 32, condition: "baik", availability: "tersedia" },
  { id: "a6", asset_code: "INV-006", name: "Speaker Aktif", category: "Audio", location: "Aula", quantity: 2, condition: "rusak_berat", availability: "tidak_tersedia", description: "Salah satu unit mengeluarkan suara tidak normal." },
];

export const demoReports: FacilityReport[] = [
  { id: "r1", report_code: "LAP-2026-001", title: "Kipas angin tidak berputar", report_type: "kerusakan", asset_name: "Kipas Angin Dinding", location: "Ruang X RPL 2", description: "Kipas di sisi belakang kelas tidak menyala sejak pagi.", priority: "sedang", status: "dalam_penanganan", reporter_name: "Nadia Putri", created_at: "2026-11-09T08:30:00.000Z" },
  { id: "r2", report_code: "LAP-2026-002", title: "Kunci pintu toilet longgar", report_type: "fasilitas", location: "Toilet Lantai 2", description: "Kunci pintu perlu diperbaiki agar dapat digunakan dengan aman.", priority: "tinggi", status: "menunggu_verifikasi", reporter_name: "Rizky Maulana", created_at: "2026-11-09T10:15:00.000Z" },
  { id: "r3", report_code: "LAP-2026-003", title: "Keyboard komputer tidak berfungsi", report_type: "kerusakan", asset_name: "Komputer Lab RPL", location: "Lab RPL", description: "Beberapa tombol keyboard tidak merespons.", priority: "rendah", status: "terverifikasi", reporter_name: "Dimas Pratama", created_at: "2026-11-08T07:45:00.000Z" },
  { id: "r4", report_code: "LAP-2026-004", title: "Flashdisk tertinggal", report_type: "kehilangan", location: "Lab RPL", description: "Flashdisk warna hitam kemungkinan tertinggal setelah praktikum.", priority: "rendah", status: "selesai", reporter_name: "Nadia Putri", created_at: "2026-11-07T13:20:00.000Z" },
];

export const demoLostFound: LostFoundItem[] = [
  { id: "f1", item_code: "LF-001", item_type: "ditemukan", item_name: "Botol minum biru", category: "Perlengkapan pribadi", location: "Perpustakaan", happened_on: "2026-11-09", description: "Ditemukan di meja dekat jendela. Detail khusus tidak ditampilkan.", status: "dipublikasikan", reporter_name: "Petugas Perpustakaan", created_at: "2026-11-09T12:00:00.000Z" },
  { id: "f2", item_code: "LF-002", item_type: "hilang", item_name: "Kalkulator scientific", category: "Alat tulis", location: "Lab RPL", happened_on: "2026-11-08", description: "Kalkulator warna hitam, terakhir digunakan saat pelajaran matematika.", status: "menunggu_verifikasi", reporter_name: "Rizky Maulana", created_at: "2026-11-08T09:00:00.000Z" },
  { id: "f3", item_code: "LF-003", item_type: "ditemukan", item_name: "Kartu identitas", category: "Dokumen", location: "Kantin", happened_on: "2026-11-07", description: "Kartu disimpan oleh Admin Sarpras. Pemilik perlu melakukan verifikasi.", status: "diklaim", reporter_name: "Admin Sarpras", created_at: "2026-11-07T11:30:00.000Z" },
];

export const demoLoans: LoanRequest[] = [
  { id: "l1", request_code: "PIN-001", request_type: "barang", item_name: "Proyektor Epson EB-X06", borrower_name: "Nadia Putri", purpose: "Presentasi proyek kelas", borrow_date: "2026-11-10", return_date: "2026-11-10", status: "disetujui", created_at: "2026-11-09T09:30:00.000Z" },
  { id: "l2", request_code: "PIN-002", request_type: "ruangan", item_name: "Aula", borrower_name: "Dimas Pratama", purpose: "Latihan presentasi kegiatan", borrow_date: "2026-11-12", return_date: "2026-11-12", status: "menunggu", created_at: "2026-11-09T14:00:00.000Z" },
  { id: "l3", request_code: "PIN-003", request_type: "barang", item_name: "Kamera DSLR", borrower_name: "Nadia Putri", purpose: "Dokumentasi kegiatan sekolah", borrow_date: "2026-11-06", return_date: "2026-11-06", status: "dikembalikan", created_at: "2026-11-05T08:00:00.000Z" },
];

export const demoRooms: SchoolRoom[] = [
  { id: "room1", room_code: "R-001", name: "Lab RPL", building: "Gedung A · Lantai 2", capacity: 36, room_type: "Laboratorium", availability: "tersedia" },
  { id: "room2", room_code: "R-002", name: "Aula", building: "Gedung Utama", capacity: 150, room_type: "Aula", availability: "digunakan" },
  { id: "room3", room_code: "R-003", name: "Ruang Multimedia", building: "Gedung B · Lantai 1", capacity: 30, room_type: "Ruang khusus", availability: "tersedia" },
  { id: "room4", room_code: "R-004", name: "Perpustakaan", building: "Gedung C · Lantai 1", capacity: 50, room_type: "Perpustakaan", availability: "perawatan" },
];
