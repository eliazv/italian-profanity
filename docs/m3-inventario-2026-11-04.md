# Italian profanity — inventario di copertura M3

Data: 4 novembre 2026 · Commit di lavoro sul branch `feat/m3-large-curated-italian-lexicon`.

## Stato quantitativo

| Metrica                                          | Prima |       Ora |
| ------------------------------------------------ | ----: | --------: |
| Regole italiane                                  |   126 |   **290** |
| Forme uniche dichiarate nei `terms`              |   517 | **1.034** |
| Varianti di frasi dichiarate                     |     — |   **187** |
| Forme divine nella regola combinatoria           |     7 |    **10** |
| Forme offensive esatte nella regola combinatoria |    36 |    **70** |
| Fixture condivise TS/Dart                        | 1.583 | **2.618** |

Le 290 regole si distribuiscono in: **117 insulti**, **64 regole sessuali**, **60 volgari**, **41 discriminatorie**, **8 bestemmie**. I numeri indicano regole e forme, non precisione, recall o copertura di tutti i dialetti italiani. La moltiplicazione delle forme della regola combinatoria non va confusa con forme dichiarate indipendenti.

## Come è stato ampliato

1. **Lessico colloquiale e regionale:** insulti lievi come `fesso`, `cafone`, `grullo`, `tamarro`; termini forti come `strunz`, `bimbominkia`, `scassamaroni`, accanto a forme sessuali e intercalari. I lemmi ambigui sono `medium`, destinati a `review` in `balanced`.
2. **Flessibilità morfologica controllata:** plurali, generi e derivati frequenti sono espliciti. Non sono utilizzate regole globali per suffissi che produrrebbero molti falsi positivi.
3. **Frasi contestuali:** insulti composti, eufemismi, imprecazioni romanesche come `mortacci tua`, frasi sessuali e discriminazione diretta con identità/condizioni che rimangono neutre se isolate.
4. **Nickname concatenati:** `figliodiputtana`, `pezzodimerda`, `diodimerda`, `mannaggiadio`, ecc. sono rilevati anche senza spazi.
5. **Grafie alternative manuali:** `minkia`, `kazzo`, `caxxo`, `koglione`, `vaffankulo`. Le sostituzioni già presenti nella normalizzazione non vengono replicate inutilmente in migliaia di righe.
6. **Guardrail:** 40 controlli aggiuntivi proteggono termini religiosi isolati, identità neutre e parole come `cazzotto`, `cazzuola`, `sega circolare`, `finocchio`, `palle da tennis`.

## Fonti e diritti

Candidati confrontati con gli inventari già versionati in `data/sources.json`: raccolta italiana di napolux e LDNOOBW; fonti linguistiche pubbliche usate solo per verifica semantica. Ogni voce nuova è scelta e formulata manualmente: nessun import indiscriminato, nessuna incorporazione di dataset a licenza non commerciale. Il materiale con attribuzione o licenza incompatibile non viene copiato.

## Esclusioni intenzionali

Non inserire isolatamente parole comuni, identità o termini sanitari/descrittivi come `sega`, `palle`, `fava`, `finocchio`, `gay`, `lesbica`, `ebreo`, `musulmano`, `handicappato`. Alcune compaiono in **frasi chiaramente denigratorie**, che hanno una propria regola. Una voce nei dizionari di parolacce non giustifica di per sé un blocco: la precisione delle regole è prioritaria.

## Qualità e lavoro residuo

- Non confondere **matched** con **da bloccare**: le parole ambigue richiedono `review` in balanced; il profilo strict è più aggressivo.
- L'audit di 127.842 input contiene nomi, cognomi e parole italiane, ma **non dimostra** una precisione su nickname in produzione o messaggi lunghi.
- Serve una valutazione in _shadow mode_ su esempi anonimi e non identificativi, con analisi di falsi negativi, falsi positivi e distribuzione delle azioni. Non conservare nickname reali o identificativi nelle fixture.
- Dialetti, eufemismi nuovi, ironia, contesti allusivi e grafie creative restano **aperti**, come per ogni filtro lessicale. Il dataset non può essere dichiarato esaustivo senza un perimetro di copertura misurabile.
- Un successivo rilascio npm/pub.dev è necessario perché gli utilizzatori ricevano effettivamente le nuove regole. Nessuna pubblicazione automatica è inclusa in questa PR.

## Esclusioni aggiunte dopo il controllo qualitativo

«Negroni» è sia cognome sia nome di cocktail: eliminato dalle forme denigratorie isolate, evitando un falso positivo riproducibile. L'eufemismo «mannaggia la miseria» non è sufficientemente specifico per la moderazione automatica: rimossa la relativa regola contestuale. Queste scelte privilegiano la precisione e preservano le fixture negative già presenti. Le collisioni anagrafiche e lessicali effettive sono documentate singolarmente nell'audit come `review` oppure `allow` per le forme anatomiche lievi.
