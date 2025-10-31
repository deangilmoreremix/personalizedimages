// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supaAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export const RENDERS_BUCKET = process.env.RENDERS_BUCKET || "renders";