"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search, ClipboardList, MapPin, CalendarDays, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useResource } from "@/lib/hooks/use-resource";
import { demoReports } from "@/lib/demo-data";
import { PageHeader, Modal, StatusBadge, EmptyState, DataWarning } from "@/components/ui";
import { REPORT_STATUSES, formatDate } from "@/lib/constants";
import type { FacilityReport, ReportStatus, ReportType } from "@/lib/types";
import { uploadSchoolImage } from "@/lib/supabase/storage";

export default function LaporanPage() {
  const { profile } = useAuth();
  const { items, loading, error, create, update } = useResource("reports", demoReports);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", report_type: "kerusakan" as ReportType, asset_name: "", location: "", description: "", priority: "sedang" as FacilityReport["priority"] });
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const isAdmin = profile?.role === "admin";

  const visible = useMemo(() => items.filter((item) => (isAdmin || item.reporter_name === profile?.full_name)).filter((item) => {
    const match = `${item.report_code} ${item.title} ${item.location} ${item.reporter_name}`.toLowerCase().includes(query.toLowerCase());
    const statusMatch = statusFilter === "all" || item.status === statusFilter;
    return match && statusMatch;
  }), [items, query, statusFilter, isAdmin, profile?.full_name]);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const code = `LAP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
      const photo_path = photoFile ? await uploadSchoolImage(photoFile, profile?.school_id ?? "") : null;
      await create({ ...form, photo_path, report_code: code, status: "menunggu_verifikasi", reporter_name: profile?.full_name ?? "Pengguna", created_at: new Date().toISOString() } as Partial<FacilityReport>);
      setPhotoFile(null); setModalOpen(false); setForm({ title: "", report_type: "kerusakan", asset_name: "", location: "", description: "", priority: "sedang" });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Laporan gagal dikirim."); }
    finally { setSaving(false); }
  }

  async function changeStatus(id: string, status: ReportStatus) {
    try { await update(id, { status }); } catch (error) { alert(error instanceof Error ? error.message : "Status gagal diperbarui."); }
  }

  return <>
    <PageHeader eyebrow="PELAPORAN FASILITAS" title={isAdmin ? "Manajemen laporan" : "Laporan fasilitas"} description={isAdmin ? "Periksa, verifikasi, dan tindak lanjuti laporan dari warga sekolah." : "Laporkan kerusakan atau masalah fasilitas dan pantau proses penanganannya."} action={<button className="button button-primary" onClick={() => { setMessage(""); setModalOpen(true); }}><Plus size={16}/> Buat laporan</button>}/>
    {error && <DataWarning message={error}/>}
    <div className="report-summary"><div className="report-summary-icon"><ClipboardList size={21}/></div><div><strong>{items.length} laporan tercatat</strong><p>{items.filter((item) => item.status !== "selesai" && item.status !== "ditolak").length} laporan masih membutuhkan tindak lanjut.</p></div><div className="report-summary-right"><span>Prioritas tinggi</span><strong>{items.filter((item) => item.priority === "tinggi" || item.priority === "darurat").length}</strong></div></div>
    <section className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={17}/><input placeholder="Cari kode, judul, lokasi, pelapor..." value={query} onChange={(e) => setQuery(e.target.value)}/></div><div className="filter-field"><ClipboardList size={16}/><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">Semua status</option>{REPORT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div></div>
      <div className="report-cards">{visible.map((item) => <article className="report-card" key={item.id}><div className="report-card-top"><span className="report-code">{item.report_code}</span><StatusBadge value={item.status}/></div><h3>{item.title}</h3><p className="report-description">{item.description}</p><div className="report-meta"><span><MapPin size={14}/>{item.location}</span><span><CalendarDays size={14}/>{formatDate(item.created_at)}</span><span>Pelapor: {item.reporter_name}</span></div><div className="report-card-bottom"><div className={`priority-label ${item.priority}`}>Prioritas {item.priority}</div>{isAdmin ? <select className="inline-select" value={item.status} onChange={(e) => changeStatus(item.id, e.target.value as ReportStatus)}>{REPORT_STATUSES.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}</select> : <span className="muted-small">{item.asset_name || "Laporan fasilitas"}</span>}</div></article>)}{!visible.length && <EmptyState title="Belum ada laporan" description="Laporan yang sesuai pencarian akan muncul di sini."/>}</div>
      <div className="table-footer"><span>{visible.length} laporan ditampilkan</span><span>{loading ? "Memuat..." : "Status dapat diperbarui oleh Admin Sarpras"}</span></div>
    </section>
    <Modal open={modalOpen} title="Buat laporan fasilitas" description="Jelaskan masalah yang ditemukan agar dapat ditindaklanjuti." onClose={() => setModalOpen(false)} wide><form className="form-grid" onSubmit={submitReport}><label className="span-2">Judul laporan<input required placeholder="Contoh: Proyektor tidak menyala" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/></label><label>Jenis laporan<select value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value as ReportType })}><option value="kerusakan">Kerusakan barang</option><option value="fasilitas">Fasilitas ruangan</option><option value="kehilangan">Kehilangan inventaris sekolah</option><option value="lainnya">Lainnya</option></select></label><label>Prioritas<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as FacilityReport["priority"] })}><option value="rendah">Rendah</option><option value="sedang">Sedang</option><option value="tinggi">Tinggi</option><option value="darurat">Darurat</option></select></label><label>Nama barang (opsional)<input placeholder="Contoh: Proyektor Epson" value={form.asset_name} onChange={(e) => setForm({ ...form, asset_name: e.target.value })}/></label><label>Lokasi<input required placeholder="Contoh: Lab RPL" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}/></label><label className="span-2">Foto bukti (opsional)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}/><small className="field-hint">JPG, PNG, atau WebP · Maksimal 5 MB. Foto disimpan di penyimpanan privat sekolah.</small></label><label className="span-2">Deskripsi masalah<textarea rows={4} required placeholder="Jelaskan kondisi dan kapan masalah ditemukan..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label>{message && <div className="form-error span-2">{message}</div>}<div className="form-actions span-2"><button type="button" className="button button-ghost" onClick={() => setModalOpen(false)}>Batal</button><button className="button button-primary" disabled={saving}>{saving ? "Mengirim..." : "Kirim laporan"}<ArrowUpRight size={16}/></button></div></form></Modal>
  </>;
}
