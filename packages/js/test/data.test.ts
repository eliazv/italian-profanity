import { describe, expect, it } from "vitest"
import { RULES } from "../src/generated/data.ts"
import { DATA_VERSION, VERSION } from "../src/index.ts"
import { fold } from "../src/normalize.ts"

describe("dati generati", () => {
  it("espone versione e versione dei dati", () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+/)
    expect(DATA_VERSION).toMatch(/^[0-9a-f]{12}$/)
  })

  it("non contiene i campi riservati ai curatori", () => {
    for (const rule of RULES) {
      expect(rule).not.toHaveProperty("provenance")
      expect(rule).not.toHaveProperty("note")
    }
  })
})

describe("fold", () => {
  it.each([
    ["CAZZO", "cazzo"],
    ["Perché", "perche"],
    ["Perché", "perche"],
    ["ｃａｚｚｏ", "cazzo"],
    ["сazzо", "cazzo"],
    ["caz​zo", "cazzo"],
    ["Straße", "strasse"],
    ["p0r-cò_Dio", "p0r-co_dio"],
  ])("%j → %j", (input, expected) => {
    expect(fold(input)).toBe(expected)
  })
})
