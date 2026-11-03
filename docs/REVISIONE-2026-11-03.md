# Revisione tecnica e nuove fonti — 3 novembre 2026

> **Documento storico.** Il contenuto è stato assorbito in [SPECIFICHE.md](../SPECIFICHE.md) v2 il 2026-11-03, e le decisioni sono registrate in [decisioni.md](decisioni.md). In caso di divergenza prevale la specifica. Una correzione rispetto al testo qui sotto: HurtLex ha una licenza dichiarata nel README, CC BY-NC-SA 4.0, e per questo è escluso.

> **Stato:** proposta di aggiornamento alla [SPECIFICHE.md](../SPECIFICHE.md). Questo documento corregge o sostituisce, dove indicato, alcune scelte dei § 5–14 della spec iniziale. Non sono ancora stati implementati motori, dataset o benchmark. Lo scopo è decidere un MVP affidabile **prima** di scrivere codice.
>
> **Decisione proposta:** confermare il monorepo TypeScript + Dart e il dataset unico; cambiare il matcher, gli allowlist, l'ordine delle priorità e il processo di curazione; partire con italiano soltanto, con inglese opt-in.

## 1. Valutazione della specifica

Da mantenere:

- libreria locale, senza API o invio di nickname a terzi;
- focus sui **nomi brevi** e sulla **precisione in italiano** invece della moderazione semantica di chat;
- JSON come sorgente comune, output generato per TypeScript e Dart, identici fixture e policy di validazione;
- distinzione tra termini religiosi non offensivi in isolamento e combinazioni blasfeme;
- segnalazioni dal mondo reale trasformate in casi di regressione.

Da modificare prima dell'implementazione:

| Scelta originale | Problema | Modifica proposta |
| --- | --- | --- |
| Confronto `contains` con l'intero testo concatenato | Crea corrispondenze spurie tra parole e tra porzioni finali di nomi | Abolire il compact globale come superficie universale; matcher su span/token e unione selettiva |
| `combo` su sottostringhe adiacenti nel compact | `Claudio porco` contiene `dio` + `porco` al confine dei token, anche se `Claudio` è un nome | Riconoscere componenti ancorate a token interi, a morfologie approvate oppure a composti riconosciuti |
| `allow` rimosso dal testo *prima* dei controlli | Può cancellare materiale realmente offensivo o formare nuove sequenze adiacenti | Le eccezioni sopprimono **solo uno specifico match**, e solo se coincidono con il token/span e la regola prevista |
| `stem: true` esteso | `cazz` cattura anche `cazzotto`, `cazzuola` e derivati innocenti | Preferire forme enumerate; prefissi solo quando validati con un corpus benigno |
| Collasso di ogni lettera ripetuta a una | Perde informazione linguistica e crea collisioni | Forma esatta + trasformazione controllata delle ripetizioni; mai unica rappresentazione distruttiva |
| Inglese attivo per default | In nickname corti può aumentare i falsi positivi e appesantisce il pacchetto | `it` default, `en` opt-in con dati e test separati |
| Zero dipendenze anche in Dart, promettendo NFKD completo | La libreria standard Dart non offre una API equivalente a `String.normalize('NFKD')` di JS | Usare una dipendenza Dart per NFKD oppure generare una tabella comune con limiti dichiarati; misurare dimensioni |
| `minSeverity` usata come unica decisione | Rilevazione linguistica e politica di moderazione sono concetti diversi | Mettere un livello `policy` sopra l'output del rilevatore |
| 150 casi, 17–22 ore, 0,05 ms a nickname | Obiettivi non dimostrati e scarsi per l'anti-elusione e i falsi positivi | Più test e benchmark misurati, senza vincoli numerici non ancora validati |
| Qualunque aggiornamento lista = minor | Una nuova parola può trasformare input precedentemente accettati in rifiutati | Pubblicare un changelog *behavioral*, con matrice dei casi modificati e policy configurabili |

## 2. Architettura v0.1 consigliata

