# italian-profanity — specifiche

> Libreria per riconoscere bestemmie, insulti, volgarità e termini discriminatori **in italiano** in testi brevi (nickname, nomi di stanze, team, titoli). Ha due motori allineati, **TypeScript** (npm) e **Dart** (pub.dev, per Flutter e server Dart), e un unico dataset.
>
> **Versione 2, consolidata il 2026-11-03.** È l'unica fonte di riferimento. Questa versione assorbe la [revisione del 3 novembre](docs/REVISIONE-2026-11-03.md), che resta come documento storico. Le decisioni prese e le loro motivazioni sono in [docs/decisioni.md](docs/decisioni.md).

---

## 1. Posizionamento

**La libreria che uno sviluppatore installa per validare i nickname italiani senza dover aggiungere a mano decine di eccezioni.**

Il valore non è avere la lista più lunga, ma **precisione e affidabilità**:

1. **Ridurre i falsi positivi su nomi, cognomi, luoghi e parole comuni italiane.** Claudio, Diodato, Porcedda, Madonna di Campiglio e Scazzottata devono passare. Gli omografi fra nomi e termini offensivi richiedono una scelta editoriale esplicita: i casi noti sono documentati nell'audit e passano a `review` in `balanced` (D19), senza una promessa assoluta di disambiguazione.
2. **Resistenza alle elusioni comuni**: leetspeak, separatori, accenti, lettere ripetute e caratteri Unicode simili.
3. **Lo stesso verdetto in JS e in Dart**, verificato da un'unica suite di casi di test.

Quando i due obiettivi sono in conflitto, **la precisione viene prima della copertura**. Un nome reale bloccato è più dannoso di un termine raro che sfugge.

### 1.1 Contesto

Ho svolto la ricerca il 2026-11-03: le fonti dettagliate sono al §10 e nella revisione. In sintesi:
- `italian-badwords-list` è la libreria italiana più diffusa (circa 1.600 download al mese), ma è ferma al 2022, ha 88 parole e nessuna regola.
- Le librerie multilingua (`safe_text`, `censor_it`, `is-bad-word`) hanno liste italiane generiche.
- L'unico progetto a regole che ho trovato, `Dax-87/badwords-it`, è solo PHP.
- Nessuna di queste è verticale sull'italiano e disponibile sia in JS sia in Dart.

---

## 2. Ambito

**In v0.1**
- Riconoscimento lessicale su testi brevi, con un limite predefinito di 64 caratteri configurabile.
- Categorie: `blasphemy`, `insult`, `sexual`, `discriminatory`, `vulgar`.
- Rilevatore facoltativo di **contatti**: URL, email e numeri di telefono. Serve per i nickname ed è disattivato per default.
- Profili di policy e personalizzazioni dell'app (termini aggiuntivi, eccezioni).
- Intervalli di caratteri (offset) sul testo originale nei risultati, così `mask()` si può aggiungere in futuro senza modificare l'API.

**Rimandato a dopo la v0.1**: `mask()`, CLI di scansione, dialetti (il primo sarà il romagnolo), demo online.

**Fuori ambito**: testi lunghi o chat con analisi del contesto, machine learning, API remote, altre lingue oltre a italiano e inglese. L’italiano resta la specializzazione principale; l’inglese è un dataset curato opzionale, mai attivato automaticamente (D22).

**Promessa esplicita nel README**: "nessun match" non significa "testo appropriato". È un controllo lessicale con copertura limitata, e la moderazione umana resta necessaria.

---

## 3. Architettura

```
          input
            │
   ┌────────▼─────────┐
   │ 1. Limiti         │ lunghezza massima, tipo, risorse
   └────────┬─────────┘
   ┌────────▼─────────┐
   │ 2. Segmentazione  │ parole e frammenti, con offset sul testo originale
   └────────┬─────────┘
   ┌────────▼─────────┐
   │ 3. Viste          │ base · deleet · squeeze  (l'originale non viene distrutto)
   └────────┬─────────┘
   ┌────────▼─────────┐
   │ 4. Rilevatore     │ regole tipizzate → elenco di match
   └────────┬─────────┘
   ┌────────▼─────────┐
   │ 5. Eccezioni      │ sopprimono singoli match, non cancellano testo
   └────────┬─────────┘
   ┌────────▼─────────┐
   │ 6. Policy         │ allow · review · block, secondo il profilo
   └────────┬─────────┘
            ▼
         risultato
```

**Il rilevatore e la policy sono separati.** Il rilevatore dice soltanto cosa ha trovato. La policy decide cosa fare in base al contesto: un'app per bambini, un gioco e una community per adulti richiedono decisioni diverse sugli stessi match.

---

## 4. Normalizzazione e segmentazione

### 4.1 Limiti di input

Il testo viene troncato a `maxLength`, 64 **punti di codice Unicode** per default, prima della normalizzazione. `maxLength` deve essere un intero positivo finito; valori non validi causano un errore di argomento in entrambi i motori. Una coppia surrogata valida non viene mai divisa; un surrogato isolato conta come un punto ed è conservato. Non si contano i grafemi: un accento combinante conta separatamente dalla lettera. Gli offset dei risultati restano invece in **unità UTF-16** sul testo originale. La segmentazione viene eseguita una sola volta. Le regex delle regole aggiunte dall'app vengono sempre convertite in testo letterale: l'app passa termini, non regex.

