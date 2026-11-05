// Developer documentation copy. HTML strings are static and rendered with set:html.
import type { Lang } from "./ui";

interface DocsCopy {
  headline: string;
  back: string;
  title: string;
  intro: string;
  onThisPage: string;
  sectionsLabel: string;
  fullGuide: string;
  nav: { quickstart: string; api: string; policy: string; customization: string; production: string; limits: string };
  copyCommand: string;
  quickstart: { text: string; dart: string; comment: string };
  api: { text: string; fn: string; use: string; rows: [string, string][]; matches: string };
  policy: { items: [string, string][]; text: string };
  customization: { items: string[]; text: string; link: string };
  production: { items: string[] };
  limits: { warningTitle: string; warning: string; text: string; missingTitle: string; missing: string; issue: string };
  breadcrumbHome: string;
}

export const docs: Record<Lang, DocsCopy> = {
  en: {
    headline: "italian-profanity developer documentation",
    back: "← Back to home",
    title: "LESS GUESSWORK.<br /><em>MORE CONTROL.</em>",
    intro: "Install the filter, pick a policy and validate user input without an API or external service.",
    onThisPage: "ON THIS PAGE",
    sectionsLabel: "Documentation sections",
    fullGuide: "Full integration guide ↗",
    nav: { quickstart: "Quick start", api: "API", policy: "Policies", customization: "Customization", production: "Production notes", limits: "Limitations" },
    copyCommand: "COPY COMMAND",
    quickstart: {
      text: "Use the JavaScript package in Node or browsers, or the pure Dart package in Flutter. Both share their detection rules and expected results.",
      dart: "For Dart packages outside Flutter, run <code>dart pub add italian_profanity</code>.",
      comment: "Reject the submitted nickname.",
    },
    api: {
      text: "Four entry points are shared between TypeScript and Dart:",
      fn: "Function",
      use: "Use it for",
      rows: [
        ["check(text)", "Get an action (<code>allow</code>, <code>review</code> or <code>block</code>) and the matches."],
        ["findMatches(text)", "Inspect detected rules without applying a moderation decision."],
        ["isClean(text)", "Return true only when the action is <code>allow</code>, not <code>review</code>."],
        ["createChecker(options)", "Reuse the same policy, languages, exceptions and settings across checks."],
      ],
      matches: "A match describes its category, severity, confidence and location in the original string. Locations are UTF-16 offsets; treat them as potentially sensitive.",
    },
    policy: {
      items: [
        ["Balanced", "The default, designed to reduce false positives on common names."],
        ["Strict", "More restrictive with ambiguous wording. Review its impact before deployment."],
        ["Lenient", "Less restrictive for products where warnings may be more useful than rejection."],
      ],
      text: "Make your product policy explicit. If you have no manual review queue, you might reject only <code>block</code> and handle <code>review</code> separately. Do not assume <code>isClean()</code> makes that distinction for you.",
    },
    customization: {
      items: [
        '<strong>Languages:</strong> Italian is on by default. Enable curated English coverage with <code>languages: ["it", "en"]</code>.',
        "<strong>Contacts:</strong> Optional detection for URL, email and phone-like text via <code>contacts: true</code>.",
        "<strong>Extra rules:</strong> Add product-specific whole-word rules rather than changing the shared dataset.",
        "<strong>Exceptions and thresholds:</strong> Tune category sensitivity without rewriting the detector.",
      ],
      text: "The full integration guide covers the option contracts and migration from existing filters.",
      link: "Open integration guide ↗",
    },
    production: {
      items: [
        "<strong>Recheck on your server.</strong> Client-side checks improve UX but can always be bypassed.",
        "<strong>Keep versions aligned.</strong> Share the same release and options across backend and mobile clients.",
        "<strong>Validate input length separately.</strong> A filter may inspect only the configured prefix of long text.",
        "<strong>Protect privacy.</strong> Avoid saving actual nicknames, matches or offsets in moderation telemetry.",
        "<strong>Review release behavior diffs.</strong> New rules may change decisions for previously allowed input.",
      ],
    },
    limits: {
      warningTitle: "A lexical filter is not full moderation.",
      warning: "The library does not understand intent or context and cannot guarantee that an allowed input is appropriate. Some ambiguous names deliberately produce <code>review</code>.",
      text: "Regional dialects are only partially covered. The optional English dataset is curated, but is not equivalent to a complete English-language moderation service. Evaluate the library on real use cases before enforcing strict blocking.",
      missingTitle: "See something missing?",
      missing: "Reproducible examples and carefully reviewed exceptions help the project improve.",
      issue: "Open an issue",
    },
    breadcrumbHome: "Home",
  },
  it: {
    headline: "Documentazione per sviluppatori di italian-profanity",
    back: "← Torna alla home",
    title: "MENO DUBBI.<br /><em>PIÙ CONTROLLO.</em>",
    intro: "Installa il filtro, scegli una policy e valida i testi degli utenti senza API né servizi esterni.",
    onThisPage: "IN QUESTA PAGINA",
    sectionsLabel: "Sezioni della documentazione",
    fullGuide: "Guida d'integrazione completa ↗",
    nav: { quickstart: "Avvio rapido", api: "API", policy: "Policy", customization: "Personalizzazione", production: "In produzione", limits: "Limiti" },
    copyCommand: "COPIA IL COMANDO",
    quickstart: {
      text: "Usa il pacchetto JavaScript in Node o nel browser, oppure il pacchetto Dart puro in Flutter. Entrambi condividono regole di rilevamento ed esiti attesi.",
      dart: "Per pacchetti Dart fuori da Flutter, esegui <code>dart pub add italian_profanity</code>.",
      comment: "Rifiuta il nickname inviato.",
    },
    api: {
      text: "TypeScript e Dart condividono quattro punti d'ingresso:",
      fn: "Funzione",
      use: "A cosa serve",
      rows: [
        ["check(text)", "Restituisce un'azione (<code>allow</code>, <code>review</code> o <code>block</code>) e le corrispondenze."],
        ["findMatches(text)", "Elenca le regole rilevate senza applicare una decisione di moderazione."],
        ["isClean(text)", "Restituisce true solo quando l'azione è <code>allow</code>, non <code>review</code>."],
        ["createChecker(options)", "Riusa la stessa policy, le lingue, le eccezioni e le impostazioni tra un controllo e l'altro."],
      ],
      matches: "Ogni corrispondenza indica categoria, gravità, confidenza e posizione nel testo originale. Le posizioni sono offset UTF-16: trattale come dati potenzialmente sensibili.",
    },
    policy: {
      items: [
        ["Balanced", "La predefinita, pensata per ridurre i falsi positivi sui nomi comuni."],
        ["Strict", "Più severa con i termini ambigui. Valutane l'impatto prima di adottarla."],
        ["Lenient", "Meno severa, per prodotti in cui un avviso è più utile di un rifiuto."],
      ],
      text: "Rendi esplicita la policy del tuo prodotto. Se non hai una coda di revisione manuale, puoi rifiutare solo <code>block</code> e gestire <code>review</code> a parte. Non dare per scontato che <code>isClean()</code> faccia questa distinzione al posto tuo.",
    },
    customization: {
      items: [
        '<strong>Lingue:</strong> l\'italiano è attivo di default. Attiva la copertura inglese curata con <code>languages: ["it", "en"]</code>.',
        "<strong>Contatti:</strong> rilevamento facoltativo di URL, email e numeri di telefono con <code>contacts: true</code>.",
        "<strong>Regole aggiuntive:</strong> aggiungi regole a parola intera specifiche del tuo prodotto invece di modificare il dataset condiviso.",
        "<strong>Eccezioni e soglie:</strong> regola la sensibilità per categoria senza riscrivere il rilevatore.",
      ],
      text: "La guida d'integrazione completa descrive tutte le opzioni e la migrazione dai filtri esistenti.",
      link: "Apri la guida d'integrazione ↗",
    },
    production: {
      items: [
        "<strong>Ricontrolla sul server.</strong> I controlli lato client migliorano l'esperienza ma si possono sempre aggirare.",
        "<strong>Allinea le versioni.</strong> Usa la stessa release e le stesse opzioni su backend e app.",
        "<strong>Valida la lunghezza a parte.</strong> Il filtro può esaminare solo la parte iniziale configurata di un testo lungo.",
        "<strong>Proteggi la privacy.</strong> Non salvare nickname, corrispondenze o offset reali nella telemetria di moderazione.",
        "<strong>Controlla le differenze tra release.</strong> Nuove regole possono cambiare l'esito di testi prima consentiti.",
      ],
    },
    limits: {
      warningTitle: "Un filtro lessicale non è una moderazione completa.",
      warning: "La libreria non comprende intenzioni o contesto e non può garantire che un testo consentito sia appropriato. Alcuni nomi ambigui restituiscono volutamente <code>review</code>.",
      text: "I dialetti regionali sono coperti solo in parte. Il dataset inglese facoltativo è curato, ma non equivale a un servizio completo di moderazione in inglese. Prova la libreria su casi reali prima di applicare blocchi rigidi.",
      missingTitle: "Manca qualcosa?",
      missing: "Esempi riproducibili ed eccezioni ben motivate aiutano il progetto a migliorare.",
      issue: "Apri una issue",
    },
    breadcrumbHome: "Home",
  },
};
