import type { APIRoute } from "astro";
import { absoluteUrl } from "../data/site";

const pages = ["", "docs/"];

export const GET: APIRoute = () => {
  const urls = pages.map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
