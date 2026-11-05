import { defineConfig } from "astro/config";

// Served from the custom domain at the root. To publish on the GitHub Pages
// project URL instead, set SITE_URL=https://eliazv.github.io and
// SITE_BASE=/italian-profanity.
export default defineConfig({
  site: process.env.SITE_URL || "https://italian-profanity.eliazavatta.it",
  base: process.env.SITE_BASE || "/",
  output: "static",
  trailingSlash: "always",
});