Ogni punto di codice prodotto dalla normalizzazione conserva l'intervallo UTF-16 della sua origine. In caso di espansione, tutti i caratteri prodotti condividono l'intervallo del carattere sorgente. L'intervallo di un match copre dall'inizio del primo carattere contribuente alla fine dell'ultimo, includendo separatori e invisibili interni. Per una lettera con segni combinanti rimossi, l'intervallo include anche quei segni successivi. Una fixture deve verificare esplicitamente questi casi: la sola parità non prova che gli offset siano corretti.

### 4.2 Segmentazione

Il testo viene scomposto in due livelli, conservando per ciascuno l'intervallo di caratteri nel testo originale:

- **Parola**: una sequenza separata da **spazi** (o caratteri equivalenti).
- **Frammento**: una parte di parola separata da **punteggiatura** (`. - _ ' * + ~ |` e simili).

Le regole che lavorano sulle parole vedono ogni parola con i frammenti **riuniti**: `p0r-cò_Dio` è un'unica parola, `porcodio`. La punteggiatura dentro una parola viene trattata come un tentativo di elusione, mentre lo spazio è un vero confine.

**Lettere spaziate.** Se ci sono almeno tre parole consecutive di una sola lettera, vengono riunite in un **segmento** candidato: `c a z z o` → `cazzo`. Le lettere singole non vengono mai unite a parole più lunghe, e le iniziali sparse nel testo non vengono mai unite tra loro.

Il candidato si aggiunge alle parole originali, senza sostituirle. Si considera ogni sequenza massimale di parole che dopo `fold` contengono esattamente una lettera ASCII e nessun altro carattere: cifre, punteggiatura e parole più lunghe interrompono la sequenza. Le iniziali seguite da un punto non vengono quindi concatenate. L'ordine dei segmenti è per inizio, poi fine dell'intervallo UTF-16.

**Caratteri invisibili** (zero-width, soft hyphen, selettori di variante): vengono rimossi prima della segmentazione.

**Ordine delle trasformazioni.** Si applica `fold` conservando gli intervalli originali, poi si individuano i confini di spazio sul testo così ottenuto (anche gli spazi fullwidth e non separabili diventano confini). Ogni parola conserva i propri simboli sorgente: nella vista `base` la punteggiatura viene ignorata per riunire i frammenti; nella vista `deleet` i simboli presenti nella mappa leet vengono prima convertiti, poi si ignora la punteggiatura rimanente. Il requisito di almeno una lettera si valuta dopo `fold`, prima delle conversioni leet. Non si eliminano quindi `@`, `$`, `€` e `!` prima di costruire `deleet`. Le due viste restano disponibili anche per i simboli a inizio o fine parola; le fixture devono coprire sia sostituzioni interne sia punteggiatura ordinaria.

La classificazione è esplicita e identica nei due motori. Gli spazi comprendono U+0009–U+000D, U+0020, U+0085, U+00A0, U+1680, U+2000–U+200A, U+2028, U+2029, U+202F, U+205F e U+3000. I separatori comprendono la punteggiatura e i simboli ASCII, U+2010–U+2015, U+2018–U+201F, U+00AB, U+00BB, U+2026 e U+20AC. Emoji, simboli e lettere fuori da questi insiemi e dalle mappe restano nelle viste: non vengono cancellati per avvicinare lettere prima separate. Una parola di sola punteggiatura resta come segmento con viste vuote, così non si altera l'adiacenza delle parole originali.

Ogni segmento conserva `kind` (`word` o `spaced`), `range`, `fragments`, le stringhe `base` e `deleet`, gli array `baseOrigins` e `deleetOrigins` e le sequenze `squeeze`. Gli array delle origini contengono un intervallo per **punto di codice prodotto**, non per unità UTF-16; un'emoji ne occupa uno, una legatura espansa può occuparne più di uno. `range` comprende la punteggiatura esterna della parola, mentre le origini delle viste permettono al futuro rilevatore di escluderla dal match. Se la rimozione di invisibili o separatori rende adiacenti un surrogato alto e uno basso prima isolati, la vista risultante contiene un solo punto di codice con un’origine che copre entrambi e il testo intermedio; due surrogati dello stesso tipo rimangono distinti. Questo riallineamento vale per `foldWithOrigins`, `base`, `deleet` e `squeeze`. Queste strutture sono interne: non vengono esportate dall’entrypoint pubblico.

### 4.3 Viste

Ogni parola viene valutata in più viste. Basta che una delle viste corrisponda a una regola:

