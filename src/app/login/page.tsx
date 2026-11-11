"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, LockKeyhole, Mail, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { profile, loading, demoMode, signIn, signInDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!loading && profile) router.replace("/dashboard"); }, [loading, profile, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
    else router.replace("/dashboard");
  }

  function handleDemo(role: "admin" | "warga_sekolah") {
    signInDemo(role);
    router.replace("/dashboard");
  }

  return <main className="login-page"><div className="login-visual"><div className="login-visual-grid"/><div className="login-brand"><div className="brand-mark light"><Building2 size={22}/></div><div><strong>SIPRAS<span>.</span></strong><small>School Facility Management</small></div></div><div className="login-visual-content"><div className="visual-kicker"><span/> DIGITAL FACILITY MANAGEMENT</div><h1>Kelola fasilitas sekolah, <em>lebih terarah.</em></h1><p>Seluruh informasi sarana, laporan kerusakan, barang temuan, dan peminjaman dalam satu platform.</p><div className="visual-points"><div><ShieldCheck size={17}/> Data terorganisasi</div><div><Users size={17}/> Kolaborasi warga sekolah</div><div><Building2 size={17}/> Monitoring fasilitas</div></div></div><div className="login-visual-footer">Satu platform untuk lingkungan sekolah yang lebih tertata.</div></div><div className="login-panel"><div className="login-panel-inner"><div className="mobile-login-brand"><div className="brand-mark"><Building2 size={20}/></div><strong>SIPRAS<span>.</span></strong></div><div className="login-heading"><div className="eyebrow">SELAMAT DATANG</div><h2>Masuk ke SIPRAS</h2><p>Gunakan akun sekolah untuk melanjutkan ke workspace.</p></div>
      {demoMode ? <div className="demo-login"><div className="demo-callout"><span className="demo-dot"/>Mode demo aktif <small>Supabase belum dikonfigurasi</small></div><p className="demo-title">Pilih peran untuk mencoba aplikasi</p><button className="role-login-card" onClick={() => handleDemo("admin")}><span className="role-icon admin"><ShieldCheck size={20}/></span><span><strong>Masuk sebagai Admin Sarpras</strong><small>Kelola inventaris, laporan, dan peminjaman</small></span><ArrowRight size={18}/></button><button className="role-login-card" onClick={() => handleDemo("warga_sekolah")}><span className="role-icon user"><Users size={20}/></span><span><strong>Masuk sebagai Warga Sekolah</strong><small>Lihat inventaris dan kirim pengajuan</small></span><ArrowRight size={18}/></button><div className="demo-footnote">Data contoh disimpan di browser lokal dan bukan data sekolah sebenarnya.</div></div> : <form className="login-form" onSubmit={handleSubmit}><label>Email sekolah<div className="input-with-icon"><Mail size={17}/><input type="email" placeholder="nama@sekolah.sch.id" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username"/></div></label><label>Password<div className="input-with-icon"><LockKeyhole size={17}/><input type="password" placeholder="Masukkan password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password"/></div></label>{error && <div className="form-error">{error}</div>}<button className="button button-primary login-submit" disabled={submitting}>{submitting ? "Memproses..." : "Masuk ke dashboard"}<ArrowRight size={17}/></button><p className="login-help">Akun dibuat oleh Admin Sarpras. Hubungi pengelola sekolah jika belum memiliki akses.</p></form>}
      <div className="login-bottom"><span>© {new Date().getFullYear()} SIPRAS Online</span><span>Secure school workspace</span></div></div></div></main>;
}
