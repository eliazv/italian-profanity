# italian-profanity — istruzioni per agenti

Libreria per riconoscere bestemmie, insulti e volgarità in italiano in testi brevi, con due motori allineati (TypeScript in `packages/js`, Dart in `packages/dart`) e un unico dataset in `data/`.

**Fonte di riferimento: [SPECIFICHE.md](SPECIFICHE.md).** Le decisioni sono in [docs/decisioni.md](docs/decisioni.md). Se una richiesta è in contrasto con una decisione, fallo presente prima di procedere.

Lingua: codice e identificatori in inglese; commenti, documentazione e messaggi dei commit in italiano.

## Regole che non si violano

1. **Le parole stanno solo in `data/`.** I motori non contengono termini, liste o regex di parole.
2. **I file generati non si modificano a mano.** `packages/*/src/generated` e `packages/dart/lib/src/generated` si rigenerano con `pnpm build:data`.
3. **Parità.** Ogni modifica a normalizzazione, segmentazione, rilevatore o policy va fatta **in entrambi i motori nella stessa PR**, e `pnpm parity` deve passare.
4. **Ogni regola nuova o modificata richiede le sue fixture**: almeno un caso positivo e uno negativo vicino. Inoltre `pnpm audit:benign` deve essere pulito, oppure le collisioni vanno giustificate in `data/audit/accepted.jsonl`.
5. **Nessun dato esterno senza inventario.** Ogni fonte va in `data/sources.json` con licenza e commit. HurtLex ed EVALITA non entrano nel repository. Il corpus napolux si scarica solo in cache e non va mai versionato.
6. **Le eccezioni sopprimono un match**, non rimuovono testo (D6).
7. Tipo di regola predefinito: `word` con forme elencate. `prefix` solo se giustificato in `note` (§5.1).
8. **Mai inserire nickname reali** di utenti nelle fixture o nei log. Usare esempi inventati o anonimizzati.

## Requisiti

Node 24 o superiore, pnpm 10 (versione fissata in `packageManager`) e Dart SDK 3.4 o superiore. Al primo avvio: `pnpm install`, poi `dart pub get` in `packages/dart`.

## Comandi

| Comando                      | Cosa fa                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm validate`              | Schema, unicità degli id, termini già normalizzati, fixture per ogni regola            |
| `pnpm build:data`            | Genera la tabella di normalizzazione e i dati per TS e Dart                            |
| `pnpm lint` / `pnpm format`  | Biome (TS, JSON, Markdown) più `dart format` e `dart analyze`                          |
| `pnpm typecheck`             | `tsc` su `tools/` e sul pacchetto, con `isolatedDeclarations` sul codice pubblicato    |
| `pnpm test`                  | Test TS (Vitest) e Dart (`dart test`)                                                  |
| `pnpm parity`                | Confronta i motori e verifica sempre le attese di normalizzazione, segmenti ed errori  |
| `pnpm parity --expectations` | Verifica anche attese lessicali e match completi: obbligatorio in check e CI           |
| `pnpm audit:benign`          | Esegue il rilevatore sul corpus e verifica collisioni e azioni accettate               |
| `pnpm check`                 | Validazione, build, lint, tipi, test, attese e audit: **deve passare prima del merge** |
| `pnpm changeset`             | Registra una modifica per il prossimo rilascio                                         |
| `pnpm release:version`       | Applica i changeset e allinea la versione Dart (vedi `docs/rilascio.md`)               |

## Dove mettere le mani

- **Una regola o un'eccezione**: `data/rules/<lingua>/<categoria>.json` o `data/exceptions/`, con le fixture in `data/fixtures/`, poi `pnpm build:data`.
- **La normalizzazione**: le mappe stanno in `data/normalization/`; la logica sta in `packages/js/src/normalize.ts` e `packages/dart/lib/src/normalize.dart`, sempre insieme.
- **Il formato dei risultati per la parità**: `packages/js/test/fixtures-runner.ts` e `packages/dart/tool/fixtures_runner.dart` devono produrre lo stesso JSON.
- **Gli offset (`range`)** sono in unità UTF-16, native sia in JS sia in Dart.
- **Il formatter Dart** passa da `tools/format-dart.ts`: esclude i dati generati, che appartengono al build e non si riformattano a mano.
