import { readFileSync } from "node:fs"

export function readJson<T = unknown>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

/** Una riga JSON per caso; le righe vuote vengono ignorate. */
export function readJsonl<T = unknown>(path: string): Array<{ line: number; value: T }> {
  return readFileSync(path, "utf8")
    .split("\n")
    .map((text, index) => ({ text: text.trim(), line: index + 1 }))
    .filter(({ text }) => text.length > 0)
    .map(({ text, line }) => {
      try {
        return { line, value: JSON.parse(text) as T }
      } catch (error) {
        throw new Error(`${path}:${line}: JSON non valido (${(error as Error).message})`)
      }
    })
}

/** JSON con chiavi ordinate: confronti e hash indipendenti dall'ordine di inserimento. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value))
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
    )
  }
  return value
}
