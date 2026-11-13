import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// Il checker viene creato all'avvio delle app, anche in WebView vecchie
// (Android con Chrome < 92, iOS < 15.4). Lì queste API non esistono e una
// chiamata lancia `TypeError` impedendo di caricare il modulo.
const UNSUPPORTED_APIS: ReadonlyArray<[string, RegExp]> = [
  ["Array/String.prototype.at", /\.at\(/],
  ["Object.hasOwn", /Object\.hasOwn\(/],
  ["findLast / findLastIndex", /\.findLast(Index)?\(/],
  ["structuredClone", /\bstructuredClone\(/],
  ["toSorted / toReversed / toSpliced", /\.to(Sorted|Reversed|Spliced)\(/],
]

const srcDir = join(import.meta.dirname, "..", "src")
const sources = readdirSync(srcDir, { recursive: true, encoding: "utf8" })
  .filter((file) => file.endsWith(".ts"))
  .map((file) => ({
    file,
    // I commenti possono citare le API vietate.
    code: readFileSync(join(srcDir, file), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, ""),
  }))

describe("compatibilità con motori JavaScript datati", () => {
  for (const [name, pattern] of UNSUPPORTED_APIS) {
    it(`non usa ${name}`, () => {
      const offenders = sources.filter(({ code }) => pattern.test(code)).map(({ file }) => file)
      expect(offenders).toEqual([])
    })
  }
})
