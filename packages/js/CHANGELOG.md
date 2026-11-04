# italian-profanity

## 0.2.0 — 2026-11-04

### Minor Changes

- 3cfe52f: Riconosce le parole sensibili seguite o precedute da cifre (`stronzo_99`, `puttana88`, `88puttana`) con viste aggiuntive senza cifre esterne, nei motori TS e Dart. Riconosce anche le parole unite in CamelCase (`StronzoRutto`, `FuckYou`), senza cercare sottostringhe nel testo tutto minuscolo o tutto maiuscolo. Aggiunge le forme inglesi `nigga` e `niggas`.

### Differenze dalla 0.1.0

Sulle 3.470 fixture valide cambiano 11 esiti, tutti da `allow` a `block` e tutti nei casi introdotti da questa versione: cifre esterne (`stronzo_99`, `stronzo99`, `88puttana`, `c4zz0_99`, `porcodio_99`), CamelCase (`StronzoRutto`, `RuttoStronzo`, `FuckYou`) e le forme `nigga`, `niggas`, `nigger_88`. Nessun esito passa da `block` ad `allow`. L'audit su nomi, cognomi e parole comuni non registra collisioni nuove.

Tabella completa e risultati riproducibili: [confronto di comportamento](https://github.com/eliazv/italian-profanity/blob/v0.2.0/data/releases/0.2.0/behavior-diff.md).

## 0.1.0 — 2026-11-04

Primo rilascio senza suffisso prerelease, con versioni allineate per npm e pub.dev e nessuna dipendenza a runtime.

### Copertura e comportamento

- Italiano: da 65 regole e 244 forme nella beta pubblicata a 290 regole e 1.034 forme, oltre a frasi e combinazioni. Aggiunti composti, flessioni, grafie alternative, regionalismi selezionati e offese contestuali.
- Inglese opzionale: da 3 a 51 regole, con 110 forme e 20 varianti di frase; italiano ancora predefinito. Candidati dal preset MIT di Obscenity, confronto con leo-profanity e @2toad/profanity, fonti fissate e attribuzioni incluse. Nessuna dipendenza da queste librerie.
- Corrette in TS e Dart le origini UTF-16 quando due surrogati isolati si ricongiungono dopo la rimozione di invisibili o separatori.
- Le forme ambigue mantengono policy prudenti; le nuove regole possono rendere più restrittivo il filtro rispetto alla beta.

### Consolidamento e verifiche

- 3.459 fixture condivise, 7.030 test per motore e parità con attese complete.
- Audit su 127.842 input per ciascuna configurazione it e it+en, senza nuove collisioni non giustificate.
- 307 fixture di consolidamento Unicode, di cui 256 casi fuzz fissati; smoke su 870 fixture ESM, CommonJS e Chrome reale. Compatibilità Node 20 e Dart SDK 3.4 verificata in CI.
- Bundle ESM completo misurato: circa 16,7 KB gzip. Aggiunti benchmark riproducibile e confronto di comportamento con la beta.

### Differenze dalla 0.1.0-beta.1

Confrontate 3.445 fixture valide: 1.372 hanno match o azioni diversi e 1.190 cambiano azione. Sono casi di regressione, non frequenze misurate sugli utenti.

| Transizione                     | Casi |
| ------------------------------- | ---: |
| allow → block                   |  633 |
| allow → review                  |  532 |
| review → block                  |   25 |
| Azione invariata, match diversi |  182 |

Tabella completa e risultati riproducibili: [confronto di comportamento](https://github.com/eliazv/italian-profanity/blob/v0.1.0/data/releases/0.1.0/behavior-diff.md).

### Prova nelle applicazioni

Consolidamento tecnico completato. Il manutentore ha pianificato l’integrazione in due proprie app; prova comparativa sul campo e valutazione dei falsi positivi restano da completare. Questo rilascio non dichiara una copertura esaustiva o validazione su utenti reali.

## 0.1.0-beta.1

### Patch Changes

- Completa metadati, keyword, badge e collegamenti reciproci delle pagine npm e pub.dev. Rimuove le diciture di lavoro in corso dai README pubblicati e rende ripetibile il workflow saltando le versioni già presenti sui registri. Nessuna modifica al rilevamento o alle policy.

## 0.1.0-beta.0

### Minor Changes

- Amplia il lessico italiano con 20 regole curate, nuove forme e frasi esplicite; aggiunge casi di regressione per omografi e false corrispondenze.
- b6c68ba: Implementa rilevatore, policy e API pubbliche allineate in TypeScript e Dart; nucleo italiano, contatti facoltativi, personalizzazioni e audit bloccante con collisioni motivate.
- Prepara la prima beta per npm e pub.dev, con nucleo inglese minimo opzionale, regressioni di adozione e guida alla migrazione client/server. Corregge la validazione delle frasi con parole di una lettera e documenta tre omografi nominali M3.
