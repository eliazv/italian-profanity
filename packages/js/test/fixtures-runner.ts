// Esegue le fixture condivise e stampa i risultati in JSON, per tools/parity.ts.
// Il formato di uscita deve restare identico a quello di packages/dart/tool/fixtures_runner.dart.
// Uso: node test/fixtures-runner.ts <cartella fixture>
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type { Fixture } from "../../../tools/lib/data.ts"
import { check } from "../src/detect.ts"
import { fold } from "../src/normalize.ts"
import { segment } from "../src/segment.ts"

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
    const fixture = JSON.parse(line) as Fixture
    const result: Record<string, unknown> = { id: fixture.id, base: fold(fixture.input) }
    try {
      result.segments = segment(fixture.input, fixture.maxLength)
    } catch (error) {
      if (!(error instanceof RangeError)) throw error
      result.error = "invalidMaxLength"
    }
    if (result.error === undefined) {
      try {
        Object.assign(result, check(fixture.input, fixture))
      } catch (error) {
        if (!(error instanceof TypeError)) throw error
        result.error = "invalidOptions"
      }
    }
    results.push(result)
  }
}

process.stdout.write(`${JSON.stringify(results)}\n`)
