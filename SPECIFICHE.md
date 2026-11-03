# italian-profanity — analisi e specifiche

> Libreria per riconoscere parolacce, bestemmie e insulti **in italiano** in testi brevi (nickname, nomi di stanze, team, titoli), con due implementazioni allineate: **JavaScript/TypeScript** (npm) e **Dart** (pub.dev, per Flutter e server).
>
> Stato: proposta · Data analisi: 2026-11-03 · Autore: Elia Zavatta

---

## 1. In sintesi

- **Il problema**: le librerie esistenti trattano l'italiano come una lista di parole da cercare. In italiano però le parole problematiche richiedono regole diverse: `dio` da solo è innocuo (Claudio, Diodato), `dio` + `porco` no; `cazzo` va bloccato, "Scazzottata" no. Per questo i filtri attuali **bloccano nomi innocui e lasciano passare il leetspeak** (`D10 p0rc0`).
- **Il vuoto**: non esiste una libreria verticale sull'italiano, mantenuta, con le stesse regole in JS e in Dart. Il pacchetto più usato (`italian-badwords-list`) ha 88 parole, nessuna regola e nessun aggiornamento dal 2022, eppure fa circa 1.600 download al mese: la domanda c'è.
- **La proposta**: un progetto che parte dai dati. Le regole stanno in JSON, condivise da due motori piccoli senza dipendenze. Un unico insieme di casi di test viene eseguito su entrambi i linguaggi e garantisce che si comportino in modo identico.
- **Il nome**: `italian-profanity` su npm, `italian_profanity` su pub.dev, e `italian-profanity` per il repository GitHub. Motivazioni al §3.
- **La stima**: v0.1 in 2,5-3 giorni, di cui la curazione dei dati è la parte più lunga.

---

## 2. Ricerca svolta

### 2.1 Metodo

Ho cercato come lo cercherebbe uno sviluppatore che ha il problema, sia in inglese sia in italiano:

| Dove | Ricerca |
|---|---|
| Web | `italian profanity filter npm bestemmie library` |
| Web | `pub.dev profanity filter italian dart package` |
| Web | `github italian bad words list bestemmie json multilingual profanity dataset` |
| GitHub API | `parolacce`, `bestemmie`, `italian bad words`, `profanity italian` (ordinati per stelle) |
| Registri | disponibilità dei nomi su `registry.npmjs.org` e `pub.dev/api/packages` |
| npm API | download mensili di `italian-badwords-list` |
| Codice esistente | i due filtri di `maraffa-romagnola` (client e server), messi alla prova con casi reali |

### 2.2 Cosa esiste

**JavaScript / npm**

| Pacchetto | Cosa offre | Limiti per l'italiano |
|---|---|---|
| `italian-badwords-list` | 88 parole, una regex e una funzione leet | Fermo dal 2022 (≈1.600 download al mese). Contiene `dio`, `madonna` e `porco` come parole singole, che cercate dentro il testo producono falsi positivi |
| `leo-profanity` | Motore con dizionari aggiungibili | Dizionario inglese. Usato in maraffa insieme alla lista sopra |
| `is-bad-word` | Multilingua, dichiara più di 175 parole italiane | Lista semplice, senza regole diverse per tipo di parola |
| `profanity-light` | Motore TypeScript con dizionario vuoto e regex | Va riempito a mano |
| `clean-speech`, `@idrisay/profanity-check` | Multilingua | Poco usati, italiano marginale |
| `obscenity` | Ottimo motore anti-elusione (confusables, ripetizioni, whitelist) | Dataset solo inglese |

**Dart / pub.dev**

| Pacchetto | Cosa offre | Limiti |
|---|---|---|
| `safe_text` | Dart puro, multilingua compreso l'italiano, riconosce anche i numeri di telefono | Lista generica, qualità della parte italiana da verificare |
| `censor_it` | Multilingua compreso l'italiano, mascheramento, MIT | Come sopra |
| `profanity_filter` | Il più diffuso | Usa la lista LDNOOBW in inglese |

