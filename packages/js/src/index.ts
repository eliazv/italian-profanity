// API pubblica di italian-profanity. M1 completata: normalizzazione e segmentazione
// sono interne. Il rilevatore pubblico arriva in M2: SPECIFICHE.md §11.

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
