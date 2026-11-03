// Tipi pubblici del rilevatore e della policy (SPECIFICHE.md §5, §6).

export type Category = "blasphemy" | "insult" | "sexual" | "discriminatory" | "vulgar"
export type Severity = 1 | 2 | 3
export type Confidence = "high" | "medium"
export type RuleKind = "word" | "prefix" | "phrase" | "compound" | "combo" | "pattern"
export type Action = "allow" | "review" | "block"
export type Profile = "balanced" | "strict" | "lenient"

export interface ExtraRule {
  id?: string
  kind: "word"
  terms: readonly string[]
  category: Category
  severity: Severity
  confidence?: Confidence
}

export interface CheckerOptions {
  profile?: Profile
  languages?: readonly ("it" | "en")[]
  contacts?: boolean
  maxLength?: number
  extraRules?: readonly ExtraRule[]
  exceptions?: readonly CompiledException[]
  /** null disattiva l'azione per la categoria, senza eliminare i match. */
  thresholds?: Partial<Record<Category | "contact", Severity | null>>
}

export interface Checker {
  findMatches(input: string): Match[]
  check(input: string): CheckResult
  isClean(input: string): boolean
}

/** Intervallo nel testo originale, in unità UTF-16 (le stesse in JS e in Dart). */
export interface Range {
  start: number
  end: number
}

export interface Match {
  ruleId: string
  category: Category | "contact"
  severity: Severity
  confidence: Confidence
  kind: RuleKind
  /** Non scriverlo nei log: permette di risalire al testo. */
  range: Range
}

export interface CheckResult {
  action: Action
  matches: Match[]
}

// --- Forma dei dati compilati (generated/data.ts) ---------------------------------

interface CompiledRuleBase {
  id: string
  language: string
  category: Category
  severity: Severity
  confidence: Confidence
}

export type CompiledRule =
  | (CompiledRuleBase & { kind: "word" | "prefix"; terms: string[] })
  | (CompiledRuleBase & { kind: "phrase"; phrases: string[][] })
  | (CompiledRuleBase & { kind: "compound"; terms: string[]; anchor: "start" | "end" | "both" })
  | (CompiledRuleBase & {
      kind: "combo"
      a: string[]
      b: { forms?: string[]; prefixes?: string[] }
    })

export interface CompiledException {
  ruleId: string
  word: string
}
