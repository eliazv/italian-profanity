// Genera, a partire da data/, i dati compilati per entrambi i motori (SPECIFICHE.md §4.4, §5.3):
// - tabella di normalizzazione `fold` (carattere → stringa), identica in TS e Dart;
// - tabella leetspeak;
// - regole ed eccezioni senza i campi riservati ai curatori.
// Copia anche LICENSE e NOTICE nei due pacchetti. Uso: node tools/build.ts
import { createHash } from "node:crypto"
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import {
  loadExceptionFiles,
  loadNormalization,
  loadRuleFiles,
  rel,
  type SourceRule,
} from "./lib/data.ts"
import { canonicalJson, readJson } from "./lib/json.ts"
import { DART_PKG, JS_PKG, ROOT } from "./lib/paths.ts"

// --- Tabella fold --------------------------------------------------------------
// Intervalli in cui la scomposizione NFKD di Node fornisce la forma latina. La politica di
// stabilità di Unicode garantisce che le scomposizioni dei caratteri esistenti non cambino:
// il risultato non dipende dalla versione di Node.
const NFKD_RANGES: Array<[number, number]> = [
  [0x00a0, 0x00bf], // spazio non separabile, apici numerici, ª º
  [0x00c0, 0x024f], // Latin-1 Supplement, Latin Extended-A/B
  [0x1e00, 0x1eff], // Latin Extended Additional
  [0x2000, 0x200a], // spazi tipografici
  [0x3000, 0x3000], // spazio ideografico
  [0xfb00, 0xfb06], // legature latine
  [0xff01, 0xff5e], // forme fullwidth
]
// Simboli che NFKD riconduce a una lettera o cifra: numeri romani ("ⅽazzo"), lettere
// cerchiate, matematiche e apici. Si prende la forma solo se è un singolo carattere
// alfanumerico, così un simbolo non diventa mai una parola (™ → "tm", ℡ → "tel", ⑩ → "10").
const SYMBOL_NFKD_RANGES: Array<[number, number]> = [
  [0x2070, 0x209f], // apici e pedici
  [0x2100, 0x214f], // simboli letterali (ℂ, ℓ, ℯ)
  [0x2150, 0x218f], // forme numeriche (numeri romani)
  [0x2460, 0x24ff], // alfanumerici cerchiati
  [0x1d400, 0x1d7ff], // alfanumerici matematici
  [0x1f100, 0x1f1ff], // alfanumerici racchiusi, supplemento
]
const SINGLE_ALNUM = /^[a-z0-9]$/
const COMBINING_MARKS: [number, number] = [0x0300, 0x036f]
const PRINTABLE_ASCII = /^[\x20-\x7e]+$/

const fold = new Map<string, string>()
const origin = new Map<string, string>()

function setFold(char: string, value: string, from: string) {
  const previous = fold.get(char)
  if (previous !== undefined && previous !== value) {
    throw new Error(
      `conflitto su U+${hex(char)}: "${previous}" (${origin.get(char)}) e "${value}" (${from})`,
    )
  }
  fold.set(char, value)
  origin.set(char, from)
}

for (let code = 0x41; code <= 0x5a; code++) {
  setFold(String.fromCodePoint(code), String.fromCodePoint(code + 0x20), "ascii")
}

for (const [start, end] of NFKD_RANGES) {
  for (let code = start; code <= end; code++) {
    const char = String.fromCodePoint(code)
    const value = char.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
    if (value !== char && PRINTABLE_ASCII.test(value)) setFold(char, value, "nfkd")
  }
}

for (const [start, end] of SYMBOL_NFKD_RANGES) {
  for (let code = start; code <= end; code++) {
    const char = String.fromCodePoint(code)
    const value = char.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
    if (value !== char && SINGLE_ALNUM.test(value)) setFold(char, value, "nfkd-symbol")
  }
}

for (let code = COMBINING_MARKS[0]; code <= COMBINING_MARKS[1]; code++) {
  setFold(String.fromCodePoint(code), "", "combining")
}

for (const name of ["invisible", "latin-extra", "confusables-subset"] as const) {
  for (const [char, value] of Object.entries(loadNormalization(name).map))
    setFold(char, value, name)
}

const foldTable = Object.fromEntries(
  [...fold.entries()].sort(([a], [b]) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0)),
)
const leetTable = loadNormalization("leet").map

// --- Regole ed eccezioni -------------------------------------------------------
type CompiledRule = Omit<SourceRule, "provenance" | "note"> & { language: string }

const rules: CompiledRule[] = loadRuleFiles()
  .flatMap((file) =>
    file.rules.map(({ provenance: _provenance, note: _note, ...rule }) => ({
      ...rule,
      language: file.language,
    })),
  )
  .sort((a, b) => a.id.localeCompare(b.id))

const exceptions = loadExceptionFiles()
  .flatMap((file) => file.exceptions.map(({ ruleId, word }) => ({ ruleId, word })))
  .sort((a, b) => `${a.ruleId}:${a.word}`.localeCompare(`${b.ruleId}:${b.word}`))