| Vista     | Trasformazione                                                                                                                                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`    | Minuscole, rimozione degli accenti, caratteri fullwidth convertiti, caratteri simili ricondotti alle lettere latine                                                                                                                            |
| `deleet`  | `base` più la conversione del leetspeak: `0→o 1→i 3→e 4→a 5→s 7→t @→a $→s €→e !→i`                                                                                                                                                             |
| `squeeze` | Confronto delle sequenze di lettere ripetute di `deleet` con la forma dichiarata dalla regola: una sequenza di **3 o più** può corrispondere a una lettera singola o doppia. Le sequenze di una o due lettere devono corrispondere esattamente |

`deleet` si applica solo alle parole che contengono almeno una lettera. Così "1993" non diventa "ieei", mentre "D10" diventa "dio".

`squeeze` non produce una singola stringa distruttiva né tutte le combinazioni possibili: conserva lettera, numero di ripetizioni e intervallo originale per ogni sequenza. Il matcher confronta queste sequenze con quelle della forma dichiarata, in ordine. Così `cazzzzo` corrisponde a `cazzo`, `porcooo` a `porco`, ma `cazo` non corrisponde a `cazzo` e una doppia originale non viene ridotta a una singola. Il confronto vale anche per le forme usate da `prefix`, `phrase`, `compound` e `combo`; ogni forma mantiene i propri vincoli di confine. La rappresentazione viene costruita in M1, il confronto con le regole in M2 (D15).

### 4.4 Parità tra JS e Dart: tabella generata, zero dipendenze

Dart non offre un equivalente di `String.normalize("NFKD")`. Per questo **nessuno dei due motori normalizza Unicode a runtime**: entrambi usano la stessa **tabella `char → string`**, generata al momento del build da `tools/` a partire da tre insiemi:

- i caratteri latini con segni diacritici e le legature (tramite `normalize("NFKD")` di Node su intervalli espliciti; nessuna versione del runtime nei file generati, che hanno un hash del contenuto);
- i caratteri fullwidth;
- un sottoinsieme mirato di caratteri simili, cirillici e greci identici a lettere latine, preso da UTS #39 (`confusables.txt`) con la versione fissata.

Questo approccio ha tre vantaggi:
- zero dipendenze in entrambi i linguaggi;
- **parità garantita**, perché entrambi i motori leggono la stessa tabella invece di eseguire due algoritmi diversi;
- copertura dichiarata nel README: caratteri fuori tabella restano invariati.

---

## 5. Regole

### 5.1 Tipi di regola

| Tipo       | Su cosa si applica                                                                 | Esempio                                           | Note                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `word`     | Parola intera, uguale a una delle forme elencate                                   | `cazzo`, `cazzi`, `stronzo`, `stronza`, `stronzi` | **Il tipo predefinito.** Le flessioni vanno elencate, non dedotte                                    |
| `prefix`   | Parola che inizia con il termine                                                   | `vaffancul`                                       | **Raro.** Va giustificato in `note` e deve superare il controllo sul corpus di parole innocue (§7.3) |
| `phrase`   | Sequenza di parole                                                                 | `porca puttana`, `figlio di puttana`              | Le parole intermedie sono quelle dichiarate                                                          |
| `compound` | Composto noto dentro una sola parola, ancorato all'inizio o alla fine della parola | `porcodio`, `diocane`, `madonnaputtana`           | Mai cercato in mezzo a una parola                                                                    |
| `combo`    | Concetto divino più insulto, vedi §5.2                                             | `Dio porco`, `D10 p0rc0`, `dioporcone`            | Riservato alle bestemmie                                                                             |
| `pattern`  | Riconoscimento di contatti (URL, email, telefono)                                  | `www.sito.it`, `333 1234567`                      | Solo per la categoria `contact`, regex fisse dentro il motore                                        |

### 5.2 Bestemmie: la regola `combo`

Una regola `combo` ha:
- un gruppo **A** di concetti divini (`dio`, `madonna`, `gesu`, `cristo`…), ciascuno con le sue forme;
- un gruppo **B** di insulti (`porc*`, `can*`, `ladr*`, `boia`, `bestia`, `merd*`, `serpent*`…), con forme elencate o prefissi approvati.

La regola scatta in due casi:
1. **Due parole adiacenti**: una parola è **esattamente** una forma di A e la parola accanto, prima o dopo, è una forma di B. Così `Dio porco`, `porco Dio`, `D10 p0rc0` e `Dio.porcone` vengono bloccati.
2. **Dentro una sola parola**: la parola **inizia** con una forma di A seguita da una forma di B (`dioporcone`), oppure **finisce** con una forma di B seguita da una forma di A (`porcodio`).

Di conseguenza:
- `Claudio porco` non attiva `combo`, perché "claudio" non è esattamente "dio". Eventuali insulti presenti nel testo vengono valutati dalle altre regole.
- `Claudioporcu` non la attiva, perché la parola non inizia con "dio".
- `Dio santo` non la attiva, perché "santo" non è in B.

### 5.3 Formato di una regola

```jsonc
{
  "id": "it.blasphemy.divine-insult", // stabile: compare nei risultati e nei changelog
  "kind": "combo",
  "category": "blasphemy",
  "severity": 3, // 1 lieve · 2 volgare · 3 grave
  "confidence": "high", // high | medium: la policy decide come trattare medium
  "a": ["dio", "dii", "madonna", "madonne", "gesu", "cristo"],
  "b": { "forms": ["boia", "bestia"], "prefixes": ["porc", "can", "ladr", "merd", "serpent"] },
  "provenance": ["manual"], // manual | napolux@<commit> | …
  "note": "facoltativo, per i curatori"
}
```

Le eccezioni hanno un file separato e **sopprimono solo un match specifico**:

```jsonc
{ "ruleId": "it.sexual.cazz-forms", "word": "cazzuola", "reason": "attrezzo da muratore" }
```

Un'eccezione **non toglie testo e non disattiva la regola altrove**. Se la stessa parola è coperta da un'altra regola, quella resta attiva.

Le eccezioni si applicano ai match contenuti in un singolo segmento, confrontando l'intera parola nelle viste `base` o `deleet`. Un'eccezione su una parola non sopprime una regola `phrase` o `combo` che copre più parole: il testo e l'adiacenza restano disponibili a tutte le altre regole. I match duplicati fra viste vengono eliminati per `ruleId` e intervallo.

Per `word`, `prefix` e `combo` l'intervallo copre il segmento o la coppia riconosciuta, esclusa la punteggiatura esterna senza contributo lessicale. Per `compound` copre la porzione ancorata effettivamente riconosciuta. Le frasi usano solo le parole originali adiacenti, mai i candidati aggiuntivi delle lettere spaziate. Dopo offset iniziale, gravità e `ruleId`, la fine dell'intervallo risolve eventuali ulteriori parità d'ordine.

`provenance` e `note` servono solo ai curatori: il build li toglie dai dati distribuiti nei pacchetti.

### 5.4 Gravità e categorie

- `severity` e `confidence` sono scelte editoriali del progetto, documentate in [docs/curazione.md](docs/curazione.md). Non vengono mai copiate da altre liste.
- La categoria `discriminatory` include **solo le forme ingiuriose**. I termini neutri che indicano un'identità (gruppi etnici, religioni, orientamenti) non sono mai offese di per sé.

---

## 6. Policy e API

### 6.1 Profili

| Profilo              | Uso                      | Comportamento                                                         |
| -------------------- | ------------------------ | --------------------------------------------------------------------- |
| `balanced` (default) | Giochi e app generaliste | `block` per gravità 2-3 con `confidence: high`; `review` per `medium` |
| `strict`             | Utenti minorenni, scuole | `block` da gravità 1; `review` diventa `block`                        |
| `lenient`            | Community adulte         | `block` solo per `blasphemy` e `discriminatory`                       |
| personalizzato       | Esigenze specifiche      | Soglie per categoria, termini ed eccezioni dell'app                   |

`review` indica un caso dubbio: l'app decide se rifiutare il testo o mandarlo in moderazione manuale. Per i nickname conviene trattarlo come un rifiuto.

Le forme con `confidence: medium` producono `review` anche a gravità 1 in `balanced`. In `lenient`, solo `blasphemy` e `discriminatory` producono un'azione lessicale: `high` porta a `block`, `medium` a `review`. `strict` porta a `block` ogni match attivo. Il risultato aggregato sceglie `block` prima di `review`, poi `allow`; l'elenco dei match resta sempre completo.

`thresholds` permette di impostare per categoria il minimo di gravità (1, 2 o 3), oppure `null` per disattivarne l'azione. Le soglie esplicite prevalgono sul profilo, senza rimuovere i match; per un match ammesso dalla soglia resta il trattamento della confidenza. L'opzione `contacts: true` blocca i contatti in tutti i profili predefiniti (D20), salvo una soglia esplicita diversa.

I contatti si riconoscono sull'input originale troncato: URL con `http://`, `https://` o `www.`, email ASCII con dominio e numeri telefonici di 9-15 cifre, anche con separatori. È un rilevatore euristico: una sequenza numerica isolata di tale lunghezza può essere classificata come telefono. Non è una validazione completa degli standard di email e URL né un normalizzatore di contatti Unicode.

