// Esegue le fixture su entrambi i motori e confronta i risultati (SPECIFICHE.md §7.2).
// Uso: node tools/parity.ts [--expectations]
//   --expectations  verifica anche che i risultati rispettino le attese delle fixture
//                   (attivo in CI dalla fase M2, quando esiste il rilevatore).
import { execFileSync } from "node:child_process"
import { join } from "node:path"

import { type Fixture, loadFixtureFiles } from "./lib/data.ts"
import { canonicalJson } from "./lib/json.ts"
import { DART_PKG, DATA, JS_PKG } from "./lib/paths.ts"

interface RunnerResult {
  id: string
  base?: string
  action?: string
  matches?: Array<{ ruleId: string }>
}

const fixturesDir = join(DATA, "fixtures")
// Su Windows `dart` è un file .bat: lo lanciamo tramite cmd.exe in modo esplicito, senza
// l'opzione shell (che concatenerebbe gli argomenti e spezzerebbe i percorsi con spazi).
const viaCmd = (command: string, args: string[]): [string, string[]] =>
  process.platform === "win32" && command === "dart"
    ? ["cmd.exe", ["/d", "/s", "/c", command, ...args]]
    : [command, args]

function run(
  label: string,
  command: string,
  args: string[],
  cwd: string,
): Map<string, RunnerResult> {
  let output: string
  try {
    const [file, argv] = viaCmd(command, args)
    output = execFileSync(file, argv, {
      cwd,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "inherit"],
    })
  } catch (error) {
    console.error(`✗ il runner ${label} è fallito`)
    throw error
  }
  const results = JSON.parse(output) as RunnerResult[]
  return new Map(results.map((result) => [result.id, result]))
}

const js = run(
  "TS",
  process.execPath,
  [join(JS_PKG, "test", "fixtures-runner.ts"), fixturesDir],
  JS_PKG,
)
const dart = run("Dart", "dart", ["run", "tool/fixtures_runner.dart", fixturesDir], DART_PKG)

const fixtures = new Map<string, Fixture>(
  loadFixtureFiles().flatMap((file) =>
    file.fixtures.map(({ value }) => [value.id, value] as const),
  ),
)

const problems: string[] = []

for (const id of fixtures.keys()) {
  const a = js.get(id)
  const b = dart.get(id)
  if (!a || !b) {
    problems.push(`${id}: manca nel runner ${a ? "Dart" : "TS"}`)
    continue
  }
  if (canonicalJson(a) !== canonicalJson(b)) {
    problems.push(
      `${id}: risultati diversi\n    TS:   ${canonicalJson(a)}\n    Dart: ${canonicalJson(b)}`,
    )
  }
}

const checkExpectations = process.argv.includes("--expectations")
if (checkExpectations) {
  for (const [id, fixture] of fixtures) {
    const result = js.get(id)
    if (!result) continue
    const found = new Set((result.matches ?? []).map((match) => match.ruleId))
    if (fixture.action && result.action !== fixture.action) {
      problems.push(
        `${id}: atteso ${fixture.action}, ottenuto ${result.action} — ${JSON.stringify(fixture.input)}`,
      )
    }
    for (const rule of fixture.rules ?? []) {
      if (!found.has(rule))
        problems.push(`${id}: manca il match ${rule} — ${JSON.stringify(fixture.input)}`)
    }
    for (const rule of fixture.mustNotMatch ?? []) {
      if (found.has(rule))
        problems.push(`${id}: match non voluto ${rule} — ${JSON.stringify(fixture.input)}`)
    }
  }
}

if (problems.length > 0) {
  console.error(`✗ ${problems.length} problemi:\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}

console.log(
  `✓ parità TS/Dart su ${fixtures.size} fixture${checkExpectations ? ", attese rispettate" : ""}`,
)
