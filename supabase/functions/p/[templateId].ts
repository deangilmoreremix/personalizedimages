// GET endpoint — functions/p/[templateId].ts

// Accepts query tokens (merge tags substituted by ESP)

// Validates signature + expiry

// Caches first render, reuses later

// Optional userId if you want to bill by account; otherwise bill by your chosen strategy

import type { Handler } from "@netlify/functions";
import { verifySignature } from "../../lib/signature";
import { resolveTokens, hashKey } from "../../lib/resolve-tokens";
import { renderImageForTemplate } from "../../lib/renderers";
import { getCached, putCached } from "../../lib/cache";
import { uploadPNG } from "../../lib/storage";
// import { ensureCredits, spendCredits } from "../../lib/credits"; // enable if billing per render

export const handler: Handler = async (event) => {
  try {
    const templateId = event.path.split("/").pop()!;
    const q = event.queryStringParameters || {};
    const { sig, exp, ...raw } = q;

    if (!sig || !exp) return bad(400, "Missing signature or exp");
    const now = Math.floor(Date.now()/1000);
    if (now > Number(exp)) return bad(403, "Link expired");

    const signedParams: Record<string,string|number> = { ...raw, exp };
    if (!verifySignature(signedParams, sig)) return bad(403, "Invalid signature");

    const tokens = resolveTokens(raw as Record<string,string|undefined>);
    const key = hashKey(templateId, tokens);

    // 1) Serve from cache if exists
    const cachedUrl = await getCached(templateId, key);
    if (cachedUrl) {
      return redirectPng(cachedUrl);
    }

    // 2) Optionally bill credits here (uncomment if needed)
    // const userId = String(raw.userId || "public");
    // await ensureCredits(userId, 1);

    // 3) Render + upload
    const png = await renderImageForTemplate(templateId, tokens);
    const storageKey = `${templateId}/${key}.png`;
    const publicUrl = await uploadPNG(png, storageKey);

    await putCached(templateId, key, publicUrl);
    // await spendCredits(userId, 1, "render", { templateId, key });

    return redirectPng(publicUrl);
  } catch (e: any) {
    return bad(500, e.message || "Server error");
  }
};

function redirectPng(url: string) {
  return {
    statusCode: 302,
    headers: {
      Location: url,
      "Cache-Control": "public, max-age=86400"
    },
    body: ""
  };
}

function bad(code: number, message: string) {
  return { statusCode: code, body: message };
}