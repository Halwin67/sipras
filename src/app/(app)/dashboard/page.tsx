"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, ClipboardList, Package, Wrench, CalendarClock, Plus, CircleAlert } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, EmptyState, DataWarning } from "@/components/ui";
import { useAuth } from "@/components/providers/auth-provider";
import { useResource } from "@/lib/hooks/use-resource";
import { demoAssets, demoLoans, demoReports } from "@/lib/demo-data";
import { formatDate } from "@/lib/constants";

export default function DashboardPage() {
  const { profile } = useAuth();
  const assets = useResource("assets", demoAssets);
  const reports = useResource("reports", demoReports);
  const loans = useResource("loan_requests", demoLoans);
  const isAdmin = profile?.role === "admin";
  const issueCount = assets.items.filter((asset) => ["rusak_ringan", "rusak_berat", "tidak_berfungsi", "dalam_perbaikan", "hilang"].includes(asset.condition)).length;
  const pendingCount = reports.items.filter((item) => item.status === "menunggu_verifikasi" || item.status === "terverifikasi").length;
  const activeLoans = loans.items.filter((item) => item.status === "disetujui" || item.status === "dipinjam").length;
  const latestReports = [...reports.items].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4);

  return <>
    <PageHeader eyebrow="OVERVIEW" title={`Selamat datang, ${profile?.full_name.split(" ")[0] ?? "Pengguna"}`} description="Pantau kondisi sarana dan prasarana sekolah dari satu dashboard." action={<Link href="/laporan" className="button button-primary"><Plus size={16}/> Buat laporan</Link>}/>
    {[assets.error, reports.error, loans.error].filter(Boolean).map((error) => <DataWarning key={error} message={error as string}/>)}
    <div className="welcome-strip"><div><div className="welcome-label">WORKSPACE SEKOLAH</div><strong>Ringkasan sarana dan prasarana</strong><p>Informasi inventaris, kondisi fasilitas, dan aktivitas terbaru.</p></div><div className="welcome-art"><div className="art-building"><div/><div/><div/></div><span className="art-ring ring-one"/><span className="art-ring ring-two"/></div></div>
    <div className="stat-grid">
      <StatCard label="Total inventaris" value={assets.items.reduce((sum, item) => sum + item.quantity, 0)} note={`${assets.items.length} jenis barang terdata`} icon={<Package size={20}/>} tone="blue"/>
      <StatCard label="Barang bermasalah" value={issueCount} note="Perlu pemantauan" icon={<Wrench size={20}/>} tone="orange"/>
      <StatCard label={isAdmin ? "Laporan menunggu" : "Laporan dipantau"} value={pendingCount} note="Belum selesai ditangani" icon={<ClipboardList size={20}/>} tone="purple"/>
      <StatCard label="Peminjaman aktif" value={activeLoans} note="Barang atau ruangan" icon={<CalendarClock size={20}/>} tone="green"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel recent-panel"><div className="panel-heading"><div><h2>Laporan terbaru</h2><p>Aktivitas pelaporan fasilitas sekolah</p></div><Link href="/laporan" className="text-link">Lihat semua <ArrowUpRight size={15}/></Link></div>{latestReports.length ? <div className="recent-list">{latestReports.map((report) => <div className="recent-item" key={report.id}><div className={`recent-symbol ${report.priority}`}><CircleAlert size={18}/></div><div className="recent-main"><strong>{report.title}</strong><span>{report.location} · {report.reporter_name}</span></div><div className="recent-meta"><StatusBadge value={report.status}/><small>{formatDate(report.created_at)}</small></div></div>)}</div> : <EmptyState title="Belum ada laporan" description="Laporan fasilitas yang masuk akan muncul di sini."/>}</section>
      <section className="panel quick-panel"><div className="panel-heading"><div><h2>Akses cepat</h2><p>Menu yang sering digunakan</p></div></div><div className="quick-links"><Link href="/inventaris" className="quick-link"><span className="quick-icon blue"><Package size={18}/></span><span><strong>Lihat inventaris</strong><small>Periksa kondisi barang sekolah</small></span><ArrowRight size={16}/></Link><Link href="/lost-found" className="quick-link"><span className="quick-icon purple"><CircleAlert size={18}/></span><span><strong>Barang hilang & temuan</strong><small>Cari atau laporkan barang</small></span><ArrowRight size={16}/></Link><Link href="/peminjaman" className="quick-link"><span className="quick-icon green"><CalendarClock size={18}/></span><span><strong>Ajukan peminjaman</strong><small>Barang dan ruangan sekolah</small></span><ArrowRight size={16}/></Link></div><div className="quick-note"><div className="quick-note-icon"><ClipboardList size={17}/></div><div><strong>{isAdmin ? "Tips untuk Admin" : "Informasi"}</strong><p>{isAdmin ? "Pastikan status laporan diperbarui setelah proses penanganan selesai." : "Gunakan fitur laporan saat menemukan fasilitas sekolah yang rusak atau tidak berfungsi."}</p></div></div></section>
    </div>
    <div className="panel inventory-health"><div className="panel-heading"><div><h2>Kondisi inventaris</h2><p>Ringkasan berdasarkan data barang</p></div><Link href="/inventaris" className="text-link">Buka inventaris <ArrowUpRight size={15}/></Link></div><div className="health-bars">{[{ label: "Baik", value: assets.items.filter((a) => a.condition === "baik").length, color: "#20a477" }, { label: "Rusak ringan", value: assets.items.filter((a) => a.condition === "rusak_ringan").length, color: "#e8a43c" }, { label: "Rusak berat / tidak berfungsi", value: assets.items.filter((a) => ["rusak_berat", "tidak_berfungsi"].includes(a.condition)).length, color: "#df6969" }, { label: "Dalam perbaikan", value: assets.items.filter((a) => a.condition === "dalam_perbaikan").length, color: "#6687df" }].map((item) => <div className="health-row" key={item.label}><div className="health-label"><span><i style={{ background: item.color }}/>{item.label}</span><strong>{item.value}</strong></div><div className="health-track"><span style={{ width: `${assets.items.length ? Math.max(4, item.value / assets.items.length * 100) : 0}%`, background: item.color }}/></div></div>)}</div></div>
  </>;
}
