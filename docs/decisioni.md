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

Dart non ha un equivalente di NFKD. Invece di aggiungere `unorm_dart` e avere due algoritmi diversi, il build genera una sola tabella (caratteri latini con diacritici, fullwidth, sottoinsieme di confusables UTS #39, con la versione fissata) usata da entrambi i motori. Ne risultano parità garantita e zero dipendenze. La copertura limitata è dichiarata nel README.

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
