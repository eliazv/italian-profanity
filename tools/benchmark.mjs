// Misura il pacchetto compilato su fixture pubbliche, senza nickname di utenti.
// Uso: pnpm --filter italian-profanity build && node tools/benchmark.mjs
import { readdirSync, readFileSync } from "node:fs"
import { cpus, platform, release } from "node:os"
import { performance } from "node:perf_hooks"
import { gzipSync } from "node:zlib"
import { createChecker } from "../packages/js/dist/index.js"

const fixtureDirectory = new URL("../data/fixtures/", import.meta.url)
const fixtures = readdirSync(fixtureDirectory)
  .filter((name) => name.endsWith(".jsonl"))
  .sort()
  .flatMap((name) =>
    readFileSync(new URL(name, fixtureDirectory), "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line)),
  )
  .filter((fixture) => !fixture.expectedError && [...fixture.input].length <= 64)

const results = []
for (const languages of [["it"], ["it", "en"]]) {
  const checker = createChecker({ languages })
  for (const fixture of fixtures) checker.check(fixture.input)
  const durations = []
  // Ogni misura raggruppa dieci chiamate per ridurre il rumore del timer.
  for (const fixture of fixtures) {
    const start = performance.now()
    for (let iteration = 0; iteration < 10; iteration++) checker.check(fixture.input)
    durations.push((performance.now() - start) / 10)
  }
  durations.sort((a, b) => a - b)
  results.push({
    languages,
    samples: durations.length,
    meanMs: durations.reduce((sum, value) => sum + value, 0) / durations.length,
    p95Ms: durations[Math.floor(durations.length * 0.95)],
  })
}
const bundle = readFileSync(new URL("../packages/js/dist/index.js", import.meta.url))
console.log(
  JSON.stringify(
    {
      node: process.version,
      platform: `${platform()} ${release()} ${process.arch}`,
      cpu: cpus()[0]?.model,
      bundleBytes: bundle.length,
      gzipBytes: gzipSync(bundle).length,
      results,
    },
    null,
    2,
  ),
)
