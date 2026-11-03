# italian-profanity

Italian-first profanity detection for short user-generated text — nicknames, usernames, room and team names. Same rules and same verdicts in **TypeScript** and **Dart/Flutter**.

> 🚧 Work in progress — not yet published. Design: [SPECIFICHE.md](SPECIFICHE.md) (Italian).

- Precision first: Italian names, surnames and places such as *Claudio*, *Diodato* or *Madonna di Campiglio* are not flagged.
- Catches common evasions: leetspeak, separators, accents, repeated letters, spaced letters and Unicode look-alikes.
- Blasphemy-aware: divine terms are only flagged in combination with an insult (*dio* alone is fine).
- Detection separated from policy: `balanced`, `strict` and `lenient` profiles, plus custom rules and exceptions.
- Zero runtime dependencies, offline, MIT.

---

## In italiano

Libreria per riconoscere bestemmie, insulti e volgarità **in italiano** in testi brevi, come nickname e nomi di stanze o team. Ha le stesse regole e gli stessi esiti in JavaScript/TypeScript e in Dart/Flutter.

Non blocca nomi innocui (Claudio, Diodato, Porcedda) e riconosce le elusioni più comuni (`D10 p0rc0`, `c a z z o`, `porcooo`).

**Limite dichiarato:** è un controllo lessicale. Un testo senza match non è necessariamente appropriato, e la moderazione umana resta necessaria.

Pacchetti previsti: npm `italian-profanity` · pub.dev `italian_profanity`.

Keywords: profanity, italian, parolacce, bestemmie, insulti, moderation, nickname, username, validation, flutter, dart.
