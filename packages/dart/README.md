# italian_profanity

[![pub.dev](https://img.shields.io/pub/v/italian_profanity?include_prereleases&label=pub.dev)](https://pub.dev/packages/italian_profanity) [![npm beta](https://img.shields.io/npm/v/italian-profanity/beta?label=JavaScript%2FTypeScript)](https://www.npmjs.com/package/italian-profanity)

[Repository](https://github.com/eliazv/italian-profanity) · [Guida d'integrazione](https://github.com/eliazv/italian-profanity/blob/master/docs/integrazione.md) · [Segnalazioni](https://github.com/eliazv/italian-profanity/issues/new/choose) · [Changelog](https://github.com/eliazv/italian-profanity/blob/master/packages/dart/CHANGELOG.md)

Italian-first profanity detection for nicknames and short text, for Dart and Flutter. The npm package [`italian-profanity`](https://www.npmjs.com/package/italian-profanity) gives the same verdicts.

> Beta 0.1.0-beta.1 per integrazioni sperimentali.

```yaml
dependencies:
  italian_profanity: 0.1.0-beta.1
```

Libreria per riconoscere bestemmie, insulti e volgarità in italiano in nickname e testi brevi.

```dart
import 'package:italian_profanity/italian_profanity.dart';

final checker = ItalianProfanity.createChecker(contacts: true);
final result = checker.check('D10 p0rc0');
// result.action == Action.block
```

65 regole italiane curate, 244 forme dichiarate più frasi e combinazioni. Disponibili `ItalianProfanity`, `ProfanityChecker`, `CheckerOptions` e le funzioni `check`, `findMatches`, `isClean`, `createChecker`. Il pacchetto è Dart puro, senza dipendenze Flutter.

È un controllo lessicale: la copertura è limitata e alcuni omografi richiedono revisione. `isClean()` è vero solo per `Action.allow`. I contatti sono disattivati per default; se attivati, bloccano con tutti i profili predefiniti. `range` usa offset UTF-16 sul testo originale e non va registrato nei log.

Inglese opzionale: tre famiglie minime, da attivare con `languages`. Dialetti non ancora coperti. Versione esatta e opzioni devono coincidere fra client e server. Se l'app consente `review`, verificare che l'azione sia diversa da `block`: `isClean()` consente solo `allow`.

[Guida alla migrazione](https://github.com/eliazv/italian-profanity/blob/master/docs/integrazione.md).

MIT License.
