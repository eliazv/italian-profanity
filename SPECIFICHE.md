# italian-profanity — specifiche

> Libreria per riconoscere bestemmie, insulti, volgarità e termini discriminatori **in italiano** in testi brevi (nickname, nomi di stanze, team, titoli). Ha due motori allineati, **TypeScript** (npm) e **Dart** (pub.dev, per Flutter e server Dart), e un unico dataset.
>
> **Versione 2, consolidata il 2026-11-03.** È l'unica fonte di riferimento. Questa versione assorbe la [revisione del 3 novembre](docs/REVISIONE-2026-11-03.md), che resta come documento storico. Le decisioni prese e le loro motivazioni sono in [docs/decisioni.md](docs/decisioni.md).

---

## 1. Posizionamento

**La libreria che uno sviluppatore installa per validare i nickname italiani senza dover aggiungere a mano decine di eccezioni.**

Il valore non è avere la lista più lunga, ma **precisione e affidabilità**:

1. **Nessun falso positivo su nomi, cognomi, luoghi e parole comuni italiane.** Claudio, Diodato, Porcedda, Madonna di Campiglio e Scazzottata devono passare.
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

**Fuori ambito**: testi lunghi o chat con analisi del contesto, machine learning, API remote, lingue diverse dall'italiano (l'inglese resta solo come pacchetto minimo da attivare).

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

Il testo viene troncato a `maxLength`, 64 caratteri per default. La segmentazione viene eseguita una sola volta. Le regex delle regole aggiunte dall'app vengono sempre convertite in testo letterale: l'app passa termini, non regex.

### 4.2 Segmentazione

Il testo viene scomposto in due livelli, conservando per ciascuno l'intervallo di caratteri nel testo originale:

- **Parola**: una sequenza separata da **spazi** (o caratteri equivalenti).
- **Frammento**: una parte di parola separata da **punteggiatura** (`. - _ ' * + ~ |` e simili).

Le regole che lavorano sulle parole vedono ogni parola con i frammenti **riuniti**: `p0r-cò_Dio` è un'unica parola, `porcodio`. La punteggiatura dentro una parola viene trattata come un tentativo di elusione, mentre lo spazio è un vero confine.

**Lettere spaziate.** Se ci sono almeno tre parole consecutive di una sola lettera, vengono riunite in un **segmento** candidato: `c a z z o` → `cazzo`. Le lettere singole non vengono mai unite a parole più lunghe, e le iniziali sparse nel testo non vengono mai unite tra loro.

**Caratteri invisibili** (zero-width, soft hyphen, selettori di variante): vengono rimossi prima della segmentazione.

### 4.3 Viste

Ogni parola viene valutata in più viste. Basta che una delle viste corrisponda a una regola:

| Vista | Trasformazione |
|---|---|
| `base` | Minuscole, rimozione degli accenti, caratteri fullwidth convertiti, caratteri simili ricondotti alle lettere latine |
| `deleet` | `base` più la conversione del leetspeak: `0→o 1→i 3→e 4→a 5→s 7→t @→a $→s €→e !→i` |
| `squeeze` | `deleet` più la riduzione a una delle lettere ripetute **3 o più volte** (`porcooo` → `porco`, `cazzzzo` → `cazzo`). Le doppie italiane restano intatte |

`deleet` si applica solo alle parole che contengono almeno una lettera. Così "1993" non diventa "ieei", mentre "D10" diventa "dio".

### 4.4 Parità tra JS e Dart: tabella generata, zero dipendenze

Dart non offre un equivalente di `String.normalize("NFKD")`. Per questo **nessuno dei due motori normalizza Unicode a runtime**: entrambi usano la stessa **tabella `char → string`**, generata al momento del build da `tools/` a partire da tre insiemi:

- i caratteri latini con segni diacritici e le legature (tramite `normalize("NFKD")` di Node, con la versione Unicode dichiarata nella tabella);
- i caratteri fullwidth;
- un sottoinsieme mirato di caratteri simili, cirillici e greci identici a lettere latine, preso da UTS #39 (`confusables.txt`) con la versione fissata.

Questo approccio ha tre vantaggi:
- zero dipendenze in entrambi i linguaggi;
- **parità garantita**, perché entrambi i motori leggono la stessa tabella invece di eseguire due algoritmi diversi;
- copertura dichiarata nel README: caratteri fuori tabella restano invariati.

---

## 5. Regole

### 5.1 Tipi di regola

