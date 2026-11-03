# italian_profanity

Italian-first profanity detection for nicknames and short text, for Dart and Flutter. The npm package [`italian-profanity`](https://www.npmjs.com/package/italian-profanity) gives the same verdicts.

> 🚧 Implemented in the repository, not yet published. Coverage and field validation are still in progress. See the [project repository](https://github.com/eliazv/italian-profanity).

Libreria per riconoscere bestemmie, insulti e volgarità in italiano in nickname e testi brevi.

```dart
import 'package:italian_profanity/italian_profanity.dart';

final checker = ItalianProfanity.createChecker(contacts: true);
final result = checker.check('D10 p0rc0');
// result.action == Action.block
```

45 regole italiane curate, 173 forme dichiarate più frasi e combinazioni. Disponibili `ItalianProfanity`, `ProfanityChecker`, `CheckerOptions` e le funzioni `check`, `findMatches`, `isClean`, `createChecker`. Il pacchetto è Dart puro, senza dipendenze Flutter.

È un controllo lessicale: la copertura è limitata e alcuni omografi richiedono revisione. `isClean()` è vero solo per `Action.allow`. I contatti sono disattivati per default; se attivati, bloccano con tutti i profili predefiniti. `range` usa offset UTF-16 sul testo originale e non va registrato nei log.

MIT License.
