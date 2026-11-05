# Differenze di comportamento: 0.3.0 → 0.4.0

Confrontate 3650 fixture valide: 110 cambiano nei match o nell’azione, 64 cambiano azione.
Sono casi di regressione pubblici, non una stima della frequenza su utenti reali. Le fixture di errore di configurazione sono escluse.
Input, opzioni e risultati completi sono in [behavior-diff.jsonl](behavior-diff.jsonl).

| Fixture       | Lingue | Profilo  | Prima  | Dopo   | Differenze nei match                      |
| ------------- | ------ | -------- | ------ | ------ | ----------------------------------------- |
| compounds-035 | it     | balanced | block  | block  | +it.insult.vaffanculo                     |
| compounds-036 | it     | balanced | block  | block  | +it.insult.vafanculo                      |
| compounds-038 | it     | balanced | block  | block  | +it.insult.vaffanculo                     |
| compounds-049 | it     | balanced | block  | block  | +it.insult.coglione                       |
| compounds-050 | it     | balanced | block  | block  | +it.insult.coglione                       |
| compounds-051 | it     | balanced | block  | block  | +it.insult.coglione                       |
| compounds-052 | it     | balanced | block  | block  | +it.insult.coglione                       |
| compounds-053 | it     | balanced | block  | block  | +it.insult.coglione                       |
| compounds-054 | it     | balanced | allow  | block  | +it.insult.coglione                       |
| compounds-083 | it     | balanced | block  | block  | +it.sexual.del-cazzo-composto             |
| compounds-084 | it     | balanced | block  | block  | +it.sexual.del-cazzo-composto             |
| compounds-085 | it     | balanced | block  | block  | +it.sexual.del-cazzo-composto             |
| compounds-086 | it     | balanced | block  | block  | +it.sexual.del-cazzo-composto             |
| context-015   | it     | balanced | review | review | +it.insult.mortacci                       |
| context-016   | it     | balanced | review | review | +it.insult.mortacci                       |
| context-017   | it     | balanced | review | review | +it.insult.mortacci                       |
| context-018   | it     | balanced | review | review | +it.insult.mortacci                       |
| context-019   | it     | balanced | review | review | +it.insult.mortacci                       |
| context-020   | it     | balanced | review | review | +it.insult.mortacci                       |
| context-021   | it     | balanced | review | review | +it.insult.mortacci                       |
| context-024   | it     | balanced | review | review | +it.insult.mortacci                       |
| context-026   | it     | strict   | block  | block  | +it.insult.mortacci                       |
| context-118   | it     | balanced | review | allow  | Metadati, intervalli o numero dei match   |
| context-120   | it     | strict   | block  | block  | Metadati, intervalli o numero dei match   |
| context-121   | it     | balanced | review | allow  | Metadati, intervalli o numero dei match   |
| context-123   | it     | strict   | block  | block  | Metadati, intervalli o numero dei match   |
| context-161   | it     | balanced | block  | block  | +it.discriminatory.zingaro                |
| context-162   | it     | balanced | block  | block  | +it.discriminatory.zingaro                |
| context-163   | it     | balanced | block  | block  | +it.discriminatory.zingaro                |
| context-213   | it     | balanced | block  | block  | +it.discriminatory.zingaro                |
| context-214   | it     | balanced | block  | block  | +it.discriminatory.zingaro                |
| context-215   | it     | balanced | block  | block  | +it.discriminatory.zingaro                |
| context-216   | it     | balanced | allow  | review | +it.discriminatory.zingaro                |
| curation-001  | it     | balanced | allow  | block  | +it.blasphemy.divine-insult               |
| curation-002  | it     | balanced | allow  | block  | +it.blasphemy.divine-insult               |
| curation-003  | it     | balanced | allow  | block  | +it.blasphemy.divine-insult               |
| curation-004  | it     | balanced | allow  | block  | +it.blasphemy.divine-insult               |
| curation-005  | it     | balanced | allow  | block  | +it.blasphemy.divine-insult               |
| curation-011  | it     | balanced | review | allow  | Metadati, intervalli o numero dei match   |
| curation-012  | it     | lenient  | allow  | allow  | Metadati, intervalli o numero dei match   |
| curation-013  | it     | strict   | block  | block  | Metadati, intervalli o numero dei match   |
| curation-014  | it     | balanced | review | allow  | Metadati, intervalli o numero dei match   |
| curation-015  | it     | lenient  | allow  | allow  | Metadati, intervalli o numero dei match   |
| curation-016  | it     | strict   | block  | block  | Metadati, intervalli o numero dei match   |
| curation-017  | it     | balanced | review | allow  | Metadati, intervalli o numero dei match   |
| curation-018  | it     | lenient  | allow  | allow  | Metadati, intervalli o numero dei match   |
| curation-019  | it     | strict   | block  | block  | Metadati, intervalli o numero dei match   |
| curation-021  | it     | balanced | block  | block  | +it.vulgar.imprecazioni-cazzo             |
| curation-022  | it     | balanced | allow  | block  | +it.vulgar.imprecazioni-cazzo             |
| curation-023  | it     | balanced | block  | block  | +it.vulgar.imprecazioni-cazzo             |
| curation-024  | it     | balanced | allow  | block  | +it.vulgar.imprecazioni-cazzo             |
| curation-026  | it     | balanced | allow  | block  | +it.sexual.succhiacazzi                   |
| curation-027  | it     | balanced | allow  | block  | +it.sexual.succhiacazzi                   |
| curation-028  | it     | balanced | allow  | block  | +it.sexual.succhiacazzi                   |
| curation-030  | it     | balanced | allow  | block  | +it.sexual.del-cazzo-composto             |
| curation-031  | it     | balanced | allow  | block  | +it.sexual.del-cazzo-composto             |
| curation-032  | it     | balanced | allow  | block  | +it.sexual.del-cazzo-composto             |
| curation-033  | it     | balanced | allow  | block  | +it.sexual.del-cazzo-composto             |
| curation-043  | it     | balanced | allow  | review | +it.insult.vaffa                          |
| curation-044  | it     | strict   | allow  | block  | +it.insult.vaffa                          |
| curation-046  | it     | balanced | allow  | review | +it.insult.mortacci                       |
| curation-047  | it     | balanced | allow  | review | +it.insult.mortacci                       |
| curation-049  | it     | balanced | allow  | review | +it.sexual.segone                         |
| curation-050  | it     | strict   | allow  | block  | +it.sexual.segone                         |
| curation-052  | it     | balanced | allow  | block  | +it.sexual.ti-scopo                       |
| curation-053  | it     | balanced | allow  | block  | +it.sexual.ti-scopo                       |
| curation-054  | it     | balanced | allow  | block  | +it.sexual.ti-scopo                       |
| curation-055  | it     | balanced | allow  | block  | +it.sexual.ti-scopo                       |
| curation-059  | it     | balanced | allow  | block  | +it.discriminatory.lesbicona              |
| curation-060  | it     | balanced | allow  | block  | +it.discriminatory.lesbicona              |
| curation-062  | it     | balanced | allow  | review | +it.discriminatory.travone                |
| curation-064  | it     | balanced | allow  | review | +it.discriminatory.giudeo                 |
| curation-067  | it     | balanced | allow  | review | +it.discriminatory.zingaro                |
| curation-068  | it     | balanced | allow  | review | +it.discriminatory.zingaro                |
| curation-069  | it     | strict   | allow  | block  | +it.discriminatory.zingaro                |
| curation-073  | it     | balanced | allow  | review | +it.discriminatory.spastico               |
| curation-076  | it     | balanced | allow  | block  | +it.discriminatory.muso-giallo            |
| curation-077  | it     | balanced | allow  | block  | +it.discriminatory.muso-giallo            |
| curation-081  | it     | balanced | block  | allow  | −it.vulgar.minchia                        |
| expansion-266 | it     | balanced | review | allow  | Metadati, intervalli o numero dei match   |
| expansion-267 | it     | balanced | review | allow  | Metadati, intervalli o numero dei match   |
| expansion-268 | it     | balanced | review | allow  | Metadati, intervalli o numero dei match   |
| expansion-269 | it     | balanced | review | allow  | Metadati, intervalli o numero dei match   |
| expansion-271 | it     | strict   | block  | block  | Metadati, intervalli o numero dei match   |
| lexicon-134   | it     | balanced | block  | block  | +it.vulgar.imprecazioni-cazzo             |
| lexicon-135   | it     | balanced | block  | block  | +it.vulgar.imprecazioni-cazzo             |
| masking-001   | it     | balanced | allow  | block  | +it.sexual.cazzo                          |
| masking-002   | it     | balanced | allow  | block  | +it.sexual.cazzo                          |
| masking-003   | it     | balanced | allow  | block  | +it.vulgar.minchia                        |
| masking-004   | it     | balanced | allow  | block  | +it.blasphemy.divine-insult               |
| masking-005   | it     | balanced | allow  | block  | +it.blasphemy.divine-insult               |
| masking-006   | it     | balanced | allow  | block  | +it.vulgar.kazzo-grafie                   |
| masking-007   | it     | balanced | allow  | block  | +it.insult.fanculo                        |
| masking-008   | it     | balanced | allow  | block  | +it.blasphemy.divine-insult               |
| masking-009   | it     | balanced | allow  | block  | +it.blasphemy.divine-insult               |
| masking-010   | it     | balanced | block  | block  | +it.sexual.cazzo                          |
| masking-011   | it     | balanced | allow  | block  | +it.sexual.cazzo                          |
| masking-012   | it     | balanced | allow  | block  | +it.blasphemy.divine-insult               |
| masking-013   | it     | strict   | allow  | block  | +it.sexual.cazzo                          |
| masking-022   | it     | balanced | block  | allow  | −it.vulgar.minchia                        |
| masking-029   | it, en | balanced | allow  | block  | +en.vulgar.fuck                           |
| masking-030   | it     | balanced | allow  | block  | +it.sexual.cazzo                          |
| masking-031   | it     | balanced | allow  | block  | +it.sexual.cazzo                          |
| masking-032   | it     | balanced | allow  | block  | +it.sexual.cazzo                          |
| masking-033   | it     | balanced | allow  | block  | +it.sexual.cazzo, +it.vulgar.kazzo-grafie |
| mcuration-085 | it     | balanced | block  | block  | +it.discriminatory.zingaro                |
| variants-010  | it     | balanced | block  | block  | +it.sexual.cazzo                          |
| variants-011  | it     | balanced | block  | block  | +it.sexual.cazzo                          |
| variants-012  | it     | balanced | block  | block  | +it.sexual.cazzo                          |
| variants-013  | it     | balanced | block  | block  | +it.sexual.cazzo                          |
