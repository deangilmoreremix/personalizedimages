// React hook — src/lib/useSignedLink.ts

// Build signed links for each ESP (so marketers can copy/paste easily).

// Minimal builder; extend as needed
const maps: Record<string, Record<string, string>> = {
  mailerLite:     { first_name: "{$name}", email: "{$email}", company: "{$company}" },
  mailchimp:      { first_name: "*|FNAME|*", email: "*|EMAIL|*", company: "*|COMPANY|*" },
  activeCampaign: { first_name: "%FIRSTNAME%", email: "%EMAIL%", company: "%COMPANY%" },
  hubspot:        { first_name: "{{ contact.firstname }}", email: "{{ contact.email }}", company: "{{ company.name }}" },
  gohighlevel:    { first_name: "{{contact.first_name}}", email: "{{contact.email}}", company: "{{contact.company_name}}" },
  generic:        { first_name: "{first_name}", email: "{email}", company: "{company}" },
};

export function buildSignedLink(base: string, templateId: string, platform: keyof typeof maps, extraParams: Record<string,string|number> = {}) {
  const tmap = maps[platform];
  const exp = Math.floor(Date.now()/1000) + 60 * 60 * 24 * 3; // 3 days
  const params: Record<string,string|number> = { exp, src: platform, ...extraParams };

  // Only include keys that your template expects (common set shown)
  params.first_name = tmap.first_name;
  params.company = tmap.company;

  const sig = signParams(params);
  const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k,v]) => [k, String(v)])), sig });
  return `${base}/p/${templateId}?${qs.toString()}`;
}

// FE signature for preview use only (NOT cryptographically secret in client).
// For real emails, generate signed links server-side (recommended).
function signParams(params: Record<string,string|number>) {
  // Non-secret deterministic preview signature (dev UX); replace with server endpoint for production link building.
  const base = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  // Weak hash for preview: NOT SECURE. Use server function to sign for production!
  let hash = 0;
  for (let i=0; i<base.length; i++) hash = ((hash<<5)-hash) + base.charCodeAt(i) | 0;
  return Math.abs(hash).toString(16);
}