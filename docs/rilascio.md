# Rilascio

## Flusso ordinario

1. Ogni PR che cambia il comportamento aggiunge un changeset: `pnpm changeset`.
2. Per rilasciare: `pnpm release:version`. Changesets aggiorna `packages/js`, poi `tools/sync-version.ts` allinea `packages/dart` (pubspec e CHANGELOG) e `pnpm build:data` rigenera i dati con la nuova versione.
3. Commit, poi tag `vX.Y.Z` e push del tag.
4. Il workflow `release.yml` verifica che il tag coincida con la versione, esegue `pnpm check` e la parità con le attese, poi pubblica su npm e pub.dev.

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

- Leggere la tabella delle differenze di comportamento (da `behavior-diff`, fase M6) e riportare nel changeset i casi il cui esito cambia.
- Controllare che `NOTICE` elenchi tutte le fonti con `provenance` esterna presenti nei dati.
