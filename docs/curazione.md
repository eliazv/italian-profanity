# Curazione delle regole

La fonte normativa è [SPECIFICHE.md](../SPECIFICHE.md), §§5, 7 e 8. Il lessico italiano contiene ora 290 regole e 1.034 forme distinte nei campi `terms`, oltre a frasi e combinazioni. Il numero di forme non misura da solo copertura o qualità; M3 prosegue.

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

## Curazione M3 — quarta iterazione (2026-11-04)

Confrontate le categorie italiane con le **liste già censite** in `data/sources.json` per trovare lacune, senza copiare automaticamente i loro contenuti. Aggiunte **28 regole** e ampliate **7 famiglie**; estese di **16 forme** le combinazioni delle bestemmie. Sono state preparate **209 fixture** in `data/fixtures/coverage.jsonl`, con positivi e negativi, profili di moderazione e controesempi lessicali.

- **Insulti comuni e flessioni:** `incoglionito`, `cazzaro`, `palloso`, `farabutto`, `infame`, `schifoso`, `lurido`, `rompiminchia`, `cacasotto`.
- **Lessico sessuale esplicito:** `bagascia`, `bocchinara`, `puttano`, `ciucciamelo`, `raspone`, `sburra`.
- **Dialetti ed eufemismi:** `loffa` e `maremma maiala` non sono bestemmie; forme con più interpretazioni hanno confidenza `medium` e richiedono `review` in balanced.
- **Bestemmie contestuali:** nuove forme B solo in combinazione con termine divino, e frase `mannaggia a Dio` con varianti. `Dio`, `Madonna` e `mannaggia` isolati restano neutrali per queste regole.
- **Omografi delicati:** forme come `Negro` e `Negri` possono essere **cognomi reali**: il termine discriminatorio isolato è `medium`, quindi `review` in balanced, mai `block` automatico. Termini identitari neutri come `gay` e `disabile` restano fuori dalla blacklist.

**Nota di qualità:** un confronto testuale con una wordlist sovrastima i falsi negativi, perché il motore rileva già parole eluse, composti, varianti e combinazioni; non conta solo la presenza di una stringa in `terms`. Non inserire automaticamente parole innocue come `sega`, `palle`, `fava` o `finocchio` senza segnali contestuali. L'audit sui nomi e cognomi rimane bloccante, e nessuna collisione nuova è automaticamente accettata. Servono ancora prove in shadow mode su input realistici prima di definire completa M3.

### Revisione delle collisioni della quarta iterazione

Il primo audit ha individuato **25 collisioni** con cognomi e parole del dizionario. Le voci sono state valutate individualmente in `data/audit/accepted.jsonl`: Cazzaro, Negro/Negri (anche nei cognomi composti), Raspone/Rasponi, forme verbali `cessa`, `cessi`, `cessò`, aggettivi `infame` e `schifoso` e `lecchino`. L'azione attesa è sempre `review` in `balanced`, mai `block`. La revisione non dimostra che l'espressione sia offensiva: è un'omografia non risolvibile tramite il filtro lessicale. Sono state aggiunte regressioni mirate per cognomi e falsi positivi. `strict` rimane intenzionalmente più restrittivo.

## Curazione M3 — ampliamento esteso del 4 novembre 2026

Questa iterazione porta il lessico italiano da **126 a 290 regole** e da **517 a 1.034 forme distinte** nei campi `terms`. Le espressioni `phrase` comprendono **187 varianti dichiarate**; la regola `combo` contiene ora 10 forme divine, 70 forme offensive esatte e 5 prefissi selezionati. Questi gruppi non costituiscono altrettante parole indipendenti e non vanno sommati alle forme singole.

La curazione è organizzata in file nuovi per categoria (`*-m3.json`, `*-phrases-m3.json`, `compounds-m3.json`, `variants-m3.json`) e in estensioni controllate alle regole già esistenti. Non sono state copiate liste terze in blocco. Ogni nuova regola ha un positivo e un negativo vicino; ci sono fixture dedicate a soprannomi concatenati, grafie alternative, inflessioni, espressioni regionali e frasi discriminatorie contestuali. Sono stati aggiunti anche 40 guardrail per parole religiose, cognomi, utensili, alimenti e identità neutre.

Le principali lacune risolte includono: `figliodiputtana`, `facciadimerda`, `diodimerda`, `mortacci tua`, `fatti i cazzi tuoi`, `porca miseria`, grafie `kazzo`/`caxxo`/`koglione` e termini regionali come `strunz`, `grullo`, `ostrega`, `belandi`. I termini identitari isolati restano fuori dai nuovi blocchi; le offese esplicite che li accompagnano sono rappresentate come frasi, non come prefissi indiscriminati.

