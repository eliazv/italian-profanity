# Curazione delle regole

La fonte normativa è [SPECIFICHE.md](../SPECIFICHE.md), §§5, 7 e 8. Il lessico italiano contiene ora 98 regole e 409 forme distinte nei campi `terms`, oltre a frasi e combinazioni. Il numero di forme non misura da solo copertura o qualità; M3 prosegue.

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

**Omografie individuate in CI:** `recchione`, `recchioni` e `zoccola` compaiono anche tra i cognomi del corpus; sono mantenuti come `medium/review` nel profilo balanced e registrati individualmente in `accepted.jsonl`. Le frasi possono contenere preposizioni monosillabiche, senza rendere permissivo il matcher delle parole singole.

**Da verificare obbligatoriamente prima del merge:** `pnpm check`, `pnpm audit:benign` e la CI GitHub. Ogni collisione aggiuntiva su nomi/cognomi deve essere valutata individualmente; non autorizzare accettazioni indiscriminate. Controllare sul campo gli omografi nominali. I dialetti rimangono pacchetti di curazione separati per una futura iterazione.

## Verifiche per la prima beta

Lo schema ammette parole di una lettera nelle frasi, mantenendo almeno due lettere nei termini isolati. Tre collisioni nominali del secondo nucleo sono documentate individualmente nell'audit: due forme discriminatorie e una sessuale restano `review` in balanced e `block` in strict, con fixture dedicate.

Il dataset della beta contiene 65 regole italiane (244 forme nei campi `terms`, oltre alle frasi e combinazioni) e tre famiglie inglesi opzionali con 12 forme esplicite. Il nucleo inglese è scritto manualmente, non deriva da liste esterne e non ne promette la copertura. Le fixture di adozione verificano anche l'attivazione esplicita della lingua e i confini di parola. Restano 127.842 input di audit e 37 collisioni distinte motivate; non è una misura su nickname reali.

## Terzo ampliamento M3 — 4 novembre 2026

Aggiunte **33 regole**, ampliate **15 famiglie di parole** e **2 famiglie di frasi**, con **259 nuove fixture** in `data/fixtures/lexicon.jsonl`. Le raccolte napolux e LDNOOBW già inventariate sono state consultate per confronto di copertura, non importate in blocco; ogni termine qui è frutto di selezione editoriale manuale.

- Derivati e forme femminili: `cogliona`, `bastardaccio`, `cazzetto`, `stronzino`, `troiaccia`, `puttanaccia`, `incazzatura`.
- Insulti composti: `mezzasega`, `scassacazzo`, `faccia da culo`, `faccia di merda`, `figlia di puttana`, `testa di minchia`.
- Volgarità: `inculare`, `pugnetta`, `smerdare`, `pisciasotto`, `cagacazzo` e varianti.
- Regionalismi: `socmel` (Romagna), `mona` (Veneto), `bischero` (Toscana), `belin` (Liguria), `balengo` (Piemonte), `patacca` (Romagna/italiano); non equivalgono a copertura dialettale completa.
- Omografie: `checca` è anche un nome familiare, `patacca` e altri sono polisemici. Questi termini sono `medium` e in `balanced` producono `review`, non blocco automatico. Non sono stati aggiunti termini identitari neutri.

La prima esecuzione dell'audit ha trovato sette collisioni nominali o lessicali, tutte classificate `review` in `balanced`: Checca (cognome e ipocoristico), Fregna (cognome), Patacca (cognome), Pezzente/Pezzenti (cognomi e voci del dizionario). Sono motivate una per una in `data/audit/accepted.jsonl`, con regressioni specifiche. Nessuna produce `block` automatico in `balanced`.

Prima del merge, `pnpm check` e l'audit sul corpus devono essere verdi: eventuali collisioni vanno giustificate singolarmente e non accettate in blocco. Resta necessaria una prova su nickname reali in shadow mode.
