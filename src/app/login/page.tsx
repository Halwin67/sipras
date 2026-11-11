"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, LockKeyhole, Mail, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { profile, loading, demoMode, signIn, signInDemoWithCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!loading && profile) router.replace("/dashboard"); }, [loading, profile, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const result = demoMode
      ? await signInDemoWithCredentials(email, password)
      : await signIn(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
    else router.replace("/dashboard");
  }


  return <main className="login-page"><div className="login-visual"><div className="login-visual-grid"/><div className="login-brand"><div className="brand-mark light"><Building2 size={22}/></div><div><strong>SIPRAS<span>.</span></strong><small>School Facility Management</small></div></div><div className="login-visual-content"><div className="visual-kicker"><span/> DIGITAL FACILITY MANAGEMENT</div><h1>Kelola fasilitas sekolah, <em>lebih terarah.</em></h1><p>Seluruh informasi sarana, laporan kerusakan, barang temuan, dan peminjaman dalam satu platform.</p><div className="visual-points"><div><ShieldCheck size={17}/> Data terorganisasi</div><div><Users size={17}/> Kolaborasi warga sekolah</div><div><Building2 size={17}/> Monitoring fasilitas</div></div></div><div className="login-visual-footer">Satu platform untuk lingkungan sekolah yang lebih tertata.</div></div><div className="login-panel"><div className="login-panel-inner"><div className="mobile-login-brand"><div className="brand-mark"><Building2 size={20}/></div><strong>SIPRAS<span>.</span></strong></div><div className="login-heading"><div className="eyebrow">SELAMAT DATANG</div><h2>Masuk ke SIPRAS</h2><p>Gunakan akun sekolah untuk melanjutkan ke workspace.</p></div>
      {demoMode && <div className="demo-callout"><span className="demo-dot"/>Mode demo aktif <small>Supabase belum dikonfigurasi · gunakan akun contoh di bawah</small></div>}
      <form className="login-form" onSubmit={handleSubmit}>
        <label>Email sekolah<div className="input-with-icon"><Mail size={17}/><input type="email" placeholder={demoMode ? "admin@sipras.local" : "nama@sekolah.sch.id"} value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username"/></div></label>
        <label>Password<div className="input-with-icon"><LockKeyhole size={17}/><input type="password" placeholder="Masukkan password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password"/></div></label>
        {error && <div className="form-error">{error}</div>}
        <button className="button button-primary login-submit" disabled={submitting}>{submitting ? "Memproses..." : "Masuk ke dashboard"}<ArrowRight size={17}/></button>
        {demoMode ? <div className="demo-login"><p className="demo-title">Akun demo SIPRAS</p>
          <button type="button" className="role-login-card" onClick={() => { setEmail("admin@sipras.local"); setPassword("AdminSipras#2026"); setError(""); }}><span className="role-icon admin"><ShieldCheck size={20}/></span><span><strong>Admin Sarpras</strong><small>admin@sipras.local · AdminSipras#2026</small></span><ArrowRight size={18}/></button>
          <button type="button" className="role-login-card" onClick={() => { setEmail("warga@sipras.local"); setPassword("WargaSipras#2026"); setError(""); }}><span className="role-icon user"><Users size={20}/></span><span><strong>Warga Sekolah</strong><small>warga@sipras.local · WargaSipras#2026</small></span><ArrowRight size={18}/></button>
          <div className="demo-footnote">Akun ini hanya untuk demo lokal. Data disimpan di browser dan bukan akun sekolah sungguhan.</div>
        </div> : <p className="login-help">Akun dibuat oleh Admin Sarpras. Hubungi pengelola sekolah jika belum memiliki akses.</p>}
      </form>
      <div className="login-bottom"><span>© {new Date().getFullYear()} SIPRAS Online</span><span>Secure school workspace</span></div></div></div></main>;
}
