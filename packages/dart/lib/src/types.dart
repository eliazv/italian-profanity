enum Category { blasphemy, insult, sexual, discriminatory, vulgar, contact }

enum Confidence { high, medium }

enum RuleKind { word, prefix, phrase, compound, combo, pattern }

enum Action { allow, review, block }

enum Profile { balanced, strict, lenient }

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
      this.languages = const ['it'],
      this.contacts = false,
      this.maxLength = 64,
      this.extraRules = const [],
      this.exceptions = const [],
      this.thresholds = const {}});
  final Profile profile;
  final List<String> languages;
  final bool contacts;
  final num maxLength;
  final List<ExtraRule> extraRules;
  final List<RuleException> exceptions;
  final Map<Category, int?> thresholds;
}
