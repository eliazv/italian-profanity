import 'types.dart';

/// Categorie che bloccano anche in modalità `text` (D29).
const _textBlocking = [
  Category.blasphemy,
  Category.discriminatory,
  Category.contact
];

/// La policy non altera né elimina i match rilevati.
Action applyPolicy(List<ProfanityMatch> matches, CheckerOptions options) {
  final text = options.mode == InputMode.text;
  var action = Action.allow;
  for (final match in matches) {
    final custom = options.thresholds.containsKey(match.category);
    final threshold = options.thresholds[match.category];
    if (custom && (threshold == null || match.severity < threshold)) continue;
    if (!custom &&
        options.profile == Profile.lenient &&
        ![Category.blasphemy, Category.discriminatory, Category.contact]
            .contains(match.category)) {
      continue;
    }
    if (options.profile == Profile.strict) return Action.block;
    if (match.confidence == Confidence.medium) {
      action = Action.review;
    } else if (custom ||
        options.profile == Profile.lenient ||
        match.category == Category.contact ||
        match.severity >= 2) {
      if (text && !custom && !_textBlocking.contains(match.category)) {
        action = Action.review;
      } else {
        return Action.block;
      }
    }
  }
  return action;
}
