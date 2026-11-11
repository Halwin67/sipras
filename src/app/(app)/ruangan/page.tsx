"use client";

import { useState, type FormEvent } from "react";
import { Plus, DoorOpen, Users, MapPin, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useResource } from "@/lib/hooks/use-resource";
import { demoRooms } from "@/lib/demo-data";
import { PageHeader, Modal, StatusBadge, EmptyState, DataWarning } from "@/components/ui";
import type { SchoolRoom } from "@/lib/types";

export default function RuanganPage() {
  const { profile } = useAuth();
  const { items, error, create, update } = useResource("rooms", demoRooms);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ room_code: "", name: "", building: "", capacity: "30", room_type: "Ruang kelas", availability: "tersedia" as SchoolRoom["availability"] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const isAdmin = profile?.role === "admin";

  async function submitRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      await create({ ...form, capacity: Number(form.capacity) } as Partial<SchoolRoom>);
      setModalOpen(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Data ruangan gagal disimpan."); }
    finally { setSaving(false); }
  }

  async function changeAvailability(id: string, availability: SchoolRoom["availability"]) {
    try { await update(id, { availability }); } catch (error) { alert(error instanceof Error ? error.message : "Gagal memperbarui ruangan."); }
  }

  return <>
    <PageHeader eyebrow="FASILITAS SEKOLAH" title="Data ruangan" description="Lihat lokasi, kapasitas, dan ketersediaan ruangan sekolah." action={isAdmin ? <button className="button button-primary" onClick={() => { setMessage(""); setForm({ room_code: `R-${String(items.length + 1).padStart(3, "0")}`, name: "", building: "", capacity: "30", room_type: "Ruang kelas", availability: "tersedia" }); setModalOpen(true); }}><Plus size={16}/> Tambah ruangan</button> : undefined}/>
    {error && <DataWarning message={error}/>}
    <div className="room-stats"><div><strong>{items.length}</strong><span>Total ruangan</span></div><div><strong>{items.filter((room) => room.availability === "tersedia").length}</strong><span>Tersedia</span></div><div><strong>{items.filter((room) => room.availability === "digunakan").length}</strong><span>Sedang digunakan</span></div><div><strong>{items.filter((room) => room.availability === "perawatan").length}</strong><span>Dalam perawatan</span></div></div>
    <div className="room-grid">{items.map((room) => <article className="room-card" key={room.id}><div className="room-card-head"><span className="room-symbol"><DoorOpen size={21}/></span><StatusBadge value={room.availability}/></div><div className="room-code">{room.room_code}</div><h3>{room.name}</h3><p>{room.room_type}</p><div className="room-details"><span><MapPin size={14}/>{room.building}</span><span><Users size={14}/>Kapasitas {room.capacity} orang</span></div><div className="room-card-footer">{isAdmin ? <select className="inline-select" value={room.availability} onChange={(e) => changeAvailability(room.id, e.target.value as SchoolRoom["availability"])}><option value="tersedia">Tersedia</option><option value="digunakan">Digunakan</option><option value="perawatan">Perawatan</option></select> : <Link className="text-link" href="/peminjaman">Ajukan peminjaman <CalendarPlus size={15}/></Link>}</div></article>)}{!items.length && <EmptyState title="Belum ada data ruangan" description="Admin Sarpras dapat menambahkan data ruangan sekolah."/>}</div>
    <Modal open={modalOpen} title="Tambah ruangan" description="Masukkan data ruangan yang dikelola sekolah." onClose={() => setModalOpen(false)}><form className="form-grid" onSubmit={submitRoom}><label>Kode ruangan<input required value={form.room_code} onChange={(e) => setForm({ ...form, room_code: e.target.value })}/></label><label>Nama ruangan<input required placeholder="Contoh: Lab RPL" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></label><label>Gedung / lokasi<input required placeholder="Contoh: Gedung A · Lantai 2" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })}/></label><label>Kapasitas<input type="number" min="1" required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}/></label><label>Jenis ruangan<select value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })}><option>Ruang kelas</option><option>Laboratorium</option><option>Aula</option><option>Ruang khusus</option><option>Perpustakaan</option><option>Ruang rapat</option></select></label><label>Ketersediaan<select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value as SchoolRoom["availability"] })}><option value="tersedia">Tersedia</option><option value="digunakan">Digunakan</option><option value="perawatan">Perawatan</option></select></label>{message && <div className="form-error span-2">{message}</div>}<div className="form-actions span-2"><button type="button" className="button button-ghost" onClick={() => setModalOpen(false)}>Batal</button><button className="button button-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan ruangan"}</button></div></form></Modal>
  </>;
}
