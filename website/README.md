# Website

This is the independent Astro website and client-side playground for `italian-profanity`.

## Develop

```sh
cd website
npm install
npm run dev
npm run build
```

The website is not in the root pnpm workspace. The npm library is published from `packages/js` with an explicit file allowlist; Dart is published from `packages/dart`. Installing either library **does not download the website**.

## Publish

The GitHub workflow `.github/workflows/website-pages.yml` builds pull requests and deploys the static site from `master`. In repository Settings → Pages, select **GitHub Actions** as the source.

Live at https://italian-profanity.eliazavatta.it (Italian version under `/it/`). The old address https://eliazv.github.io/italian-profanity/ redirects there.

The custom domain is configured in Settings → Pages, with a DNS CNAME `italian-profanity` → `eliazv.github.io` on `eliazavatta.it`. The workflow reads the repository Actions variables `WEBSITE_SITE_URL` and `WEBSITE_SITE_BASE` (currently `https://italian-profanity.eliazavatta.it` and `/`); the same values are the defaults in `astro.config.mjs`.

If the site is ever taken down, delete the CNAME record too, so the subdomain cannot be claimed by another GitHub Pages site.

## Dependencies

The playground imports the real npm package, currently pinned to 0.3.0. Update that pin deliberately after a library release. The website does not send user text to a server.
