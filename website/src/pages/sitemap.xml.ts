import type { APIRoute } from "astro";
import { pageUrl } from "../data/site";
import { LANGS } from "../i18n/ui";

const pages = ["", "docs/"];

// Every page is listed once per language, with hreflang alternates.
export const GET: APIRoute = () => {
  const urls = pages.flatMap((path) =>
    LANGS.map((lang) => {
      const alternates = [
        ...LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${pageUrl(l, path)}"/>`),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl("en", path)}"/>`,
      ];
      return `  <url><loc>${pageUrl(lang, path)}</loc>${alternates.join("")}</url>`;
    }),
  );
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
