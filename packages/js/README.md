# italian-profanity

Italian-first profanity detection for nicknames and short text, for JavaScript and TypeScript. The Dart package [`italian_profanity`](https://pub.dev/packages/italian_profanity) gives the same verdicts.

> 🚧 Implemented in the repository, not yet published. Coverage and field validation are still in progress. See the [project repository](https://github.com/eliazv/italian-profanity).

Libreria per riconoscere bestemmie, insulti e volgarità in italiano in nickname e testi brevi.

```ts
import { check, createChecker } from "italian-profanity"

check("D10 p0rc0").action // "block"
const checker = createChecker({ contacts: true })
checker.check("Claudio").action // "allow"
```

45 regole italiane curate, 173 forme dichiarate più frasi e combinazioni. `findMatches()` separa il rilevamento dalla policy di `check()`. Profili: `balanced`, `strict`, `lenient`; opzioni: `maxLength`, `contacts`, `extraRules`, `exceptions`, `thresholds`.

È un controllo lessicale: la copertura è limitata e alcuni omografi richiedono revisione. `isClean()` è vero solo per `allow`. I contatti sono disattivati per default; se attivati, bloccano con tutti i profili predefiniti. `range` usa offset UTF-16 sul testo originale e non va registrato nei log.

MIT License.
