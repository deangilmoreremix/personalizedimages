// lib/storage.ts
import { supaAdmin, RENDERS_BUCKET } from "./supabase";

export async function uploadPNG(png: Buffer, key: string) {
  const { data, error } = await supaAdmin.storage.from(RENDERS_BUCKET).upload(key, png, {
    contentType: "image/png",
    upsert: true
  });
  if (error) throw error;
  const { data: pub } = supaAdmin.storage.from(RENDERS_BUCKET).getPublicUrl(key);
  return pub.publicUrl;
}