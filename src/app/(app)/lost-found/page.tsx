"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search, MapPin, CalendarDays, PackageSearch, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useResource } from "@/lib/hooks/use-resource";
import { demoLostFound } from "@/lib/demo-data";
import { PageHeader, Modal, StatusBadge, EmptyState, DataWarning } from "@/components/ui";
import { ITEM_STATUSES, formatDate } from "@/lib/constants";
import type { ItemStatus, ItemType, LostFoundItem } from "@/lib/types";
import { uploadSchoolImage } from "@/lib/supabase/storage";

export default function LostFoundPage() {
  const { profile } = useAuth();
  const { items, error, create, update } = useResource("lost_found_items", demoLostFound);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ item_type: "ditemukan" as ItemType, item_name: "", category: "Perlengkapan pribadi", location: "", happened_on: new Date().toISOString().slice(0, 10), description: "" });
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const isAdmin = profile?.role === "admin";

  const visible = useMemo(() => items.filter((item) => (isAdmin || item.status !== "menunggu_verifikasi" || item.reporter_name === profile?.full_name)).filter((item) => {
    const match = `${item.item_name} ${item.category} ${item.location} ${item.item_code}`.toLowerCase().includes(query.toLowerCase());
    return match && (typeFilter === "all" || item.item_type === typeFilter) && (statusFilter === "all" || item.status === statusFilter);
  }), [items, query, typeFilter, statusFilter, isAdmin, profile?.full_name]);

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const code = `LF-${String(Date.now()).slice(-6)}`;
      const photo_path = photoFile ? await uploadSchoolImage(photoFile, profile?.school_id ?? "") : null;
      await create({ ...form, photo_path, item_code: code, status: "menunggu_verifikasi", reporter_name: profile?.full_name ?? "Pengguna", created_at: new Date().toISOString() } as Partial<LostFoundItem>);
      setPhotoFile(null); setModalOpen(false); setForm({ item_type: "ditemukan", item_name: "", category: "Perlengkapan pribadi", location: "", happened_on: new Date().toISOString().slice(0, 10), description: "" });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Data gagal disimpan."); }
    finally { setSaving(false); }
  }

  async function changeStatus(id: string, status: ItemStatus) {
    try { await update(id, { status }); } catch (error) { alert(error instanceof Error ? error.message : "Status gagal diperbarui."); }
  }

  return <>
    <PageHeader eyebrow="BARANG HILANG & TEMUAN" title="Lost and Found" description="Temukan barang yang tertinggal atau bantu mengembalikan barang kepada pemiliknya." action={<button className="button button-primary" onClick={() => { setMessage(""); setModalOpen(true); }}><Plus size={16}/> Buat laporan barang</button>}/>
    {error && <DataWarning message={error}/>}
    <div className="lostfound-banner"><div className="lostfound-banner-icon"><PackageSearch size={28}/></div><div><strong>Barang hilang atau menemukan barang?</strong><p>Buat laporan agar Admin Sarpras dapat membantu proses verifikasi dan pengembalian.</p></div><div className="lostfound-banner-side"><span><CheckCircle2 size={15}/> Data diverifikasi admin</span><span><AlertCircle size={15}/> Detail sensitif tidak dipublikasikan</span></div></div>
    <div className="table-toolbar standalone-toolbar"><div className="search-field"><Search size={17}/><input placeholder="Cari nama barang atau lokasi..." value={query} onChange={(e) => setQuery(e.target.value)}/></div><div className="filter-field"><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="all">Semua jenis</option><option value="hilang">Barang hilang</option><option value="ditemukan">Barang ditemukan</option></select></div><div className="filter-field"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">Semua status</option>{ITEM_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div></div>
    <div className="lostfound-grid">{visible.map((item) => <article className="lostfound-card" key={item.id}><div className={`lostfound-type ${item.item_type}`}>{item.item_type === "hilang" ? "BARANG HILANG" : "BARANG DITEMUKAN"}</div><div className="lostfound-card-icon"><PackageSearch size={28}/></div><div className="lostfound-card-main"><h3>{item.item_name}</h3><span>{item.category}</span></div><StatusBadge value={item.status}/><p>{item.description}</p><div className="lostfound-card-meta"><span><MapPin size={14}/>{item.location}</span><span><CalendarDays size={14}/>{formatDate(item.happened_on)}</span></div><div className="lostfound-card-footer"><small>Dilaporkan oleh {item.reporter_name}</small>{isAdmin ? <select className="inline-select" value={item.status} onChange={(e) => changeStatus(item.id, e.target.value as ItemStatus)}>{ITEM_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select> : <span className="muted-small">Hubungi Admin Sarpras untuk klaim</span>}</div></article>)}{!visible.length && <EmptyState title="Barang belum ditemukan" description="Coba ubah filter atau kata kunci pencarian."/>}</div>
    <Modal open={modalOpen} title="Laporkan barang" description="Isi data barang hilang atau barang yang ditemukan." onClose={() => setModalOpen(false)} wide><form className="form-grid" onSubmit={submitItem}><label>Jenis laporan<select value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value as ItemType })}><option value="ditemukan">Saya menemukan barang</option><option value="hilang">Saya kehilangan barang</option></select></label><label>Nama barang<input required placeholder="Contoh: Botol minum" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })}/></label><label>Kategori<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Perlengkapan pribadi</option><option>Alat tulis</option><option>Elektronik</option><option>Dokumen</option><option>Pakaian</option><option>Lainnya</option></select></label><label>Lokasi<input required placeholder="Lokasi ditemukan / terakhir terlihat" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}/></label><label>Tanggal<input type="date" required value={form.happened_on} onChange={(e) => setForm({ ...form, happened_on: e.target.value })}/></label><label className="span-2">Foto barang (opsional)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}/><small className="field-hint">JPG, PNG, atau WebP · Maksimal 5 MB. Foto tidak ditampilkan kepada publik secara otomatis.</small></label><label className="span-2">Deskripsi<textarea required rows={3} placeholder="Tuliskan ciri-ciri umum atau informasi yang membantu verifikasi..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label><div className="privacy-note span-2">Untuk keamanan, jangan menampilkan nomor identitas, alamat, atau ciri khusus barang secara lengkap pada deskripsi publik.</div>{message && <div className="form-error span-2">{message}</div>}<div className="form-actions span-2"><button type="button" className="button button-ghost" onClick={() => setModalOpen(false)}>Batal</button><button className="button button-primary" disabled={saving}>{saving ? "Mengirim..." : "Kirim laporan"}</button></div></form></Modal>
  </>;
}