Il conteggio aggiornato delle fixture condivise è **2.618**. L'audit su 127.842 input rimane obbligatorio e deve ancora essere rieseguito su questo ampliamento prima del merge. Ogni nuova collisione richiede valutazione individuale; non aggiungere automaticamente tutte le collisioni a `accepted.jsonl`. `balanced` non deve bloccare automaticamente gli omografi `medium`.

La copertura non è un dizionario esaustivo della lingua: è un insieme curato per la moderazione di nickname e testi brevi. Restano forme creative, dialetti con ortografie variabili e contesti impossibili da disambiguare lessicalmente; vedi [inventario M3](m3-inventario-2026-11-04.md).

### Controllo finale del corpus: esclusioni prima delle accettazioni

Le revisioni hanno rimosso la forma isolata `negroni` (cognome e cocktail) e la regola `mannaggia la miseria` (esclamazione non necessariamente offensiva), mantenendo i controlli di assenza di match. Ulteriori collisioni effettive con cognomi o voci di dizionario sono state annotate individualmente con azione attesa `review` nel profilo balanced; per `tetta`/`tette` (gravità 1) l'azione attesa è `allow`. Questo controllo non garantisce una comprensione del contesto né un recall esaustivo: le nuove regole richiedono comunque osservazione in produzione senza blocco iniziale.

## Consolidamento e inglese opzionale — 4 novembre 2026

Il consolidamento mantiene le 290 regole italiane e aggiunge 307 fixture Unicode e di offset, di cui 256 casi fuzz riproducibili. Ha individuato e corretto in entrambi i motori il disallineamento delle origini quando surrogati isolati si ricongiungono dopo rimozioni.

Il dataset inglese passa da 3 a 51 regole (110 forme e 20 varianti di frase), con 534 fixture aggiuntive. Le famiglie sono scelte manualmente dal preset MIT di Obscenity, che attribuisce cuss; entrambi i notice sono distribuiti. leo-profanity e @2toad/profanity sono confronti di copertura, senza importare le loro liste. Nessuna dipendenza aggiunta. Identità, anatomia e altre parole neutre isolate restano fuori dai nuovi blocchi; i termini ambigui richiedono review in balanced.

Il totale è 341 regole e 3.459 fixture. L’audit viene eseguito su 127.842 input per ognuna delle configurazioni it e it+en, senza nuove accettazioni. [Rapporto e verifiche](consolidamento-2026-11-04.md). Il consolidamento tecnico non sostituisce una prova comparativa su applicazioni reali; nessun nickname reale è incluso nei test o nei report.

## Curazione 0.4 — 5 novembre 2026

Una batteria di circa 380 input inventati (lacune probabili, elusioni, nomi e cognomi) ha guidato le aggiunte; nessun nickname reale è usato o salvato. Il lessico passa a 301 regole italiane, con 82 fixture in `data/fixtures/curation.jsonl`.

- **Bestemmie:** `maiala`, `lupo` e `lupi` entrano nel gruppo B della combo (`madonna maiala`, `dio lupo`); restano neutri senza concetto divino adiacente.
- **Insulti e volgarità:** `vaffa` e `mortacci` isolati sono `medium` perché usati anche in tono scherzoso o esclamativo. Nuovi composti `checcazzo`/`eccheccazzo`, forme `ciucciacazzi`, `segone` (`medium`, omografo raro di grande sega) e la frase `ti scopo`/`ti sfondo`.
- **Concatenati con cazzo:** il composto `delcazzo` è ancorato alla fine. Non si usa `cazzo` come composto o infix: all'inizio colpirebbe Cazzola, e un composto uguale alla parola duplicherebbe i match scavalcando le eccezioni su `it.sexual.cazzo`. Anche `dicazzo` è escluso perché si sovrappone a `testadicazzo`.
- **Discriminatori:** `lesbicona` e `muso giallo` sono `high`. `travone` (trave grande), `giudeo` (usi storici), `zingaro` (esonimo anche descrittivo, e cognome) e `spastico` (termine medico) sono `medium`: review in balanced, mai blocco automatico. `ritardato` è escluso (treno ritardato).
- **Eufemismi lievi:** `cacchio`, `porca miseria` e `porca vacca` passano a confidenza `high` con gravità 1. Il match resta nei risultati, balanced e lenient consentono il testo, strict lo blocca.
- **Eccezioni:** `minchilli` (cognome) per la radice infix `minchi`.

L'audit ha trovato solo le collisioni attese di `zingaro` con i cognomi Zingaro e Zingari, accettate individualmente come `review`. Elusioni con `k` al posto di `c` e con asterischi richiedono un cambio di normalizzazione e sono trattate separatamente.
