// Shared metadata for SEO, structured data, sitemap and llms.txt.
const base = import.meta.env.BASE_URL;
export const root: string = base.endsWith("/") ? base : `${base}/`;

/** Absolute URL for a path relative to the site root (e.g. "docs/"). */
export function absoluteUrl(path = ""): string {
  const site = import.meta.env.SITE ?? "https://eliazv.github.io";
  return new URL(root + path.replace(/^\//, ""), site).toString();
}

export const SITE_NAME = "italian-profanity";
export const REPOSITORY = "https://github.com/eliazv/italian-profanity";
export const NPM_URL = "https://www.npmjs.com/package/italian-profanity";
export const PUB_URL = "https://pub.dev/packages/italian_profanity";
export const INTEGRATION_GUIDE = `${REPOSITORY}/blob/master/docs/integrazione.md`;
export const AUTHOR = { "@type": "Person", name: "Elia Zavatta", url: "https://eliazavatta.it" };

export const HOME_DESCRIPTION =
  "Open-source Italian profanity filter for JavaScript, TypeScript and Flutter. Detects bestemmie, insults and vulgar words in nicknames and usernames, offline, without blocking innocent names.";

export const DOCS_DESCRIPTION =
  "Install and configure the italian-profanity filter in JavaScript, TypeScript or Dart/Flutter: API (check, findMatches, isClean, createChecker), moderation profiles, custom rules and limitations.";
