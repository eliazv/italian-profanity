# italian-profanity

Italian-first profanity detection for nicknames and short text, for JavaScript and TypeScript. The Dart package [`italian_profanity`](https://pub.dev/packages/italian_profanity) gives the same verdicts.

> Beta 0.1.0-beta.0 per integrazioni sperimentali. Copertura limitata e validazione sul campo ancora in corso.

```sh
npm install --save-exact italian-profanity@0.1.0-beta.0
```

Libreria per riconoscere bestemmie, insulti e volgarità in italiano in nickname e testi brevi.

```ts
import { check, createChecker } from "italian-profanity"

check("D10 p0rc0").action // "block"
const checker = createChecker({ contacts: true })
checker.check("Claudio").action // "allow"
```

65 regole italiane curate, 244 forme dichiarate più frasi e combinazioni. `findMatches()` separa il rilevamento dalla policy di `check()`. Profili: `balanced`, `strict`, `lenient`; opzioni: `maxLength`, `contacts`, `extraRules`, `exceptions`, `thresholds`.

È un controllo lessicale: la copertura è limitata e alcuni omografi richiedono revisione. `isClean()` è vero solo per `allow`. I contatti sono disattivati per default; se attivati, bloccano con tutti i profili predefiniti. `range` usa offset UTF-16 sul testo originale e non va registrato nei log.

Inglese opzionale: tre famiglie minime, da attivare con `languages`. Dialetti non ancora coperti. Versione esatta e opzioni devono coincidere fra client e server. Se l?app consente `review`, verificare che l?azione sia diversa da `block`: `isClean()` consente solo `allow`.

[Guida alla migrazione](https://github.com/eliazv/italian-profanity/blob/master/docs/integrazione.md).

MIT License.
