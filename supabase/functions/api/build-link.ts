// 1) Secure server function: /api/build-link

// Generates production-signed links (using your secret) so marketers never sign in the browser.

import type { Handler } from "@netlify/functions";
import { signParams } from "../../lib/signature";
import { ALLOWED_TOKENS } from "../../lib/allowed-tokens";

function requireStr(x: any, name: string) {
  if (!x || typeof x !== "string") throw new Error(`Missing or invalid ${name}`);
  return x;
}

const PLATFORM_MAPS: Record<string, Record<string, string>> = {
  mailerLite:     { first_name: "{$name}", email: "{$email}", company: "{$company}" },
  mailchimp:      { first_name: "*|FNAME|*", email: "*|EMAIL|*", company: "*|COMPANY|*" },
  activeCampaign: { first_name: "%FIRSTNAME%", email: "%EMAIL%", company: "%COMPANY%" },
  hubspot:        { first_name: "{{ contact.firstname }}", email: "{{ contact.email }}", company: "{{ company.name }}" },
  gohighlevel:    { first_name: "{{contact.first_name}}", email: "{{contact.email}}", company: "{{contact.company_name}}" },
  generic:        { first_name: "{first_name}", email: "{email}", company: "{company}" },
};

export const handler: Handler = async (event: any) => {
  try {
    if (event.httpMethod !== "POST") return bad(405, "Method not allowed");
    const body = JSON.parse(event.body || "{}");

    const base = requireStr(body.base, "base");                  // e.g. https://app.yourdomain.com
    const templateId = requireStr(body.templateId, "templateId");
    const platform = requireStr(body.platform, "platform");
    const src = (body.src && String(body.src)) || platform;
    const expiresInSec = Math.max(60, Math.min(60 * 60 * 24 * 7, Number(body.expiresInSec) || 60 * 60 * 24 * 3)); // 1m..7d

    const pmap = PLATFORM_MAPS[platform];
    if (!pmap) return bad(400, "Unknown platform");

    // Only include tokens you explicitly allow (and requested)
    const requestedTokens: string[] = Array.isArray(body.tokens) ? body.tokens : ["first_name", "company"];
    const safeTokens = requestedTokens.filter(t => ALLOWED_TOKENS.includes(t as any));

    const exp = Math.floor(Date.now() / 1000) + expiresInSec;
    const params: Record<string, string | number> = { exp, src };

    // Fill token placeholders with platform-specific merge fields
    for (const t of safeTokens) {
      params[t] = pmap[t] ?? `{${t}}`;
    }

    // Include optional userId for billing if provided
    if (body.userId) params.userId = String(body.userId);

    const sig = signParams(params);
    const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), sig });
    const url = `${base}/p/${encodeURIComponent(templateId)}?${qs.toString()}`;

    return json(200, { url, templateId, platform, tokens: safeTokens, expiresAt: exp });
  } catch (e: any) {
    return bad(400, e.message || "Invalid request");
  }
};

function json(code: number, data: any) {
  return { statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}
function bad(code: number, message: string) {
  return json(code, { error: message });
}