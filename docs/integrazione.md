# Integrazione client e server

La prima versione è una beta: prima del passaggio in produzione confrontare i risultati con i filtri attuali. Usare la stessa versione esatta, le stesse lingue, lo stesso profilo, le stesse soglie e le stesse personalizzazioni sul client e sul server. Il server resta autorevole e ricontrolla sempre il testo ricevuto.

## Installazione

Le istruzioni seguenti si riferiscono alla beta preparata nel repository; funzionano dopo la sua pubblicazione sui rispettivi registri.

```sh
npm install --save-exact italian-profanity@0.1.0-beta.1
```

```yaml
dependencies:
  italian_profanity: 0.1.0-beta.1
```

## Policy senza coda di moderazione

Per consentire gli esiti `review` e rifiutare solo `block`:

```ts
import { createChecker } from "italian-profanity"

// Condividere questa configurazione tra client e server.
const checker = createChecker({
  profile: "balanced",
  languages: ["it", "en"],
  maxLength: 64,
  contacts: false,
})

export function containsProfanity(text: string): boolean {
  return checker.check(text).action === "block"
}

export function isModeratedTextAllowed(text: string): boolean {
  return checker.check(text).action !== "block"
}
```

In Dart la stessa scelta si esprime con `Action.block`:

```dart
final checker = ItalianProfanity.createChecker(
  profile: Profile.balanced,
  languages: ['it', 'en'],
  maxLength: 64,
  contacts: false,
);

bool containsProfanity(String text) =>
    checker.check(text).action == Action.block;

bool isModeratedTextAllowed(String text) =>
    checker.check(text).action != Action.block;
```

`isClean()` restituisce vero solo per `allow`: non usarlo come sostituto se l'app vuole consentire anche `review`. Consentire `review` è una decisione dell'app: può ammettere anche forme offensive ambigue. `strict` le blocca, con più falsi positivi nominali.

Il limite di 64 punti di codice tronca l'input analizzato. Il validatore dell'app deve rifiutare separatamente nomi troppo lunghi: il filtro non verifica il testo oltre il limite. Se si attiva `contacts`, URL, email e telefoni riconosciuti sono bloccati anche con i profili più permissivi; il rilevatore è euristico.

## Copertura e sostituzione dei filtri

L'italiano è attivo per default. L'inglese deve essere richiesto con `languages: ["it", "en"]`: contiene 51 regole curate, 110 forme e 20 varianti di frase. `["en"]` attiva soltanto l’inglese; non si installano librerie aggiuntive. La copertura non coincide con le liste esterne usate per confronto e non comprende automaticamente ogni termine o grafia. L’attivazione è logica: il pacchetto include già i dati di entrambe le lingue. I dialetti, incluso il romagnolo, non hanno ancora copertura dedicata.

Prima di rimuovere i filtri precedenti:

1. Inventariare le loro regole e confrontarle con il dataset e i risultati della beta. Non importare liste esterne nel repository senza inventario e licenza.
2. Aggiungere le regole mancanti deliberate dall'app tramite `extraRules`, condividendo i dati fra client e server. Le regole locali sono parole intere letterali; non accettano regex o frasi.
3. Verificare in entrambi gli ambienti le fixture di adozione in `data/fixtures/adoption.jsonl`, insieme a `english.jsonl` e `consolidation.jsonl`, oltre ai test dell’app. Contengono nomi convenzionali, confini di parola, elusioni e attivazione dell'inglese.
4. Fare una prova comparativa senza cambiare inizialmente il comportamento e senza registrare nickname reali o intervalli riconducibili al testo nei log.
5. Sostituire entrambi i wrapper, poi rimuovere pacchetti e dichiarazioni di tipo precedenti solo quando non hanno più utilizzatori.

I client già distribuiti conservano il vecchio filtro fino all'aggiornamento. Il controllo sul server protegge le richieste ricevute, ma non può impedire che un vecchio client rifiuti localmente un nome accettato dal nuovo server.

La parità fra i motori vale per gli stessi dati, opzioni e input. Non implica una copertura esaustiva o una comprensione del contesto.
