# Registro delle decisioni

Ogni voce riporta una decisione presa, le alternative valutate e il motivo della scelta. Per cambiare una decisione si aggiunge una nuova voce che sostituisce la precedente: le voci vecchie non si modificano.

---

## D1 · Nome: `italian-profanity` / `italian_profanity` — 2026-11-03

È la query più naturale per chi cerca la libreria, comprensibile anche a chi non parla italiano, e usa il termine standard dell'ecosistema ("profanity"). Le parole italiane (`parolacce`, `bestemmie`) entrano come keyword.

Scartati: `parolacce-it`, ridondante e oscuro per chi non parla italiano; `italian-profanity-filter`, più lungo, con "filter" che restringe il campo.

## D2 · Un'unica specifica — 2026-11-03

`SPECIFICHE.md` v2 assorbe la revisione del 3 novembre ed è l'unica fonte di riferimento. La revisione resta come documento storico.

## D3 · Rilevatore separato dalla policy — 2026-11-03

`findMatches()` riporta solo cosa ha trovato. `check()` applica un profilo (`balanced`, `strict`, `lenient` o personalizzato) e restituisce `allow`, `review` o `block`. App diverse richiedono decisioni diverse sugli stessi match.

## D4 · Niente testo compattato globale: la punteggiatura unisce, lo spazio separa — 2026-11-03

Concatenare tutto il testo genera falsi positivi tra parole diverse. In napolux ci sono 95 nomi che contengono "dio" e diversi cognomi che iniziano con "porc": da soli formano circa 1.200 coppie innocue, come "Claudio Porcu".

Regola adottata: la punteggiatura dentro una parola viene ignorata (`p0r-cò_Dio` → `porcodio`), lo spazio è un confine vero, e le lettere singole consecutive vengono riunite solo se sono almeno tre (`c a z z o`).

## D5 · `combo` ancorata — 2026-11-03

Le bestemmie scattano solo in due casi:
- il concetto divino è una **parola intera** adiacente all'insulto;
- il concetto divino è **all'inizio o alla fine** di una sola parola.

Il concetto divino non viene mai cercato in mezzo a una parola. Così "Claudio porco" non attiva la regola delle bestemmie.

## D6 · Eccezioni limitate al singolo match — 2026-11-03

Un'eccezione sopprime una regola su una parola. Non cancella mai testo, perché cancellandolo si possono nascondere offese o crearne di nuove.

## D7 · Normalizzazione con tabella generata, zero dipendenze — 2026-11-03