Separare **Rilevatore** (trova possibili corrispondenze) da **Policy** (decide cosa fare nel contesto applicativo).

Pipeline:

1. Vincoli di input e sicurezza: stringa, lunghezza massima configurabile, risorse/tempo limitati, regex custom escaped.
2. Tokenizzazione preservando gli **intervalli nell'input originale** e le informazioni su spazi, punteggiatura e separatori.
3. Normalizzazione a più viste, senza distruggere l'originale: forma base (casefold prudente, NFKD, diacritici), forma con leetspeak, forma con confusables, forma con ripetizioni ridotte. Generare solo combinazioni utili e limitate per evitare esplosione combinatoria.
4. Match su tipi espliciti: `token_exact`, `token_prefix` (raro), `phrase` (sequenze di token), `joined` (composti o separazione artificiale dentro **uno** span), `adjacent_combo` (componenti ancorate).
5. Eccezioni applicate **ai match già individuati**: `{ ruleId, exactToken? , exactPhrase? }`. Le eccezioni non sono un motore per rimuovere sottostringhe.
6. Deduplica delle corrispondenze sovrapposte, ordinamento deterministico; preferire l'intervallo più specifico e la regola di gravità maggiore quando sovrapposte.
7. Decisione policy: `allow`, `review`, `block`. La modalità di default per nickname può trattare `review` come rifiuto temporaneo o come approvazione manuale, secondo il prodotto.

### Regole e ancoraggi

Non costruire ogni bestemmia come prodotto cartesiano indiscriminato di tronconi. Conservare componenti riconosciute, flessioni consentite, order e separatori ammessi. I composti senza spazi vanno gestiti separatamente dalle frasi:

- `Dio porco`, `D10 p0rc0`, `porco Dio`: corrispondenze high-confidence se la coppia è riconosciuta.
- `diocane`: composto noto, high-confidence.
- `Claudio`, `Claudio porco`, `Diodato`, `Cristiano`, `Madonna di Campiglio`: non devono essere bloccati *come bestemmia* per una semplice sottostringa. Eventuali insulti indipendenti si valutano separatamente.
- `cazzo`, `cazzzo`, `c a z z o`: riconoscere varianti certe.
- `cazzotto`, `cazzuola`, `scazzottata`: proteggere da prefissi troppo larghi.
- `incazzato`: richiede una forma/derivazione esplicitamente approvata, non un contains libero.
- `Dio santo`: non è una bestemmia per definizione di questa policy.

Testare i token di una lettera concatenati **solo in segmenti circoscritti** quando producono un candidato noto: non unire iniziali di tutte le parole del testo. Evitare la mappa universale confusables su tutte le lingue: applicare un sottoinsieme mirato alle lettere latine nei nickname e documentare la versione della tabella. Riferimento: Unicode UTS #39.

### Normalizzazione e parità JS/Dart

- JS: API nativa `String.normalize('NFKD')`.
- Dart: valutare `unorm_dart` (implementa NFC/NFD/NFKC/NFKD; MIT), oppure una mappa generata da file Unicode con versione comune.
- Il requisito non è “tutti gli input Unicode del mondo identici” senza prove: è **stessa versione dei dati + stessi fixture + stesso output atteso**. Aggiungere fixture di Unicode precomposto/decomposto, fullwidth, caratteri greci/cirillici confondibili, zero-width, numeri dentro testo e emoji.
- Non collassare tutte le doppie italiane nella forma canonica; eventuali forme aggressive servono solo per il matching di regole validate.
- Memorizzare mapping degli offset originale/normalizzato già nella prima versione, così `mask()` futuro è possibile senza mascherare caratteri sbagliati.

### API concettuale

~~~ts
const result = check("D10 p0rc0", { profile: "balanced" });
// {
//   action: "block",
//   matches: [{
//     ruleId: "it.blasphemy.divine-insult",
//     category: "blasphemy",
//     severity: 3,
//     confidence: "high",
//     kind: "adjacent_combo",
//     // opzionale, per la UI o mask; non da scrivere nei log
//     range: { start: 0, end: 9 }
//   }]
// }
isClean("Claudio"); // true: è un helper della policy, NON il motore
~~~

