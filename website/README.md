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

Default address once Pages is enabled: https://eliazv.github.io/italian-profanity/

To use the optional subdomain, configure it under GitHub Pages Settings and add a DNS CNAME (`italian-profanity` → `eliazv.github.io`). Set the repository Actions variables:

- `WEBSITE_SITE_URL=https://italian-profanity.eliazavatta.it`
- `WEBSITE_SITE_BASE=/`

Then rerun the Pages workflow. Verify the domain and enable HTTPS in Pages settings.

## Dependencies

The playground imports the real npm package, currently pinned to 0.3.0. Update that pin deliberately after a library release. The website does not send user text to a server.
