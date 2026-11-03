## Cosa cambia

<!-- Descrizione breve -->

## Checklist

- [ ] `pnpm check` passa in locale
- [ ] Modifiche a normalizzazione, segmentazione, rilevatore o policy fatte **in entrambi i motori**
- [ ] Ogni regola nuova o modificata ha un caso positivo e uno negativo vicino nelle fixture
- [ ] `pnpm audit:benign` pulito, oppure collisioni giustificate in `data/audit/accepted.jsonl`
- [ ] Fonti esterne registrate in `data/sources.json` e `NOTICE` aggiornato
- [ ] Changeset aggiunto (`pnpm changeset`) se cambia il comportamento
- [ ] Nessun nickname reale nelle fixture
