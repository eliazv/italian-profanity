---
"italian-profanity": minor
---

Nei nickname con `_`, `-` o `.` ogni frammento con lettere viene controllato anche da solo, intero e senza cifre esterne: `sborra_verde`, `adolf-nigger` e `x_sborra99` ora vengono bloccati. La parola riunita resta, quindi `p0r-cò_Dio` è riconosciuto come prima. Stessa logica in TS e Dart (D25).