| Tipo | Su cosa si applica | Esempio | Note |
|---|---|---|---|
| `word` | Parola intera, uguale a una delle forme elencate | `cazzo`, `cazzi`, `stronzo`, `stronza`, `stronzi` | **Il tipo predefinito.** Le flessioni vanno elencate, non dedotte |
| `prefix` | Parola che inizia con il termine | `vaffancul` | **Raro.** Va giustificato in `note` e deve superare il controllo sul corpus di parole innocue (§7.3) |
| `phrase` | Sequenza di parole | `porca puttana`, `figlio di puttana` | Le parole intermedie sono quelle dichiarate |
| `compound` | Composto noto dentro una sola parola, ancorato all'inizio o alla fine della parola | `porcodio`, `diocane`, `madonnaputtana` | Mai cercato in mezzo a una parola |
| `combo` | Concetto divino più insulto, vedi §5.2 | `Dio porco`, `D10 p0rc0`, `dioporcone` | Riservato alle bestemmie |
| `pattern` | Riconoscimento di contatti (URL, email, telefono) | `www.sito.it`, `333 1234567` | Solo per la categoria `contact`, regex fisse dentro il motore |

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
  "id": "it.blasphemy.divine-insult",     // stabile: compare nei risultati e nei changelog
  "kind": "combo",
  "category": "blasphemy",
  "severity": 3,                          // 1 lieve · 2 volgare · 3 grave
  "confidence": "high",                   // high | medium: la policy decide come trattare medium
  "a": ["dio", "dii", "madonna", "madonne", "gesu", "cristo"],
  "b": { "forms": ["boia", "bestia"], "prefixes": ["porc", "can", "ladr", "merd", "serpent"] },
  "provenance": ["manual"],               // manual | napolux@<commit> | …
  "note": "facoltativo, per i curatori"
}
```

Le eccezioni hanno un file separato e **sopprimono solo un match specifico**:

```jsonc
{ "ruleId": "it.sexual.cazz-forms", "word": "cazzuola", "reason": "attrezzo da muratore" }
```

Un'eccezione **non toglie testo e non disattiva la regola altrove**. Se la stessa parola è coperta da un'altra regola, quella resta attiva.

`provenance` e `note` servono solo ai curatori: il build li toglie dai dati distribuiti nei pacchetti.

### 5.4 Gravità e categorie

- `severity` e `confidence` sono scelte editoriali del progetto, documentate in [docs/curazione.md](docs/curazione.md). Non vengono mai copiate da altre liste.
- La categoria `discriminatory` include **solo le forme ingiuriose**. I termini neutri che indicano un'identità (gruppi etnici, religioni, orientamenti) non sono mai offese di per sé.

---

## 6. Policy e API

### 6.1 Profili

| Profilo | Uso | Comportamento |
|---|---|---|
| `balanced` (default) | Giochi e app generaliste | `block` per gravità 2-3 con `confidence: high`; `review` per `medium` |
| `strict` | Utenti minorenni, scuole | `block` da gravità 1; `review` diventa `block` |
| `lenient` | Community adulte | `block` solo per `blasphemy` e `discriminatory` |
| personalizzato | Esigenze specifiche | Soglie per categoria, termini ed eccezioni dell'app |

`review` indica un caso dubbio: l'app decide se rifiutare il testo o mandarlo in moderazione manuale. Per i nickname conviene trattarlo come un rifiuto.

### 6.2 TypeScript

```ts
import { findMatches, check, isClean, createChecker } from "italian-profanity"

findMatches("D10 p0rc0")
// [{ ruleId: "it.blasphemy.divine-insult", category: "blasphemy", severity: 3,
//    confidence: "high", kind: "combo", range: { start: 0, end: 9 } }]

check("D10 p0rc0")                  // { action: "block", matches: [...] }  profilo balanced
check("Claudio", { profile: "strict" })   // { action: "allow", matches: [] }
isClean("Claudio")                  // true: scorciatoia per check(...).action === "allow"

