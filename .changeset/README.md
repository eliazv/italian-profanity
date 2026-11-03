# Changeset

Ogni PR che cambia il comportamento della libreria aggiunge un changeset con `pnpm changeset`.

La versione vale per entrambi i pacchetti: Changesets aggiorna `packages/js`, poi `pnpm release:version` allinea `packages/dart` (pubspec e CHANGELOG) e rigenera i dati.

Prima della 1.0 (SPECIFICHE.md §10):

- `minor`: regole nuove o più restrittive, che possono bloccare testi prima accettati;
- `patch`: correzioni di falsi positivi e documentazione.
