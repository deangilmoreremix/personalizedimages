// lib/credits.ts
import { supaAdmin } from "./supabase";

export async function ensureCredits(userId: string, cost = 1) {
  const { data } = await supaAdmin.from("user_credits").select("*").eq("user_id", userId).single();
  if (!data || data.credits < cost) throw new Error("Insufficient credits");
}

export async function spendCredits(userId: string, cost = 1, reason = "render", meta?: any) {
  await supaAdmin.from("credit_ledger").insert([{ user_id: userId, delta: -cost, reason, meta }]);
  const rpcResult = await supaAdmin.rpc("atomic_decrement_credits", { p_user_id: userId, p_cost: cost });
  if (rpcResult.error) {
    // fallback if RPC not created
    await supaAdmin.from("user_credits").update({ credits: (data: any) => (data.credits - cost) })
      .eq("user_id", userId);
  }
}