### 6.2 TypeScript

```ts
import { findMatches, check, isClean, createChecker } from "italian-profanity"

findMatches("D10 p0rc0")
// [{ ruleId: "it.blasphemy.divine-insult", category: "blasphemy", severity: 3,
//    confidence: "high", kind: "combo", range: { start: 0, end: 9 } }]

check("D10 p0rc0") // { action: "block", matches: [...] }  profilo balanced
check("Claudio", { profile: "strict" }) // { action: "allow", matches: [] }
isClean("Claudio") // true: scorciatoia per check(...).action === "allow"

const checker = createChecker({
  profile: "balanced",
  languages: ["it"], // default; "en" solo se attivato
  contacts: true, // URL, email, telefono
  extraRules: [{ kind: "word", terms: ["nomeconcorrente"], category: "insult", severity: 2 }],
  exceptions: [{ ruleId: "it.insult.xyz", word: "cognomelocale" }],
})
checker.check("…")
```

`extraRules` accetta solo regole `word` letterali; `id` è facoltativo e, se omesso, diventa `app.word.<indice>`. Un id duplicato o nel namespace `contact.` è rifiutato. Le forme e le eccezioni locali vengono normalizzate come parole alfabetiche singole, senza eseguire regex; termini vuoti, simboli senza lettere o frasi richiedono un errore di configurazione. Le regole locali restano attive anche con `languages: []`. `createChecker()` compila una copia delle opzioni e non legge le successive mutazioni degli array dell'app.

