# italian-profanity

[![CI](https://github.com/eliazv/italian-profanity/actions/workflows/ci.yml/badge.svg)](https://github.com/eliazv/italian-profanity/actions/workflows/ci.yml) · [Licenza MIT](LICENSE)

[![npm](https://img.shields.io/npm/v/italian-profanity?label=npm)](https://www.npmjs.com/package/italian-profanity) [![pub.dev](https://img.shields.io/pub/v/italian_profanity?label=pub.dev)](https://pub.dev/packages/italian_profanity)

Italian-first profanity detection for short user-generated text — nicknames, usernames, room and team names. Same rules and same verdicts in **TypeScript** and **Dart/Flutter**.

> Versione 0.1.0, primo rilascio senza suffisso prerelease.

Stato: prima versione senza suffisso prerelease, con rilevamento e policy in entrambi i motori. The first curated Italian core has 290 rules and 1,034 declared word/prefix/compound forms, plus phrases and blasphemy combinations.

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

Pacchetti: npm [`italian-profanity`](https://www.npmjs.com/package/italian-profanity) · pub.dev [`italian_profanity`](https://pub.dev/packages/italian_profanity).

**Versione 0.1.0.** Sono disponibili `findMatches()`, `check()`, `isClean()` e `createChecker()` in TS e Dart, con contatti facoltativi, eccezioni e soglie per categoria. Il lessico contiene 290 regole e 1.034 forme dichiarate per parole, prefissi e composti, più frasi e combinazioni di bestemmie. Tutte le categorie italiane hanno un primo nucleo; i dialetti sono coperti solo parzialmente. L’inglese opzionale contiene 51 regole curate, con 110 forme e 20 varianti di frase, senza dipendenze aggiuntive.

Le attese sono condivise su 3.459 fixture. L’audit esegue il rilevatore su 127.842 input per ciascuna configurazione (`it` e `it+en`) e richiede che ogni collisione sia corretta o motivata. Alcuni omografi di nomi e cognomi producono intenzionalmente `review` in `balanced`: non viene promessa disambiguazione contestuale o assenza assoluta di falsi positivi. `strict` blocca anche questi casi. Le motivazioni e gli esiti attesi sono in [data/audit/accepted.jsonl](data/audit/accepted.jsonl).

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

**Aggiornamento dalla beta:** la 0.1.0 amplia il lessico e può cambiare gli esiti. Consultare il changelog e il [confronto di comportamento](data/releases/0.1.0/behavior-diff.md) prima dell’aggiornamento.

Il consolidamento tecnico è completato. La prova comparativa nelle due applicazioni del manutentore è pianificata e resta da completare; non viene dichiarata una misura di precisione su utenti reali.

Keywords: profanity, italian, parolacce, bestemmie, insulti, moderation, nickname, username, validation, flutter, dart.

## Installazione

```sh
npm install --save-exact italian-profanity@0.1.0
```

```yaml
dependencies:
  italian_profanity: 0.1.0
```

La [guida d'integrazione](docs/integrazione.md) descrive configurazione condivisa client/server, gestione di `review`, limiti e migrazione dei vecchi filtri. Il dataset inglese curato va attivato con `languages: ["it", "en"]`; `languages: ["en"]` seleziona solo l’inglese. Le librerie esterne sono riferimenti di curazione, senza dipendenze a runtime. Non viene promessa copertura equivalente alle loro liste. Il [rapporto di consolidamento](docs/consolidamento-2026-11-04.md) documenta fonti, controlli e limiti.

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

## Supporto e integrazioni

Il progetto resta gratuito e MIT. Per sostenerne la manutenzione è previsto [GitHub Sponsors](https://github.com/sponsors/eliazv), disponibile dopo l'attivazione del profilo. Per integrazioni, consulenza e sviluppo software su misura: [eliazavatta.it](https://eliazavatta.it).
