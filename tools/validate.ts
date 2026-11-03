// Valida i dati sorgente: schema JSON più controlli semantici (SPECIFICHE.md §5, §7, §8).
// Uso: node tools/validate.ts
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { Ajv2020 } from "ajv/dist/2020.js"
import addFormatsModule from "ajv-formats"

import {
  loadExceptionFiles,
  loadFixtureFiles,
  loadNormalization,
  loadRuleFiles,
  NORMALIZATION_FILES,
  rel,
  type SourceRule,
} from "./lib/data.ts"
import { readJson, readJsonl } from "./lib/json.ts"
import { DART_PKG, DATA, JS_PKG } from "./lib/paths.ts"

const errors: string[] = []
const fail = (where: string, message: string) => errors.push(`${where}: ${message}`)

// ajv-formats è CommonJS: sotto Node ESM l'export di default arriva annidato in `default`.
type AddFormats = (ajv: Ajv2020) => unknown
const formatsModule = addFormatsModule as unknown as AddFormats & { default?: AddFormats }
const addFormats: AddFormats = formatsModule.default ?? formatsModule
// strictRequired disattivato: segnala come errore il pattern anyOf + required, che è JSON Schema valido.
const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  strictRequired: false,
  allowUnionTypes: true,
})
addFormats(ajv)

const schema = (name: string) =>
  ajv.compile(readJson(join(DATA, "schema", `${name}.schema.json`)) as object)

const validators = {
  rules: schema("rules"),
  exceptions: schema("exceptions"),
  fixture: schema("fixture"),
  sources: schema("sources"),
  normalization: schema("normalization"),
}

function checkSchema(
  validate: (typeof validators)[keyof typeof validators],
  data: unknown,
  where: string,
) {
  if (validate(data)) return true
  for (const error of validate.errors ?? []) {
    fail(where, `${error.instancePath || "/"} ${error.message ?? "non valido"}`)
  }
  return false
}

// --- Fonti -----------------------------------------------------------------
const sourcesPath = join(DATA, "sources.json")
const sources = readJson<{ sources: Array<{ id: string; use: string }> }>(sourcesPath)
checkSchema(validators.sources, sources, rel(sourcesPath))
const sourceIds = new Map(sources.sources.map((source) => [source.id, source.use]))

// --- Normalizzazione ----------------------------------------------------------
for (const name of NORMALIZATION_FILES) {
  const file = loadNormalization(name)
  checkSchema(validators.normalization, readJson(file.path), rel(file.path))
  for (const key of Object.keys(file.map)) {
    if ([...key].length !== 1)
      fail(rel(file.path), `la chiave ${JSON.stringify(key)} non è un solo carattere`)
  }
}

// --- Regole ----------------------------------------------------------------
const ruleIds = new Map<string, SourceRule>()
const REPEATED = /(.)\1\1/

function termsOf(rule: SourceRule): string[] {
  switch (rule.kind) {
    case "phrase":
      return rule.phrases.flat()
    case "combo":
      return [...rule.a, ...(rule.b.forms ?? []), ...(rule.b.prefixes ?? [])]
    default:
      return rule.terms
  }
}

for (const file of loadRuleFiles()) {
  const where = rel(file.path)
  if (!checkSchema(validators.rules, readJson(file.path), where)) continue

  for (const rule of file.rules) {
    const at = `${where} [${rule.id}]`
    if (ruleIds.has(rule.id)) fail(at, "id duplicato")
    ruleIds.set(rule.id, rule)

    const [language, category] = rule.id.split(".")
    if (language !== file.language)
      fail(at, `l'id inizia con "${language}" ma il file è in rules/${file.language}`)
    if (category !== rule.category)
      fail(at, `l'id indica "${category}" ma category è "${rule.category}"`)
    if (rule.kind === "combo" && rule.category !== "blasphemy")
      fail(at, "combo è riservata alla categoria blasphemy")

    for (const term of termsOf(rule)) {
      if (REPEATED.test(term))
        fail(at, `"${term}" ha lettere ripetute 3+ volte: scrivilo già normalizzato`)
    }

    for (const provenance of rule.provenance) {
      if (provenance === "manual") continue
      const sourceId = provenance.split("@")[0] ?? ""
      const use = sourceIds.get(sourceId)
      if (!use) fail(at, `provenance "${provenance}": fonte non presente in data/sources.json`)
      else if (use !== "candidates")
        fail(at, `provenance "${provenance}": la fonte ha use "${use}", non "candidates"`)
    }
  }
}