**Dataset**

| Progetto | Note |
|---|---|
| LDNOOBW (`List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words`) | Lo standard di fatto, ha un file `it`. Licenza CC-BY 4.0 |
| `okineadev/profanity-list` | Multilingua, include l'italiano |
| `washyourmouthoutwithsoap` | Generata con Google Translate: da escludere |

**Progetti affini trovati su GitHub**

- `Dax-87/badwords-it`: filtro italiano in **PHP** con riconoscimento su tre livelli (regex, substring, frasi composte). È l'idea più vicina alla nostra, ma è solo PHP e non ha nessuna stella. Conferma che l'approccio a regole è quello giusto.
- `marcomc/BadWordsChecker`: un'applicazione da riga di comando, non una libreria.
- Il resto dei risultati sono generatori o contatori di bestemmie: non pertinenti.

### 2.3 Prova sul campo: maraffa-romagnola

Il filtro client (`leo-profanity` più `italian-badwords-list`, con ricerca dentro il testo):

| Input | Risultato | Corretto? |
|---|---|---|
| Claudio | bloccato (contiene "dio") | ❌ falso positivo |
| Diodato | bloccato | ❌ falso positivo |
| Madonna di Campiglio | bloccato | ❌ falso positivo |
| Scazzottata | bloccato (contiene "cazzo") | ❌ falso positivo |
| D10 p0rc0 | passa | ❌ falso negativo |
| Dio porcone | bloccato, ma solo perché contiene "dio" | ⚠️ giusto per il motivo sbagliato |

Il filtro server (24 termini, normalizzazione di accenti, leetspeak e separatori) ha l'impostazione giusta, ma la lista è troppo corta: `diocane` e `madonnaputtana` passano. Inoltre **client e server hanno due liste diverse**, quindi danno esiti diversi sullo stesso nome.

### 2.4 Conclusioni della ricerca

1. Il vuoto è reale: manca un progetto italiano, mantenuto, a regole, disponibile sia in JS sia in Dart.
2. Contribuire a LDNOOBW o a `italian-badwords-list` non basta: il loro formato è una lista semplice e non può esprimere le distinzioni "solo parola intera", "solo in combinazione" o "eccezione".
3. Il valore del progetto sta nei **dati curati e nei casi di test**, non nel motore.

---

## 3. Nome

### 3.1 Scelta: `italian-profanity`

