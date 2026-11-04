# Differenze di comportamento: 0.1.0 → 0.2.0

Confrontate 3470 fixture valide: 11 cambiano nei match o nell’azione, 11 cambiano azione.
Sono casi di regressione pubblici, non una stima della frequenza su utenti reali. Le fixture di errore di configurazione sono escluse.
Input, opzioni e risultati completi sono in [behavior-diff.jsonl](behavior-diff.jsonl).

| Fixture     | Lingue | Profilo  | Prima | Dopo  | Differenze nei match        |
| ----------- | ------ | -------- | ----- | ----- | --------------------------- |
| engine-110  | it     | balanced | allow | block | +it.insult.stronzo          |
| engine-111  | it     | balanced | allow | block | +it.insult.stronzo          |
| engine-112  | it     | balanced | allow | block | +it.sexual.puttana          |
| engine-113  | it     | balanced | allow | block | +it.sexual.cazzo            |
| engine-114  | it     | balanced | allow | block | +it.blasphemy.divine-insult |
| engine-120  | it     | balanced | allow | block | +it.insult.stronzo          |
| engine-121  | it     | balanced | allow | block | +it.insult.stronzo          |
| english-535 | en     | balanced | allow | block | +en.discriminatory.nigger   |
| english-536 | en     | balanced | allow | block | +en.discriminatory.nigger   |
| english-539 | it, en | balanced | allow | block | +en.discriminatory.nigger   |
| english-540 | it, en | balanced | allow | block | +en.vulgar.fuck             |
