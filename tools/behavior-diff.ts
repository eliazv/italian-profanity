// Confronta la release corrente con un artefatto npm precedente verificato.
// Uso: node tools/behavior-diff.ts --baseline <dist/index.js> [--output <directory>]
// Gli input provengono soltanto dalle fixture pubbliche in data/.
import { mkdirSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { check, DATA_VERSION, VERSION } from "../packages/js/src/index.ts"
import type { CheckerOptions, CheckResult } from "../packages/js/src/types.ts"
import { loadFixtureFiles } from "./lib/data.ts"
import { canonicalJson } from "./lib/json.ts"
import { DATA } from "./lib/paths.ts"

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index < 0 ? undefined : process.argv[index + 1]
}

const baselinePath = argument("--baseline")
if (!baselinePath)
  throw new Error("Specificare --baseline con il modulo ESM della release precedente")
const baseline = (await import(pathToFileURL(resolve(baselinePath)).href)) as {
  VERSION: string
  DATA_VERSION: string
  check: (input: string, options: CheckerOptions) => CheckResult
}
if (!baseline.VERSION || typeof baseline.check !== "function") {
  throw new Error("La baseline non espone VERSION e check")
}
const output = resolve(argument("--output") ?? join(DATA, "releases", VERSION))
const fixtures = loadFixtureFiles().flatMap((file) =>
  file.fixtures.map(({ value }) => value).filter((fixture) => !fixture.expectedError),
)
const differences = []
const transitions: Record<string, number> = {}
for (const fixture of fixtures) {
  const options: CheckerOptions = {
    profile: fixture.profile,
    ...(fixture.languages && { languages: fixture.languages }),
    ...(fixture.contacts !== undefined && { contacts: fixture.contacts }),
    ...(fixture.maxLength !== undefined && { maxLength: fixture.maxLength }),
    ...(fixture.extraRules && { extraRules: fixture.extraRules }),
    ...(fixture.exceptions && { exceptions: fixture.exceptions }),
    ...(fixture.thresholds && { thresholds: fixture.thresholds }),
  }
  const before = baseline.check(fixture.input, options)
  const after = check(fixture.input, options)
  if (canonicalJson(before) === canonicalJson(after)) continue
  differences.push({ fixtureId: fixture.id, input: fixture.input, options, before, after })
  const transition = `${before.action} → ${after.action}`
  transitions[transition] = (transitions[transition] ?? 0) + 1
}
const summary = {
  baselineVersion: baseline.VERSION,
  baselineDataVersion: baseline.DATA_VERSION,
  version: VERSION,
  dataVersion: DATA_VERSION,
  compared: fixtures.length,
  changed: differences.length,
  actionChanged: differences.filter((row) => row.before.action !== row.after.action).length,
  transitions,
}
const table = differences.map(({ fixtureId, options, before, after }) => {
  const previous = new Set(before.matches.map((match) => match.ruleId))
  const current = new Set(after.matches.map((match) => match.ruleId))
  const added = [...current].filter((id) => !previous.has(id)).map((id) => `+${id}`)
  const removed = [...previous].filter((id) => !current.has(id)).map((id) => `−${id}`)
  const changes = [...added, ...removed].join(", ") || "Metadati, intervalli o numero dei match"
  return `| ${fixtureId} | ${(options.languages ?? ["it"]).join(", ")} | ${options.profile} | ${before.action} | ${after.action} | ${changes} |`
})
mkdirSync(output, { recursive: true })
writeFileSync(join(output, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`)
writeFileSync(
  join(output, "behavior-diff.jsonl"),
  differences.map((row) => JSON.stringify(row)).join("\n") + (differences.length ? "\n" : ""),
)
writeFileSync(
  join(output, "behavior-diff.md"),
  [
    `# Differenze di comportamento: ${baseline.VERSION} → ${VERSION}`,
    "",
    `Confrontate ${fixtures.length} fixture valide: ${differences.length} cambiano nei match o nell’azione, ${summary.actionChanged} cambiano azione.`,
    "Sono casi di regressione pubblici, non una stima della frequenza su utenti reali. Le fixture di errore di configurazione sono escluse.",
    "Input, opzioni e risultati completi sono in [behavior-diff.jsonl](behavior-diff.jsonl).",
    "",
    "| Fixture | Lingue | Profilo | Prima | Dopo | Differenze nei match |",
    "| --- | --- | --- | --- | --- | --- |",
    ...table,
    "",
  ].join("\n"),
)
console.log(JSON.stringify(summary, null, 2))
