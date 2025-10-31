// lib/renderers.ts
import { Resvg } from "@resvg/resvg-js";

function svgFor(templateId: string, t: Record<string,string>) {
  // trivial sample; replace with your real branded template system
  return `
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#0b1220"/>
    <text x="60" y="200" font-size="70" fill="#fff">Hey ${t.first_name} 👋</text>
    <text x="60" y="300" font-size="44" fill="#a8b3cf">
      ${t.company} just unlocked ${t.offer} — want your personalized example?
    </text>
  </svg>`;
}

export async function renderImageForTemplate(templateId: string, t: Record<string,string>) {
  const svg = svgFor(templateId, t);
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const pngData = resvg.render().asPng();
  return Buffer.from(pngData);
}