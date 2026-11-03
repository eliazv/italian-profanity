# italian-profanity

[![CI](https://github.com/eliazv/italian-profanity/actions/workflows/ci.yml/badge.svg)](https://github.com/eliazv/italian-profanity/actions/workflows/ci.yml) · [Licenza MIT](LICENSE)

Italian-first profanity detection for short user-generated text — nicknames, usernames, room and team names. Same rules and same verdicts in **TypeScript** and **Dart/Flutter**.

> Beta 0.1.0-beta.0 per integrazioni sperimentali.

Current status: first integration beta, with detection and policy APIs in both engines. The first curated Italian core has 65 rules and 244 declared word/prefix/compound forms, plus phrases and blasphemy combinations.

- Precision first: whole-word rules, explicit exceptions and an audit on Italian names, surnames and common words.
- Catches common evasions: leetspeak, separators, accents, repeated letters, spaced letters and Unicode look-alikes.
- Blasphemy-aware: divine terms are only flagged in combination with an insult (_dio_ alone is fine).
- Detection separated from policy: `balanced`, `strict` and `lenient` profiles, plus custom rules and exceptions.
- Zero runtime dependencies, offline, MIT.

---

## In italiano

Libreria per riconoscere bestemmie, insulti e volgarità **in italiano** in testi brevi, come nickname e nomi di stanze o team. Ha le stesse regole e gli stessi esiti in JavaScript/TypeScript e in Dart/Flutter.

Non blocca nomi innocui (Claudio, Diodato, Porcedda) e riconosce le elusioni più comuni (`D10 p0rc0`, `c a z z o`, `porcooo`).

**Limite dichiarato:** è un controllo lessicale. Un testo senza match non è necessariamente appropriato, e la moderazione umana resta necessaria.

Pacchetti previsti: npm `italian-profanity` · pub.dev `italian_profanity`.

**Prima beta di integrazione.** Sono disponibili `findMatches()`, `check()`, `isClean()` e `createChecker()` in TS e Dart, con contatti facoltativi, eccezioni e soglie per categoria. Il lessico contiene 65 regole e 244 forme dichiarate per parole, prefissi e composti, più frasi e combinazioni di bestemmie. Tutte le categorie italiane hanno un primo nucleo; i dialetti restano da curare. L'inglese opzionale contiene tre famiglie minime.

Le attese sono condivise su 1.096 fixture. L'audit esegue il rilevatore su 127.842 input e richiede che ogni collisione sia corretta o motivata. Alcuni omografi di nomi e cognomi producono intenzionalmente `review` in `balanced`: non viene promessa disambiguazione contestuale o assenza assoluta di falsi positivi. `strict` blocca anche questi casi. Le motivazioni e gli esiti attesi sono in [data/audit/accepted.jsonl](data/audit/accepted.jsonl).

```ts
import { check, createChecker } from "italian-profanity"

check("D10 p0rc0").action // "block"
check("Claudio").action // "allow"

const checker = createChecker({ profile: "balanced", contacts: true })
checker.check("www.example.org").action // "block"
```

```dart
import 'package:italian_profanity/italian_profanity.dart';

final checker = ItalianProfanity.createChecker(contacts: true);
final result = checker.check('D10 p0rc0');
// result.action == Action.block
```

La beta consente di provare l'integrazione. Prima della v0.1 stabile restano curazione, consolidamento e prova in una delle applicazioni previste.

Keywords: profanity, italian, parolacce, bestemmie, insulti, moderation, nickname, username, validation, flutter, dart.

## Installazione della beta

```sh
npm install --save-exact italian-profanity@0.1.0-beta.0
```

```yaml
dependencies:
  italian_profanity: 0.1.0-beta.0
```

La [guida d'integrazione](docs/integrazione.md) descrive configurazione condivisa client/server, gestione di `review`, limiti e migrazione dei vecchi filtri. Il nucleo inglese minimo va attivato con `languages: ["it", "en"]`; non sostituisce una wordlist inglese completa.

## Sviluppo

Requisiti: Node 24 o superiore, pnpm 10 e Dart SDK 3.4 o superiore.

```sh
pnpm install
(cd packages/dart && dart pub get)
pnpm check
```

Regole, comandi e struttura sono descritti in [AGENTS.md](AGENTS.md), il rilascio in [docs/rilascio.md](docs/rilascio.md).

Lo stato di M0, i prossimi controlli e i criteri per eventuali altri linguaggi sono in [docs/analisi-post-m0.md](docs/analisi-post-m0.md). La documentazione è pubblica e versionata; il corpus di audit resta in cache.

Per contribuire, leggere [CONTRIBUTING.md](CONTRIBUTING.md).
