"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow ?? "SIPRAS ONLINE"}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="page-actions">{action}</div>}</div>;
}

export function StatCard({ label, value, note, icon, tone = "blue" }: { label: string; value: string | number; note?: string; icon: ReactNode; tone?: "blue" | "green" | "orange" | "purple" }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div></div>;
}

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  const key = value.toLowerCase();
  let tone = "neutral";
  if (["baik", "tersedia", "selesai", "dikembalikan", "dipublikasikan", "disetujui", "terverifikasi"].includes(key)) tone = "success";
  else if (["rusak_ringan", "dalam_perbaikan", "menunggu", "menunggu_verifikasi", "terlambat"].includes(key)) tone = "warning";
  else if (["rusak_berat", "tidak_berfungsi", "hilang", "ditolak", "darurat"].includes(key)) tone = "danger";
  else if (["dalam_penanganan", "dipinjam", "diklaim", "digunakan"].includes(key)) tone = "info";
  const text = label ?? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return <span className={`status-badge ${tone}`}><i />{text}</span>;
}

export function Modal({ open, title, description, onClose, children, wide = false }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const handle = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Tutup"><X size={18}/></button></div>{children}</div></div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><div className="empty-icon">⌕</div><strong>{title}</strong><p>{description}</p></div>;
}

export function DemoNotice() {
  return <div className="demo-notice"><span className="demo-dot"/> Mode demo aktif · Data contoh tersimpan di browser ini</div>;
}

export function DataWarning({ message }: { message: string }) {
  return <div className="data-warning"><strong>Data belum berhasil dimuat.</strong><span>{message}</span></div>;
}
