import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIPRAS Online — Sistem Pengelolaan Sarana dan Prasarana",
  description: "Platform digital untuk inventaris, pelaporan fasilitas, Lost and Found, dan peminjaman sarana sekolah.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
