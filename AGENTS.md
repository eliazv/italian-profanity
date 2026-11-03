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

## Comandi (dalla fase M0)

| Comando             | Cosa fa                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| `pnpm validate`     | Schema, unicità degli id, termini già normalizzati, fixture per ogni regola |
| `pnpm build:data`   | Genera la tabella di normalizzazione e i dati per TS e Dart                 |
| `pnpm test`         | Test TS (Vitest) e Dart (`dart test`)                                       |
| `pnpm parity`       | Esegue le fixture su entrambi i motori e confronta i risultati              |
| `pnpm audit:benign` | Controlla il corpus di nomi, cognomi e parole comuni                        |
| `pnpm check`        | Tutto quanto sopra più lint: **deve passare prima del merge**               |
