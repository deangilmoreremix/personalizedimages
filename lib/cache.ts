// lib/cache.ts
import { supaAdmin } from "./supabase";

export async function getCached(templateId: string, tokenHash: string) {
  const { data } = await supaAdmin
    .from("personalization_renders")
    .select("storage_url")
    .eq("template_id", templateId)
    .eq("token_hash", tokenHash)
    .maybeSingle();
  return data?.storage_url || null;
}

export async function putCached(templateId: string, tokenHash: string, storageUrl: string) {
  await supaAdmin.from("personalization_renders").insert([{ template_id: templateId, token_hash: tokenHash, storage_url: storageUrl }]).catch(() => {});
}