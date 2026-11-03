// Caricamento dei dati sorgente in data/. Nessuna validazione qui: la fa validate.ts.
import { readdirSync } from "node:fs"
import { basename, join, relative } from "node:path"
import type { Segment } from "../../packages/js/src/segment.ts"
import type { CheckerOptions, Match } from "../../packages/js/src/types.ts"

import { readJson, readJsonl } from "./json.ts"
import { DATA, ROOT } from "./paths.ts"

export type Category = "blasphemy" | "insult" | "sexual" | "discriminatory" | "vulgar"
export type Language = "it" | "en"

interface RuleBase {
  id: string
  category: Category
  severity: 1 | 2 | 3
  confidence: "high" | "medium"
  provenance: string[]
  note?: string
}

export type SourceRule =
  | (RuleBase & { kind: "word" | "prefix"; terms: string[] })
  | (RuleBase & { kind: "phrase"; phrases: string[][] })
  | (RuleBase & { kind: "compound"; terms: string[]; anchor: "start" | "end" | "both" })
  | (RuleBase & { kind: "combo"; a: string[]; b: { forms?: string[]; prefixes?: string[] } })

export interface RuleFile {
  path: string
  language: Language
  rules: SourceRule[]
}

export interface SourceException {
  ruleId: string
  word: string
  reason: string
}

export interface Fixture extends CheckerOptions {
  id: string
  input: string
  profile: "balanced" | "strict" | "lenient"
  contacts?: boolean
  expectedBase?: string
  maxLength?: number
  expectedSegments?: Array<Pick<Segment, "kind" | "range" | "base" | "deleet"> & Partial<Segment>>
  expectedError?: "invalidMaxLength" | "invalidOptions"
  expectedMatches?: Match[]
  action?: "allow" | "review" | "block"
  rules?: string[]
  mustNotMatch?: string[]
  note?: string
}

export interface FixtureFile {
  path: string
  name: string
  fixtures: Array<{ line: number; value: Fixture }>
}

export interface NormalizationFile {
  path: string
  map: Record<string, string>
}

export const rel = (path: string): string => relative(ROOT, path).replaceAll("\\", "/")

const jsonFiles = (dir: string, extension: string): string[] =>
  readdirSync(dir)
    .filter((name) => name.endsWith(extension))
    .sort()
    .map((name) => join(dir, name))

export function loadRuleFiles(): RuleFile[] {
  return (["it", "en"] as const).flatMap((language) =>
    jsonFiles(join(DATA, "rules", language), ".json").map((path) => ({
      path,
      language,
      rules: readJson<{ rules: SourceRule[] }>(path).rules,
    })),
  )
}

export function loadExceptionFiles(): Array<{ path: string; exceptions: SourceException[] }> {
  return jsonFiles(join(DATA, "exceptions"), ".json").map((path) => ({
    path,
    exceptions: readJson<{ exceptions: SourceException[] }>(path).exceptions,
  }))
}

export function loadFixtureFiles(): FixtureFile[] {
  return jsonFiles(join(DATA, "fixtures"), ".jsonl").map((path) => ({
    path,
    name: basename(path, ".jsonl"),
    fixtures: readJsonl<Fixture>(path),
  }))
}

export function loadNormalization(name: string): NormalizationFile {
  const path = join(DATA, "normalization", `${name}.json`)
  return { path, map: readJson<{ map: Record<string, string> }>(path).map }
}

export const NORMALIZATION_FILES = [
  "invisible",
  "latin-extra",
  "confusables-subset",
  "leet",
] as const
