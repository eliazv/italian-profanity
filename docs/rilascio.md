# Rilascio

## Flusso ordinario

1. Ogni PR che cambia il comportamento aggiunge un changeset: `pnpm changeset`.
2. Per rilasciare: `pnpm release:version`. Changesets aggiorna `packages/js`, poi `tools/sync-version.ts` allinea `packages/dart` (pubspec e CHANGELOG) e `pnpm build:data` rigenera i dati con la nuova versione.
3. Commit, poi tag `vX.Y.Z` e push del tag.
4. Il workflow `release.yml` verifica che il tag coincida con la versione, esegue `pnpm check` e la parità con le attese, poi pubblica su npm e pub.dev.

## Primo rilascio senza prerelease

La versione `0.1.0` esce dalla beta su richiesta del manutentore (D23).
Il consolidamento tecnico è completato; l'integrazione nelle due applicazioni
del manutentore e la relativa prova comparativa restano pianificate.
Il changelog deve distinguere questi progressi dai controlli già eseguiti.

Il confronto con l'artefatto npm `0.1.0-beta.1`, verificato tramite l'integrità
pubblicata dal registro, è in
[data/releases/0.1.0](../data/releases/0.1.0/behavior-diff.md).
Per rigenerarlo dal modulo ESM estratto in cache:

```sh
pnpm behavior:diff --baseline .cache/releases/0.1.0-beta.1/package/dist/index.js
```

Lo strumento confronta azioni e match completi sulle fixture pubbliche attuali,
escludendo i casi di configurazione non valida. Conserva input, opzioni e
risultati in `data/releases/<versione>/`, insieme alla tabella Markdown.
Il confronto non misura precisione o frequenza delle regressioni su utenti reali.

Il tag `v0.1.0` attiva il workflow di pubblicazione. Il pacchetto npm va su
`latest`, mentre le vecchie prerelease restano consultabili nella cronologia.

## Cronologia della prima beta

La prima versione di integrazione era `0.1.0-beta.0` su entrambi i registri (D21), seguita da `0.1.0-beta.1`. Per preparare `0.1.0` sono stati eseguiti `pnpm exec changeset pre exit` e `pnpm release:version`: Changesets non è più in modalità prerelease. Non modificare le versioni a mano.

Prima della prima pubblicazione eseguire `pnpm check`, build e smoke test npm, `npm pack --dry-run` e `dart pub publish --dry-run`. La prima pubblicazione npm usa `npm publish --access public --tag beta`, senza `--provenance` locale: l'attestazione viene generata dalle pubblicazioni successive su GitHub Actions. Il workflow seleziona il tag npm dalla versione, mantenendo le prerelease fuori da `latest`.

Completare la prima pubblicazione manuale e configurare entrambi i trusted publisher prima di inviare tag che attivano il workflow. La configurazione degli account non è sostituita dai file YAML. Le versioni pubblicate sono immutabili: controllare nome, contenuto e versione prima dell'invio.

La prima beta non ha una release precedente con cui generare un confronto di comportamento. Il changelog descrive le API, la copertura aggiunta e gli omografi; per i rilasci successivi resta richiesto il confronto descritto sotto.

## Configurazione iniziale (una volta sola)

Le pubblicazioni automatiche si possono configurare solo su pacchetti già esistenti: **la prima versione si pubblica a mano**.

### npm

1. `cd packages/js && pnpm build && npm publish --access public` (serve `npm login`).
2. Su npmjs.com → pacchetto → Settings → **Trusted publishing**: GitHub Actions, repository `eliazv/italian-profanity`, workflow `release.yml`.
3. Dopo la configurazione, disattivare la pubblicazione con token dalle impostazioni del pacchetto.

### pub.dev

1. `cd packages/dart && dart pub publish`.
2. Su pub.dev → pacchetto → Admin → **Automated publishing**: abilitare GitHub Actions, repository `eliazv/italian-profanity`, tag pattern `v{{version}}`.
3. Facoltativo ma consigliato: creare un **publisher verificato** (richiede un dominio, ad esempio eliazavatta.it) e trasferirvi il pacchetto.

## Prima di ogni rilascio

- Generare e leggere la tabella delle differenze con `pnpm behavior:diff --baseline <modulo ESM della versione precedente>`, e riportare nel changelog i casi il cui esito cambia.
- Controllare che `NOTICE` elenchi tutte le fonti con `provenance` esterna presenti nei dati.
