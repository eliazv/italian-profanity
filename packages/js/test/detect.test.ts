import { describe, expect, it } from "vitest"
import { loadFixtureFiles } from "../../../tools/lib/data.ts"
import { check, createChecker, findMatches, isClean } from "../src/index.ts"
import type { Category, Severity } from "../src/types.ts"

const fixtures = loadFixtureFiles().flatMap((file) => file.fixtures.map(({ value }) => value))

describe("rilevamento e policy: attese condivise", () => {
  for (const fixture of fixtures) {
    it(fixture.id, () => {
      if (fixture.expectedError) {
        expect(() => createChecker(fixture)).toThrow(
          fixture.expectedError === "invalidMaxLength" ? RangeError : TypeError,
        )
        return
      }
      const checker = createChecker(fixture)
      const result = checker.check(fixture.input)
      if (fixture.action) expect(result.action).toBe(fixture.action)
      if (fixture.expectedMatches) expect(result.matches).toEqual(fixture.expectedMatches)
      const ids = result.matches.map((match) => match.ruleId)
      for (const id of fixture.rules ?? []) expect(ids).toContain(id)
      for (const id of fixture.mustNotMatch ?? []) expect(ids).not.toContain(id)
      expect(checker.findMatches(fixture.input)).toEqual(result.matches)
      expect(checker.isClean(fixture.input)).toBe(result.action === "allow")
      for (const match of result.matches) {
        expect(match.range.start).toBeGreaterThanOrEqual(0)
        expect(match.range.end).toBeGreaterThan(match.range.start)
        expect(match.range.end).toBeLessThanOrEqual(fixture.input.length)
      }
    })
  }
})

describe("API pubblica e isolamento", () => {
  const sample = fixtures.find(
    (item) => item.action === "block" && item.expectedMatches?.length && !item.contacts,
  )
  if (!sample) throw new Error("Manca la fixture pubblica")
  it("espone funzioni equivalenti al checker", () => {
    expect(check(sample.input).matches).toEqual(findMatches(sample.input))
    expect(isClean(sample.input)).toBe(false)
    expect(check(sample.input).action).toBe("block")
  })
  it("non legge oltre il prefisso ammesso, anche per i contatti", () => {
    expect(check(" ".repeat(1_000_000) + sample.input, { contacts: true })).toEqual({
      action: "allow",
      matches: [],
    })
  })
  it("compila una copia indipendente delle opzioni dell'app", () => {
    const custom = fixtures.find(
      (item) => item.action === "block" && item.extraRules?.length && !item.expectedError,
    )
    const rule = custom?.extraRules?.[0]
    if (!custom || !rule) throw new Error("Manca la fixture personalizzata")
    const terms = [...rule.terms]
    const thresholds: Partial<Record<Category, Severity | null>> = { [rule.category]: 2 }
    const checker = createChecker({ ...custom, extraRules: [{ ...rule, terms }], thresholds })
    expect(checker.check(custom.input).action).toBe("block")
    terms.length = 0
    thresholds[rule.category] = null
    expect(checker.check(custom.input).action).toBe("block")
  })
})
