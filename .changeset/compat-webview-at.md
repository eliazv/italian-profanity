---
"italian-profanity": patch
---

Compatibilità con WebView datate: rimosso `Array.prototype.at`, assente in Chrome < 92 e Safari/iOS < 15.4. Lì `createChecker` lanciava `TypeError: e.at is not a function` all'import del modulo. Nessun cambiamento di comportamento; un test vieta il ritorno di API ES2022+ non supportate.
