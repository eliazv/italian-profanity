---
"italian-profanity": minor
---

Nuova opzione `mode: "text"` per descrizioni, bio e altri testi lunghi (D29): limite predefinito di 20.000 punti di codice e policy che in `balanced` porta a `review`, invece di `block`, insulti, termini sessuali e volgarità; bestemmie, termini discriminatori e contatti restano bloccati. `mode: "short"` resta il default e non cambia comportamento. In Dart `CheckerOptions.maxLength` diventa nullable (`effectiveMaxLength` dà il limite risolto) e le facciate accettano `mode: InputMode.text`. Esportate le costanti `SHORT_MAX_LENGTH`/`TEXT_MAX_LENGTH` (`shortMaxLength`/`textMaxLength` in Dart).

Eccezione nominale `goldoni` per `it.sexual.goldone` (Carlo Goldoni, teatri omonimi); il singolare `goldone` resta segnalato.