| Dove | Nome | Disponibilità (verificata il 2026-11-03) |
|---|---|---|
| npm | `italian-profanity` | libero |
| pub.dev | `italian_profanity` (pub.dev richiede l'underscore) | libero |
| GitHub | `italian-profanity` | — |

### 3.2 Perché

- **Corrisponde alla ricerca più probabile.** Chi ha il problema cerca in inglese "italian profanity", che è anche la query che ho usato io. La ricerca di npm e pub.dev dà molto peso al nome esatto del pacchetto.
- **È comprensibile anche a chi non parla italiano.** Un team straniero con utenti italiani non sa cosa sia una "parolaccia".
- **Usa la parola standard dell'ecosistema**: `profanity` è il termine di `leo-profanity`, `profanity_filter`, `@2toad/profanity` e simili.
- **Non promette più del dovuto**: non contiene "filter" né "censor", perché il prodotto principale è *riconoscere*, non riscrivere il testo.

I termini italiani entrano comunque nella ricerca tramite keyword e topic: `parolacce`, `bestemmie`, `insulti`, `volgarità`.

### 3.3 Alternative scartate

| Nome | Perché no |
|---|---|
| `parolacce-it` | Ridondante (la parola è già italiana) e oscuro per chi non parla italiano. Va bene come keyword |
| `parolacce` | Ottimo per gli italiani, invisibile per gli altri. Può restare un alias futuro |
| `italian-profanity-filter` | Più lungo, e "filter" restringe il campo |
| `profanity-it` | Meno naturale: nessuno cerca "profanity it" |
| `bestemmie` | Copre solo un sottoinsieme, e come nome di pacchetto è poco presentabile ai clienti |

---

## 4. Ambito

### 4.1 Casi d'uso

- Validare un nickname o uno username al salvataggio (RuttoFacile, maraffa-romagnola).
- Validare nomi di stanze, team, tornei e titoli brevi creati dagli utenti.
- Segnalare all'amministratore i nomi già salvati che violano le regole (scansione a posteriori).

### 4.2 Obiettivi

- **Precisione sull'italiano**: niente falsi positivi su nomi propri e luoghi comuni.
- **Resistenza alle elusioni più comuni**: leetspeak, separatori, accenti, lettere ripetute, maiuscole, caratteri Unicode simili.
- **Due implementazioni identiche** (TypeScript e Dart), verificate dallo stesso insieme di casi di test.
- **Zero dipendenze a runtime**, funzionamento offline e dimensioni ridotte.
- **Configurabile**: categorie, gravità minima, termini aggiuntivi ed eccezioni del progetto.

### 4.3 Fuori ambito

- Moderazione di chat o testi lunghi con comprensione del contesto. Funzionerà anche lì, ma senza garanzie.
- Machine learning, API remote, analisi del tono o del sentiment.
- Lingue diverse dall'italiano, oltre a un pacchetto inglese minimo (§6.4).
- Riscrivere il testo: `mask()` arriva in v0.3, e solo come utilità.

---

## 5. Architettura

### 5.1 Struttura del repository (monorepo)

```
italian-profanity/
├─ data/
│  ├─ it/
│  │  ├─ blasphemy.json        bestemmie (concetti divini × insulti)
│  │  ├─ sexual.json
│  │  ├─ insults.json
│  │  ├─ discriminatory.json   termini d'odio, razzisti, omofobi
│  │  └─ allow.json            eccezioni (nomi, luoghi, parole comuni)
│  ├─ en/core.json             inglese minimo (fuck, shit, …)
│  ├─ dialects/                romagnolo, veneto, napoletano, … (facoltativi)
│  ├─ cases/                   casi di test condivisi (§8)
│  └─ schema.json              JSON Schema dei file dati
├─ scripts/
│  └─ build-data.mjs           valida i dati, genera i file per JS e Dart
├─ packages/
│  ├─ js/                      → npm "italian-profanity"
│  │  └─ src/generated/data.ts (generato, versionato)
│  └─ dart/                    → pub.dev "italian_profanity"
│     └─ lib/src/generated/data.dart (generato, versionato)
├─ NOTICE                      attribuzioni dei dati
├─ LICENSE                     MIT (codice)
└─ LICENSE-DATA                CC-BY 4.0 (dati)
```

### 5.2 Principi

- **I dati sono l'unica fonte.** Le regole stanno solo in `data/`. I motori non contengono parole.
- **I dati vengono generati nel codice, non letti a runtime.** Così non servono `fs`, asset Flutter o fetch: funziona in browser, Node, edge, Flutter e Dart server.
- **I file generati sono versionati.** La CI rigenera i file e fallisce se il diff non è pulito.

---

## 6. Modello dei dati

### 6.1 Tipi di regola

| Tipo | Su cosa confronta | Quando usarlo | Esempio |
|---|---|---|---|
| `contains` | Il testo compattato (§7) | Termini che non compaiono mai dentro parole innocue | `porcodio`, `vaffancul`, `dioboia` |
| `word` | Le singole parole (token). Con `stem: true` basta che la parola **inizi** con il termine | Termini che compaiono dentro parole innocue | `cazz` (stem) blocca cazzo e cazzata, ma non "scazzottata" |
| `combo` | Il testo compattato: un termine del gruppo A **immediatamente adiacente** a uno del gruppo B, in qualunque ordine | Bestemmie composte | gruppo A `dio, madonn, gesu, crist` × gruppo B `porc, can, ladr, boia, bestia, merd, serpent` |
| `allow` | Viene rimosso dal testo prima dei controlli | Eccezioni note | `scazzott`, nomi propri problematici |

### 6.2 Campi di ogni regola

```jsonc
{
  "id": "it.blasphemy.divine-insult",   // stabile, compare nei risultati
  "type": "combo",
  "category": "blasphemy",              // blasphemy | sexual | insult | discriminatory | vulgar
  "severity": 3,                        // 1 lieve · 2 volgare · 3 grave (bestemmia, odio)
  "a": ["dio", "madonn", "gesu", "crist"],
  "b": ["porc", "can", "ladr", "boia", "bestia", "merd", "serpent"],
  "note": "facoltativo, per i curatori"
}
```

```jsonc
{ "id": "it.sexual.cazz", "type": "word", "stem": true, "terms": ["cazz"], "category": "sexual", "severity": 2 }
{ "id": "it.insult.vaffa", "type": "contains", "terms": ["vaffancul", "affancul"], "category": "insult", "severity": 2 }
{ "id": "it.allow.common", "type": "allow", "terms": ["scazzott", "diodato", "claudio"] }
```

Tutti i termini vanno scritti **già normalizzati** (§7): minuscoli, senza accenti e con le lettere ripetute ridotte a una. Il build verifica questa regola.

### 6.3 Gravità e categorie

Ogni progetto sceglie la propria soglia:

- App per bambini o scuole: `minSeverity: 1`.
- Giochi generici (RuttoFacile, maraffa): `minSeverity: 2`, che è il valore predefinito.
- Contesti adulti che vogliono bloccare solo bestemmie e odio: `minSeverity: 3`.

### 6.4 Pacchetti di lingua

- `it` sempre attivo.
- `en` attivo di default ma disattivabile: le app italiane ricevono anche insulti in inglese.
- `dialects.*` facoltativi e attivabili uno per uno, dalla v0.2.

---

## 7. Algoritmo

### 7.1 Normalizzazione

Si applica in modo identico sull'input in JS e in Dart, e sui termini durante il build.

1. **Unicode NFKD** e rimozione dei segni diacritici: `cò` → `co`; anche i caratteri fullwidth tornano normali.
2. **Minuscole.**
3. **Caratteri simili (confusables)**: una mappa ridotta per le lettere cirilliche e greche identiche a quelle latine (`а`→`a`, `о`→`o`, `е`→`e`, `р`→`p`, `с`→`c`, …).
4. **Leetspeak**: `0→o 1→i 3→e 4→a 5→s 7→t 8→b @→a $→s €→e !→i |→i`.
   - Si producono **due varianti**: una con la mappatura e una senza. Basta che una delle due corrisponda. Così "Marco93" non diventa automaticamente un problema, ma "p0rc0" viene riconosciuto.
5. **Token**: il testo viene diviso su ogni carattere che non è una lettera o una cifra. Le sequenze di token di una sola lettera vengono unite: `c a z z o` → `cazzo`.
6. **Testo compattato**: tutti i token concatenati senza separatori: `Dio.P0rc0ne` → `dioporcone`.
7. **Lettere ripetute ridotte a una**: sia sull'input sia sui termini. `porcooo` → `porco`, `cazzzo` → `cazo`, `cazzo` → `cazo`. Siccome si confrontano due forme ridotte, le doppie italiane non sono un problema.

### 7.2 Ordine di valutazione

1. Normalizzazione.
2. Rimozione delle eccezioni (`allow`) dal testo compattato e dai token.
3. Controllo delle regole `word`, poi `contains`, poi `combo`.
4. Filtro per categorie e `minSeverity`.
5. Risultato: elenco delle regole trovate (`id`, categoria, gravità). **Non viene restituito il testo originale trovato**, così il risultato si può registrare nei log senza problemi.

### 7.3 Prestazioni

- Le regole vengono compilate all'avvio in poche regex o in un trie, una volta sola.
- Obiettivo: meno di 0,05 ms per un nickname di 24 caratteri e meno di 25 KB compressi per il pacchetto JS con `it` e `en`.

---

## 8. Casi di test condivisi (il cuore del progetto)

### 8.1 Formato

```jsonc
// data/cases/it-names.json
[
  { "input": "Claudio",              "expect": "clean" },
  { "input": "Diodato",              "expect": "clean" },
  { "input": "Madonna di Campiglio", "expect": "clean" },
  { "input": "Scazzottata",          "expect": "clean" },
  { "input": "Porcellino",           "expect": "clean" },
  { "input": "Dio porcone",          "expect": "blocked", "rules": ["it.blasphemy.divine-insult"] },
  { "input": "D10 p0rc0",            "expect": "blocked" },
  { "input": "p0r-cò_Dio",           "expect": "blocked" },
  { "input": "c a z z o",            "expect": "blocked" },
  { "input": "Diocaneee",            "expect": "blocked" },
  { "input": "Mad0nna.puttana",      "expect": "blocked" }
]
```

### 8.2 Regole

- **Ogni regola ha almeno un caso positivo, e ogni eccezione almeno un caso negativo.** Lo controlla lo script di build.
- Elenco di "nomi sicuri": nomi propri, cognomi, comuni e parole italiane frequenti che contengono pezzi sospetti. Ogni falso positivo segnalato diventa un nuovo caso di test.
- **La CI esegue gli stessi file su JS e su Dart e richiede esiti identici.** Questo garantisce che client Flutter e server Node si comportino allo stesso modo, che è proprio il difetto di maraffa.
- Obiettivo per la v0.1: almeno 150 casi, di cui almeno la metà negativi (nomi da *non* bloccare).

---

## 9. API

### 9.1 TypeScript / JavaScript

```ts
import { isClean, check, createFilter } from "italian-profanity"

isClean("Claudio")        // true
isClean("D10 p0rc0")      // false

check("Dio porcone")
// {
//   clean: false,
//   matches: [{ ruleId: "it.blasphemy.divine-insult", category: "blasphemy", severity: 3 }]
// }

const filter = createFilter({
  languages: ["it", "en"],           // default
  dialects: ["romagnolo"],           // v0.2
  minSeverity: 2,                    // default
  categories: undefined,             // tutte
  extraTerms: [{ type: "contains", terms: ["nomeconcorrente"], category: "insult", severity: 2 }],
  allow: ["diomede"],
})
filter.isClean("…")
```

Pubblicato come ESM con i tipi `.d.ts` (più un CJS di compatibilità), per Node 18 o superiore e i browser moderni. Zero dipendenze. Va usato **sia lato client** (feedback immediato) **sia lato server** (la validazione che conta davvero).

### 9.2 Dart / Flutter

```dart
import 'package:italian_profanity/italian_profanity.dart';

ItalianProfanity.isClean('Claudio');      // true
final result = ItalianProfanity.check('D10 p0rc0');
result.clean;                              // false
result.matches.first.ruleId;               // 'it.blasphemy.divine-insult'

final filter = ItalianProfanity.create(
  minSeverity: Severity.vulgar,
  allow: ['diomede'],
);
```

Dart puro, senza dipendenza da Flutter, quindi utilizzabile anche su server Dart. SDK 3.4 o superiore. Ha la stessa API concettuale del pacchetto JS, con i nomi adattati alle convenzioni Dart.

### 9.3 Utilità secondarie (v0.3)

- `mask(text)`: sostituisce i tratti trovati con `***`. Il risultato è approssimato, perché la normalizzazione cambia le posizioni dei caratteri.
- `explain(text)`: mostra le forme normalizzate e le regole valutate, utile per il debug e per chi cura i dati.

---

## 10. Curazione dei dati

### 10.1 Fonti

| Fonte | Uso | Licenza |
|---|---|---|
| Curazione manuale | Base di tutte le regole, soprattutto bestemmie composte ed eccezioni | propria |
| LDNOOBW `it` | Lista di controllo della copertura | CC-BY 4.0 → attribuzione in `NOTICE` |
| `italian-badwords-list` | Lista di controllo della copertura | MIT |
| Filtro server di maraffa-romagnola | Normalizzazione e prima lista | propria |
| Segnalazioni da RuttoFacile e maraffa | Falsi positivi e negativi reali | propria |

`washyourmouthoutwithsoap` e qualunque lista prodotta con un traduttore automatico vanno escluse.

### 10.2 Licenze

- **Codice MIT, dati CC-BY 4.0** con attribuzione in `NOTICE`. È la scelta più semplice e onesta se si usa LDNOOBW anche solo come riferimento.
- In alternativa, per avere tutto MIT, si scrivono le liste da zero e si usano le altre solo per confronto. Va deciso prima della v0.1.

### 10.3 Linee guida

- Si preferisce `word` con `stem` a `contains`, salvo quando il termine non compare mai dentro parole innocue.
- Nessun termine singolo può essere un concetto religioso (`dio`, `madonna`, `cristo`): stanno solo dentro le regole `combo`.
- Ogni nuova regola entra insieme ai suoi casi di test, sia positivi sia negativi.
- I termini discriminatori vanno inseriti con attenzione: niente parole che servono anche a descriversi (per esempio nomi di gruppi etnici o di orientamenti), solo le forme ingiuriose.

---

## 11. Rilascio e manutenzione

| Aspetto | Scelta |
|---|---|
| Versione | Semver unico, **la stessa versione per JS e Dart** |
| Gestione delle versioni | Changeset per il CHANGELOG, uno per entrambi i pacchetti |
| Cambio della lista | `minor` se si aggiungono termini, `patch` per correzioni di falsi positivi, `major` se cambiano l'API o la normalizzazione |
| CI (GitHub Actions) | Validazione dello schema → generazione dei dati → diff pulito → test JS → test Dart → stessi casi su entrambi → dimensione del pacchetto |
| Pubblicazione npm | Trusted publishing via OIDC da GitHub Actions, con provenance |
| Pubblicazione pub.dev | Pubblicazione automatica da GitHub Actions (OIDC), con publisher verificato |
| Segnalazioni | Template di issue per falsi positivi e negativi, con i campi `input`, `atteso` e `contesto` |

### 11.1 Visibilità e reperibilità

- **Keyword npm**: `profanity`, `italian`, `italiano`, `parolacce`, `bestemmie`, `badwords`, `moderation`, `nickname`, `username`, `validation`.
- **Topic pub.dev** (massimo 5): `profanity`, `moderation`, `italian`, `validation`, `filter`.
- **Topic GitHub**: gli stessi, più `flutter`, `dart`, `typescript`.
- **README bilingue**: le prime righe in inglese per il pubblico internazionale, poi una sezione in italiano. Una tabella di confronto con `italian-badwords-list` e i filtri multilingua, con i casi del §2.3, mostra il motivo di esistere della libreria in dieci secondi.
- Una issue o PR verso LDNOOBW e `italian-badwords-list` che rimanda al progetto per chi cerca regole e non solo parole.

---

## 12. Roadmap

| Versione | Contenuto |
|---|---|
| **v0.1** | `it` di base (bestemmie, sessuali, insulti, discriminatori), eccezioni, `en` minimo, motori JS e Dart, almeno 150 casi condivisi, CI con verifica di parità, pubblicazione |
| v0.2 | Dialetti (romagnolo, veneto, napoletano, siciliano, lombardo), filtri per categoria e gravità rifiniti |
| v0.3 | `mask()`, `explain()`, CLI `npx italian-profanity scan file.csv` per ripulire nickname già salvati |
| v1.0 | API stabile, almeno 400 casi, correzioni da uso reale su almeno due progetti |

---

## 13. Stima

| Attività | Ore |
|---|---|
| Struttura del monorepo, schema, script di generazione, CI | 3-4 |
| Normalizzazione e motore TypeScript, con test | 3-4 |
| Port in Dart, con test | 3-4 |
| **Curazione dei dati italiani e almeno 150 casi** | 6-8 |
| README, NOTICE, pubblicazione su npm e pub.dev | 2 |
| **Totale v0.1** | **17-22 h (2,5-3 giorni)** |
| Integrazione in RuttoFacile (route del nickname, sfide, messaggio nella UI) | 1 |
| Integrazione in maraffa (sostituzione dei due filtri client e server) | 1-2 |

Il lavoro sulla libreria è un investimento tuo. Al cliente vanno fatturate solo le ore di integrazione nel suo progetto.

---

## 14. Rischi

| Rischio | Mitigazione |
|---|---|
| Falsi positivi su nomi reali | Bestemmie solo come `combo`, `word` con `stem` invece di `contains`, elenco di nomi sicuri nei casi di test |
| Elusioni creative | Normalizzazione robusta, segnalazioni che diventano casi di test. Nessun filtro a lista è perfetto: la moderazione da pannello admin resta necessaria |
| Le due implementazioni divergono | Dati generati da un'unica fonte, stessi casi su entrambi i linguaggi in CI |
| Manutenzione nel tempo | Ambito stretto, liste versionate, contributi tramite PR con casi di test obbligatori |
| Immagine: un repository pubblico pieno di bestemmie a tuo nome | Nome tecnico e neutro, README professionale, i termini solo in `data/` |

---

## 15. Integrazione nei tuoi progetti

### RuttoFacile (Next.js)

- `isClean()` nel route `src/app/api/player/nickname/route.ts`, dopo la validazione Zod, con l'errore `invalid_nickname` e il messaggio "Il nickname contiene parole non ammesse."
- Stesso controllo lato client nell'editor del nickname e in quello delle sfide, per dare un feedback immediato.
- Facoltativo: nel pannello admin, un filtro "nickname sospetti" che scansiona i nomi già salvati.

### maraffa-romagnola (React + server Node)

- Sostituire `src/utils/profanityFilter.ts` (client) e `server/src/profanityFilter.ts` (server) con la libreria, così client e server applicano le stesse regole.
- Rimuovere `leo-profanity`, `italian-badwords-list` e `src/types/italian-badwords-list.d.ts`.

### Progetti Flutter

- `italian_profanity` direttamente nei validatori dei form, e la stessa logica sul backend se è in Dart.

---

## 16. Decisioni aperte

1. Licenza dei dati: CC-BY 4.0 con attribuzione, oppure liste scritte da zero e tutto MIT?
2. Account di pubblicazione: npm personale o organizzazione, e publisher verificato su pub.dev (serve un dominio).
3. Repository pubblico da subito, oppure privato fino alla v0.1?

---

## Fonti

- italian-badwords-list — https://classic.yarnpkg.com/en/package/italian-badwords-list
- is-bad-word — https://www.pkgstats.com/pkg:is-bad-word
- profanity-light — https://www.pkgstats.com/pkg:profanity-light
- safe_text — https://pub.dev/documentation/safe_text/3.0.0/
- censor_it — https://pub.dev/packages/censor_it/versions/2.1.3
- profanity_filter (Dart) — https://pub.dev/documentation/profanity_filter/latest/
- LDNOOBW — https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words
- okineadev/profanity-list — https://github.com/okineadev/profanity-list
- Dax-87/badwords-it — https://github.com/Dax-87/badwords-it
- Download npm di italian-badwords-list (4 ottobre – 2 novembre 2026: 1.620) — https://api.npmjs.org/downloads/point/last-month/italian-badwords-list