Il dataset inglese opzionale contiene 51 regole curate, 110 forme nei campi `terms` e 20 varianti di frase. `languages: ["en"]` attiva soltanto queste regole; `["it", "en"]` attiva entrambe le lingue. Non equivale alle liste complete delle librerie di confronto. Le lingue diverse da `it` ed `en` vengono rifiutate. Nessuna lingua aggiuntiva viene attivata per default.

- `range` si riferisce al testo originale, in **unità UTF-16** (native sia in JS sia in Dart, quindi identiche). **Non va scritto nei log**, perché permetterebbe di risalire al nickname.
- Pubblicato come ESM con i tipi `.d.ts`, per Node 20 o superiore e i browser moderni. Nessuna dipendenza a runtime.

### 6.3 Dart

```dart
import 'package:italian_profanity/italian_profanity.dart';

final result = ItalianProfanity.check('D10 p0rc0');
result.action;                       // Action.block
result.matches.first.ruleId;         // 'it.blasphemy.divine-insult'
ItalianProfanity.isClean('Claudio'); // true

final checker = ItalianProfanity.createChecker(
  profile: Profile.balanced,
  contacts: true,
);
```

Dart puro, senza Flutter, SDK 3.4 o superiore. È la stessa API concettuale del pacchetto TS, con i nomi adattati alle convenzioni Dart. L'ordine dei match è deterministico e identico in entrambi i motori: per offset iniziale, poi per gravità decrescente, poi per `ruleId`.

---

## 7. Test e qualità

### 7.1 Casi di test condivisi (fixture)

Le fixture sono file **JSONL**, una riga per caso, così i diff restano leggibili e aggiungere un caso è semplice. Stanno in `data/fixtures/`:

```jsonc
{"id":"it-neg-001","input":"Claudio","profile":"balanced","action":"allow"}
{"id":"it-neg-002","input":"Claudio porco","profile":"balanced","mustNotMatch":["it.blasphemy.divine-insult"]}
{"id":"it-pos-001","input":"D10 p0rc0","profile":"balanced","action":"block","rules":["it.blasphemy.divine-insult"]}
{"id":"it-pos-002","input":"c a z z o","profile":"balanced","action":"block"}
{"id":"uni-001","input":"ｃａｚｚｏ","profile":"balanced","action":"block","note":"fullwidth"}
```

