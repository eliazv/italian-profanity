// Shared metadata for SEO, structured data, sitemap and llms.txt.
import { langPrefix, root, ui, type Lang } from "../i18n/ui";

export { root };

/** Absolute URL for a path relative to the site root (e.g. "docs/"). */
export function absoluteUrl(path = ""): string {
  const site = import.meta.env.SITE ?? "https://italian-profanity.eliazavatta.it";
  return new URL(root + path.replace(/^\//, ""), site).toString();
}

/** Absolute URL for a page path ("" or "docs/") in a language. */
export const pageUrl = (lang: Lang, path = ""): string => absoluteUrl(langPrefix(lang) + path);

export const SITE_NAME = "italian-profanity";
export const REPOSITORY = "https://github.com/eliazv/italian-profanity";
export const NPM_URL = "https://www.npmjs.com/package/italian-profanity";
export const PUB_URL = "https://pub.dev/packages/italian_profanity";
export const INTEGRATION_GUIDE = `${REPOSITORY}/blob/master/docs/integrazione.md`;
export const ISSUES_URL = `${REPOSITORY}/issues`;
export const AUTHOR = { "@type": "Person", name: "Elia Zavatta", url: "https://eliazavatta.it" };

export const HOME_DESCRIPTION: string = ui.en.meta.homeDescription;
export const DOCS_DESCRIPTION: string = ui.en.meta.docsDescription;
