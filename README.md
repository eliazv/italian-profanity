# italian-profanity

Italian-first profanity detection for short user-generated text — nicknames, usernames, room and team names. Same rules and same verdicts in **TypeScript** and **Dart/Flutter**.

> 🚧 Work in progress — not yet published. Design: [SPECIFICHE.md](SPECIFICHE.md) (Italian).

- Precision first: Italian names, surnames and places such as _Claudio_, _Diodato_ or _Madonna di Campiglio_ are not flagged.
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

Keywords: profanity, italian, parolacce, bestemmie, insulti, moderation, nickname, username, validation, flutter, dart.

## Sviluppo

Requisiti: Node 24 o superiore, pnpm 10 e Dart SDK 3.4 o superiore.

```sh
pnpm install
(cd packages/dart && dart pub get)
pnpm check
```

Regole, comandi e struttura sono descritti in [AGENTS.md](AGENTS.md), il rilascio in [docs/rilascio.md](docs/rilascio.md).

Lo stato di M0, i prossimi controlli e i criteri per eventuali altri linguaggi sono in [docs/analisi-post-m0.md](docs/analisi-post-m0.md). La documentazione è pubblica e versionata; il corpus di audit resta in cache.