// --- Metadati --------------------------------------------------------------------
const version = readJson<{ version: string }>(join(JS_PKG, "package.json")).version
const dataVersion = createHash("sha256")
  .update(canonicalJson({ fold: foldTable, leet: leetTable, rules, exceptions }))
  .digest("hex")
  .slice(0, 12)

const HEADER = "File generato da tools/build.ts a partire da data/: non modificare a mano."

// --- Emissione TypeScript -------------------------------------------------------
const tsString = (value: string) =>
  JSON.stringify(value).replace(/[\u007f-￿]/g, (char) => `\\u${hex(char)}`)

function tsLiteral(value: unknown, indent = ""): string {
  const next = `${indent}  `
  if (typeof value === "string") return tsString(value)
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string"))
      return `[${value.map(tsString).join(", ")}]`
    return `[\n${value.map((item) => `${next}${tsLiteral(item, next)},`).join("\n")}\n${indent}]`
  }
  const entries = Object.entries(value as Record<string, unknown>)
  return `{\n${entries.map(([key, item]) => `${next}${tsString(key)}: ${tsLiteral(item, next)},`).join("\n")}\n${indent}}`
}

const ts = `// ${HEADER}
import type { CompiledException, CompiledRule } from "../types.ts"

export const VERSION = ${tsString(version)}
export const DATA_VERSION = ${tsString(dataVersion)}

/** Tabella di normalizzazione condivisa con il pacchetto Dart (SPECIFICHE.md §4.4). */
export const FOLD: Readonly<Record<string, string>> = ${tsLiteral(foldTable)}

/** Sostituzioni della vista deleet (SPECIFICHE.md §4.3). */
export const LEET: Readonly<Record<string, string>> = ${tsLiteral(leetTable)}

export const RULES: readonly CompiledRule[] = ${tsLiteral(rules)}

export const EXCEPTIONS: readonly CompiledException[] = ${tsLiteral(exceptions)}
`

// --- Emissione Dart ---------------------------------------------------------------
const dartString = (value: string) =>
  `'${[...value]
    .map((char) => {
      const code = char.codePointAt(0) ?? 0
      if (char === "\\") return "\\\\"
      if (char === "'") return "\\'"
      if (char === "$") return "\\$"
      if (code < 0x20 || code > 0x7e)
        return code > 0xffff ? `\\u{${code.toString(16)}}` : `\\u${hex(char)}`
      return char
    })
    .join("")}'`

function dartLiteral(value: unknown, indent = ""): string {
  const next = `${indent}  `
  if (typeof value === "string") return dartString(value)
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string"))
      return `[${value.map(dartString).join(", ")}]`
    return `[\n${value.map((item) => `${next}${dartLiteral(item, next)},`).join("\n")}\n${indent}]`
  }
  const entries = Object.entries(value as Record<string, unknown>)
  return `{\n${entries.map(([key, item]) => `${next}${dartString(key)}: ${dartLiteral(item, next)},`).join("\n")}\n${indent}}`
}

const dart = `// ${HEADER}
// ignore_for_file: lines_longer_than_80_chars

const String version = ${dartString(version)};
const String dataVersion = ${dartString(dataVersion)};

/// Tabella di normalizzazione condivisa con il pacchetto TypeScript (SPECIFICHE.md §4.4).
const Map<String, String> foldTable = ${dartLiteral(foldTable)};

/// Sostituzioni della vista deleet (SPECIFICHE.md §4.3).
const Map<String, String> leetTable = ${dartLiteral(leetTable)};

const List<Map<String, Object>> rulesData = ${dartLiteral(rules)};

const List<Map<String, String>> exceptionsData = ${dartLiteral(exceptions)};
`

// --- Scrittura ------------------------------------------------------------------
let changed = 0
function write(path: string, content: string) {
  if (existsSync(path) && readFileSync(path, "utf8") === content) return
  writeFileSync(path, content)
  changed++
  console.log(`  aggiornato ${rel(path)}`)
}

write(join(JS_PKG, "src", "generated", "data.ts"), ts)
write(join(DART_PKG, "lib", "src", "generated", "data.dart"), dart)

for (const name of ["LICENSE", "NOTICE"]) {
  for (const pkg of [JS_PKG, DART_PKG]) {
    const target = join(pkg, name)
    if (
      !existsSync(target) ||
      readFileSync(target, "utf8") !== readFileSync(join(ROOT, name), "utf8")
    ) {
      copyFileSync(join(ROOT, name), target)
      changed++
      console.log(`  aggiornato ${rel(target)}`)
    }
  }
}

console.log(
  `✓ dati ${dataVersion}: ${fold.size} caratteri in fold, ${rules.length} regole, ${exceptions.length} eccezioni${changed ? "" : ", nessuna modifica"}`,
)

function hex(char: string): string {
  return (char.codePointAt(0) ?? 0).toString(16).padStart(4, "0")
}
