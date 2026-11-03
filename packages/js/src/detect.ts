import { EXCEPTIONS, RULES } from "./generated/data.ts"
import { applyPolicy } from "./policy.ts"
import { type Segment, segment } from "./segment.ts"
import type { Checker, CheckerOptions, CheckResult, CompiledRule, Match, Range } from "./types.ts"

interface Pattern {
  runs: Array<{ char: string; count: number }>
}
interface View {
  chars: string[]
  origins: Range[]
  flexible: boolean
}
interface PreparedRule {
  rule: CompiledRule
  terms: Pattern[]
  phrases: Pattern[][]
  a: Pattern[]
  forms: Pattern[]
  prefixes: Pattern[]
}

function pattern(term: string): Pattern {
  const runs: Pattern["runs"] = []
  for (const char of term) {
    const last = runs.at(-1)
    if (last?.char === char) last.count++
    else runs.push({ char, count: 1 })
  }
  return { runs }
}

function prepare(rule: CompiledRule): PreparedRule {
  return {
    rule,
    terms: "terms" in rule ? rule.terms.map(pattern) : [],
    phrases: rule.kind === "phrase" ? rule.phrases.map((phrase) => phrase.map(pattern)) : [],
    a: rule.kind === "combo" ? rule.a.map(pattern) : [],
    forms: rule.kind === "combo" ? (rule.b.forms ?? []).map(pattern) : [],
    prefixes: rule.kind === "combo" ? (rule.b.prefixes ?? []).map(pattern) : [],
  }
}

// Restituisce l'indice dopo la forma riconosciuta. Le doppie originali non
// vengono ridotte; solo le sequenze di almeno tre lettere ammettono squeeze.
function consume(view: View, term: Pattern, start = 0): number | undefined {
  let cursor = start
  for (const [index, run] of term.runs.entries()) {
    if (view.chars[cursor] !== run.char) return undefined
    let end = cursor
    while (view.chars[end] === run.char) end++
    const count = end - cursor
    const last = index === term.runs.length - 1
    if (last && count >= run.count) {
      // Per i prefissi l'ultima sequenza può finire dentro una doppia.
      cursor += view.flexible && count >= 3 && run.count <= 2 ? count : run.count
    } else if (count === run.count || (view.flexible && count >= 3 && run.count <= 2)) {
      cursor = end
    } else return undefined
  }
  return cursor
}

function full(view: View, term: Pattern): boolean {
  return consume(view, term) === view.chars.length
}

function suffix(view: View, term: Pattern): number | undefined {
  for (let start = 0; start < view.chars.length; start++) {
    if (consume(view, term, start) === view.chars.length) return start
  }
  return undefined
}

function views(part: Segment): View[] {
  return [
    { chars: [...part.base], origins: part.baseOrigins, flexible: false },
    { chars: [...part.deleet], origins: part.deleetOrigins, flexible: true },
  ]
}

function interval(view: View, start = 0, end = view.chars.length): Range | undefined {
  const first = view.origins[start]
  const last = view.origins[end - 1]
  return first && last ? { start: first.start, end: last.end } : undefined
}

function normalizedWord(input: string): string {
  const parts = segment(input, Math.max(1, [...input].length))
  if (parts.length !== 1 || !parts[0]?.base || !/^[a-z]+$/.test(parts[0].base)) {
    throw new TypeError("Serve un termine letterale composto da una sola parola alfabetica")
  }
  return parts[0].base
}

function validateOptions(options: CheckerOptions): void {
  if (options.profile !== undefined && !["balanced", "strict", "lenient"].includes(options.profile))
    throw new TypeError("Profilo non valido")
  if (options.languages?.some((language) => language !== "it" && language !== "en"))
    throw new TypeError("Lingua non valida")
  if (options.contacts !== undefined && typeof options.contacts !== "boolean")
    throw new TypeError("contacts deve essere booleano")
  for (const [category, threshold] of Object.entries(options.thresholds ?? {})) {
    if (
      !["blasphemy", "insult", "sexual", "discriminatory", "vulgar", "contact"].includes(
        category,
      ) ||
      (threshold !== null && threshold !== 1 && threshold !== 2 && threshold !== 3)
    )
      throw new TypeError("Soglia non valida")
  }
  segment("", options.maxLength)
}

