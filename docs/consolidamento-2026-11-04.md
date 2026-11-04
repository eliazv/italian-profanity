# Consolidamento italiano e inglese opzionale

Verifica del 4 novembre 2026. Le 12 PR precedenti risultano integrate in
`master`; i branch rimasti non rappresentano altrettanti lavori ancora aperti.
Il consolidamento parte dal contenuto di `391c608`, senza reimportare i commit
già confluiti tramite squash.

## Dati e compatibilità

| Metrica                            | Prima |  Dopo |
| ---------------------------------- | ----: | ----: |
| Regole italiane                    |   290 |   290 |
| Regole inglesi opzionali           |     3 |    51 |
| Forme inglesi nei campi `terms`    |    12 |   110 |
| Varianti inglesi di frase          |     0 |    20 |
| Fixture condivise                  | 2.618 | 3.459 |
| Configurazioni dell’audit italiano |     1 |     2 |

L’italiano resta predefinito. `languages: ["it", "en"]` attiva entrambi i
dataset; `["en"]` seleziona solo quello inglese. L’attivazione è logica: i
pacchetti distribuiscono già entrambe le lingue. Non sono aggiunte dipendenze
JS o Dart e non vengono eseguite chiamate remote dal rilevatore.

La selezione inglese comprende insulti, volgarità, espressioni sessuali e
offese discriminatorie contestuali. Le forme polisemiche hanno confidenza
media; le identità e i termini anatomici neutri isolati sono esclusi dalle
nuove regole. Le 534 nuove fixture inglesi verificano ogni forma dichiarata,
l’attivazione esplicita, i profili e i negativi vicini, inclusi nomi e parole
innocue con entrambe le lingue attive. Non si promette equivalenza con le
liste delle librerie di confronto o copertura esaustiva dell’inglese.

## Fonti

Le famiglie candidate sono selezionate dal preset MIT di
[Obscenity](https://github.com/jo3-l/obscenity/blob/32c9061c1ad18de43432e4e59084189628f2a2a4/src/preset/english.ts),
che attribuisce il dataset MIT di cuss. Flessioni, gravità, confidenza e
confini sono curati per questo progetto: le regex, le whitelist e i
trasformatori esterni non sono copiati. I notice MIT di entrambi sono inclusi
in `packages/js/NOTICE` e `packages/dart/NOTICE`.

[leo-profanity](https://github.com/jojoee/leo-profanity/tree/fd3c68e5f0415cdb103210109a775f4a2dd9bd90)
e [@2toad/profanity](https://github.com/2Toad/Profanity/tree/19d6da192d61bd14544b7e417ea2613a2ba8357f)
sono confronti di copertura e API, senza importazione delle liste. In
particolare, la licenza MIT del codice di leo-profanity non sostituisce la
licenza della fonte LDNOOBW del suo dizionario. Commit, licenze e usi sono
censiti in `data/sources.json`; i file consultati rimangono in cache.

## Consolidamento Unicode

Le 307 fixture di `data/fixtures/consolidation.jsonl` comprendono 256 input
fuzz fissati, con oracolo esplicito di normalizzazione e limiti diversi. Gli
altri casi verificano match completi e offset UTF-16 in presenza di emoji,
accenti combinanti, invisibili, punteggiatura e surrogati isolati. Le attese
non sono ricavate dall’output del motore.

Il fuzz ha trovato un difetto comune ai due motori: eliminando un invisibile
o un separatore fra due surrogati isolati, la stringa risultante poteva
contenere un solo punto di codice e due origini. TS e Dart ora riallineano
le origini alla coppia risultante, coprendo l’intervallo originale completo.
I surrogati dello stesso tipo e quelli ancora separati restano distinti.
Regressioni minime verificano entrambi i comportamenti.

## Verifiche

- `pnpm check`: validazione, generazione deterministica, lint, tipi,
  7.030 test per ciascun motore, parità con attese su 3.459 fixture e audit.
- Audit: 127.842 input per ciascuna configurazione `it` e `it+en`, senza
  collisioni non giustificate e senza aggiungere accettazioni al corpus.
- Build e `node tools/smoke.mjs`: ESM e CommonJS su 870 fixture di adozione,
  inglesi e di consolidamento, con verifica dell’assenza di dipendenze JS.
- `node tools/smoke-browser.mjs`: le stesse 870 fixture nel bundle ESM
  eseguito da Chrome headless reale; il controllo entra anche nella CI.
- La CI verifica inoltre Node 20, Dart SDK 3.4 e il dry-run del pacchetto
  pub. Il dry-run non pubblica una release.

## Misure locali

Comando: `pnpm --filter italian-profanity build`, poi
`node tools/benchmark.mjs`. Ambiente: Windows 10.0.26300 x64, Node 24.20.0,
AMD Ryzen 5 5600. Su 3.188 fixture pubbliche entro 64 punti di codice,
dopo riscaldamento e con dieci chiamate per campione:

| Configurazione     | Media per chiamata | P95 per chiamata |
| ------------------ | -----------------: | ---------------: |
| Italiano           |           0,088 ms |         0,205 ms |
| Italiano e inglese |           0,093 ms |         0,228 ms |

Il bundle ESM completo occupa 108.828 byte, 16.650 byte gzip, includendo
entrambe le lingue. Sono misure locali su fixture, non garanzie prestazionali
o una misura di precisione su utenti reali; il P95 supera l’obiettivo
indicativo di 0,1 ms. Le opzioni `contacts` non sono incluse in queste misure.

## Passo successivo

Il consolidamento tecnico M4 è completato; restano la prova comparativa M5
nelle applicazioni e la preparazione della versione stabile M6. La curazione
editoriale continua: un controllo lessicale non disambigua il contesto.
Non vengono pubblicati automaticamente nuovi pacchetti e nei test o nei
report non sono inclusi nickname reali di utenti.
