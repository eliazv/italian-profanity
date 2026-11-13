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

Il playground importa il pacchetto npm reale, fissato alla versione 0.4.0. Aggiornare il vincolo e `package-lock.json` dopo ogni rilascio della libreria. Le FAQ e i testi delle funzionalità in italiano e inglese descrivono le viste anti-elusione della 0.4.0 e le radici `infix` curate. Il sito non invia il testo degli utenti a un server.

## Contatore download

Un solo contatore nella hero mostra la somma cumulativa dei download npm e pub.dev. L'animazione parte quando il dato entra nello schermo, viene saltata con `prefers-reduced-motion` e il numero è formattato nella lingua corrente.

Il workflow GitHub Pages aggiorna ogni giorno `website/public/stats/downloads.json` e archivia uno snapshot giornaliero in `stats/downloads-history.json` sul branch dedicato `download-stats` (non protetto come `master`). Non serve un DB, un token npm o un backend. Il browser legge solo il JSON statico del sito.

npm: API pubblica per finestre dalla data della prima pubblicazione. pub.dev: dato ufficiale a 30 giorni durante il primo mese e serie settimanale pubblica (non ufficialmente garantita) fino a 52 settimane. Superato l'anno, un totale precedente conservato consente di recuperare la parte precedente alla finestra; in assenza di una fonte affidabile il job mantiene l'ultimo totale noto, senza spacciare una finestra mobile per il totale storico. I download non rappresentano utenti unici.

Per un aggiornamento manuale: GitHub Actions → `Website (Astro + GitHub Pages)` → Run workflow.
