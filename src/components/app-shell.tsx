"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, Building2, CalendarDays, ClipboardList, DoorOpen, LayoutDashboard, LogOut, Menu, Package, Search, Settings, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { SCHOOL_NAME } from "@/lib/constants";
import { DemoNotice } from "@/components/ui";

const userNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventaris", label: "Inventaris sekolah", icon: Package },
  { href: "/laporan", label: "Laporan fasilitas", icon: ClipboardList },
  { href: "/lost-found", label: "Lost and Found", icon: Search },
  { href: "/peminjaman", label: "Peminjaman", icon: CalendarDays },
  { href: "/ruangan", label: "Ruangan", icon: DoorOpen },
];
const adminNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventaris", label: "Manajemen inventaris", icon: Package },
  { href: "/laporan", label: "Manajemen laporan", icon: ClipboardList },
  { href: "/lost-found", label: "Lost and Found", icon: Search },
  { href: "/peminjaman", label: "Manajemen peminjaman", icon: CalendarDays },
  { href: "/ruangan", label: "Manajemen ruangan", icon: DoorOpen },
  { href: "/pengaturan", label: "Pengaturan sekolah", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, loading, demoMode, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = profile?.role === "admin";

  useEffect(() => { if (!loading && !profile) router.replace("/login"); }, [loading, profile, router]);
  const navigation = isAdmin ? adminNavigation : userNavigation;

  if (loading || !profile) return <div className="auth-loading"><div className="loading-spinner"/><span>Memeriksa sesi pengguna...</span></div>;

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return <div className="app-frame">
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Tutup menu"/>}
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Building2 size={22}/></div><div><strong>SIPRAS<span>.</span></strong><small>Facility Management</small></div><button className="mobile-close icon-button" onClick={() => setMobileOpen(false)} aria-label="Tutup menu"><X size={18}/></button></div>
      <div className="school-switcher"><div className="school-avatar">SN</div><div><strong>{demoMode ? SCHOOL_NAME : "Sekolah Anda"}</strong><small>Workspace sekolah</small></div><span className="switch-dot"/></div>
      <div className="nav-caption">MENU UTAMA</div>
      <nav className="side-nav">{navigation.map((item) => { const Icon = item.icon; const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)); return <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`} onClick={() => setMobileOpen(false)}><Icon size={18}/><span>{item.label}</span>{item.href === "/laporan" && isAdmin && <b className="nav-count">3</b>}</Link>; })}</nav>
      {isAdmin && <div className="sidebar-tip"><div className="tip-icon"><ShieldCheck size={17}/></div><strong>Admin Sarpras</strong><p>Kelola data fasilitas sekolah dalam satu tempat.</p></div>}
      <div className="sidebar-bottom"><div className="profile-row"><div className="profile-avatar">{profile.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div className="profile-info"><strong>{profile.full_name}</strong><small>{isAdmin ? "Admin Sarpras" : "Warga Sekolah"}</small></div><button className="logout-button" onClick={handleSignOut} title="Keluar"><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setMobileOpen(true)} aria-label="Buka menu"><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{navigation.find((item) => item.href === pathname)?.label ?? "SIPRAS"}</strong></div></div><div className="topbar-right"><span className="topbar-school">{demoMode ? "DEMO WORKSPACE" : "LIVE WORKSPACE"}</span><button className="notification-button" title="Notifikasi"><Bell size={18}/><i/></button><div className="topbar-avatar">{profile.full_name[0]}</div></div></header>
      <div className="content-wrap">{demoMode && <DemoNotice/>}{children}<footer className="app-footer"><span>© {new Date().getFullYear()} SIPRAS Online</span><span>School Facility Management System</span></footer></div>
    </main>
  </div>;
}
