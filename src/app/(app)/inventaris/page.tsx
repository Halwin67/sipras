"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Search, SlidersHorizontal, Package, QrCode, MapPin, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useResource } from "@/lib/hooks/use-resource";
import { demoAssets } from "@/lib/demo-data";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader, Modal, StatusBadge, EmptyState, DataWarning } from "@/components/ui";
import { ASSET_CONDITIONS, ASSET_AVAILABILITIES } from "@/lib/constants";
import type { Asset, AssetCondition, AssetAvailability } from "@/lib/types";
import { uploadSchoolImage } from "@/lib/supabase/storage";

const blankForm = { asset_code: "", name: "", category: "Elektronik", location: "", quantity: "1", condition: "baik" as AssetCondition, availability: "tersedia" as AssetAvailability, description: "" };

export default function InventarisPage() {
  const { profile } = useAuth();
  const { items, loading, error, create, update, remove } = useResource("assets", demoAssets);
  const [query, setQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    const assetId = new URLSearchParams(window.location.search).get("asset");
    if (!assetId) return;
    const matched = items.find((item) => item.id === assetId);
    if (matched) setQuery(matched.name);
  }, [items]);

  const filtered = useMemo(() => items.filter((item) => {
    const matchText = `${item.asset_code} ${item.name} ${item.category} ${item.location}`.toLowerCase().includes(query.toLowerCase());
    const matchCondition = conditionFilter === "all" || item.condition === conditionFilter;
    return matchText && matchCondition;
  }), [items, query, conditionFilter]);

  function openCreate() {
    setForm({ ...blankForm, asset_code: `INV-${String(items.length + 1).padStart(3, "0")}` });
    setMessage(""); setModalOpen(true);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const photo_path = photoFile ? await uploadSchoolImage(photoFile, profile?.school_id ?? "") : null;
      await create({ ...form, quantity: Number(form.quantity), photo_path } as Partial<Asset>);
      setPhotoFile(null);
      setModalOpen(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal menyimpan data."); }
    finally { setSaving(false); }
  }

  async function handleConditionChange(id: string, condition: AssetCondition) {
    try { await update(id, { condition, availability: condition === "baik" ? "tersedia" : "tidak_tersedia" }); }
    catch (error) { alert(error instanceof Error ? error.message : "Gagal memperbarui kondisi."); }
  }

  async function handleDelete(item: Asset) {
    if (!confirm(`Hapus data ${item.name}?`)) return;
    try { await remove(item.id); } catch (error) { alert(error instanceof Error ? error.message : "Gagal menghapus data."); }
  }

  return <>
    <PageHeader eyebrow="DATA SEKOLAH" title="Inventaris sekolah" description="Lihat dan kelola daftar barang beserta kondisi dan lokasi penyimpanannya." action={isAdmin ? <button className="button button-primary" onClick={openCreate}><Plus size={16}/> Tambah inventaris</button> : undefined}/>
    {error && <DataWarning message={error}/>}
    <div className="inventory-summary"><div><span>Total item terdata</span><strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div><div><span>Jenis inventaris</span><strong>{items.length}</strong></div><div><span>Perlu perhatian</span><strong className="text-danger">{items.filter((item) => item.condition !== "baik").length}</strong></div><div><span>Lokasi tercatat</span><strong>{new Set(items.map((item) => item.location)).size}</strong></div></div>
    <section className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={17}/><input placeholder="Cari nama, kode, kategori, lokasi..." value={query} onChange={(event) => setQuery(event.target.value)}/></div><div className="filter-field"><SlidersHorizontal size={16}/><select value={conditionFilter} onChange={(event) => setConditionFilter(event.target.value)}><option value="all">Semua kondisi</option>{ASSET_CONDITIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div></div>
      <div className="table-wrap"><table><thead><tr><th>Barang</th><th>Kategori</th><th>Lokasi</th><th>Jumlah</th><th>Kondisi</th><th>Status</th>{isAdmin && <th>Aksi</th>}</tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><div className="table-primary"><span className="table-product-icon"><Package size={17}/></span><span><strong>{item.name}</strong><small>{item.asset_code}</small></span></div></td><td>{item.category}</td><td><span className="location-cell"><MapPin size={14}/>{item.location}</span></td><td><strong>{item.quantity}</strong></td><td>{isAdmin ? <select className="inline-select" value={item.condition} onChange={(event) => handleConditionChange(item.id, event.target.value as AssetCondition)}>{ASSET_CONDITIONS.map((condition) => <option value={condition.value} key={condition.value}>{condition.label}</option>)}</select> : <StatusBadge value={item.condition}/>}</td><td><StatusBadge value={item.availability}/></td>{isAdmin && <td><div className="table-actions"><button className="icon-button" title="Lihat QR Code" onClick={() => setQrAsset(item)}><QrCode size={16}/></button><button className="icon-button danger-icon" title="Hapus" onClick={() => handleDelete(item)}><Trash2 size={16}/></button></div></td>}</tr>)}</tbody></table>{!filtered.length && <EmptyState title="Inventaris tidak ditemukan" description="Coba ubah kata kunci atau filter kondisi."/>}</div>
      <div className="table-footer"><span>Menampilkan {filtered.length} dari {items.length} data</span><span>{loading ? "Memuat data..." : "Data terbaru"}</span></div>
    </section>
    <Modal open={modalOpen} title="Tambah inventaris" description="Masukkan informasi barang yang akan dicatat." onClose={() => setModalOpen(false)} wide><form className="form-grid" onSubmit={handleCreate}><label>Kode inventaris<input required value={form.asset_code} onChange={(e) => setForm({ ...form, asset_code: e.target.value })}/></label><label>Nama barang<input required placeholder="Contoh: Proyektor Epson" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></label><label>Kategori<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Elektronik</option><option>Komputer</option><option>Mebel</option><option>Audio</option><option>Peralatan praktik</option><option>Perangkat kantor</option><option>Lainnya</option></select></label><label>Lokasi<input required placeholder="Contoh: Lab RPL" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}/></label><label>Jumlah<input type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}/></label><label>Kondisi<select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as AssetCondition })}>{ASSET_CONDITIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Status penggunaan<select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value as AssetAvailability })}>{ASSET_AVAILABILITIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="span-2">Foto barang (opsional)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}/><small className="field-hint">JPG, PNG, atau WebP · Maksimal 5 MB</small></label><label className="span-2">Deskripsi<textarea rows={3} placeholder="Keterangan tambahan (opsional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label>{message && <div className="form-error span-2">{message}</div>}<div className="form-actions span-2"><button type="button" className="button button-ghost" onClick={() => setModalOpen(false)}>Batal</button><button className="button button-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan inventaris"}</button></div></form></Modal>
    <Modal open={Boolean(qrAsset)} title="QR Code inventaris" description={qrAsset ? `${qrAsset.asset_code} · ${qrAsset.name}` : undefined} onClose={() => setQrAsset(null)}><div className="qr-content">{qrAsset && <><div className="qr-canvas"><QRCodeSVG value={`${typeof window !== "undefined" ? window.location.origin : "https://sipras.local"}/inventaris?asset=${qrAsset.id}`} size={190} level="M" includeMargin/></div><p>QR ini dapat ditempel pada barang. Setelah dipindai, pengguna diarahkan ke daftar inventaris dengan identitas barang terkait.</p><button className="button button-secondary" onClick={() => window.print()}><QrCode size={16}/> Cetak QR Code</button></>}</div></Modal>
  </>;
}
