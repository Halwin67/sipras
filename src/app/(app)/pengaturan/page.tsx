"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Database, ShieldCheck, Info, ExternalLink, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { useAuth } from "@/components/providers/auth-provider";

export default function PengaturanPage() {
  const { profile, demoMode } = useAuth();
  const router = useRouter();
  const isAdmin = profile?.role === "admin";
  useEffect(() => { if (profile && !isAdmin) router.replace("/dashboard"); }, [profile, isAdmin, router]);
  if (!isAdmin) return null;
  return <>
    <PageHeader eyebrow="ADMINISTRASI" title="Pengaturan sekolah" description="Informasi workspace dan konfigurasi layanan SIPRAS Online."/>
    <div className="settings-grid"><section className="panel settings-panel"><div className="settings-heading"><span className="settings-icon"><Building2 size={20}/></span><div><h2>Identitas sekolah</h2><p>Informasi organisasi yang menggunakan SIPRAS Online.</p></div></div><div className="settings-field"><span>Nama workspace</span><strong>{demoMode ? "SMK Nusantara Digital" : "Sekolah Anda"}</strong></div><div className="settings-field"><span>Admin aktif</span><strong>{profile?.full_name}</strong></div><div className="settings-field"><span>Email akun</span><strong>{profile?.email ?? "—"}</strong></div><div className="settings-field"><span>Peran akun</span><strong>Admin Sarpras</strong></div></section><section className="panel settings-panel"><div className="settings-heading"><span className="settings-icon green"><Database size={20}/></span><div><h2>Status database</h2><p>Informasi koneksi layanan backend.</p></div></div><div className="connection-status"><span className={`connection-dot ${demoMode ? "warning" : "success"}`}/><div><strong>{demoMode ? "Mode demo lokal" : "Supabase terhubung"}</strong><p>{demoMode ? "Data tersimpan pada browser ini. Hubungkan project Supabase untuk penggunaan nyata." : "Aplikasi menggunakan project Supabase yang dikonfigurasi."}</p></div></div><div className="settings-divider"/><div className="settings-field"><span>Authentication</span><strong>{demoMode ? "Demo role" : "Supabase Auth"}</strong></div><div className="settings-field"><span>Database</span><strong>{demoMode ? "LocalStorage" : "PostgreSQL"}</strong></div><div className="settings-field"><span>Row Level Security</span><strong>{demoMode ? "Belum aktif" : "Dikelola melalui Supabase"}</strong></div></section><section className="panel settings-panel full-span"><div className="settings-heading"><span className="settings-icon purple"><ShieldCheck size={20}/></span><div><h2>Keamanan dan akses</h2><p>Prinsip pengamanan data yang digunakan SIPRAS Online.</p></div></div><div className="security-list"><div><CheckCircle2 size={17}/><span><strong>Pemisahan data sekolah</strong><small>Data setiap sekolah dibatasi menggunakan school_id dan kebijakan RLS.</small></span></div><div><CheckCircle2 size={17}/><span><strong>Pembagian hak akses</strong><small>Warga Sekolah dan Admin Sarpras memiliki izin yang berbeda.</small></span></div><div><CheckCircle2 size={17}/><span><strong>Secret key tidak di browser</strong><small>Gunakan publishable key pada client dan jangan mengekspos service_role key.</small></span></div></div></section></div>
    <div className="settings-info"><Info size={17}/><span>Pengelolaan akun dan penambahan sekolah dilakukan melalui Supabase pada tahap MVP. Fitur manajemen paket SaaS dan multi-sekolah lanjutan disiapkan pada fase komersialisasi.</span><a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase Dashboard <ExternalLink size={13}/></a></div>
  </>;
}
