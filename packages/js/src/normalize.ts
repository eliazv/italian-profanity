import { FOLD } from "./generated/data.ts"

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
