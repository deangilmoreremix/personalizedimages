// lib/signature.ts
import crypto from "crypto";

const SECRET = process.env.PERSONALIZATION_SECRET!;

export function signParams(params: Record<string, string | number>) {
  const base = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  return crypto.createHmac("sha256", SECRET).update(base).digest("hex");
}

export function verifySignature(params: Record<string, string | number>, sig: string) {
  const expected = signParams(params);
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}