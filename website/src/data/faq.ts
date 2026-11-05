// Visible FAQ on the home page, also emitted as FAQPage structured data.
// Keep answers factual and self-contained: search engines and AI assistants
// quote them verbatim.
export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
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
