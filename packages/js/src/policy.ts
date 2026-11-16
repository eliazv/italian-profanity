import type { Action, CheckerOptions, Match } from "./types.ts"

/** Categorie che bloccano anche in modalità `text` (D29). */
const TEXT_BLOCKING: ReadonlyArray<Match["category"]> = ["blasphemy", "discriminatory", "contact"]

/** La policy non altera né elimina i match rilevati. */
export function applyPolicy(matches: Match[], options: CheckerOptions): Action {
  const profile = options.profile ?? "balanced"
  const text = options.mode === "text"
  let action: Action = "allow"
  for (const match of matches) {
    const threshold = options.thresholds?.[match.category]
    if (threshold === null || (threshold !== undefined && match.severity < threshold)) continue
    if (
      threshold === undefined &&
      profile === "lenient" &&
      !["blasphemy", "discriminatory", "contact"].includes(match.category)
    )
      continue
    if (profile === "strict") return "block"
    if (match.confidence === "medium") action = "review"
    else if (
      threshold !== undefined ||
      profile === "lenient" ||
      match.category === "contact" ||
      match.severity >= 2
    ) {
      if (text && threshold === undefined && !TEXT_BLOCKING.includes(match.category))
        action = "review"
      else return "block"
    }
  }
  return action
}
