# Contribuire

Segnalare falsi positivi e falsi negativi tramite i moduli nelle [issue](https://github.com/eliazv/italian-profanity/issues/new/choose). Indicare versione, profilo, lingue, risultato atteso ed effettivo. Usare esempi inventati o anonimizzati, mai nickname reali.

La fonte normativa è [SPECIFICHE.md](SPECIFICHE.md); leggere anche [AGENTS.md](AGENTS.md), [decisioni](docs/decisioni.md) e [procedura di curazione](docs/curazione.md).

## Modifiche

1. Installare Node 24+, pnpm 10 e Dart 3.4+, poi eseguire `pnpm install` e `dart pub get` in `packages/dart`.
2. Creare un branch da `master`. I termini lessicali stanno solo in `data/`; ogni nuova fonte esterna richiede inventario e licenza.
3. Aggiungere fixture positive e negative vicine. Le modifiche ai motori devono essere equivalenti in TypeScript e Dart nella stessa PR.
4. Rigenerare con `pnpm build:data`, senza modificare a mano i file generati. Eseguire `pnpm check` e valutare ogni collisione dell'audit.
5. Aggiungere un changeset con `pnpm changeset` per i cambiamenti di comportamento. I changeset conservano il frontmatter YAML e sono esclusi dal formatter Markdown.
6. Aprire una pull request: tutti i controlli CI devono passare e le conversazioni devono essere risolte prima del merge.

Codice e identificatori sono in inglese; documentazione, commenti e messaggi di commit sono in italiano. Il corpus di audit rimane in cache e non va versionato.
