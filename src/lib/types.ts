export type UserRole = "admin" | "warga_sekolah";
export type AssetCondition = "baik" | "rusak_ringan" | "rusak_berat" | "tidak_berfungsi" | "dalam_perbaikan" | "hilang";
export type AssetAvailability = "tersedia" | "dipinjam" | "dipesan" | "tidak_tersedia";
export type ReportStatus = "menunggu_verifikasi" | "terverifikasi" | "dalam_penanganan" | "selesai" | "ditolak";
export type ReportType = "kerusakan" | "kehilangan" | "fasilitas" | "lainnya";
export type ItemType = "hilang" | "ditemukan";
export type ItemStatus = "menunggu_verifikasi" | "dipublikasikan" | "diklaim" | "dikembalikan" | "ditutup";
export type LoanStatus = "menunggu" | "disetujui" | "ditolak" | "dipinjam" | "dikembalikan";

export interface Profile {
  id: string;
  school_id: string;
  full_name: string;
  email?: string;
  role: UserRole;
  class_or_department?: string | null;
  avatar_url?: string | null;
}

export interface Asset {
  id: string;
  school_id?: string;
  asset_code: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  condition: AssetCondition;
  availability: AssetAvailability;
  description?: string;
  photo_path?: string | null;
  created_at?: string;
}

export interface FacilityReport {
  id: string;
  school_id?: string;
  report_code: string;
  title: string;
  report_type: ReportType;
  asset_name?: string;
  location: string;
  description: string;
  priority: "rendah" | "sedang" | "tinggi" | "darurat";
  status: ReportStatus;
  reporter_name: string;
  created_by?: string;
  photo_path?: string | null;
  created_at: string;
}

export interface LostFoundItem {
  id: string;
  school_id?: string;
  item_code: string;
  item_type: ItemType;
  item_name: string;
  category: string;
  location: string;
  happened_on: string;
  description: string;
  status: ItemStatus;
  reporter_name: string;
  created_by?: string;
  photo_path?: string | null;
  created_at: string;
}

export interface LoanRequest {
  id: string;
  school_id?: string;
  request_code: string;
  request_type: "barang" | "ruangan";
  item_name: string;
  borrower_name: string;
  purpose: string;
  borrow_date: string;
  return_date: string;
  status: LoanStatus;
  created_by?: string;
  created_at: string;
}

export interface SchoolRoom {
  id: string;
  school_id?: string;
  room_code: string;
  name: string;
  building: string;
  capacity: number;
  room_type: string;
  availability: "tersedia" | "digunakan" | "perawatan";
}

export interface ResourceMap {
  assets: Asset;
  reports: FacilityReport;
  lost_found_items: LostFoundItem;
  loan_requests: LoanRequest;
  rooms: SchoolRoom;
}
