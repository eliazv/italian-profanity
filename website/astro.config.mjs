import { defineConfig } from "astro/config";

// GitHub Pages project URL by default. Override both values when a custom
// domain is enabled in GitHub Pages settings (without a repository base path).
export default defineConfig({
  site: process.env.SITE_URL || "https://eliazv.github.io",
  base: process.env.SITE_BASE || "/italian-profanity",
  output: "static",
  trailingSlash: "always",
});
