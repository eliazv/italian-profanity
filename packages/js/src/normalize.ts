import { lastItem } from "./compat.ts"
import { FOLD } from "./generated/data.ts"
import type { Range } from "./types.ts"

/** Un punto di codice normalizzato e la sua provenienza UTF-16. */
export interface OriginChar {
  char: string
  range: Range
}

/** Riallinea le origini se una rimozione rende adiacenti due surrogati isolati. */
export function mergeSurrogatePairs(units: OriginChar[]): OriginChar[] {
  const output: OriginChar[] = []
  for (const unit of units) {
    const previous = lastItem(output)
    const high = previous?.char.charCodeAt(0) ?? 0
    const low = unit.char.charCodeAt(0)
    if (
      previous?.char.length === 1 &&
      unit.char.length === 1 &&
      high >= 0xd800 &&
      high <= 0xdbff &&
      low >= 0xdc00 &&
      low <= 0xdfff
    ) {
      output[output.length - 1] = {
        char: previous.char + unit.char,
        range: { start: previous.range.start, end: unit.range.end },
      }
    } else output.push(unit)
  }
  return output
}

/** Normalizza solo il prefisso ammesso, senza spezzare coppie surrogate. */
export function foldWithOrigins(input: string, maxLength = 64): OriginChar[] {
  if (typeof input !== "string") throw new TypeError("Il testo deve essere una stringa")
  if (!Number.isInteger(maxLength) || maxLength <= 0) {
    throw new RangeError("maxLength deve essere un intero positivo finito")
  }
  const output: OriginChar[] = []
  let offset = 0
  let count = 0
  for (const char of input) {
    if (count++ >= maxLength) break
    const start = offset
    offset += char.length
    const value = FOLD[char] ?? char
    // I segni combinanti eliminati appartengono al carattere precedente,
    // anche quando questo si è espanso in più punti di codice.
    const code = char.codePointAt(0) ?? 0
    if (value === "" && code >= 0x0300 && code <= 0x036f) {
      const previous = lastItem(output)
      if (previous) {
        const originStart = previous.range.start
        for (let index = output.length - 1; index >= 0; index--) {
          const unit = output[index]
          if (!unit || unit.range.start !== originStart) break
          unit.range.end = offset
        }
      }
    }
    for (const normalized of value) {
      output.push({ char: normalized, range: { start, end: offset } })
    }
  }
  return mergeSurrogatePairs(output)
}

/**
 * Vista `base` a livello di carattere (SPECIFICHE.md §4.3): minuscole, accenti rimossi,
 * fullwidth e caratteri simili ricondotti al latino, invisibili eliminati.
 * Usa solo la tabella generata, identica nel pacchetto Dart.
 */
export function fold(input: string): string {
  let output = ""
  for (const char of input) output += FOLD[char] ?? char
  return output
}
