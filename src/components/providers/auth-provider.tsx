"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Profile, UserRole } from "@/lib/types";
import { getBrowserClientOrNull } from "@/lib/supabase/client";

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  demoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInDemo: (role: UserRole) => void;
  signInDemoWithCredentials: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_KEY = "sipras_demo_profile";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => getBrowserClientOrNull(), []);
  const demoMode = !supabase;

  const loadProfile = useCallback(async (userId: string, email?: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from("profiles").select("id, school_id, full_name, role, class_or_department").eq("id", userId).single();
    if (error || !data) return null;
    return { ...data, email } as Profile;
  }, [supabase]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function initialise() {
      if (!supabase) {
        try {
          const saved = localStorage.getItem(DEMO_KEY);
          if (saved && active) setProfile(JSON.parse(saved) as Profile);
        } catch {
          localStorage.removeItem(DEMO_KEY);
        }
        if (active) setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user && active) setProfile(await loadProfile(user.id, user.email));
      if (active) setLoading(false);

      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!active) return;
        if (!session?.user) {
          setProfile(null);
          return;
        }
        const nextProfile = await loadProfile(session.user.id, session.user.email);
        if (active) setProfile(nextProfile);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    }

    void initialise();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [supabase, loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: "Mode demo aktif. Gunakan tombol masuk demo." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const nextProfile = await loadProfile(user.id, user.email);
      if (!nextProfile) {
        await supabase.auth.signOut();
        return { error: "Profil akun belum terdaftar. Hubungi Admin Sarpras." };
      }
      setProfile(nextProfile);
    }
    return {};
  }, [supabase, loadProfile]);

  const signInDemo = useCallback((role: UserRole) => {
    const nextProfile: Profile = {
      id: role === "admin" ? "demo-admin" : "demo-warga",
      school_id: "demo-school",
      full_name: role === "admin" ? "Admin Sarpras" : "Nadia Putri",
      email: role === "admin" ? "admin@demo.sipras.local" : "warga@demo.sipras.local",
      role,
      class_or_department: role === "admin" ? "Pengelola Sarpras" : "XI RPL 1",
    };
    localStorage.setItem(DEMO_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
  }, []);

  // Demo-only credentials. These are intentionally local and must never be used
  // as production credentials. Production accounts are managed by Supabase Auth.
  const signInDemoWithCredentials = useCallback(async (email: string, password: string) => {
    if (supabase) return { error: "Akun demo hanya tersedia saat Supabase belum dikonfigurasi." };
    const normalizedEmail = email.trim().toLowerCase();
    const demoAccounts = [
      { email: "admin@sipras.local", password: "AdminSipras#2026", role: "admin" as const },
      { email: "warga@sipras.local", password: "WargaSipras#2026", role: "warga_sekolah" as const },
    ];
    const matched = demoAccounts.find((account) => account.email === normalizedEmail && account.password === password);
    if (!matched) return { error: "Email atau password demo tidak sesuai." };

    const role = matched.role;
    const nextProfile: Profile = {
      id: role === "admin" ? "demo-admin" : "demo-warga",
      school_id: "demo-school",
      full_name: role === "admin" ? "Admin Sarpras" : "Nadia Putri",
      email: matched.email,
      role,
      class_or_department: role === "admin" ? "Pengelola Sarpras" : "XI RPL 1",
    };
    localStorage.setItem(DEMO_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
    return {};
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(DEMO_KEY);
    setProfile(null);
  }, [supabase]);

  const value = useMemo(() => ({ profile, loading, demoMode, signIn, signInDemo, signInDemoWithCredentials, signOut }), [profile, loading, demoMode, signIn, signInDemo, signInDemoWithCredentials, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  return context;
}
