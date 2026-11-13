import { lastItem } from "./compat.ts"
import { LEET } from "./generated/data.ts"
import { foldWithOrigins, mergeSurrogatePairs, type OriginChar } from "./normalize.ts"
import type { Range } from "./types.ts"

export interface Fragment {
  text: string
  range: Range
}

export interface Repetition {
  char: string
  count: number
  range: Range
}

/** Struttura interna M1: nessuna ricerca lessicale e nessuna policy. */
export interface Segment {
  kind: "word" | "spaced"
  range: Range
  fragments: Fragment[]
  base: string
  deleet: string
  baseOrigins: Range[]
  deleetOrigins: Range[]
  squeeze: Repetition[]
}

const isLetter = (char: string): boolean => /^[a-z]$/.test(char)

// Classificazione esplicita, identica in Dart e indipendente dalle regex Unicode
// dei runtime. I caratteri sconosciuti restano nel testo: non creano nuovi match.
function isSpace(char: string): boolean {
  const code = char.codePointAt(0) ?? 0
  return (
    (code >= 0x09 && code <= 0x0d) ||
    code === 0x20 ||
    code === 0x85 ||
    code === 0xa0 ||
    code === 0x1680 ||
    (code >= 0x2000 && code <= 0x200a) ||
    code === 0x2028 ||
    code === 0x2029 ||
    code === 0x202f ||
    code === 0x205f ||
    code === 0x3000
  )
}

function isSeparator(char: string): boolean {
  const code = char.codePointAt(0) ?? 0
  return (
    (code >= 0x21 && code <= 0x2f) ||
    (code >= 0x3a && code <= 0x40) ||
    (code >= 0x5b && code <= 0x60) ||
    (code >= 0x7b && code <= 0x7e) ||
    (code >= 0x2010 && code <= 0x2015) ||
    (code >= 0x2018 && code <= 0x201f) ||
    code === 0xab ||
    code === 0xbb ||
    code === 0x2026 ||
    code === 0x20ac
  )
}

function span(units: OriginChar[]): Range {
  return { start: units[0]?.range.start ?? 0, end: lastItem(units)?.range.end ?? 0 }
}

function repetitions(units: OriginChar[]): Repetition[] {
  const result: Repetition[] = []
  for (const unit of units) {
    const last = lastItem(result)
    if (last && isLetter(unit.char) && last.char === unit.char) {
      last.count++
      last.range.end = unit.range.end
    } else {
      result.push({ char: unit.char, count: 1, range: { ...unit.range } })
    }
  }
  return result
}

function makeSegment(units: OriginChar[], kind: Segment["kind"]): Segment {
  const fragments: Fragment[] = []
  let fragment: OriginChar[] = []
  const flush = (): void => {
    if (fragment.length) {
      fragments.push({ text: fragment.map((unit) => unit.char).join(""), range: span(fragment) })
      fragment = []
    }
  }
  for (const unit of units) {
    if (isSeparator(unit.char)) flush()
    else fragment.push(unit)
  }
  flush()
  const hasLetter = units.some((unit) => isLetter(unit.char))
  const base = mergeSurrogatePairs(units.filter((unit) => !isSeparator(unit.char)))
  let deleet: OriginChar[] = []
  for (const unit of units) {
    const value = (hasLetter ? LEET[unit.char] : undefined) ?? unit.char
    for (const char of value) {
      if (!isSeparator(char)) deleet.push({ char, range: { ...unit.range } })
    }
  }
  deleet = mergeSurrogatePairs(deleet)
  return {
    kind,
    range: span(units),
    fragments,
    base: base.map((unit) => unit.char).join(""),
    deleet: deleet.map((unit) => unit.char).join(""),
    baseOrigins: base.map((unit) => ({ ...unit.range })),
    deleetOrigins: deleet.map((unit) => ({ ...unit.range })),
    squeeze: repetitions(deleet),
  }
}

/** Mantiene le parole originali e aggiunge candidati per le lettere spaziate. */
export function segment(input: string, maxLength = 64): Segment[] {
  const words: OriginChar[][] = []
  let word: OriginChar[] = []
  for (const unit of foldWithOrigins(input, maxLength)) {
    if (isSpace(unit.char)) {
      if (word.length) words.push(word)
      word = []
    } else word.push(unit)
  }
  if (word.length) words.push(word)
  const segments = words.map((units) => makeSegment(units, "word"))
  // Si uniscono solo parole sorgente di una lettera, senza punteggiatura,
  // numeri o altri caratteri. Ogni sequenza massimale genera un candidato.
  let letters: OriginChar[] = []
  const flush = (): void => {
    if (letters.length >= 3) segments.push(makeSegment(letters, "spaced"))
    letters = []
  }
  for (const units of words) {
    const only = units[0]
    if (units.length === 1 && only && isLetter(only.char)) letters.push(only)
    else flush()
  }
  flush()
  return segments.sort((a, b) => a.range.start - b.range.start || a.range.end - b.range.end)
}
