// lib/resolve-tokens.ts
import { ALLOWED_TOKENS, FALLBACKS, TokenKey } from "./allowed-tokens";

export function sanitize(v: string) {
  // Strip control characters, excessive length, etc.
  return String(v ?? "").slice(0, 128).replace(/[<>]/g, "");
}

export function resolveTokens(input: Record<string, string | undefined>) {
  const out: Record<TokenKey, string> = {} as any;
  for (const key of ALLOWED_TOKENS) {
    out[key] = sanitize(input[key] ?? FALLBACKS[key]);
  }
  return out;
}