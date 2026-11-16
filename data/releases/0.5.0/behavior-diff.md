# Differenze di comportamento: 0.4.1 → 0.5.0

Confrontate 3662 fixture valide: 6 cambiano nei match o nell’azione, 6 cambiano azione.
Sono casi di regressione pubblici, non una stima della frequenza su utenti reali. Le fixture di errore di configurazione sono escluse.
Input, opzioni e risultati completi sono in [behavior-diff.jsonl](behavior-diff.jsonl).

| Fixture       | Lingue | Profilo  | Prima  | Dopo   | Differenze nei match                    |
| ------------- | ------ | -------- | ------ | ------ | --------------------------------------- |
| expansion-195 | it     | balanced | review | allow  | −it.sexual.goldone                      |
| it-names-006  | it     | balanced | review | allow  | −it.sexual.goldone                      |
| text-mode-001 | it     | balanced | block  | review | Metadati, intervalli o numero dei match |
| text-mode-003 | it     | balanced | block  | review | Metadati, intervalli o numero dei match |
| text-mode-004 | it     | balanced | allow  | block  | +it.blasphemy.divine-insult             |
| text-mode-006 | it     | balanced | allow  | block  | +it.discriminatory.frocio               |
