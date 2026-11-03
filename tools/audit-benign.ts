// Audit dei falsi positivi su nomi, cognomi e parole comuni italiane (SPECIFICHE.md §7.3).
// Il corpus napolux viene scaricato in .cache a un commit fissato e non va mai versionato.
// Uso: node tools/audit-benign.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { readJsonl } from "./lib/json.ts"
import { CACHE, DATA, JS_PKG } from "./lib/paths.ts"

const NAPOLUX_COMMIT = "2951524b6d5b67986f542937cef16a54af63ff84"
const FILES = {
  names: "9000_nomi_propri.txt",
  surnames: "lista_38000_cognomi.txt",
  words: "60000_parole_italiane.txt",
} as const
const SEPARATORS = [" ", ".", "_", ""]
const PAIR_SAMPLE = 20_000

async function corpus(file: string): Promise<string[]> {
  const dir = join(CACHE, "napolux", NAPOLUX_COMMIT)
  const path = join(dir, file)
  if (!existsSync(path)) {
    mkdirSync(dir, { recursive: true })
    const url = `https://raw.githubusercontent.com/napolux/paroleitaliane/${NAPOLUX_COMMIT}/paroleitaliane/${file}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`download fallito ${url}: ${response.status}`)
    writeFileSync(path, await response.text())
  }
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

const [names, surnames, words] = await Promise.all([
  corpus(FILES.names),
  corpus(FILES.surnames),
  corpus(FILES.words),
])

type FindMatches = (input: string) => Array<{ ruleId: string }>
const engine = (await import(pathToFileURL(join(JS_PKG, "src", "index.ts")).href)) as {
  findMatches?: FindMatches
}

if (typeof engine.findMatches !== "function") {
  console.log(
    `• corpus pronto (${names.length} nomi, ${surnames.length} cognomi, ${words.length} parole): rilevatore non ancora disponibile, audit saltato (fase M2)`,
  )
  process.exit(0)
}
const findMatches = engine.findMatches

// Campionamento deterministico delle coppie nome + cognome (LCG con seme fisso).
let seed = 42
const random = () => {
  seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31
  return seed / 2 ** 31
}
const pick = <T>(list: T[]): T => list[Math.floor(random() * list.length)] as T

const inputs = [
  ...names,
  ...surnames,
  ...words,
  ...Array.from(
    { length: PAIR_SAMPLE },
    () => `${pick(names)}${pick(SEPARATORS)}${pick(surnames)}`,
  ),
]

const accepted = new Set(
  readJsonl<{ ruleId: string; input: string }>(join(DATA, "audit", "accepted.jsonl")).map(
    ({ value }) => `${value.ruleId}\u0000${value.input}`,
  ),
)

const collisions: string[] = []
for (const input of inputs) {
  for (const match of findMatches(input)) {
    if (!accepted.has(`${match.ruleId}\u0000${input}`)) collisions.push(`${match.ruleId}  ${input}`)
  }
}

if (collisions.length > 0) {
  console.error(
    `✗ ${collisions.length} collisioni su testi innocui. Valutale una per una (SPECIFICHE.md §7.3):\n`,
  )
  for (const collision of collisions.slice(0, 200)) console.error(`  ${collision}`)
  if (collisions.length > 200) console.error(`  … e altre ${collisions.length - 200}`)
  process.exit(1)
}

console.log(`✓ nessuna collisione su ${inputs.length} testi innocui`)
