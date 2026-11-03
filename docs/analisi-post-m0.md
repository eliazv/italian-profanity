# Analisi dopo M0 — 3 novembre 2026

Questo documento registra l'analisi dello stato M0 e le priorità concordate. La fonte normativa resta [SPECIFICHE.md](../SPECIFICHE.md); le decisioni sono registrate in [decisioni.md](decisioni.md), D14-D18.

## Valutazione di M0

La struttura del monorepo è pronta: dati condivisi, generazione TS/Dart, validazione, parità, test e workflow. Le prove deliberate di errore sulla validazione e sulla parità sono state riportate come riuscite nel riepilogo di M0. Lo stesso riepilogo riporta `pnpm check` verde in locale e sette commit di implementazione senza push; questo non equivale a una CI GitHub verificata.

I controlli attuali hanno una portata precisa:

- I runner confrontano il risultato di `fold`, non segmentazione, rilevamento o policy.
- Le attese positive di rilevamento non sono ancora attive nella CI ordinaria.
- L'audit scarica il corpus ma salta il controllo se il rilevatore non è disponibile.
- Build npm e dry-run Dart verificano la confezione dei pacchetti, non la precisione del filtro.

M0 è quindi una base tecnica completata, mentre affidabilità lessicale, copertura e falsi positivi devono ancora essere misurati.

## Altri linguaggi

Si mantengono solo TS e Dart fino alla v0.1: coprono i progetti web, i backend Node e Flutter già previsti. Un dataset unico riduce il lavoro sui dati, ma ogni motore aggiunge implementazione, test Unicode, gestione degli offset, policy, compatibilità e pubblicazione.

Il prossimo linguaggio si sceglierà in base a un utilizzo concreto, non a una graduatoria astratta:

| Utilizzo effettivo                    | Port da valutare       |
| ------------------------------------- | ---------------------- |
| Backend o strumenti Python            | Python                 |
| Applicazione PHP con controllo locale | PHP                    |
| Applicazione .NET o Unity             | C#                     |
| Backend Go o Java                     | Linguaggio del backend |

Prima di accettare un port occorrono un utilizzatore, un responsabile della manutenzione, un runner delle fixture condivise e la verifica di tutti i risultati, inclusi gli offset UTF-16. La tabella non è una roadmap di port. Un nucleo Rust/WASM non è previsto: va rivalutato solo se esigenze reali giustificano il costo architetturale e di distribuzione.

## Miglioramenti preparatori

La roadmap ora prevede rilevatore e policy in entrambi i linguaggi in M2; M4 è dedicata al consolidamento. Questo risolve il conflitto con AGENTS.md, che richiede ogni modifica di comportamento nella stessa PR per i due motori.

La specifica precisa inoltre tre contratti da implementare in M1/M2:

1. `squeeze` confronta le sequenze ripetute con le forme delle regole, conservando le doppie e senza generare tutte le varianti.
2. I simboli leet vengono conservati fino alla costruzione della vista `deleet`; la vista `base` rimane disponibile. Gli spazi normalizzati determinano i confini.
3. Il limite si misura in punti di codice, gli offset in UTF-16. Espansioni, invisibili, segni combinanti ed emoji richiedono attese esplicite sull'origine dei caratteri.

Sono aggiunte attese `expectedBase` alle fixture Unicode, verificate sempre su entrambi i motori da `pnpm parity`, anche senza `--expectations`. È il primo passo per distinguere uguaglianza fra motori e correttezza rispetto al contratto. In M1 lo stesso principio va esteso a segmenti, viste e intervalli: questi controlli non sono ancora implementati.

La CI include uno smoke test ESM/CJS del pacchetto compilato su Node 20, il runtime minimo dichiarato. Gli strumenti e il build restano su Node 24. Questo smoke test va ampliato all'API effettiva quando esiste il rilevatore.

Verifiche locali di questo aggiornamento: `pnpm check` passa con 31 fixture, 10 test TS e 10 test Dart; il build npm e gli import ESM/CJS passano sul runtime locale. Una fixture temporanea con attesa `expectedBase` vuota ma risultato non vuoto ha fatto fallire correttamente il controllo per entrambi i motori; rimossa la fixture, la parità torna verde. La prova su Node 20 è affidata al nuovo job CI.

## Ordine dei prossimi passi

1. Primo push e verifica dei job GitHub, inclusi Linux, Node 20 e Dart 3.4. Non dedurre l'esito remoto dai test locali.
2. M1 in TS e Dart: segmentazione, viste, provenienza degli offset e almeno 80 fixture con attese esplicite. La parità da sola non basta.
3. M2 in TS e Dart: rilevatore, eccezioni, policy e API; attivare `--expectations` e rendere obbligatorio l'audit effettivo, senza consentire che l'assenza del motore passi inosservata.
4. Curazione M3 con almeno 300 fixture e maggioranza di negativi; poi consolidamento M4, prova sul campo M5 e pubblicazione M6.

La generazione della tabella non include la versione Unicode del runtime nei file emessi. Questo evita variazioni di metadati, ma non dimostra da solo la riproducibilità di ogni futuro aggiornamento: restano necessari il controllo dei diff generati e la revisione delle modifiche agli intervalli e alle mappe.

## Documentazione pubblica

`docs/` resta nel repository e non viene aggiunta a `.gitignore`. Spiega scelte e limiti del prodotto e permette di riesaminarli. Cache, output temporanei e report con dati privati devono rimanere fuori dal versionamento. Nessun nickname reale di utenti va inserito nei documenti pubblici, nelle fixture o nei log.

## Esito M1

La prima CI GitHub di M0 è passata sul commit `6e8bd9a`. La fase M1 implementa ora in TS e Dart segmenti, frammenti, viste `base` e `deleet`, sequenze ripetute per `squeeze` e provenienza dei caratteri in UTF-16. Il limite viene applicato prima del fold e non spezza coppie surrogate valide.

Sono aggiunte 107 fixture M1, per un totale di 138; i test dei pacchetti verificano direttamente le attese e le invarianti, e la parità confronta le strutture complete. `pnpm check` passa con 253 test per linguaggio. Il confronto delle sequenze ripetute con le regole, rilevatore, policy e attivazione obbligatoria delle attese lessicali e dell'audit restano in M2. L'elenco delle due regole seme non è stato ampliato: la curazione resta in M3.
