// lib/link-builders.ts
import { TokenKey } from "./allowed-tokens";
import { signParams } from "./signature";

type Platform = "mailerLite" | "mailchimp" | "activeCampaign" | "hubspot" | "gohighlevel" | "generic";

const maps: Record<Platform, Record<string, string>> = {
  mailerLite:     { first_name: "{$name}", email: "{$email}", company: "{$company}" },
  mailchimp:      { first_name: "*|FNAME|*", email: "*|EMAIL|*", company: "*|COMPANY|*" },
  activeCampaign: { first_name: "%FIRSTNAME%", email: "%EMAIL%", company: "%COMPANY%" },
  hubspot:        { first_name: "{{ contact.firstname }}", email: "{{ contact.email }}", company: "{{ company.name }}" },
  gohighlevel:    { first_name: "{{contact.first_name}}", email: "{{contact.email}}", company: "{{contact.company_name}}" },
  generic:        { first_name: "{first_name}", email: "{email}", company: "{company}" },
};

export function buildSignedLink({
  base,
  templateId,
  tokens,
  platform,
  expiresInSec = 60 * 60 * 24 * 3, // 3 days
  src = platform,
}: {
  base: string; templateId: string; tokens: Partial<Record<TokenKey, string>>;
  platform: Platform; expiresInSec?: number; src?: string;
}) {
  const platformMap = maps[platform];
  const exp = Math.floor(Date.now()/1000) + expiresInSec;

  const params: Record<string,string|number> = { exp, src };
  for (const k of Object.keys(tokens)) {
    const platformToken = platformMap[k] ?? `{${k}}`;
    params[k] = platformToken;
  }

  const sig = signParams(params);

  const query = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k,v]) => [k, String(v)])), sig });
  return `${base}/p/${templateId}?${query.toString()}`;
}