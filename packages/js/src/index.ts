// API pubblica di italian-profanity. Stato: fase M0 (struttura). Il rilevatore
// (findMatches, check, isClean, createChecker) arriva nelle fasi M1-M2: SPECIFICHE.md §11.

export { DATA_VERSION, VERSION } from "./generated/data.ts"
export type {
  Action,
  Category,
  CheckResult,
  Confidence,
  Match,
  Profile,
  Range,
  RuleKind,
  Severity,
} from "./types.ts"
