// Esegue le fixture condivise e stampa i risultati in JSON, per tools/parity.ts.
// Il formato di uscita deve restare identico a quello di packages/dart/tool/fixtures_runner.dart.
// Uso: node test/fixtures-runner.ts <cartella fixture>
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { fold } from "../src/normalize.ts"

const dir = process.argv[2]
if (!dir) {
  console.error("uso: node test/fixtures-runner.ts <cartella fixture>")
  process.exit(2)
}

const results: Array<Record<string, unknown>> = []

for (const name of readdirSync(dir)
  .filter((file) => file.endsWith(".jsonl"))
  .sort()) {
  for (const line of readFileSync(join(dir, name), "utf8").split("\n")) {
    if (line.trim() === "") continue
    const fixture = JSON.parse(line) as { id: string; input: string }
    // M0: solo la vista base. Da M2 si aggiungono action e matches.
    results.push({ id: fixture.id, base: fold(fixture.input) })
  }
}

process.stdout.write(`${JSON.stringify(results)}\n`)