const checker = createChecker({
  profile: "balanced",
  languages: ["it"],                // default; "en" solo se attivato
  contacts: true,                   // URL, email, telefono
  extraRules: [{ kind: "word", terms: ["nomeconcorrente"], category: "insult", severity: 2 }],
  exceptions: [{ ruleId: "it.insult.xyz", word: "cognomelocale" }],
})
checker.check("…")
```

- `range` si riferisce al testo originale. **Non va scritto nei log**, perché permetterebbe di risalire al nickname.
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

Campi: `action` (atteso), `rules` (devono comparire), `mustNotMatch` (non devono comparire), `profile`. Almeno uno tra `action`, `rules` e `mustNotMatch` è obbligatorio.

**Insieme minimo per la v0.1: 300 casi**, di cui almeno il 60% negativi (nomi, luoghi, parole vicine a quelle bloccate). Le famiglie obbligatorie sono quelle della tabella al §4 della revisione: nomi, toponimi, parole innocue simili a parolacce, `Dio santo`, leet, separatori, ripetizioni, lettere spaziate, Unicode composto e decomposto, fullwidth, caratteri cirillici misti, zero-width, numeri innocui ed emoji.

### 7.2 Parità tra i motori

Ogni motore ha un piccolo eseguibile di test (`fixtures-runner`) che legge le fixture e scrive un JSON con i risultati (`action`, `matches` ordinati con `range`). La CI verifica due cose:
1. ogni motore rispetta le aspettative delle fixture;
2. **i due JSON sono identici, byte per byte**.

### 7.3 Controllo sul corpus di parole innocue

Lo script `tools/audit-benign` esegue il rilevatore TS su:
- i nomi propri (8.912), i cognomi (38.486) e le parole comuni (60.444) di `napolux/paroleitaliane`, scaricati da un **commit fissato** e conservati nella cache della CI, ma **mai inclusi nel repository né nei pacchetti** (il README di napolux dichiara che alcune liste hanno provenienza ignota);
- combinazioni nome + cognome campionate, unite da spazio, `.`, `_` e senza separatore (`Claudio Porcu`, `amadio.cane`, `Mario_Rossi`). Nei nickname la punteggiatura unisce le parole (§4.2), quindi un `compound` ancorato alla fine può scattare su un nome seguito da un cognome: è esattamente il caso che l'audit deve intercettare.

Ogni collisione va **valutata da un curatore**, non corretta in automatico. La soluzione può essere un'eccezione, una regola più stretta o un `prefix` trasformato in `word`. Una regola nuova o modificata **non entra** finché l'audit non è pulito o ogni collisione non è stata giustificata in `data/audit/accepted.jsonl`.

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
- **HurtLex**: **escluso**. La licenza è CC BY-NC-SA 4.0 (verificata nel README del repository il 2026-11-03), quindi non commerciale e share-alike: non è compatibile con un pacchetto MIT.
- **EVALITA / HaSpeeDe**: solo per ricerca, mai nel repository.

`data/sources.json` tiene l'inventario delle fonti consultate: URL, commit, licenza, data e uso consentito.

### 8.2 Processo di curazione

1. Un candidato arriva da una fonte, da una segnalazione o dall'uso reale.
2. Si sceglie il tipo di regola (`word` per primo), si elencano le forme, si assegnano categoria, gravità e confidenza.
3. Si scrivono almeno un caso positivo e un caso negativo vicino nelle fixture.
4. Si esegue l'audit del corpus innocuo e si valutano le collisioni.
5. Si apre una PR. La CI mostra la **differenza di comportamento** rispetto alla release precedente.

La guida operativa per i curatori è in [docs/curazione.md](docs/curazione.md), da scrivere nella fase M3.

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
│  ├─ curazione.md           guida per i curatori (M3)
│  └─ REVISIONE-2026-11-03.md   storico, assorbita in v2
├─ data/                     ← unica fonte di regole e test
│  ├─ schema/                JSON Schema di regole, eccezioni e fixture
│  ├─ rules/it/              blasphemy.json · insult.json · sexual.json · discriminatory.json · vulgar.json
│  ├─ rules/en/              core.json (pacchetto facoltativo)
│  ├─ exceptions/it.json
│  ├─ normalization/         leet.json · confusables-subset.json (input del build)
│  ├─ fixtures/*.jsonl
│  ├─ audit/accepted.jsonl   collisioni valutate e accettate
│  └─ sources.json
├─ tools/                    TypeScript, eseguito con Node 24 (type stripping)
│  ├─ validate.ts            schema, unicità degli id, termini già normalizzati, casi per ogni regola
│  ├─ build.ts               genera la tabella di normalizzazione e i dati per TS e Dart
│  ├─ audit-benign.ts        corpus napolux (commit fissato, scaricato in cache)
│  ├─ parity.ts              confronta i JSON dei due fixtures-runner
│  └─ behavior-diff.ts       differenze di esito rispetto all'ultima release
├─ packages/
│  ├─ js/                    npm "italian-profanity"
│  │  ├─ src/                normalize.ts · segment.ts · matchers/ · policy.ts · index.ts
│  │  ├─ src/generated/      dati e tabella (generati, versionati)
│  │  └─ test/               unit test + fixtures-runner
│  └─ dart/                  pub.dev "italian_profanity"
│     ├─ lib/src/            stessi moduli
│     ├─ lib/src/generated/  (generati, versionati)
│     └─ test/               unit test + fixtures-runner
├─ .github/workflows/
│  ├─ ci.yml                 validate → build (diff pulito) → test TS → test Dart → parity → audit-benign → smoke
│  └─ release.yml            pubblicazione da tag con OIDC (npm trusted publishing, pub.dev automated publishing)
├─ package.json · pnpm-workspace.yaml
└─ .editorconfig · .gitattributes   (fine riga LF, così il build è deterministico anche su Windows)
```

