// Visible FAQ on the home page, also emitted as FAQPage structured data.
// Keep answers factual and self-contained: search engines and AI assistants
// quote them verbatim.
import type { Lang } from "../i18n/ui";

export interface FaqItem {
  question: string;
  answer: string;
}

const en: FaqItem[] = [
  {
    question: "What is italian-profanity?",
    answer:
      "italian-profanity is a free, open-source library that detects Italian profanity — blasphemy (bestemmie), insults (insulti) and vulgar words (parolacce) — in short user-generated text such as nicknames, usernames, room names and team names. It is available for JavaScript/TypeScript on npm and for Dart/Flutter on pub.dev, with the same rules and the same verdicts in both.",
  },
  {
    question: "How do I add an Italian profanity filter to a JavaScript or Flutter app?",
    answer:
      'Install it with "npm install italian-profanity" or "flutter pub add italian_profanity", then call check(text). The result has an action — allow, review or block — and the list of matches with category, severity and position.',
  },
  {
    question: "Does it block innocent names like Claudio or Diodato?",
    answer:
      "No. Rules match whole words, explicit exceptions cover common collisions, and every release is audited against a large corpus of Italian names, surnames and common words. A few ambiguous homographs return review instead of block under the default balanced profile.",
  },
  {
    question: "Does it detect Italian blasphemy (bestemmie)?",
    answer:
      'Yes. Divine terms are flagged only when combined with an insult, so "dio" alone is allowed while variants such as "D10 p0rc0" are blocked.',
  },
  {
    question: "Which evasion tricks does it catch?",
    answer:
      "Leetspeak (0 for o, 1 for i), separators and punctuation between letters, spaced letters, repeated letters, accents and Unicode look-alike characters.",
  },
  {
    question: "Does it send user text to a server?",
    answer:
      "No. The filter runs entirely inside your app or browser, offline, with zero runtime dependencies. The playground on this site also runs locally and does not upload what you type.",
  },
  {
    question: "Does it support English?",
    answer:
      'Yes, optionally. Italian is on by default; enable a curated English dataset with languages: ["it", "en"]. It is not a replacement for a full English moderation service.',
  },
  {
    question: "Is it free to use in commercial products?",
    answer: "Yes. italian-profanity is released under the MIT license.",
  },
  {
    question: "Is a profanity filter enough to moderate a community?",
    answer:
      "No. It is a lexical filter: it does not understand intent or context, and an allowed input is not guaranteed to be appropriate. Combine it with server-side checks, reporting and human review.",
  },
];

const it: FaqItem[] = [
  {
    question: "Cos'è italian-profanity?",
    answer:
      "italian-profanity è una libreria gratuita e open source che riconosce le volgarità in italiano — bestemmie, insulti e parolacce — in testi brevi scritti dagli utenti, come nickname, username e nomi di stanze o squadre. È disponibile per JavaScript/TypeScript su npm e per Dart/Flutter su pub.dev, con le stesse regole e gli stessi esiti in entrambi.",
  },
  {
    question: "Come aggiungo un filtro per parolacce a un'app JavaScript o Flutter?",
    answer:
      `Installalo con "npm install italian-profanity" oppure "flutter pub add italian_profanity", poi chiama check(testo). Il risultato contiene un'azione — allow, review o block — e l'elenco delle corrispondenze con categoria, gravità e posizione.`,
  },
  {
    question: "Blocca nomi innocui come Claudio o Diodato?",
    answer:
      "No. Le regole lavorano su parole intere, eccezioni esplicite coprono le collisioni più comuni e ogni versione viene verificata su un ampio corpus di nomi, cognomi e parole italiane. Con la policy predefinita balanced, alcuni omografi ambigui restituiscono review invece di block.",
  },
  {
    question: "Riconosce le bestemmie?",
    answer:
      'Sì. I termini religiosi vengono segnalati solo se combinati con un insulto: "dio" da solo è consentito, mentre varianti come "D10 p0rc0" vengono bloccate.',
  },
  {
    question: "Quali trucchi per aggirare il filtro riconosce?",
    answer:
      "Leetspeak (0 al posto di o, 1 al posto di i), separatori e punteggiatura tra le lettere, lettere spaziate o ripetute, accenti e caratteri Unicode somiglianti.",
  },
  {
    question: "Invia il testo degli utenti a un server?",
    answer:
      "No. Il filtro funziona interamente nella tua app o nel browser, offline e senza dipendenze a runtime. Anche il playground di questo sito gira in locale e non invia ciò che scrivi.",
  },
  {
    question: "Supporta l'inglese?",
    answer:
      `Sì, in modo facoltativo. L'italiano è attivo di default; un dataset inglese curato si attiva con languages: ["it", "en"]. Non sostituisce un servizio completo di moderazione in inglese.`,
  },
  {
    question: "Si può usare gratis in prodotti commerciali?",
    answer: "Sì. italian-profanity è distribuito con licenza MIT.",
  },
  {
    question: "Un filtro per parolacce basta per moderare una community?",
    answer:
      "No. È un filtro lessicale: non comprende intenzioni o contesto, e un testo consentito non è garantito come appropriato. Va affiancato da controlli lato server, segnalazioni e revisione umana.",
  },
];

export const faq: Record<Lang, FaqItem[]> = { en, it };
