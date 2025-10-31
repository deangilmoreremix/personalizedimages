// allowed-tokens.ts
export const ALLOWED_TOKENS = [
  "first_name", "last_name", "email", "company", "title",
  "city", "country", "industry", "favorite_style", "offer",
  // add more as needed
] as const;

export type TokenKey = typeof ALLOWED_TOKENS[number];

export const FALLBACKS: Record<TokenKey, string> = {
  first_name: "Friend",
  last_name: "",
  email: "",
  company: "your team",
  title: "",
  city: "",
  country: "",
  industry: "",
  favorite_style: "classic",
  offer: "VIP Access",
};