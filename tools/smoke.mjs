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
const adoptionFixtures = ["adoption", "english", "consolidation"].flatMap((name) =>
  readFileSync(new URL(`../data/fixtures/${name}.jsonl`, import.meta.url), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line)),
)
const packageMetadata = JSON.parse(
  readFileSync(new URL("../packages/js/package.json", import.meta.url), "utf8"),
)
assert.deepEqual(packageMetadata.dependencies ?? {}, {}, "Il runtime deve restare senza dipendenze")
for (const api of [esm, cjs]) {
  assert.ok(api.VERSION)
  assert.equal(api.check(fixture.input).action, fixture.action)
  assert.deepEqual(api.findMatches(fixture.input), fixture.expectedMatches)
  assert.equal(api.isClean(fixture.input), false)
  for (const example of adoptionFixtures) {
    const result = api.check(example.input, example)
    if (example.action) assert.equal(result.action, example.action, example.id)
    if (example.expectedMatches)
      assert.deepEqual(result.matches, example.expectedMatches, example.id)
    for (const ruleId of example.rules ?? [])
      assert.ok(
        result.matches.some((match) => match.ruleId === ruleId),
        example.id,
      )
    for (const ruleId of example.mustNotMatch ?? [])
      assert.ok(
        result.matches.every((match) => match.ruleId !== ruleId),
        example.id,
      )
  }
}
console.log("✓ API ESM/CJS compilata: rilevamento, policy, offset e fixture di adozione verificati")
