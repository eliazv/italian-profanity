# italian-profanity

[![npm](https://img.shields.io/npm/v/italian-profanity?label=npm)](https://www.npmjs.com/package/italian-profanity) [![pub.dev](https://img.shields.io/pub/v/italian_profanity?label=Dart%2FFlutter)](https://pub.dev/packages/italian_profanity)

[Repository](https://github.com/eliazv/italian-profanity) · [Guida d'integrazione](https://github.com/eliazv/italian-profanity/blob/master/docs/integrazione.md) · [Segnalazioni](https://github.com/eliazv/italian-profanity/issues/new/choose) · [Changelog](https://github.com/eliazv/italian-profanity/blob/master/packages/js/CHANGELOG.md)

Italian-first profanity detection for nicknames and short text, for JavaScript and TypeScript. The Dart package [`italian_profanity`](https://pub.dev/packages/italian_profanity) gives the same verdicts.

```sh
npm install italian-profanity
```

Per salvare una versione esatta nel progetto:

```sh
npm install --save-exact italian-profanity@latest
```

Libreria per riconoscere bestemmie, insulti e volgarità in italiano in nickname e testi brevi.

```ts
import { check, createChecker } from "italian-profanity"

check("D10 p0rc0").action // "block"
const checker = createChecker({ contacts: true })
checker.check("Claudio").action // "allow"
```

290 regole italiane curate, 1.034 forme dichiarate più frasi e combinazioni. `findMatches()` separa il rilevamento dalla policy di `check()`. Profili: `balanced`, `strict`, `lenient`; opzioni: `maxLength`, `contacts`, `extraRules`, `exceptions`, `thresholds`.

È un controllo lessicale: la copertura è limitata e alcuni omografi richiedono revisione. `isClean()` è vero solo per `allow`. I contatti sono disattivati per default; se attivati, bloccano con tutti i profili predefiniti. `range` usa offset UTF-16 sul testo originale e non va registrato nei log.

Inglese opzionale: 51 regole curate, 110 forme e 20 varianti di frase, da attivare con `languages: ["it", "en"]` (solo inglese: `["en"]`). Nessuna dipendenza a runtime; selezione dal preset MIT di Obscenity e confronto con leo-profanity e @2toad/profanity, con provenienza e attribuzioni in NOTICE. Dialetti non ancora coperti. Versione esatta e opzioni devono coincidere fra client e server. Se l'app consente `review`, verificare che l'azione sia diversa da `block`: `isClean()` consente solo `allow`.

[Guida alla migrazione](https://github.com/eliazv/italian-profanity/blob/master/docs/integrazione.md).

Per integrazioni e sviluppo personalizzato: [Elia Zavatta](https://eliazavatta.it).

MIT License.
