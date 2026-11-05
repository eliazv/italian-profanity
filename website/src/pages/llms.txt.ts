import type { APIRoute } from "astro";
import { faq } from "../data/faq";
import { absoluteUrl, HOME_DESCRIPTION, INTEGRATION_GUIDE, NPM_URL, PUB_URL, REPOSITORY } from "../data/site";

// llms.txt (https://llmstxt.org): a plain-text summary for AI assistants.
export const GET: APIRoute = () => {
  const body = `# italian-profanity

> ${HOME_DESCRIPTION}

Italian-first profanity detection for short user-generated text (nicknames, usernames, room and team names). Same rules and same verdicts in JavaScript/TypeScript and Dart/Flutter. MIT licensed, offline, zero runtime dependencies. In Italian: libreria per riconoscere bestemmie, insulti e parolacce in nickname e testi brevi.

## Install

- npm: \`npm install italian-profanity\`
- Flutter: \`flutter pub add italian_profanity\`
- Dart: \`dart pub add italian_profanity\`

## Usage

\`\`\`ts
import { check } from "italian-profanity";
check("D10 p0rc0").action; // "block"
check("Claudio").action;   // "allow"
\`\`\`

API: \`check(text)\`, \`findMatches(text)\`, \`isClean(text)\`, \`createChecker(options)\`. Profiles: balanced (default), strict, lenient. Optional English with \`languages: ["it", "en"]\`, optional contact detection with \`contacts: true\`.

## Docs

- [Website and live playground](${absoluteUrl()})
- [Developer documentation](${absoluteUrl("docs/")})
- [Integration guide (Italian)](${INTEGRATION_GUIDE})
- [Source code](${REPOSITORY})
- [npm package](${NPM_URL})
- [pub.dev package](${PUB_URL})

## FAQ

${faq.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
