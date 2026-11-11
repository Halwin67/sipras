"use client";

import { getBrowserClientOrNull } from "@/lib/supabase/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadSchoolImage(file: File, schoolId: string) {
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Format gambar harus JPG, PNG, atau WebP.");
  if (file.size > MAX_FILE_SIZE) throw new Error("Ukuran gambar maksimal 5 MB.");
  const supabase = getBrowserClientOrNull();
  if (!supabase) return `demo://${file.name}`;
  if (!schoolId) throw new Error("Identitas sekolah tidak ditemukan pada profil pengguna.");
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  const path = `${schoolId}/uploads/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from("sipras-private").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}
