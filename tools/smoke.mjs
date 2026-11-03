// Prova l'artefatto distribuito su Node 20+, senza eseguire TypeScript.
// I termini e le attese restano esclusivamente nelle fixture in data/.
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"

const fixture = JSON.parse(
  readFileSync(new URL("../data/fixtures/engine.jsonl", import.meta.url), "utf8").split("\n")[0],
)
const esm = await import("../packages/js/dist/index.js")
const cjs = createRequire(import.meta.url)("../packages/js/dist/index.cjs")
for (const api of [esm, cjs]) {
  assert.ok(api.VERSION)
  assert.equal(api.check(fixture.input).action, fixture.action)
  assert.deepEqual(api.findMatches(fixture.input), fixture.expectedMatches)
  assert.equal(api.isClean(fixture.input), false)
}
console.log("✓ API ESM/CJS compilata: rilevamento, policy e offset verificati")
