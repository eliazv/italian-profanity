# Curazione delle regole

La fonte normativa è [SPECIFICHE.md](../SPECIFICHE.md), §§5, 7 e 8. Il primo nucleo contiene 45 regole italiane e 173 forme distinte nei campi `terms`, più frasi e i gruppi della regola `combo`. Il numero di forme non misura da solo copertura o qualità. M3 è avviata, non conclusa.

## Scelte del primo nucleo

Le aggiunte sono curate manualmente, con `provenance: ["manual"]`. Le liste esterne non sono importate in blocco. Tutte le categorie italiane hanno regole iniziali; le identità neutre, come orientamenti, religioni o disabilità, non diventano ingiurie. I casi discriminatori includono forme esplicitamente ingiuriose e un caso polisemico segnalato come `medium`.

Si preferisce `word` con forme elencate. I negativi vicini verificano che una forma non dichiarata o una radice nel mezzo di un'altra parola non bastino. Le fixture includono anche nomi convenzionali e parole innocue; non contengono nickname reali di utenti.

Il prefisso per il comando offensivo è giustificato nella regola ed è soggetto all'audit. Le frasi richiedono le parole dichiarate in ordine e adiacenti. Le flessioni dei gruppi `combo` sono esplicite; i prefissi di B sono attivi solo accanto a una forma divina esatta o dentro un composto ancorato.

## Gravità e confidenza

- Gravità 1: espressione lieve o scurrile, che `balanced` può consentire con confidenza alta.
- Gravità 2: espressione volgare o insulto esplicito.
- Gravità 3: bestemmia o ingiuria discriminatoria grave; anche una frase particolarmente ingiuriosa può avere tale gravità.
- `high`: la forma selezionata è sufficientemente specifica per l'azione automatica prevista dal profilo.
- `medium`: forma polisemica o omografa di un nome, cognome o parola non offensiva; `balanced` richiede revisione. Non è una probabilità numerica.

Queste sono decisioni editoriali del progetto, non etichette ereditate da altre liste. Una confidenza media non garantisce il riconoscimento del contesto e `strict` blocca anche i casi dubbi.

## Procedura per ogni modifica

1. Valutare il candidato e scegliere categoria, tipo, forme, gravità e confidenza. Evitare prefissi quando bastano forme intere.
2. Registrare qualsiasi fonte esterna in `data/sources.json`, con licenza, commit e uso consentito. Il corpus napolux resta in cache; LDNOOBW serve solo al confronto di copertura; HurtLex ed EVALITA restano esclusi.
3. Aggiungere almeno un positivo e un negativo vicino per la regola. Per nuove forme verificare anche confini e omografi; per cambi di normalizzazione verificare entrambi i motori.
4. Eseguire `pnpm check`: include generazione, test, attese complete, parità e audit. Non modificare i file generati a mano e non passarli al formatter.
5. Valutare ogni collisione dell'audit per provenienza: `name`, `surname`, `word` o `pair`. Una parola del dizionario può essere un positivo intenzionale; un nome può richiedere una regola più stretta o un'eccezione.
6. Correggere la regola oppure motivare il caso preciso in `data/audit/accepted.jsonl`, includendo `corpus`, `reason` e `action`. Mai generare accettazioni automaticamente dal report. L'azione attesa viene ricontrollata per evitare regressioni da revisione a blocco.
7. Registrare un changeset: prima della 1.0, regole nuove o più restrittive richiedono un `minor`.

Le eccezioni sopprimono solo il match indicato, senza cancellare testo. Un'eccezione su una parola non deve disattivare una frase o una regola diversa. Le fixture M2 verificano anche questo comportamento.

## Limiti e lavoro residuo

L'audit corrente esegue il filtro su 127.842 input; due falsi positivi combinatori sono corretti con eccezioni e 34 collisioni distinte hanno motivazioni e azioni attese. Questo significa assenza di collisioni **non giustificate**, non assenza assoluta di falsi positivi. L'insieme campionato non rappresenta una prova su utenti reali.

Restano revisione editoriale, altri termini comuni e frasi, consolidamento e prova sul campo senza blocco iniziale. Non si aggiungono regole solo per raggiungere una quota numerica. Dialetti e un nucleo inglese opzionale richiedono curazione dedicata; non vengono dedotti dall'algoritmo.

## Curazione M3 — secondo nucleo (2026-11-03)

Sono state proposte 20 nuove regole (tra lemmi e frasi) e 6 famiglie preesistenti ampliate. L'ampliamento è **manuale**, non una copia di wordlist esterne, ed è accompagnato da fixture positive e negativi vicini in `data/fixtures/mcuration.jsonl`. Le liste LDNOOBW e napolux rimangono strumenti di verifica, non fonti automaticamente incorporate. Il dataset non può essere considerato esaustivo.

- Insulti composti: `pezzo di merda`, `vai a fanculo`, `figlio di troia`, `vai a cagare`; nuove parole come `pirla`, `cornuto`, `paraculo`, `cagasotto`.
- Volgarità ed espressioni sessuali: forme di `fottere`, `trombare`, `chiavare`, `scopare`, `segaiolo`, `baldracca`, `zoccola`, `battona`, `pompinara` e varianti.
- Discriminazione: ingiurie specifiche e combinazioni esplicitamente denigratorie; i termini identitari isolati restano neutri.
- Le espressioni con significati alternativi (`cornuto`, `pirla`, `zoccola`, `trombare` e simili) sono `medium`: `balanced` le segnala per revisione anziché bloccarle automaticamente; le espressioni composte chiaramente ingiuriose sono `high`.

**Da verificare obbligatoriamente prima del merge:** `pnpm check`, `pnpm audit:benign` e la CI GitHub. Ogni collisione aggiuntiva su nomi/cognomi deve essere valutata individualmente; non autorizzare accettazioni indiscriminate. Controllare sul campo gli omografi nominali. I dialetti rimangono pacchetti di curazione separati per una futura iterazione.
