/** Shared [TOKEN] substitution for prompts, text layers and emails. */
export type TokenValues = Record<string, string>;

/** FIRST_NAME, first-name and FirstName all compare equal: "FIRSTNAME". */
export const compactKey = (k: string) => k.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

export interface ResolveOptions {
  /** Also replace {{TOKEN}} and {TOKEN} (ESP-style merge tags). Off by default. */
  curly?: boolean;
}

/** Replace [TOKEN] placeholders; unknown/empty tokens are left as-is so mistakes stay visible. */
export function resolveTokens(text: string, values: TokenValues = {}, opts: ResolveOptions = {}): string {
  const byCompact: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) if (v !== undefined && v !== null && v !== '') byCompact[compactKey(k)] = String(v);
  const lookup = (m: string, key: string) => byCompact[compactKey(key)] ?? m;
  let out = text.replace(/\[([A-Za-z0-9_]+)\]/g, (m, key: string) => lookup(m, key));
  if (opts.curly) {
    out = out.replace(/\{\{\s*([A-Za-z0-9_ ]+?)\s*\}\}/g, (m, key: string) => lookup(m, key));
    out = out.replace(/\{([A-Za-z0-9_]+)\}/g, (m, key: string) => lookup(m, key));
  }
  return out;
}

/** Tokens that none of the given columns can fill. */
export function unmatchedTokens(tokens: string[], columns: string[]): string[] {
  const have = new Set(columns.map(compactKey));
  return tokens.filter(t => !have.has(compactKey(t)));
}
