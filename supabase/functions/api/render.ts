// POST endpoint — functions/api/render.ts

// For Zapier/Make/CRM sending JSON (no merge tags). Returns a hosted PNG URL.

import type { Handler } from "@netlify/functions";
import { resolveTokens, hashKey } from "../../lib/resolve-tokens";
import { renderImageForTemplate } from "../../lib/renderers";
import { getCached, putCached } from "../../lib/cache";
import { uploadPNG } from "../../lib/storage";
// import { ensureCredits, spendCredits } from "../../lib/credits";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
    const { templateId, tokens: rawTokens = {}, userId = "public" } = JSON.parse(event.body || "{}");

    if (!templateId) return { statusCode: 400, body: "Missing templateId" };

    const tokens = resolveTokens(rawTokens);
    const key = hashKey(templateId, tokens);

    const cachedUrl = await getCached(templateId, key);
    if (cachedUrl) return json(200, { url: cachedUrl, cached: true });

    // await ensureCredits(userId, 1);

    const png = await renderImageForTemplate(templateId, tokens);
    const storageKey = `${templateId}/${key}.png`;
    const publicUrl = await uploadPNG(png, storageKey);

    await putCached(templateId, key, publicUrl);
    // await spendCredits(userId, 1, "render", { templateId, key });

    return json(200, { url: publicUrl, cached: false });
  } catch (e: any) {
    return json(500, { error: e.message || "Server error" });
  }
};

function json(statusCode: number, data: any) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}