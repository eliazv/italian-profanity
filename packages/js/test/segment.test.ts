import { describe, expect, it } from "vitest"
import { loadFixtureFiles } from "../../../tools/lib/data.ts"
import { fold, foldWithOrigins } from "../src/normalize.ts"
import { segment } from "../src/segment.ts"

const fixtures = loadFixtureFiles().flatMap((file) => file.fixtures.map(({ value }) => value))

describe("contratto M1 condiviso", () => {
  for (const fixture of fixtures) {
    if (fixture.expectedSegments === undefined && fixture.expectedError !== "invalidMaxLength")
      continue
    it(fixture.id, () => {
      if (fixture.expectedError) {
        expect(() => segment(fixture.input, fixture.maxLength)).toThrow(RangeError)
        return
      }
      const actual = segment(fixture.input, fixture.maxLength)
      expect(actual).toHaveLength(fixture.expectedSegments?.length ?? 0)
      for (const [index, expected] of (fixture.expectedSegments ?? []).entries()) {
        for (const [key, value] of Object.entries(expected)) {
          expect(actual[index]?.[key as keyof typeof expected]).toEqual(value)
        }
      }
    })
  }
})

describe("invarianti della provenienza", () => {
  for (const fixture of fixtures.filter((item) => !item.expectedError)) {
    it(fixture.id, () => {
      const prefix = [...fixture.input].slice(0, fixture.maxLength ?? 64).join("")
      expect(fold(fold(prefix))).toBe(fold(prefix))
      const units = foldWithOrigins(fixture.input, fixture.maxLength)
      expect(units.map((unit) => unit.char).join("")).toBe(fold(prefix))
      let previous = 0
      for (const unit of units) {
        expect(unit.range.start).toBeGreaterThanOrEqual(previous)
        expect(unit.range.end).toBeGreaterThan(unit.range.start)
        expect(unit.range.end).toBeLessThanOrEqual(prefix.length)
        previous = unit.range.start
      }
      for (const part of segment(fixture.input, fixture.maxLength)) {
        expect(part.baseOrigins).toHaveLength([...part.base].length)
        expect(part.deleetOrigins).toHaveLength([...part.deleet].length)
        expect(part.squeeze.map((run) => run.char.repeat(run.count)).join("")).toBe(part.deleet)
      }
    })
  }

  it("rifiuta limiti non finiti e input di tipo errato", () => {
    for (const limit of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => segment("", limit)).toThrow(RangeError)
    }
    expect(() => segment(null as unknown as string)).toThrow(TypeError)
  })
})
