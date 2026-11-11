"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search, CalendarDays, Clock3, Package, DoorOpen, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useResource } from "@/lib/hooks/use-resource";
import { demoLoans } from "@/lib/demo-data";
import { PageHeader, Modal, StatusBadge, EmptyState, DataWarning } from "@/components/ui";
import { LOAN_STATUSES, formatDate } from "@/lib/constants";
import type { LoanRequest, LoanStatus } from "@/lib/types";

export default function PeminjamanPage() {
  const { profile } = useAuth();
  const { items, error, create, update } = useResource("loan_requests", demoLoans);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ request_type: "barang" as LoanRequest["request_type"], item_name: "", purpose: "", borrow_date: "", return_date: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const isAdmin = profile?.role === "admin";

  const visible = useMemo(() => items.filter((item) => (isAdmin || item.borrower_name === profile?.full_name)).filter((item) => `${item.request_code} ${item.item_name} ${item.borrower_name} ${item.purpose}`.toLowerCase().includes(query.toLowerCase()) && (statusFilter === "all" || item.status === statusFilter)), [items, query, statusFilter, isAdmin, profile?.full_name]);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    if (form.return_date < form.borrow_date) { setMessage("Tanggal pengembalian tidak boleh lebih awal dari tanggal peminjaman."); setSaving(false); return; }
    try {
      const code = `PIN-${String(Date.now()).slice(-6)}`;
      await create({ ...form, request_code: code, borrower_name: profile?.full_name ?? "Pengguna", status: "menunggu", created_at: new Date().toISOString() } as Partial<LoanRequest>);
      setModalOpen(false); setForm({ request_type: "barang", item_name: "", purpose: "", borrow_date: "", return_date: "" });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Pengajuan gagal dikirim."); }
    finally { setSaving(false); }
  }

  async function changeStatus(id: string, status: LoanStatus) {
    try { await update(id, { status }); } catch (error) { alert(error instanceof Error ? error.message : "Status gagal diperbarui."); }
  }

  return <>
    <PageHeader eyebrow="PEMINJAMAN FASILITAS" title={isAdmin ? "Manajemen peminjaman" : "Peminjaman"} description={isAdmin ? "Tinjau permintaan peminjaman barang dan ruangan dari warga sekolah." : "Ajukan peminjaman barang atau ruangan sekolah dan pantau persetujuannya."} action={<button className="button button-primary" onClick={() => { setMessage(""); setModalOpen(true); }}><Plus size={16}/> Ajukan peminjaman</button>}/>
    {error && <DataWarning message={error}/>}
    <div className="loan-info-strip"><div className="loan-info-icon"><CalendarDays size={22}/></div><div><strong>Pengajuan peminjaman terpusat</strong><p>Pastikan tujuan, jadwal, dan waktu pengembalian diisi dengan benar. Pengajuan akan diperiksa Admin Sarpras.</p></div><div className="loan-mini-stat"><strong>{items.filter((item) => item.status === "menunggu").length}</strong><span>Menunggu persetujuan</span></div></div>
    <section className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={17}/><input placeholder="Cari kode, barang, peminjam..." value={query} onChange={(e) => setQuery(e.target.value)}/></div><div className="filter-field"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">Semua status</option>{LOAN_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div></div>
      <div className="table-wrap"><table><thead><tr><th>Pengajuan</th><th>Jenis</th><th>Peminjam</th><th>Jadwal</th><th>Status</th>{isAdmin && <th>Kelola status</th>}</tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td><div className="table-primary"><span className="table-product-icon">{item.request_type === "barang" ? <Package size={17}/> : <DoorOpen size={17}/>}</span><span><strong>{item.item_name}</strong><small>{item.request_code} · {item.purpose}</small></span></div></td><td>{item.request_type === "barang" ? "Barang" : "Ruangan"}</td><td>{item.borrower_name}</td><td><div className="date-range"><strong>{formatDate(item.borrow_date)}</strong><span><Clock3 size={12}/> sampai {formatDate(item.return_date)}</span></div></td><td><StatusBadge value={item.status}/></td>{isAdmin && <td><select className="inline-select" value={item.status} onChange={(e) => changeStatus(item.id, e.target.value as LoanStatus)}>{LOAN_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></td>}</tr>)}</tbody></table>{!visible.length && <EmptyState title="Belum ada pengajuan" description="Pengajuan peminjaman yang sesuai filter akan tampil di sini."/>}</div><div className="table-footer"><span>{visible.length} pengajuan ditampilkan</span><span><CheckCircle2 size={13}/> Status diperbarui oleh Admin Sarpras</span></div></section>
    <Modal open={modalOpen} title="Ajukan peminjaman" description="Lengkapi detail barang atau ruangan yang akan digunakan." onClose={() => setModalOpen(false)} wide><form className="form-grid" onSubmit={submitRequest}><label>Jenis peminjaman<select value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value as LoanRequest["request_type"] })}><option value="barang">Peminjaman barang</option><option value="ruangan">Peminjaman ruangan</option></select></label><label>Nama barang / ruangan<input required placeholder={form.request_type === "barang" ? "Contoh: Kamera DSLR" : "Contoh: Aula"} value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })}/></label><label>Tanggal peminjaman<input type="date" required value={form.borrow_date} onChange={(e) => setForm({ ...form, borrow_date: e.target.value })}/></label><label>Tanggal pengembalian<input type="date" required min={form.borrow_date || undefined} value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })}/></label><label className="span-2">Tujuan peminjaman<textarea rows={3} required placeholder="Jelaskan kegiatan atau keperluan peminjaman..." value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}/></label>{message && <div className="form-error span-2">{message}</div>}<div className="form-actions span-2"><button type="button" className="button button-ghost" onClick={() => setModalOpen(false)}>Batal</button><button className="button button-primary" disabled={saving}>{saving ? "Mengirim..." : "Kirim pengajuan"}</button></div></form></Modal>
  </>;
}
