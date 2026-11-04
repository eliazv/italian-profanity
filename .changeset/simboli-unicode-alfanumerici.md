---
"italian-profanity": minor
---

Riconduce a lettere e cifre i simboli Unicode che NFKD trasforma in un solo carattere alfanumerico: numeri romani, lettere cerchiate, alfanumerici matematici, apici e pedici. Così `ⅽazzo`, `Ⓒⓐⓩⓩⓞ` e `𝐜𝐚𝐳𝐳𝐨` vengono riconosciuti in entrambi i motori. I simboli che diventerebbero più caratteri (`™`, `⑩`) restano invariati.