const CONTACT_PATTERNS: ReadonlyArray<{ id: string; regex: RegExp }> = [
  { id: "contact.email", regex: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}/gi },
  {
    id: "contact.url",
    regex: /(?:https?:\/\/|www\.)[a-z0-9][a-z0-9.-]*\.[a-z]{2,63}(?::[0-9]{1,5})?(?:\/[^\s]*)?/gi,
  },
  { id: "contact.phone", regex: /\+?[0-9][0-9 .()-]{5,}[0-9]/g },
]

function contactMatches(input: string): Match[] {
  const result: Match[] = []
  for (const { id, regex } of CONTACT_PATTERNS) {
    for (const found of input.matchAll(regex)) {
      const start = found.index
      const end = start + found[0].length
      const before = input[start - 1] ?? ""
      const after = input[end] ?? ""
      if (/[a-z0-9_]/i.test(before) || /[a-z0-9_]/i.test(after)) continue
      if (id === "contact.phone") {
        const digits = found[0].replace(/[^0-9]/g, "").length
        if (digits < 9 || digits > 15) continue
      }
      result.push({
        ruleId: id,
        kind: "pattern",
        category: "contact",
        severity: 2,
        confidence: "high",
        range: { start, end },
      })
    }
  }
  return result
}

/** Compila una configurazione indipendente dalle successive modifiche dell'app. */
export function createChecker(options: CheckerOptions = {}): Checker {
  validateOptions(options)
  const settings: CheckerOptions = { ...options, thresholds: { ...options.thresholds } }
  const languages = new Set(options.languages ?? ["it"])
  const sourceRules: CompiledRule[] = RULES.filter((rule) =>
    languages.has(rule.language as "it" | "en"),
  )
  const ids = new Set(RULES.map((rule) => rule.id))
  for (const [index, extra] of (options.extraRules ?? []).entries()) {
    const id = extra.id ?? `app.word.${index}`
    if (!id || ids.has(id) || id.startsWith("contact."))
      throw new TypeError("Id di regola duplicato o riservato")
    if (
      extra.kind !== "word" ||
      !["blasphemy", "insult", "sexual", "discriminatory", "vulgar"].includes(extra.category) ||
      ![1, 2, 3].includes(extra.severity) ||
      !extra.terms.length ||
      (extra.confidence !== undefined && !["high", "medium"].includes(extra.confidence))
    )
      throw new TypeError("Regola aggiuntiva non valida")
    ids.add(id)
    sourceRules.push({
      id,
      kind: "word",
      language: "app",
      category: extra.category,
      severity: extra.severity,
      confidence: extra.confidence ?? "high",
      terms: extra.terms.map(normalizedWord),
    })
  }
  const rules = sourceRules.map(prepare)
  const exceptions = [...EXCEPTIONS, ...(options.exceptions ?? [])].map((exception) => {
    if (!ids.has(exception.ruleId)) throw new TypeError("Eccezione per una regola inesistente")
    return { ruleId: exception.ruleId, word: normalizedWord(exception.word) }
  })
  const find = (input: string): Match[] => {
    const parts = segment(input, settings.maxLength)
    const wordParts = parts.filter((part) => part.kind === "word")
    const viewMap = new Map(parts.map((part) => [part, views(part)]))
    const found = new Map<string, Match>()
    const add = (rule: CompiledRule, range: Range | undefined, owner?: Segment): void => {
      if (
        !range ||
        (owner &&
          exceptions.some(
            (exception) =>
              exception.ruleId === rule.id &&
              (exception.word === owner.base || exception.word === owner.deleet),
          ))
      )
        return
      found.set(`${rule.id}:${range.start}:${range.end}`, {
        ruleId: rule.id,
        category: rule.category,
        kind: rule.kind,
        severity: rule.severity,
        confidence: rule.confidence,
        range,
      })
    }
    const matchesWord = (part: Segment, patterns: Pattern[], prefix = false): View | undefined =>
      viewMap
        .get(part)
        ?.find((view) =>
          patterns.some((term) => (prefix ? consume(view, term) !== undefined : full(view, term))),
        )
    for (const prepared of rules) {
      const { rule } = prepared
      if (rule.kind === "phrase") {
        for (const phrase of prepared.phrases) {
          for (let index = 0; index + phrase.length <= wordParts.length; index++) {
            const matched = phrase.map((term, offset) => {
              const part = wordParts[index + offset]
              return part ? matchesWord(part, [term]) : undefined
            })
            if (matched.every((view) => view !== undefined)) {
              const first = matched[0]
              const last = matched.at(-1)
              const start = first ? interval(first)?.start : undefined
              const end = last ? interval(last)?.end : undefined
              if (start !== undefined && end !== undefined) add(rule, { start, end })
            }
          }
        }
        continue
      }
      for (const part of parts) {
        for (const view of viewMap.get(part) ?? []) {
          if (!view.chars.length) continue
          if (rule.kind === "word" || rule.kind === "prefix") {
            if (
              prepared.terms.some((term) =>
                rule.kind === "prefix" ? consume(view, term) !== undefined : full(view, term),
              )
            )
              add(rule, interval(view), part)
          } else if (rule.kind === "compound") {
            for (const term of prepared.terms) {
              if (rule.anchor !== "end") {
                const end = consume(view, term)
                if (end !== undefined) add(rule, interval(view, 0, end), part)
              }
              if (rule.anchor !== "start") {
                const start = suffix(view, term)
                if (start !== undefined) add(rule, interval(view, start), part)
              }
            }
          } else if (rule.kind === "combo") {
            for (const divine of prepared.a) {
              const split = consume(view, divine)
              if (
                split !== undefined &&
                [...prepared.forms, ...prepared.prefixes].some(
                  (term) => consume(view, term, split) !== undefined,
                )
              )
                add(rule, interval(view), part)
              const endStart = suffix(view, divine)
              if (endStart !== undefined && endStart > 0) {
                const before: View = {
                  ...view,
                  chars: view.chars.slice(0, endStart),
                  origins: view.origins.slice(0, endStart),
                }
                if (
                  prepared.forms.some((term) => suffix(before, term) !== undefined) ||
                  prepared.prefixes.some((term) =>
                    before.chars.some((_, start) => consume(before, term, start) !== undefined),
                  )
                )
                  add(rule, interval(view), part)
              }
            }
          }
        }
      }
      if (rule.kind === "combo") {
        for (let index = 0; index + 1 < wordParts.length; index++) {
          const left = wordParts[index]
          const right = wordParts[index + 1]
          if (!left || !right) continue
          const insult = (part: Segment): View | undefined =>
            matchesWord(part, prepared.forms) ?? matchesWord(part, prepared.prefixes, true)
          const leftA = matchesWord(left, prepared.a)
          const rightB = insult(right)
          const leftB = insult(left)
          const rightA = matchesWord(right, prepared.a)
          const first = leftA && rightB ? leftA : leftB && rightA ? leftB : undefined
          const last = leftA && rightB ? rightB : leftB && rightA ? rightA : undefined
          if (first && last) {
            const start = interval(first)?.start
            const end = interval(last)?.end
            if (start !== undefined && end !== undefined) add(rule, { start, end })
          }
        }
      }
    }
    if (settings.contacts) {
      let prefix = ""
      let count = 0
      for (const char of input) {
        if (count++ >= (settings.maxLength ?? 64)) break
        prefix += char
      }
      for (const match of contactMatches(prefix))
        found.set(`${match.ruleId}:${match.range.start}:${match.range.end}`, match)
    }
    return [...found.values()].sort(
      (a, b) =>
        a.range.start - b.range.start ||
        b.severity - a.severity ||
        (a.ruleId < b.ruleId ? -1 : a.ruleId > b.ruleId ? 1 : 0) ||
        a.range.end - b.range.end,
    )
  }
  const checkInput = (input: string): CheckResult => {
    const matches = find(input)
    return { action: applyPolicy(matches, settings), matches }
  }
  return {
    findMatches: find,
    check: checkInput,
    isClean: (input) => checkInput(input).action === "allow",
  }
}

const defaultChecker: Checker = createChecker()

export function findMatches(input: string, options?: CheckerOptions): Match[] {
  return (options ? createChecker(options) : defaultChecker).findMatches(input)
}

export function check(input: string, options?: CheckerOptions): CheckResult {
  return (options ? createChecker(options) : defaultChecker).check(input)
}

export function isClean(input: string, options?: CheckerOptions): boolean {
  return (options ? createChecker(options) : defaultChecker).isClean(input)
}