Gli strumenti principali:

| Ambito | Scelta |
|---|---|
| Package manager JS | pnpm, workspace con `packages/js` e la radice per `tools/` |
| Build TS | `tsdown` (ESM, CJS e `.d.ts`), nessuna dipendenza a runtime |
| Test TS | Vitest |
| Lint e formattazione | Biome, sia per TS sia per JSON |
| Dart | `dart test`, `dart analyze` con `lints/recommended`, `dart format` |
| Versioni | Changesets. **Le versioni npm e pub sono sempre identiche**: `tools/` sincronizza `pubspec.yaml` |

---

## 10. Versioni e rilasci

- Semver, con la stessa versione per i due pacchetti.
- **Prima della 1.0**: `minor` per regole nuove o più restrittive (possono bloccare testi prima accettati), `patch` per correzioni di falsi positivi e per la documentazione.
- **Dalla 1.0**: `major` per modifiche all'API o alla normalizzazione, `minor` per regole nuove, `patch` per correzioni.
- Ogni release contiene, generata da `behavior-diff`, **una tabella dei casi il cui esito è cambiato**. Chi usa la libreria vede cosa cambia prima di aggiornare.
- Le app conviene che fissino la versione esatta e la aggiornino consapevolmente.

---

## 11. Roadmap

| Fase | Contenuto | Ore stimate |
|---|---|---:|
| **M0** Struttura | Monorepo, schema, `validate` e `build` di base, CI con job vuoti, README, LICENSE | 3-4 |
| **M1** Normalizzazione e segmentazione, **in TS e in Dart** | Tabella generata, viste, offset, prime 80 fixture Unicode e separatori, parità già attiva | 6-8 |
| **M2** Rilevatore e policy in TS | `word`, `prefix`, `phrase`, `compound`, `combo`, `pattern`, eccezioni, profili, API | 6-8 |
| **M3** Curazione | 60-100 regole, 300 fixture, audit napolux, `curazione.md`, `sources.json`, `NOTICE` | 10-14 |
| **M4** Rilevatore e policy in Dart | Port completo, parità al 100% | 5-7 |
| **M5** Prova reale (shadow) | Report sui nickname salvati in RuttoFacile e maraffa, senza bloccare; valutazione dei falsi positivi | 2-3 |
| **M6** Pubblicazione 0.1.0 | Workflow di release, README completo, smoke test, pubblicazione | 2-3 |
| | **Totale v0.1** | **34-47** |

La normalizzazione va fatta in entrambi i linguaggi già in **M1**, perché le divergenze Unicode emergono lì. Scoprirle in M4 costerebbe di più.

Dopo la v0.1, in ordine: romagnolo → `mask()` → CLI `scan` → demo web → altri dialetti.

---

## 12. Integrazione nei tuoi progetti

| Progetto | Uso |
|---|---|
| RuttoFacile | `check()` con `contacts: true` nel route del nickname (`src/app/api/player/nickname/route.ts`), più lo stesso controllo lato client per la risposta immediata. In seguito: le regole aggiunte da admin arrivano dal database tramite `extraRules`. Fino alla v0.1, RuttoFacile usa un filtro interno con le stesse regole, poi passa alla libreria |
| maraffa-romagnola | Sostituire i due filtri attuali (client `leo-profanity` + `italian-badwords-list`, server con lista a mano) con lo stesso pacchetto, così client e server danno lo stesso esito |
| Progetti Flutter | `italian_profanity` nei validatori dei form. Se il backend è in Node, il pacchetto npm dà lo stesso esito |

---

## 13. Rischi

| Rischio | Mitigazione |
|---|---|
| Falsi positivi su nomi reali | `word` come tipo predefinito, `combo` ancorata, audit su circa 47.000 nomi e cognomi, fixture negative in maggioranza |
| Elusioni creative | Viste deleet e squeeze, punteggiatura dentro le parole, lettere spaziate, caratteri simili. Le segnalazioni diventano fixture |
| Divergenza tra JS e Dart | Tabella e dati generati, parità byte per byte in CI, normalizzazione in entrambi già da M1 |
| Un aggiornamento dei dati blocca testi prima accettati | `behavior-diff` in ogni release, versione fissata dalle app |
| Licenze | MIT con regole scritte a mano, inventario delle fonti, HurtLex ed EVALITA esclusi |
| Immagine di un repository pubblico pieno di bestemmie | Nome tecnico e neutro, README professionale, i termini solo dentro `data/` |
| Manutenzione | Ambito stretto, PR con fixture obbligatorie, audit automatico |

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