Campi: `expectedBase` (risultato atteso di `fold` sull'intero input, prima di limiti e segmentazione), `expectedSegments`, `expectedError`, `maxLength`, `action` (atteso), `rules` (devono comparire), `mustNotMatch` (non devono comparire), `profile`. Almeno un'attesa è obbligatoria. Le attese di normalizzazione, segmentazione ed errore vengono verificate sempre su entrambi i motori da `pnpm parity`; `--expectations` aggiunge le attese di rilevamento da M2.

`expectedSegments` specifica l'elenco completo e ordinato dei segmenti: `kind`, `range`, `base` e `deleet` sono obbligatori per ciascuno; `fragments`, `baseOrigins`, `deleetOrigins` e `squeeze` sono opzionali. Ogni campo presente viene confrontato esattamente, inclusi lunghezza e ordine degli array: non è un confronto parziale degli elementi. Le strutture complete prodotte dai due motori vengono comunque sempre confrontate in parità. `expectedBase` ed `expectedSegments` accettano attese vuote. `expectedError: "invalidMaxLength"` richiede un `maxLength` invalido ed esclude attese sui segmenti o sul rilevamento.

Da M2 `expectedMatches` verifica l'elenco completo e ordinato dei match, compresi metadati e intervalli. Le fixture possono passare `languages`, `extraRules`, `exceptions` e `thresholds`; `expectedError: "invalidOptions"` verifica configurazioni non ammesse. I test di entrambi i pacchetti e `pnpm parity --expectations` controllano le attese lessicali. `pnpm check` e la CI richiedono tale modalità e l'audit effettivo: l'assenza del rilevatore non è più uno skip consentito.

M1 ha 107 nuove fixture condivise per segmenti, viste, intervalli UTF-16 ed errori, oltre alle 31 iniziali: comprendono espansioni, eliminazioni, emoji, surrogati isolati, troncamento e casi negativi vicini. Gli stessi casi sono verificati anche dai test di entrambi i pacchetti, con invarianti su provenienza, lunghezza delle viste e ricostruzione delle ripetizioni. Il confronto fra motori e quello con le attese sono due controlli distinti e obbligatori per i campi implementati.

**Insieme minimo per la v0.1: 300 casi**, di cui almeno il 60% negativi (nomi, luoghi, parole vicine a quelle bloccate). Le famiglie obbligatorie sono quelle della tabella al §4 della revisione: nomi, toponimi, parole innocue simili a parolacce, `Dio santo`, leet, separatori, ripetizioni, lettere spaziate, Unicode composto e decomposto, fullwidth, caratteri cirillici misti, zero-width, numeri innocui ed emoji.

### 7.2 Parità tra i motori

Ogni motore ha un piccolo eseguibile di test (`fixtures-runner`) che legge le fixture e scrive un JSON con i risultati (`action`, `matches` ordinati con `range`). La CI verifica due cose:
1. ogni motore rispetta le aspettative delle fixture;
2. **i due JSON sono identici, byte per byte**.

### 7.3 Controllo sul corpus di parole innocue

Lo script `tools/audit-benign` esegue il rilevatore TS sia con `languages: ["it"]` sia con `["it", "en"]`, su:
- i nomi propri (8.912), i cognomi (38.486) e le parole comuni (60.444) di `napolux/paroleitaliane`, scaricati da un **commit fissato** e conservati nella cache della CI, ma **mai inclusi nel repository né nei pacchetti** (il README di napolux dichiara che alcune liste hanno provenienza ignota);
- combinazioni nome + cognome campionate, unite da spazio, `.`, `_` e senza separatore (`Claudio Porcu`, `amadio.cane`, `Mario_Rossi`). Nei nickname la punteggiatura unisce le parole (§4.2), quindi un `compound` ancorato alla fine può scattare su un nome seguito da un cognome: è esattamente il caso che l'audit deve intercettare.

Ogni collisione va **valutata da un curatore**, non corretta in automatico. La soluzione può essere un'eccezione, una regola più stretta o un `prefix` trasformato in `word`. Una regola nuova o modificata **non entra** finché l'audit non è pulito o ogni collisione non è stata giustificata in `data/audit/accepted.jsonl`.

Il report distingue `name`, `surname`, `word` e `pair`: il dizionario contiene anche termini realmente offensivi e non è interamente innocuo. Le collisioni accettate specificano provenienza, motivo e azione attesa in `balanced`; un passaggio inatteso da `review` a `block` fa fallire l'audit. Il nucleo corrente ha due eccezioni nominali e 103 input distinti con collisioni motivate, non un tasso misurato di falsi positivi su utenti reali.

### 7.4 Altre verifiche

- Fuzz di base: input casuali, Unicode ostile, stringhe molto lunghe. Nessun crash e nessun tempo patologico.
- Smoke test dei pacchetti: importazione da Node (ESM e CJS), da browser (bundle) e da Dart VM.
- Benchmark misurati **dopo** l'implementazione, con l'ambiente documentato. Le soglie di prestazioni sono obiettivi, non promesse: < 0,1 ms a nickname e < 30 KB gzip per il pacchetto TS con `it`.

---

## 8. Dati e licenze

### 8.1 Licenza: MIT per codice e dati

- **Le regole sono scritte a mano.** La forma `word`/`combo`/eccezioni è nostra, e le liste esterne servono come **elenco di candidati** da valutare uno per uno.
- **napolux** (MIT): la `lista_badwords` si può usare come fonte di candidati, con `provenance` e attribuzione in `NOTICE`. Nomi, cognomi e parole comuni si usano solo per l'audit (§7.3).
- **LDNOOBW** (CC-BY 4.0): **solo per verificare la copertura**, nessuna voce viene copiata. Se in futuro serviranno voci derivate, andranno in un file dati separato sotto CC-BY con attribuzione, secondo le regole della revisione (§3).
- **Obscenity** (MIT, preset derivato da cuss/MIT): famiglie candidate selezionate manualmente, con provenienza al commit fissato e i due notice MIT distribuiti. Non vengono importate le regex o le trasformazioni del motore. `leo-profanity` e `@2toad/profanity` sono riferimenti di copertura e API, senza importare dati o aggiungere dipendenze. Il dizionario di leo-profanity ha una fonte LDNOOBW distinta dalla licenza MIT del codice.
- **HurtLex**: **escluso**. La licenza è CC BY-NC-SA 4.0 (verificata nel README del repository il 2026-11-03), quindi non commerciale e share-alike: non è compatibile con un pacchetto MIT.
- **EVALITA / HaSpeeDe**: solo per ricerca, mai nel repository.

`data/sources.json` tiene l'inventario delle fonti consultate: URL, commit, licenza, data e uso consentito.

### 8.2 Processo di curazione

1. Un candidato arriva da una fonte, da una segnalazione o dall'uso reale.
2. Si sceglie il tipo di regola (`word` per primo), si elencano le forme, si assegnano categoria, gravità e confidenza.
3. Si scrivono almeno un caso positivo e un caso negativo vicino nelle fixture.
4. Si esegue l'audit del corpus innocuo e si valutano le collisioni.
5. Si apre una PR. La CI mostra la **differenza di comportamento** rispetto alla release precedente.

La guida operativa per i curatori è in [docs/curazione.md](docs/curazione.md).

---

## 9. Struttura del repository

```
italian-profanity/
├─ README.md                 presentazione EN + IT, installazione, limiti
├─ SPECIFICHE.md             questo documento: unica fonte di riferimento
├─ AGENTS.md · CLAUDE.md     istruzioni per agenti AI
├─ LICENSE · NOTICE          MIT, attribuzioni delle fonti
├─ docs/
│  ├─ decisioni.md           registro delle decisioni (ADR brevi)
│  ├─ rilascio.md            flusso di rilascio e configurazione iniziale di npm e pub.dev
│  ├─ curazione.md           guida per i curatori (M3)
│  └─ REVISIONE-2026-11-03.md   storico, assorbita in v2
├─ data/                     ← unica fonte di regole e test
│  ├─ schema/                JSON Schema di regole, eccezioni, fixture, fonti e normalizzazione
│  ├─ rules/it/              blasphemy.json · insult.json · sexual.json · discriminatory.json · vulgar.json
│  ├─ rules/en/              core.json (pacchetto facoltativo)
│  ├─ exceptions/it.json
│  ├─ normalization/         leet · invisible · latin-extra · confusables-subset (input del build)
│  ├─ fixtures/*.jsonl       id con prefisso uguale al nome del file
│  ├─ audit/accepted.jsonl   collisioni valutate e accettate
│  └─ sources.json
├─ tools/                    TypeScript, eseguito con Node 24 (type stripping)
│  ├─ lib/                   caricamento dati, JSON canonico, percorsi
│  ├─ validate.ts            schema e controlli semantici
│  ├─ build.ts               genera la tabella fold e i dati per TS e Dart, copia LICENSE e NOTICE
│  ├─ audit-benign.ts        corpus napolux (commit fissato, scaricato in .cache)
│  ├─ parity.ts              confronta i JSON dei due runner; --expectations verifica le attese
│  ├─ sync-version.ts        allinea pubspec e CHANGELOG alla versione npm
│  └─ behavior-diff.ts       differenze di esito rispetto all'ultima release (M6)
├─ packages/
│  ├─ js/                    npm "italian-profanity"
│  │  ├─ src/                normalize.ts · segment.ts · matchers/ · policy.ts · types.ts · index.ts
│  │  ├─ src/generated/      dati e tabella (generati, versionati)
│  │  ├─ test/               unit test (Vitest) + fixtures-runner.ts
│  │  └─ tsconfig.build.json isolatedDeclarations solo sul codice pubblicato
│  └─ dart/                  pub.dev "italian_profanity"
│     ├─ lib/src/            stessi moduli
│     ├─ lib/src/generated/  (generati, versionati)
│     ├─ test/               unit test
│     └─ tool/               fixtures_runner.dart
├─ .github/
│  ├─ workflows/ci.yml       validate → build (diff pulito) → lint → typecheck → test → parity → smoke npm → dry-run pub;
│  │                         job separati per Dart SDK 3.4 e per l'audit
│  ├─ workflows/release.yml  da tag vX.Y.Z: verifica, poi npm (provenance, OIDC) e pub.dev (automated publishing)
│  ├─ ISSUE_TEMPLATE/        falso positivo, falso negativo
│  ├─ pull_request_template.md
│  └─ dependabot.yml
├─ .changeset/               Changesets
├─ package.json · pnpm-workspace.yaml · tsconfig.base.json · biome.json
└─ .editorconfig · .gitattributes   (fine riga LF, così il build è deterministico anche su Windows)
```

Gli strumenti principali:

| Ambito               | Scelta                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| Package manager JS   | pnpm, workspace con `packages/js` e la radice per `tools/`                                       |
| Build TS             | `tsdown` (ESM, CJS e `.d.ts`), nessuna dipendenza a runtime                                      |
| Test TS              | Vitest                                                                                           |
| Lint e formattazione | Biome per TS, JSON e Markdown                                                                    |
| Dart                 | `dart test`, `dart analyze` con `lints/recommended`, `dart format`                               |
| Versioni             | Changesets. **Le versioni npm e pub sono sempre identiche**: `tools/` sincronizza `pubspec.yaml` |

---

## 10. Versioni e rilasci

- Semver, con la stessa versione per i due pacchetti.
- **Prima della 1.0**: `minor` per regole nuove o più restrittive (possono bloccare testi prima accettati), `patch` per correzioni di falsi positivi e per la documentazione.
- **Dalla 1.0**: `major` per modifiche all'API o alla normalizzazione, `minor` per regole nuove, `patch` per correzioni.
- Ogni release contiene, generata da `behavior-diff`, **una tabella dei casi il cui esito è cambiato**. Chi usa la libreria vede cosa cambia prima di aggiornare.
- Le app conviene che fissino la versione esatta e la aggiornino consapevolmente.

---

## 11. Roadmap

| Fase                                                           | Contenuto                                                                                                              | Ore stimate |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------: |
| ✅ **M0** Struttura                                            | Monorepo, schema, `validate` e `build` di base, CI con job vuoti, README, LICENSE                                      |         3-4 |
| ✅ **M1** Normalizzazione e segmentazione, **in TS e in Dart** | Viste, segmenti, ripetizioni, origini UTF-16, 107 nuove fixture con attese; 138 fixture totali                         |         6-8 |
| ✅ **M2** Rilevatore e policy in TS e Dart                     | Tutti i tipi di regola, contatti, eccezioni, profili, API; attese e audit obbligatori                                  |       11-15 |
| **M3** Curazione continua                                      | 290 regole italiane, 1.034 forme e inglese opzionale curato; revisione editoriale e segnalazioni restano aperte        |       10-14 |
| ✅ **M4** Consolidamento dei due motori                        | 307 fixture aggiuntive, fuzz Unicode, correzione origini, smoke ESM/CJS/browser e benchmark; verifica SDK minimi in CI |         3-5 |
| **M5** Prova reale (shadow)                                    | Report sui nickname salvati in RuttoFacile e maraffa, senza bloccare; valutazione dei falsi positivi                   |         2-3 |
| **M6** Pubblicazione 0.1.0                                     | Workflow di release, README completo, smoke test, pubblicazione                                                        |         2-3 |
|                                                                | **Totale v0.1**                                                                                                        |   **37-52** |

La normalizzazione va fatta in entrambi i linguaggi già in **M1**, perché le divergenze Unicode emergono lì. Anche rilevatore e policy vanno sviluppati insieme in **M2**, nella stessa PR per ogni comportamento: M4 non è più una fase di port (D14). Le stime sono indicative e vanno rivalutate dopo M1.

M0, M1 e M2 sono completate: la parità riguarda segmenti, viste, policy e match con origini UTF-16, e l'audit esegue il rilevatore. Il dataset copre tutte le categorie italiane e include l’inglese opzionale; i dialetti richiedono ancora curazione dedicata. La beta è pubblicata; il consolidamento tecnico M4 è verificato nel [rapporto del 4 novembre](docs/consolidamento-2026-11-04.md). Restano la revisione editoriale continua M3, la prova reale M5 e il rilascio stabile M6. L'analisi storica e i criteri per aggiungere altri linguaggi sono in [docs/analisi-post-m0.md](docs/analisi-post-m0.md).

Dopo la v0.1, in ordine: romagnolo → `mask()` → CLI `scan` → demo web → altri dialetti.

---

## 12. Integrazione nei tuoi progetti

| Progetto          | Uso                                                                                                                                                                                                                                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RuttoFacile       | `check()` con `contacts: true` nel route del nickname (`src/app/api/player/nickname/route.ts`), più lo stesso controllo lato client per la risposta immediata. In seguito: le regole aggiunte da admin arrivano dal database tramite `extraRules`. Fino alla v0.1, RuttoFacile usa un filtro interno con le stesse regole, poi passa alla libreria |
| maraffa-romagnola | Sostituire i due filtri attuali (client `leo-profanity` + `italian-badwords-list`, server con lista a mano) con lo stesso pacchetto, così client e server danno lo stesso esito                                                                                                                                                                    |
| Progetti Flutter  | `italian_profanity` nei validatori dei form. Se il backend è in Node, il pacchetto npm dà lo stesso esito                                                                                                                                                                                                                                          |

---

## 13. Rischi

| Rischio                                                | Mitigazione                                                                                                                   |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Falsi positivi su nomi reali                           | `word` come tipo predefinito, `combo` ancorata, audit su circa 47.000 nomi e cognomi, fixture negative in maggioranza         |
| Elusioni creative                                      | Viste deleet e squeeze, punteggiatura dentro le parole, lettere spaziate, caratteri simili. Le segnalazioni diventano fixture |
| Divergenza tra JS e Dart                               | Tabella e dati generati, parità byte per byte in CI, normalizzazione in entrambi già da M1                                    |
| Un aggiornamento dei dati blocca testi prima accettati | `behavior-diff` in ogni release, versione fissata dalle app                                                                   |
| Licenze                                                | MIT con regole scritte a mano, inventario delle fonti, HurtLex ed EVALITA esclusi                                             |
| Immagine di un repository pubblico pieno di bestemmie  | Nome tecnico e neutro, README professionale, i termini solo dentro `data/`                                                    |
| Manutenzione                                           | Ambito stretto, PR con fixture obbligatorie, audit automatico                                                                 |

---

## 14. Fonti

Le fonti e le licenze dettagliate sono al §3 della [revisione](docs/REVISIONE-2026-11-03.md). Quelle principali:

- napolux/paroleitaliane — https://github.com/napolux/paroleitaliane (MIT)
- LDNOOBW — https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words (CC-BY 4.0)
- HurtLex — https://github.com/valeriobasile/hurtlex (CC BY-NC-SA 4.0: escluso)
- obscenity — https://www.npmjs.com/package/obscenity (riferimento architetturale)
- Dax-87/badwords-it — https://github.com/Dax-87/badwords-it
- Unicode UTS #39 — https://www.unicode.org/reports/tr39/
- italian-badwords-list — https://classic.yarnpkg.com/en/package/italian-badwords-list
- safe_text — https://pub.dev/documentation/safe_text/3.0.0/ · censor_it — https://pub.dev/packages/censor_it