// --- Eccezioni -------------------------------------------------------------
for (const file of loadExceptionFiles()) {
  const where = rel(file.path)
  if (!checkSchema(validators.exceptions, readJson(file.path), where)) continue
  const seen = new Set<string>()
  for (const exception of file.exceptions) {
    const key = `${exception.ruleId}:${exception.word}`
    if (seen.has(key)) fail(where, `eccezione duplicata ${key}`)
    seen.add(key)
    if (!ruleIds.has(exception.ruleId))
      fail(where, `eccezione per una regola inesistente: ${exception.ruleId}`)
  }
}

// --- Fixture ---------------------------------------------------------------
const positives = new Set<string>()
const negatives = new Set<string>()
const fixtureIds = new Set<string>()

for (const file of loadFixtureFiles()) {
  for (const { line, value: fixture } of file.fixtures) {
    const where = `${rel(file.path)}:${line}`
    if (!checkSchema(validators.fixture, fixture, where)) continue

    if (fixtureIds.has(fixture.id)) fail(where, `id duplicato ${fixture.id}`)
    fixtureIds.add(fixture.id)
    if (!fixture.id.startsWith(`${file.name}-`))
      fail(where, `l'id deve iniziare con "${file.name}-"`)

    for (const id of [...(fixture.rules ?? []), ...(fixture.mustNotMatch ?? [])]) {
      if (!ruleIds.has(id)) fail(where, `regola inesistente ${id}`)
    }
    for (const id of fixture.rules ?? []) {
      positives.add(id)
      if (fixture.mustNotMatch?.includes(id))
        fail(where, `${id} è sia in rules sia in mustNotMatch`)
    }
    for (const id of fixture.mustNotMatch ?? []) negatives.add(id)
  }
}

for (const id of ruleIds.keys()) {
  if (!positives.has(id)) fail("data/fixtures", `${id} non ha un caso positivo (rules)`)
  if (!negatives.has(id))
    fail("data/fixtures", `${id} non ha un caso negativo vicino (mustNotMatch)`)
}

// --- Collisioni accettate dall'audit -------------------------------------------
const acceptedPath = join(DATA, "audit", "accepted.jsonl")
for (const { line, value } of readJsonl<{ ruleId?: string; input?: string; reason?: string }>(
  acceptedPath,
)) {
  const where = `${rel(acceptedPath)}:${line}`
  if (!value.ruleId || !value.input || !value.reason) fail(where, "servono ruleId, input e reason")
  else if (!ruleIds.has(value.ruleId)) fail(where, `regola inesistente ${value.ruleId}`)
}

// --- Versioni allineate tra npm e pub ------------------------------------------
const jsVersion = readJson<{ version: string }>(join(JS_PKG, "package.json")).version
const dartVersion = /^version:\s*(\S+)/m.exec(
  readFileSync(join(DART_PKG, "pubspec.yaml"), "utf8"),
)?.[1]
if (jsVersion !== dartVersion) {
  fail(
    "packages",
    `versione npm ${jsVersion} diversa da pub ${dartVersion}: esegui node tools/sync-version.ts`,
  )
}

// --- Esito -----------------------------------------------------------------
if (errors.length > 0) {
  console.error(`✗ ${errors.length} errori nei dati:\n`)
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

console.log(`✓ dati validi: ${ruleIds.size} regole, ${fixtureIds.size} fixture`)
