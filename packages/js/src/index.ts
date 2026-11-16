// API pubblica di italian-profanity. Normalizzazione e segmentazione restano
// interne; rilevatore e policy sono allineati al pacchetto Dart.

export {
  check,
  createChecker,
  findMatches,
  isClean,
  SHORT_MAX_LENGTH,
  TEXT_MAX_LENGTH,
} from "./detect.ts"
export { DATA_VERSION, VERSION } from "./generated/data.ts"
export type {
  Action,
  Category,
  Checker,
  CheckerOptions,
  CheckResult,
  CompiledException,
  Confidence,
  ExtraRule,
  InputMode,
  Match,
  Profile,
  Range,
  RuleKind,
  Severity,
} from "./types.ts"
