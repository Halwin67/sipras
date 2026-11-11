import type { AssetAvailability, AssetCondition, ItemStatus, LoanStatus, ReportStatus } from "@/lib/types";

export const APP_NAME = "SIPRAS Online";
export const SCHOOL_NAME = "SMK Nusantara Digital";
export const ASSET_CONDITIONS: { value: AssetCondition; label: string }[] = [
  { value: "baik", label: "Baik" },
  { value: "rusak_ringan", label: "Rusak ringan" },
  { value: "rusak_berat", label: "Rusak berat" },
  { value: "tidak_berfungsi", label: "Tidak berfungsi" },
  { value: "dalam_perbaikan", label: "Dalam perbaikan" },
  { value: "hilang", label: "Hilang" },
];
export const ASSET_AVAILABILITIES: { value: AssetAvailability; label: string }[] = [
  { value: "tersedia", label: "Tersedia" },
  { value: "dipinjam", label: "Dipinjam" },
  { value: "dipesan", label: "Dipesan" },
  { value: "tidak_tersedia", label: "Tidak tersedia" },
];
export const REPORT_STATUSES: { value: ReportStatus; label: string }[] = [
  { value: "menunggu_verifikasi", label: "Menunggu verifikasi" },
  { value: "terverifikasi", label: "Terverifikasi" },
  { value: "dalam_penanganan", label: "Dalam penanganan" },
  { value: "selesai", label: "Selesai" },
  { value: "ditolak", label: "Ditolak" },
];
export const ITEM_STATUSES: { value: ItemStatus; label: string }[] = [
  { value: "menunggu_verifikasi", label: "Menunggu verifikasi" },
  { value: "dipublikasikan", label: "Dipublikasikan" },
  { value: "diklaim", label: "Diklaim" },
  { value: "dikembalikan", label: "Dikembalikan" },
  { value: "ditutup", label: "Ditutup" },
];
export const LOAN_STATUSES: { value: LoanStatus; label: string }[] = [
  { value: "menunggu", label: "Menunggu" },
  { value: "disetujui", label: "Disetujui" },
  { value: "ditolak", label: "Ditolak" },
  { value: "dipinjam", label: "Sedang dipinjam" },
  { value: "dikembalikan", label: "Dikembalikan" },
];
export const formatDate = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
export const formatDateTime = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
export const labelize = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
