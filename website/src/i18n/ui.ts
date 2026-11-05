// UI copy for every page, in English (default, served at /) and Italian (/it/).
// Strings that contain markup are rendered with set:html: keep them static.
export type Lang = "en" | "it";
export const LANGS: Lang[] = ["en", "it"];

const base = import.meta.env.BASE_URL;
export const root: string = base.endsWith("/") ? base : `${base}/`;

/** Path segment for a language: "" for English, "it/" for Italian. */
export const langPrefix = (lang: Lang): string => (lang === "it" ? "it/" : "");

/** Site-relative href for a page path ("" or "docs/") in a language. */
export const pageHref = (lang: Lang, path = ""): string => root + langPrefix(lang) + path;

export const ui = {
  en: {
    locale: "en_US",
    meta: {
      homeTitle: "Italian Profanity Filter for JavaScript & Flutter — italian-profanity",
      homeDescription:
        "Open-source Italian profanity filter for JavaScript, TypeScript and Flutter. Detects bestemmie, insults and vulgar words in nicknames and usernames, offline, without blocking innocent names.",
      docsTitle: "Docs: Italian Profanity Filter for JS, TypeScript & Flutter — italian-profanity",
      docsDescription:
        "Install and configure the italian-profanity filter in JavaScript, TypeScript or Dart/Flutter: API (check, findMatches, isClean, createChecker), moderation profiles, custom rules and limitations.",
      ogAlt: "italian-profanity: Italian profanity filter for JavaScript, TypeScript and Flutter",
    },
    nav: { skip: "Skip to content", playground: "Playground", docs: "Docs", faq: "FAQ", main: "Main navigation", footer: "Footer", home: "italian-profanity home" },
    switchLang: { label: "Language" },
    footer: { license: "MIT License", madeBy: "Made by" },
    copy: { copy: "COPY", copied: "COPIED ✓", manual: "SELECT & COPY", copyInstall: "Copy install command", copyNpm: "Copy npm command", copyFlutter: "Copy Flutter command" },
    hero: {
      eyebrowTag: "Open source",
      eyebrow: "Italian profanity filter",
      eyebrowExtra: "for JS & Flutter",
      line1: "GOOD NAMES.",
      line2: "BAD WORDS.",
      line3: "FILTERED.",
      intro: "Spots bestemmie, insults and tricks like “D10&nbsp;p0rc0” in usernames — and leaves Claudio and Diodato alone.",
      tabs: "Package manager",
      docs: "Read the docs",
    },
    playground: {
      title: "Try it",
      meta: "Runs in your browser",
      input: "Nickname or short text",
      placeholder: "Type a nickname…",
      policy: "Policy",
      balanced: "Balanced policy",
      strict: "Strict policy",
      lenient: "Lenient policy",
      languages: "Languages",
      it: "Italian",
      itEn: "Italian + English",
      loading: "LOADING",
      loadingText: "Loading the detector…",
    },
    features: {
      title: "NOT ALL FILTERS<br />SPEAK <em>ITALIAN.</em>",
      cards: [
        { title: "Catch evasions.", text: "Leetspeak, repeated letters, punctuation, accents and lookalike Unicode are handled by the matcher." },
        { title: "Respect real names.", text: "Whole-word rules and explicit exceptions reduce collisions with ordinary Italian names and surnames." },
        { title: "Same answer. Anywhere.", text: "Shared rules and regression fixtures keep the TypeScript and Dart/Flutter engines aligned." },
      ],
    },
    install: {
      title: "READY IN<br /><em>A FEW LINES.</em>",
      text: "No API key, no network calls. Pick a <strong>balanced</strong>, <strong>strict</strong> or <strong>lenient</strong> policy and decide what to allow, review or block.",
    },
    faqTitle: "QUESTIONS,<br /><em>ANSWERED.</em>",
    cta: {
      title: "LET'S KEEP THE<br /><span>GOOD NAMES.</span>",
      text: "Free, MIT licensed and open to contributions.",
      star: "Star on GitHub",
      docs: "Read the docs",
    },
  },
  it: {
    locale: "it_IT",
    meta: {
      homeTitle: "Filtro parolacce e bestemmie per JavaScript e Flutter — italian-profanity",
      homeDescription:
        "Libreria open source che riconosce bestemmie, insulti e parolacce in nickname e username. Per JavaScript, TypeScript e Flutter, offline, senza bloccare i nomi innocui.",
      docsTitle: "Documentazione: filtro parolacce per JS, TypeScript e Flutter — italian-profanity",
      docsDescription:
        "Installa e configura italian-profanity in JavaScript, TypeScript o Dart/Flutter: API (check, findMatches, isClean, createChecker), policy di moderazione, regole personalizzate e limiti.",
      ogAlt: "italian-profanity: filtro per parolacce e bestemmie in italiano per JavaScript, TypeScript e Flutter",
    },
    nav: { skip: "Vai al contenuto", playground: "Playground", docs: "Documentazione", faq: "FAQ", main: "Navigazione principale", footer: "Piè di pagina", home: "italian-profanity, pagina iniziale" },
    switchLang: { label: "Lingua" },
    footer: { license: "Licenza MIT", madeBy: "Realizzato da" },
    copy: { copy: "COPIA", copied: "COPIATO ✓", manual: "SELEZIONA E COPIA", copyInstall: "Copia il comando di installazione", copyNpm: "Copia il comando npm", copyFlutter: "Copia il comando Flutter" },
    hero: {
      eyebrowTag: "Open source",
      eyebrow: "Filtro parolacce e bestemmie",
      eyebrowExtra: "per JS e Flutter",
      line1: "NICK PULITI.",
      line2: "PAROLACCE",
      line3: "FILTRATE.",
      intro: "Riconosce bestemmie, insulti e trucchi come “D10&nbsp;p0rc0” negli username, e lascia passare Claudio e Diodato.",
      tabs: "Gestore di pacchetti",
      docs: "Documentazione",
    },
    playground: {
      title: "Provalo",
      meta: "Funziona nel browser",
      input: "Nickname o testo breve",
      placeholder: "Scrivi un nickname…",
      policy: "Policy",
      balanced: "Policy bilanciata",
      strict: "Policy rigida",
      lenient: "Policy permissiva",
      languages: "Lingue",
      it: "Italiano",
      itEn: "Italiano + inglese",
      loading: "CARICAMENTO",
      loadingText: "Caricamento del filtro…",
    },
    features: {
      title: "NON TUTTI I FILTRI<br />PARLANO <em>ITALIANO.</em>",
      cards: [
        { title: "Scova i trucchi.", text: "Leetspeak, lettere ripetute, punteggiatura, accenti e caratteri Unicode somiglianti vengono riconosciuti." },
        { title: "Rispetta i nomi veri.", text: "Regole a parola intera ed eccezioni esplicite evitano falsi positivi su nomi e cognomi italiani." },
        { title: "Stessa risposta, ovunque.", text: "Regole e test condivisi tengono allineati i motori TypeScript e Dart/Flutter." },
      ],
    },
    install: {
      title: "PRONTO IN<br /><em>POCHE RIGHE.</em>",
      text: "Nessuna chiave API, nessuna chiamata di rete. Scegli la policy <strong>balanced</strong>, <strong>strict</strong> o <strong>lenient</strong> e decidi cosa consentire, rivedere o bloccare.",
    },
    faqTitle: "DOMANDE<br /><em>FREQUENTI.</em>",
    cta: {
      title: "PIÙ NOMI VERI.<br /><span>MENO PAROLACCE.</span>",
      text: "Gratuito, con licenza MIT e aperto ai contributi.",
      star: "Lascia una stella su GitHub",
      docs: "Leggi la documentazione",
    },
  },
} as const;

export type UI = (typeof ui)[Lang];