Il risultato può separare `findMatches(text)` (tutti i match) da `check(text, policy)`. Evitare la promessa che “assenza di match = testo appropriato”: è solo un controllo lessicale con copertura limitata.

Profili suggeriti:

| Profilo | Impiego | Principio |
| --- | --- | --- |
| `balanced` (default) | nickname di giochi generalisti | blocca forme chiaramente offensive, prudente con i casi ambigui |
| `strict` | ambienti con utenti minori | include volgarità leggere e dubbi con verifica/revisione |
| `lenient` | community adulte | blocca soprattutto bestemmie esplicite e insulti discriminatori, configurabile |
| `custom` | singola app | categorie, severità, eventuali regole/allowlist proprietarie |

Le severità non devono essere copiate automaticamente da liste altrui: dipendono da definizioni e criteri editoriali. Distinguere `vulgar`, `sexual`, `insult`, `blasphemy`, `discriminatory`; la categoria `discriminatory` non deve mai trattare nomi di identità neutri come offese di per sé.

## 3. Fonti aggiuntive verificate

| Fonte | Contenuto utile | Licenza/situazione | Impiego |
| --- | --- | --- | --- |
| [napolux/paroleitaliane](https://github.com/napolux/paroleitaliane) | 454 voci in lista_badwords; 8.912 nomi, 38.486 cognomi, 60.444 parole comuni e altri corpora | MIT dichiarata, **ma il README avverte che alcune liste sono di provenienza originaria ignota**; coniugazione_verbi è CC BY-SA 3.0 | **Priorità massima**: shortlist offensiva + corpus benigno per trovare falsi positivi. Vietato importare automaticamente tutto; documentare provenienza e verifica |
| [LDNOOBW/it](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/blob/master/it) | lista italiana semplice, con frasi e regionalismi | CC BY 4.0 | Audit copertura. Se voci/derivati vengono incorporati, attribuzione e corretto trattamento della licenza dati |
| [valeriobasile/hurtlex](https://github.com/valeriobasile/hurtlex) | lexicon italiano con classi specifiche, Revised HurtLex con punteggi di offensività | Nessun LICENSE top-level individuato nella verifica del 03/11/2026; **non assumere che si possa redistribuire** | Ricerca classificazione/ambiguità, NO copia automatica dei dati |
| [Dax-87/badwords-it](https://github.com/Dax-87/badwords-it) | esempio PHP di parola, substring, frase e test | MIT nel README | Ispirazione per matcher e test; attenzione alle false corrispondenze ai confini |
| [obscenity](https://www.npmjs.com/package/obscenity) | matcher JS con transformer, whitelist e offset di risultato | MIT | Riferimento architetturale; non integrare un motore solo JS che romperebbe la parità con Dart |
| [dsojevic/profanity-list](https://github.com/dsojevic/profanity-list) | schema con severity, tags, exceptions e partial matching | verificare prima di copiare | **Solo ispirazione per lo schema**: supporta inglese/emoji, non un corpus italiano |
| [EVALITA / HaSpeeDe](https://github.com/evalita2018/data) | benchmark di hate speech in testi più lunghi | alcune raccolte sono CC BY-NC-SA | Valutazione/ricerca **solo nei termini consentiti**, mai dati di default nel package commerciale |
| [Unicode UTS #39](https://www.unicode.org/reports/tr39/) | confusables e spoofing Unicode | standard tecnico, con dati da verificare per uso e versione | Algoritmo e test di omografi |

### Strategia sulle licenze

**Preferenza:** libreria MIT con regole originali e materiale MIT selezionato, corredato da NOTICE delle fonti effettivamente incorporate. Il file di parole generato e le fonti originarie devono conservare ogni obbligo applicabile.

Non basta “leggere una lista CC BY 4.0 e riscriverla per farla MIT”: l'uso sostanziale di contenuti/strutture protette impone di rispettarne i termini. Se si decide di importare effettivamente LDNOOBW, separare la provenienza e considerare un file LICENZE-DATI + NOTICE e componenti CC BY 4.0 attribuiti correttamente. La presenza di un repository pubblico non equivale a una licenza.

Per ogni regola o batch, aggiungere metadati di curazione **non necessariamente inclusi nel runtime**:

~~~json
{
  "id": "it.insult.example",
  "category": "insult",
  "severity": 2,
  "matchType": "token_exact",
  "terms": ["esempiofittizio"],
  "provenance": ["manual"],
  "reviewed": true,
  "positiveCases": ["it-pos-001"],
  "negativeCases": ["it-neg-001"]
}
~~~

Senza una provenienza documentabile non promuovere i candidati di origine esterna nel bundle pubblico. Non pubblicare log di nickname reali nei test senza anonimizzazione/consenso.

## 4. Pipeline per curare i dati (la vera differenziazione)

1. **Inventario delle fonti:** registrare URL, commit/tag, licenza, data e file. Evitare file privi di licenza o con vincoli incompatibili.
2. **Import in area di lavoro, mai nel runtime:** script di audit che normalizza e deduplica, annota possibili categorie, segnala termini controversi.
3. **Review manuale:** decidere per ogni lemma utile tipo di match, flessioni, gravità, casi innocui, varianti anti-elusione, fonte e note.
4. **Minimizzazione:** generare regole compatte e mirate, non una copia cieca di 454+ voci.
5. **Collision scan benigno:** eseguire i matcher su nomi, cognomi e parole comuni di napolux e su esempi propri; ogni collisione va verificata prima di correggere, non automaticamente messa in allowlist.
6. **Fixture condivise:** positivo, negativo vicino al positivo, versione leet, separatori, Unicode, caso ambiguo. Un'unica sorgente per JS e Dart.
7. **Misure:** precisione e recall sui fixture etichettati, matrice differenze rispetto alla release precedente, benchmark ripetibili. Non proclamare un “tasso di precisione” misurato su un corpus solo positivo.
8. **Rilascio controllato:** usare prima in un progetto con modalità shadow o report delle differenze senza rifiutare subito i nomi esistenti; verificare manualmente i falsi positivi.

### Fixture minime da aggiungere alla spec

| Input | Aspettativa nel profilo balanced | Motivo |
| --- | --- | --- |
| Claudio | allow | nome innocuo |
| Claudio porco | allow *per la regola di bestemmia* | non usare il suffisso `dio` del nome |
| Diodato | allow | nome innocuo |
| Cristiano | allow | nome innocuo |
| Madonna di Campiglio | allow | toponimo |
| Scazzottata / cazzotto / cazzuola | allow | parole innocue o a diverso significato |
| Dio santo | allow | formula religiosa non automaticamente blasfema |
| Dio porco / porco Dio | block | combinazione esplicita |
| D10 p0rc0 | block | leet |
| p0r-cò_Dio | block | obfuscation delimitata |
| Diocaneee | block | composto + ripetizioni |
| c a z z o | block | separazione tra lettere |
| incazzato | secondo policy, non `contains` cieco | derivato da curare |
| Unicode composto/decomposto, fullwidth, misto cirillico/latino | esito coerente col fixture | normalizzazione e omografi |
| nome con numeri innocenti | allow | anti-falsi-positivi leet |

Nelle fixture il flag `expect` non dovrebbe essere il solo booleano: prevedere `expectedMatches`, `expectedAction` e `profile`. Per `Claudio porco` controllare esplicitamente che non scatti la regola `blasphemy`, a prescindere da altre regole configurate.

## 5. Testing e criteri di uscita

Per la prima versione preferire:

- almeno **250–400 fixture annotate**, con maggioranza di casi benigni/di collisione, più fuzz/property-based testing mirato;
- corpus benigno **molto più grande** solo come audit automatico e triage, non automaticamente come prova che tutti i termini siano consentiti;
- parità JS/Dart con confronto del JSON dei risultati significativi (match, ordine, categoria, severity, action, range);
- nessun falso blocco sui casi negativi esplicitamente approvati;
- tutti i casi high-confidence bloccati; nessun regex backtracking patologico su input lunghi e nessun crash su input Unicode ostile;
- benchmark di CPU, bundle gzip e memoria su hardware/ambienti documentati, **solo dopo** l'implementazione. I limiti 0,05 ms e 25 KB della prima spec diventano obiettivi aspirazionali, non garanzie.

Per CI: schema JSON, generazione deterministica e diff pulito, test unitari dei due motori, fixture parity, fuzz base, audit licenze/NOTICE e package smoke-test browser+Node+Dart.

## 6. Roadmap e stima corretta

**Fase A — linguistica e motore TS (prima del publish):**
- blocco della semantica dei tipi, normalizzatore e provenance;
- curazione di 60–100 regole/frasi principali (numero indicativo, evitare riempimento artificiale);
- fixture positive/negative, prima collision scan su napolux;
- matcher TS con API `findMatches`, `check`, `isClean`.

**Fase B — Dart e parità:**
- implementazione Dart con stesso formato dati, gestione Unicode verificata;
- suite fixtures comune, confronto risultati e integrazione minima di un'app reale;
- documentazione delle dipendenze e pubblicazione npm/pub.dev.

**Fase C — hardening:**
- corpus benigno ampio, fuzz elusioni, tuning performance, demo online per sviluppatori, documentazione bilingue, pubblicazione della v0.1;
- audit dei nickname esistenti in shadow mode; rilasciare il blocco solo dopo valutazione dei falsi positivi.

**Da rinviare:** dialetti multipli (prima uno curato, preferibilmente romagnolo), masking, CLI, analytics, supporto semantico, ML e tutte le lingue diverse dall'italiano; inglese opt-in solo se necessità concreta.

**Stima di pianificazione:** circa **30–50 ore** per due pacchetti con normalizzazione valida, dati revisionati, CI, documentazione e pubblicazione. Non è una misura consuntiva. Una spike TypeScript può arrivare prima, ma non va chiamata release affidabile senza test e curazione.

## 7. Decisioni raccomandate

1. **MIT-first** per codice e dati originali; attribuzioni conservate per materiale MIT riusato. Dati CC BY 4.0 solo se si decide consapevolmente di distribuire quella parte sotto la licenza applicabile.
2. **Italiano per default**. `en` opt-in con pacchetto/dataset separabile; dialetti dopo v0.1.
3. **Nessuna allowlist distruttiva**. Eccezioni specifiche del match, protette da test.
4. **Policy indipendente** con profili balanced/strict/lenient, non una sola soglia globale.
5. **Zero dipendenze solo se compatibile con correttezza**. Per Dart la normalizzazione Unicode non va reinventata frettolosamente.
6. **Precisione prima della copertura**; un falso positivo su nomi reali è più dannoso di un termine raro sfuggito durante la v0.1.
7. **Diff comportamentale per ogni versione**: cambiare dati può essere breaking lato prodotto anche senza cambiare API. Prevedere analisi e changelog delle regressioni.
8. **Non pubblicare dati, benchmark o claim di performance non verificati**.

## Riferimenti

- https://github.com/napolux/paroleitaliane
- https://github.com/napolux/paroleitaliane/blob/main/LICENSE
- https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words
- https://github.com/valeriobasile/hurtlex
- https://link.springer.com/article/10.1007/s11135-022-01494-7
- https://github.com/Dax-87/badwords-it
- https://www.npmjs.com/package/obscenity
- https://github.com/dsojevic/profanity-list
- https://github.com/evalita2018/data
- https://huggingface.co/datasets/evalitahf/hatespeech_detection
- https://pub.dev/packages/unorm_dart
- https://www.unicode.org/reports/tr39/
- https://www.unicode.org/faq/normalization.html
