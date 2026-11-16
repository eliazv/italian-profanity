enum Category { blasphemy, insult, sexual, discriminatory, vulgar, contact }

enum Confidence { high, medium }

enum RuleKind { word, prefix, phrase, compound, combo, pattern }

enum Action { allow, review, block }

enum Profile { balanced, strict, lenient }

/// `short` per nickname e titoli (limite 64); `text` per descrizioni e bio:
/// limite 20.000 e blocco riservato a bestemmie, termini discriminatori e
/// contatti, le altre categorie passano in revisione (D29).
enum InputMode { short, text }

/// Limiti predefiniti in punti di codice per le due modalità (D16, D29).
const int shortMaxLength = 64;
const int textMaxLength = 20000;

/// Intervallo immutabile nel testo originale, in unità UTF-16.
class MatchRange {
  const MatchRange(this.start, this.end);
  final int start;
  final int end;
  Map<String, Object> toJson() => {'start': start, 'end': end};
}

class ProfanityMatch {
  const ProfanityMatch(
      {required this.ruleId,
      required this.category,
      required this.severity,
      required this.confidence,
      required this.kind,
      required this.range});
  final String ruleId;
  final Category category;
  final int severity;
  final Confidence confidence;
  final RuleKind kind;
  final MatchRange range;
  Map<String, Object> toJson() => {
        'ruleId': ruleId,
        'category': category.name,
        'severity': severity,
        'confidence': confidence.name,
        'kind': kind.name,
        'range': range.toJson()
      };
}

class CheckResult {
  CheckResult(this.action, List<ProfanityMatch> matches)
      : matches = List.unmodifiable(matches);
  final Action action;
  final List<ProfanityMatch> matches;
  Map<String, Object> toJson() => {
        'action': action.name,
        'matches': matches.map((match) => match.toJson()).toList()
      };
}

class ExtraRule {
  const ExtraRule(
      {this.id,
      this.kind = RuleKind.word,
      required this.terms,
      required this.category,
      required this.severity,
      this.confidence = Confidence.high});
  final String? id;
  final RuleKind kind;
  final List<String> terms;
  final Category category;
  final int severity;
  final Confidence confidence;
}

class RuleException {
  const RuleException({required this.ruleId, required this.word});
  final String ruleId;
  final String word;
}

class CheckerOptions {
  const CheckerOptions(
      {this.profile = Profile.balanced,
      this.mode = InputMode.short,
      this.languages = const ['it'],
      this.contacts = false,
      this.maxLength,
      this.extraRules = const [],
      this.exceptions = const [],
      this.thresholds = const {}});
  final Profile profile;
  final InputMode mode;
  final List<String> languages;
  final bool contacts;

  /// Predefinito: 64 in `short`, 20.000 in `text`.
  final num? maxLength;

  /// Limite effettivo, risolto in base alla modalità.
  num get effectiveMaxLength =>
      maxLength ?? (mode == InputMode.text ? textMaxLength : shortMaxLength);
  final List<ExtraRule> extraRules;
  final List<RuleException> exceptions;
  final Map<Category, int?> thresholds;
}