Dart non ha un equivalente di NFKD. Invece di aggiungere `unorm_dart` e avere due algoritmi diversi, il build genera una sola tabella (caratteri latini con diacritici, fullwidth, sottoinsieme di confusables UTS #39, con la versione fissata) usata da entrambi i motori. Ne risultano parità garantita e zero dipendenze. La copertura limitata è dichiarata nel README. Dal 2026-11-04 la tabella include anche i simboli letterali, numerici, cerchiati e matematici che NFKD riconduce a un singolo carattere alfanumerico (vedi SPECIFICHE.md §4.4).

## D8 · Ripetizioni: si riducono solo le sequenze di 3 o più lettere — 2026-11-03

Le doppie italiane restano intatte (`cazzo`), e la vista `squeeze` porta `cazzzzo` → `cazzo` e `porcooo` → `porco`. Ridurre ogni doppia a una lettera produrrebbe collisioni.

## D9 · Solo italiano per default, inglese da attivare — 2026-11-03

Nei nickname brevi, l'inglese attivo per default aumenta i falsi positivi e le dimensioni del pacchetto.

## D10 · Licenza MIT per codice e dati — 2026-11-03

- Le regole sono scritte a mano.
- napolux (MIT) si usa come fonte di candidati con attribuzione, e come corpus di audit mai distribuito.
- LDNOOBW (CC-BY 4.0) solo per verificare la copertura.
- HurtLex escluso: licenza CC BY-NC-SA 4.0, verificata il 2026-11-03.
- EVALITA solo per ricerca.

## D11 · Contatti (URL, email, telefono) come rilevatore facoltativo — 2026-11-03

Serve per i nickname (richiesta di RuttoFacile), ma non è una parolaccia. Per questo è un rilevatore separato, attivato con `contacts: true`, e non fa parte delle regole lessicali.

## D12 · Normalizzazione in TS e Dart già in M1 — 2026-11-03

Le divergenze Unicode emergono nella normalizzazione: meglio scoprirle all'inizio che durante il port in M4.

## D13 · Stima v0.1: 34-47 ore — 2026-11-03

Sostituisce le 17-22 ore della prima stesura, che erano ottimistiche per due motori, 300 fixture, audit e CI.

## D14 · Rilevatore e policy insieme in M2 — 2026-11-03

La roadmap precedente prevedeva TS in M2 e il port Dart in M4, in conflitto con la parità nella stessa PR richiesta da AGENTS.md. Da M2 ogni comportamento si implementa in entrambi i motori, con attese di rilevamento attive e audit effettivo. M4 diventa consolidamento, fuzz, verifica offset e compatibilità. Si può sviluppare prima la funzione TS e poi quella Dart, mantenendole nella stessa PR. Non si lascia il motore Dart indietro durante la curazione.

## D15 · Ripetizioni confrontate con la forma della regola — 2026-11-03

Precisa e sostituisce D8: ridurre sempre le sequenze di almeno tre lettere a una sola non produce la doppia richiesta dall'esempio di D8. `squeeze` conserva le sequenze ripetute e le confronta con la forma dichiarata: una sequenza sorgente di una o due lettere deve avere la stessa lunghezza nella forma; una di almeno tre può corrispondere a una o due. Non si generano combinazioni esponenziali e non si riducono le doppie originali. Rappresentazione e offset in M1, confronto nel rilevatore e fixture positive e negative per ogni comportamento in M2.

## D16 · Limiti in punti di codice, offset in UTF-16 — 2026-11-03

Il limite predefinito è 64 punti di codice Unicode sull'input originale, prima della normalizzazione, senza dividere coppie surrogate valide. Non si contano i grafemi; un surrogato isolato vale un punto e resta invariato. `maxLength` deve essere un intero positivo finito. Gli intervalli restano UTF-16, come già previsto dall'API. Le trasformazioni conservano la provenienza dei caratteri, incluse espansioni e segni combinanti rimossi. Questo evita che le differenze fra iterazione di stringhe nei futuri port cambino il risultato.

## D17 · Due linguaggi fino alla v0.1 e documentazione pubblica — 2026-11-03

TS e Dart coprono gli utilizzi dichiarati. Fino alla v0.1 non si aggiungono altri motori né un nucleo Rust/WASM. Un port successivo richiede un utilizzatore concreto, disponibilità di manutenzione, runner delle fixture condivise e compatibilità di comportamento, inclusi offset UTF-16. Non basta distribuire il dataset.

`docs/` resta pubblica e versionata: analisi, decisioni e procedure servono a utilizzatori e contributori. Cache, output temporanei e report con dati privati non vanno versionati; nei documenti pubblici non entrano nickname reali degli utenti.

## D18 · Revisione della stima v0.1 — 2026-11-03

Sostituisce D13: 37-52 ore indicative totali. Il lavoro del port viene anticipato in M2 (11-15 ore) e M4 mantiene un budget esplicito di consolidamento (3-5 ore). Le altre fasi restano invariate. Rivalutare dopo M1, senza trattare la stima come una scadenza.

## D19 · Omografi nominali espliciti, senza promessa di zero falsi positivi — 2026-11-03

L'audit effettivo di M2 trova sia termini offensivi presenti nel dizionario sia cognomi omografi di parole volgari. I falsi positivi combinatori su Candio e Canidio vengono soppressi con eccezioni limitate a parola e regola. Le forme polisemiche mantenute nel nucleo usano `confidence: medium`, con `review` in `balanced`; `strict` resta più restrittivo. Il curatore documenta ogni collisione e la sua azione attesa, senza chiamare innocuo l'intero dizionario. Un'app può aggiungere eccezioni locali quando conosce il contesto.

L'obiettivo rimane ridurre i falsi positivi sui nomi, ma il prodotto non promette di disambiguare tutti gli omografi con un controllo lessicale. Specifica, README e descrizioni dei pacchetti esplicitano questo limite. Le collisioni accettate non sono una misura di qualità su nickname reali.

## D20 · Contatti attivati e soglie esplicite — 2026-11-03

Precisa D11: quando l'app attiva `contacts`, URL, email e telefoni riconosciuti producono `block` con tutti i profili predefiniti, anche `lenient`. La scelta è indipendente dalla tolleranza lessicale. Una soglia esplicita per `contact`, anche `null`, permette all'app di cambiarla. Le soglie esplicite prevalgono sul profilo per ogni categoria senza eliminare i match. Il rilevatore di contatti è euristico e opera sul testo originale troncato.

## D21 · Prima beta per integrazione — 2026-11-03

Su richiesta del manutentore si prepara `0.1.0-beta.0` per npm e pub.dev, con versioni allineate e tag npm `beta`. La beta serve alla prova di integrazione prevista dalla roadmap e non dichiara completate M3–M6 o la validazione sul campo. La v0.1 stabile resta subordinata ai criteri già definiti. L'inglese resta disattivato per default (D9): il primo nucleo opzionale comprende tre famiglie curate manualmente, con fixture e audit, senza promettere equivalenza con liste esterne. I dialetti restano rinviati.

La migrazione rimuove i filtri precedenti solo dopo confronto di copertura e prova comparativa. `review` può essere consentito dall'app, ma questa scelta non coincide con `isClean()`.

## D22 · Inglese curato opzionale e consolidamento — 2026-11-04

Su richiesta del manutentore si supera il limite del nucleo inglese minimo di D21. Restano italiano predefinito e specializzazione italiana (D9), due motori allineati e zero dipendenze a runtime (D7, D17). Il dataset inglese è selezionato e adattato manualmente: 51 regole, 110 forme e 20 varianti di frase. Non vengono importate intere liste, regex o trasformazioni di librerie esterne.

Obscenity fornisce candidati dal preset MIT derivato da cuss; commit, provenienza e notice sono registrati e distribuiti. leo-profanity e @2toad/profanity restano confronti di copertura e API; la licenza del codice non autorizza a trattare automaticamente i dizionari come MIT.

L’audit deve passare sia in italiano sia con italiano e inglese attivi. Termini identitari o anatomici neutri isolati non vengono aggiunti come ingiurie; le forme ambigue richiedono review e le offese contestuali usano frasi esplicite. Le nuove regole comportano un changeset minor, senza dichiarare copertura esaustiva o pubblicare automaticamente una versione. Il consolidamento tecnico M4 non sostituisce la prova reale M5.

## D23 · Primo rilascio senza suffisso prerelease — 2026-11-04

Il manutentore richiede la pubblicazione di 0.1.0 su npm e pub.dev, senza beta, e ne pianifica l’integrazione in due proprie applicazioni. Si supera quindi il vincolo di D21 che subordinava l’uscita dalla beta alla prova reale M5: la prova comparativa resta aperta, viene tracciata esplicitamente e non è dichiarata completata nel changelog. La stabilità del numero di versione non dimostra precisione su utenti reali né assenza di falsi positivi.

Il rilascio richiede CI verde, versioni allineate, smoke test ESM/CJS/browser, dry-run dei pacchetti e confronto degli esiti con l’artefatto 0.1.0-beta.1 pubblicato. Pubblicazione via tag v0.1.0 e workflow esistente; tag npm latest per la versione senza prerelease. Nomi, API, italiano predefinito, inglese opzionale e zero dipendenze a runtime restano invariati.

## D24 · Cifre esterne e CamelCase nei nickname — 2026-11-04

La prova di integrazione in RuttoFacile mostra che i suffissi numerici aggirano il rilevatore: `stronzo_99`, `porcodio_99` e `puttana88` passavano, perché la punteggiatura unisce i frammenti (D4) e il deleet trasforma le cifre finali in lettere. Nei nickname le cifre esterne sono quasi sempre un suffisso, non un'elusione leet.

Regola adottata: per ogni parola il rilevatore aggiunge viste ridotte senza i frammenti di sole cifre e senza le cifre iniziali e finali. Le viste complete restano prioritarie, le cifre interne non vengono tolte e le eccezioni valgono anche sulle viste ridotte. Per lo stesso motivo una parola in CamelCase (`StronzoRutto`, `FuckYou`) aggiunge una vista per ogni pezzo: il confine è una maiuscola ASCII dopo una minuscola ASCII, quindi `stronzorutto` e `STRONZORUTTO` restano senza ricerca di sottostringhe (D4). Stessa logica nei due motori, nessuna parola nel codice. L'audit su nomi, cognomi e parole comuni non registra collisioni nuove.

Si aggiungono anche le forme `nigga` e `niggas` alla regola inglese esistente. `negro` resta `review` in `balanced`, come già deciso per l'omografia con cognomi reali: l'app che vuole bloccarlo nei nickname lo decide nella propria policy.

## D25 · Una vista per ogni frammento nei nickname — 2026-11-04

Gli username reali di un'app di gioco (Marafone Romagnolo) mostrano che la punteggiatura usata come spazio aggira il rilevatore: `sborra_verde`, `adolf-nigger` e `negri_bruciati` passavano, perché i frammenti vengono riuniti in una sola parola (D4) e la forma intera non corrisponde più. Nei nickname `_`, `-` e `.` separano parole vere molto più spesso di quanto mascherino una parola.

Regola adottata: quando una parola ha più frammenti con lettere, il rilevatore aggiunge una vista ridotta per ciascun frammento, prima intero (`n3gr4` resta leet) e poi senza le cifre esterne (`sborra99`). Come per D24, le viste complete restano prioritarie, le eccezioni valgono anche sulle viste ridotte, il frammento deve corrispondere per intero e non si cercano sottostringhe. La riunione dei frammenti resta: `p0r-cò_Dio` è ancora `porcodio`. L'audit su nomi, cognomi e coppie con `_` e `.` fa emergere solo 8 coppie con un cognome già noto come omografo (Patacca, Terroni, Troia, Busoni…): restano `review` in `balanced` e sono registrate in `data/audit/accepted.jsonl`.

## D26 · Radici `infix` curate dentro una parola — 2026-11-04

D4 esclude la ricerca di sottostringhe per non bloccare nomi e cognomi (`Cazzola`, `Montenegro`, `Mastroianni`). Gli username reali però scrivono le parolacce attaccate ad altre parole (`babysborra`, `SBORRAMAN`, `Miononnoinculato`, `fuckregina`) e così passavano tutte. Misurato sul corpus di audit, 769 termini su 813 non compaiono mai dentro un nome, un cognome o una parola italiana: il rischio riguarda pochi termini noti, non la ricerca in sé.

Regola adottata: una regola `word` può dichiarare in `infix` alcune radici di almeno 4 lettere, cercate in qualunque punto della parola con lo stesso confronto per sequenze (leet, ripetizioni). Le radici si scelgono solo se non compaiono nel corpus di audit; le forme con collisioni restano a parola intera (`stronzo` per Mastronzo, `zoccola` per zoccolante, `cazzo` per Cazzola). L'audit ha escluso anche `fregn` (cognomi Fregni e Fregno) e una fixture `dildo` (Dildora, nome proprio). Le fixture sintetiche che fissavano l'assenza di sottostringhe per queste regole (`xcoglionex`, `superfuckextra`) sono aggiornate e ne citano la nota originale. La ricerca non attraversa due parole vere unite da punteggiatura: una vista che tocca due frammenti di almeno tre caratteri (`rosco_patorn`) non usa `infix`, i singoli frammenti sì (D25); le lettere isolate (`s.b.o.r.r.a`) restano un'elusione e vengono cercate. Confidenza e gravità restano quelle della regola, le eccezioni valgono come per ogni vista. `pnpm audit:benign` resta la garanzia: una radice che colpisce il corpus fa fallire il check.

Si aggiungono anche, nella combinazione divina, `deus` e le forme `vigliacco`, `laido` e `troi` (forma tronca, solo accanto a un concetto divino).
