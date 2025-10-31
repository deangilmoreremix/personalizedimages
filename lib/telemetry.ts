// lib/telemetry.ts
import { supaAdmin } from "./supabase";

export async function recordImpression(data: {
  templateId: string;
  tokens: Record<string, string>;
  src: string;
  ip: string;
  userAgent: string;
}) {
  // Optional: track impressions for analytics
  // await supaAdmin.from("impressions").insert([data]);
}