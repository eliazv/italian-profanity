import 'generated/data.dart';
import 'normalize.dart';
import 'policy.dart';
import 'segment.dart';
import 'types.dart';

class _Run {
  _Run(this.char, this.count);
  final String char;
  int count;
}

class _Pattern {
  _Pattern(String term) {
    for (final code in term.runes) {
      final char = String.fromCharCode(code);
      if (runs.isNotEmpty && runs.last.char == char) {
        runs.last.count++;
      } else {
        runs.add(_Run(char, 1));
      }
    }
  }
  final runs = <_Run>[];
}

class _View {
  _View(this.chars, this.origins, this.flexible);
  final List<String> chars;
  final List<TextRange> origins;
  final bool flexible;
}

List<String> _strings(Object? value) =>
    (value as List<Object?>?)?.cast<String>() ?? [];

class _PreparedRule {
  _PreparedRule(Map<String, Object> data)
      : id = data['id']! as String,
        category = Category.values.byName(data['category']! as String),
        kind = RuleKind.values.byName(data['kind']! as String),
        severity = data['severity']! as int,
        confidence = Confidence.values.byName(data['confidence']! as String),
        anchor = data['anchor'] as String?,
        terms = _strings(data['terms']).map(_Pattern.new).toList(),
        phrases = (data['phrases'] as List<Object?>? ?? [])
            .map((phrase) => _strings(phrase).map(_Pattern.new).toList())
            .toList(),
        a = _strings(data['a']).map(_Pattern.new).toList() {
    final b = data['b'] as Map<String, Object>?;
    forms = _strings(b?['forms']).map(_Pattern.new).toList();
    prefixes = _strings(b?['prefixes']).map(_Pattern.new).toList();
  }
  final String id;
  final Category category;
  final RuleKind kind;
  final int severity;
  final Confidence confidence;
  final String? anchor;
  final List<_Pattern> terms;
  final List<List<_Pattern>> phrases;
  final List<_Pattern> a;
  late final List<_Pattern> forms;
  late final List<_Pattern> prefixes;
}

// Stesso confronto per sequenze del motore TS: nessuna riduzione delle doppie.
int? _consume(_View view, _Pattern term, [int start = 0]) {
  var cursor = start;
  for (var index = 0; index < term.runs.length; index++) {
    final run = term.runs[index];
    if (cursor >= view.chars.length || view.chars[cursor] != run.char) {
      return null;
    }
    var end = cursor;
    while (end < view.chars.length && view.chars[end] == run.char) {
      end++;
    }
    final count = end - cursor;
    final last = index == term.runs.length - 1;
    if (last && count >= run.count) {
      cursor +=
          view.flexible && count >= 3 && run.count <= 2 ? count : run.count;
    } else if (count == run.count ||
        (view.flexible && count >= 3 && run.count <= 2)) {
      cursor = end;
    } else {
      return null;
    }
  }
  return cursor;
}

bool _full(_View view, _Pattern term) =>
    _consume(view, term) == view.chars.length;

int? _suffix(_View view, _Pattern term) {
  for (var start = 0; start < view.chars.length; start++) {
    if (_consume(view, term, start) == view.chars.length) return start;
  }
  return null;
}

List<_View> _views(Segment part) => [
      _View(part.base.runes.map(String.fromCharCode).toList(), part.baseOrigins,
          false),
      _View(part.deleet.runes.map(String.fromCharCode).toList(),
          part.deleetOrigins, true),
    ];

MatchRange? _interval(_View view, [int start = 0, int? end]) {
  final stop = end ?? view.chars.length;
  if (start >= stop || stop > view.origins.length) return null;
  return MatchRange(view.origins[start].start, view.origins[stop - 1].end);
}

String _normalizedWord(String input) {
  final length = input.runes.length;
  final parts = segment(input, length > 0 ? length : 1);
  if (parts.length != 1 ||
      parts.first.base.isEmpty ||
      !RegExp(r'^[a-z]+$').hasMatch(parts.first.base)) {
    throw ArgumentError(
        'Serve un termine letterale composto da una sola parola alfabetica');
  }
  return parts.first.base;
}

final _contactPatterns = <(String, RegExp)>[
  (
    'contact.email',
    RegExp(r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}', caseSensitive: false)
  ),
  (
    'contact.url',
    RegExp(
        r'(?:https?://|www\.)[a-z0-9][a-z0-9.-]*\.[a-z]{2,63}(?::[0-9]{1,5})?(?:/[^\s]*)?',
        caseSensitive: false)
  ),
  ('contact.phone', RegExp(r'\+?[0-9][0-9 .()-]{5,}[0-9]')),
];

List<ProfanityMatch> _contactMatches(String input) {
  final result = <ProfanityMatch>[];
  final boundary = RegExp(r'[a-z0-9_]', caseSensitive: false);
  for (final (id, regex) in _contactPatterns) {
    for (final found in regex.allMatches(input)) {
      final before = found.start > 0 ? input[found.start - 1] : '';
      final after = found.end < input.length ? input[found.end] : '';
      if (boundary.hasMatch(before) || boundary.hasMatch(after)) continue;
      if (id == 'contact.phone') {
        final digits = found.group(0)!.replaceAll(RegExp(r'[^0-9]'), '').length;
        if (digits < 9 || digits > 15) continue;
      }
      result.add(ProfanityMatch(
          ruleId: id,
          category: Category.contact,
          severity: 2,
          confidence: Confidence.high,
          kind: RuleKind.pattern,
          range: MatchRange(found.start, found.end)));
    }
  }
  return result;
}

class ProfanityChecker {
  ProfanityChecker([CheckerOptions options = const CheckerOptions()]) {
    segment('', options.maxLength);
    if (options.languages
        .any((language) => language != 'it' && language != 'en')) {
      throw ArgumentError('Lingua non valida');
    }
    for (final threshold in options.thresholds.values) {
      if (threshold != null && (threshold < 1 || threshold > 3)) {
        throw ArgumentError('Soglia non valida');
      }
    }
    _settings = CheckerOptions(
        profile: options.profile,
        languages: List.of(options.languages),
        contacts: options.contacts,
        maxLength: options.maxLength,
        thresholds: Map.of(options.thresholds));
    final sourceRules = rulesData
        .where((data) => options.languages.contains(data['language']))
        .toList();
    final ids = rulesData.map((data) => data['id']! as String).toSet();
    for (var index = 0; index < options.extraRules.length; index++) {
      final extra = options.extraRules[index];
      final id = extra.id ?? 'app.word.$index';
      if (id.isEmpty || ids.contains(id) || id.startsWith('contact.')) {
        throw ArgumentError('Id duplicato o riservato');
      }
      if (extra.kind != RuleKind.word ||
          extra.category == Category.contact ||
          extra.severity < 1 ||
          extra.severity > 3 ||
          extra.terms.isEmpty) {
        throw ArgumentError('Regola aggiuntiva non valida');
      }
      ids.add(id);
      sourceRules.add({
        'id': id,
        'kind': 'word',
        'language': 'app',
        'category': extra.category.name,
        'severity': extra.severity,
        'confidence': extra.confidence.name,
        'terms': extra.terms.map(_normalizedWord).toList()
      });
    }
    _rules = sourceRules.map(_PreparedRule.new).toList();
    _exceptions = [
      ...exceptionsData.map((data) =>
          RuleException(ruleId: data['ruleId']!, word: data['word']!)),
      ...options.exceptions,
    ].map((exception) {
      if (!ids.contains(exception.ruleId)) {
        throw ArgumentError('Eccezione per una regola inesistente');
      }
      return RuleException(
          ruleId: exception.ruleId, word: _normalizedWord(exception.word));
    }).toList();
  }
  late final CheckerOptions _settings;
  late final List<_PreparedRule> _rules;
  late final List<RuleException> _exceptions;

  List<ProfanityMatch> findMatches(String input) {
    final parts = segment(input, _settings.maxLength);
    final words = parts.where((part) => part.kind == 'word').toList();
    final viewMap = {for (final part in parts) part: _views(part)};
    final found = <String, ProfanityMatch>{};
    void add(_PreparedRule rule, MatchRange? range, [Segment? owner]) {
      if (range == null ||
          (owner != null &&
              _exceptions.any((exception) =>
                  exception.ruleId == rule.id &&
                  (exception.word == owner.base ||
                      exception.word == owner.deleet)))) {
        return;
      }
      found['${rule.id}:${range.start}:${range.end}'] = ProfanityMatch(
          ruleId: rule.id,
          category: rule.category,
          kind: rule.kind,
          severity: rule.severity,
          confidence: rule.confidence,
          range: range);
    }

    _View? matchesWord(Segment part, List<_Pattern> patterns,
        [bool prefix = false]) {
      for (final view in viewMap[part]!) {
        if (patterns.any((term) =>
            prefix ? _consume(view, term) != null : _full(view, term))) {
          return view;
        }
      }
      return null;
    }

    for (final rule in _rules) {
      if (rule.kind == RuleKind.phrase) {
        for (final phrase in rule.phrases) {
          for (var index = 0; index + phrase.length <= words.length; index++) {
            final matched = <_View?>[
              for (var offset = 0; offset < phrase.length; offset++)
                matchesWord(words[index + offset], [phrase[offset]])
            ];
            if (matched.every((view) => view != null)) {
              final first = _interval(matched.first!);
              final last = _interval(matched.last!);
              if (first != null && last != null) {
                add(rule, MatchRange(first.start, last.end));
              }
            }
          }
        }
        continue;
      }
      for (final part in parts) {
        for (final view in viewMap[part]!) {
          if (view.chars.isEmpty) continue;
          if (rule.kind == RuleKind.word || rule.kind == RuleKind.prefix) {
            if (rule.terms.any((term) => rule.kind == RuleKind.prefix
                ? _consume(view, term) != null
                : _full(view, term))) {
              add(rule, _interval(view), part);
            }
          } else if (rule.kind == RuleKind.compound) {
            for (final term in rule.terms) {
              if (rule.anchor != 'end') {
                final end = _consume(view, term);
                if (end != null) add(rule, _interval(view, 0, end), part);
              }
              if (rule.anchor != 'start') {
                final start = _suffix(view, term);
                if (start != null) add(rule, _interval(view, start), part);
              }
            }
          } else if (rule.kind == RuleKind.combo) {
            for (final divine in rule.a) {
              final split = _consume(view, divine);
              if (split != null &&
                  [...rule.forms, ...rule.prefixes]
                      .any((term) => _consume(view, term, split) != null)) {
                add(rule, _interval(view), part);
              }
              final endStart = _suffix(view, divine);
              if (endStart != null && endStart > 0) {
                final before = _View(view.chars.sublist(0, endStart),
                    view.origins.sublist(0, endStart), view.flexible);
                var insult =
                    rule.forms.any((term) => _suffix(before, term) != null);
                for (final term in rule.prefixes) {
                  for (var start = 0; start < before.chars.length; start++) {
                    if (_consume(before, term, start) != null) insult = true;
                  }
                }
                if (insult) add(rule, _interval(view), part);
              }
            }
          }
        }
      }
      if (rule.kind == RuleKind.combo) {
        for (var index = 0; index + 1 < words.length; index++) {
          final left = words[index];
          final right = words[index + 1];
          _View? insult(Segment part) =>
              matchesWord(part, rule.forms) ??
              matchesWord(part, rule.prefixes, true);
          final leftA = matchesWord(left, rule.a);
          final rightB = insult(right);
          final leftB = insult(left);
          final rightA = matchesWord(right, rule.a);
          final first = leftA != null && rightB != null
              ? leftA
              : leftB != null && rightA != null
                  ? leftB
                  : null;
          final last = leftA != null && rightB != null
              ? rightB
              : leftB != null && rightA != null
                  ? rightA
                  : null;
          if (first != null && last != null) {
            final begin = _interval(first);
            final finish = _interval(last);
            if (begin != null && finish != null) {
              add(rule, MatchRange(begin.start, finish.end));
            }
          }
        }
      }
    }
    if (_settings.contacts) {
      final prefix =
          String.fromCharCodes(input.runes.take(_settings.maxLength.toInt()));
      for (final match in _contactMatches(prefix)) {
        found['${match.ruleId}:${match.range.start}:${match.range.end}'] =
            match;
      }
    }
    final result = found.values.toList()
      ..sort((a, b) {
        var order = a.range.start.compareTo(b.range.start);
        if (order == 0) order = b.severity.compareTo(a.severity);
        if (order == 0) order = a.ruleId.compareTo(b.ruleId);
        if (order == 0) order = a.range.end.compareTo(b.range.end);
        return order;
      });
    return result;
  }

  CheckResult check(String input) {
    final matches = findMatches(input);
    return CheckResult(applyPolicy(matches, _settings), matches);
  }

  bool isClean(String input) => check(input).action == Action.allow;
}

final _defaultChecker = ProfanityChecker();
ProfanityChecker createChecker(
        [CheckerOptions options = const CheckerOptions()]) =>
    ProfanityChecker(options);
List<ProfanityMatch> findMatches(String input, [CheckerOptions? options]) =>
    (options == null ? _defaultChecker : createChecker(options))
        .findMatches(input);
CheckResult check(String input, [CheckerOptions? options]) =>
    (options == null ? _defaultChecker : createChecker(options)).check(input);
bool isClean(String input, [CheckerOptions? options]) =>
    check(input, options).action == Action.allow;

/// Facciata idiomatica Dart con opzioni nominate, equivalente all'API npm.
abstract final class ItalianProfanity {
  static ProfanityChecker createChecker(
          {Profile profile = Profile.balanced,
          List<String> languages = const ['it'],
          bool contacts = false,
          num maxLength = 64,
          List<ExtraRule> extraRules = const [],
          List<RuleException> exceptions = const [],
          Map<Category, int?> thresholds = const {}}) =>
      ProfanityChecker(CheckerOptions(
          profile: profile,
          languages: languages,
          contacts: contacts,
          maxLength: maxLength,
          extraRules: extraRules,
          exceptions: exceptions,
          thresholds: thresholds));

  static CheckResult check(String input,
          {Profile profile = Profile.balanced,
          List<String> languages = const ['it'],
          bool contacts = false,
          num maxLength = 64,
          List<ExtraRule> extraRules = const [],
          List<RuleException> exceptions = const [],
          Map<Category, int?> thresholds = const {}}) =>
      createChecker(
              profile: profile,
              languages: languages,
              contacts: contacts,
              maxLength: maxLength,
              extraRules: extraRules,
              exceptions: exceptions,
              thresholds: thresholds)
          .check(input);

  static List<ProfanityMatch> findMatches(String input,
          {CheckerOptions? options}) =>
      (options == null ? _defaultChecker : ProfanityChecker(options))
          .findMatches(input);
  static bool isClean(String input,
          {Profile profile = Profile.balanced,
          bool contacts = false,
          num maxLength = 64}) =>
      check(input, profile: profile, contacts: contacts, maxLength: maxLength)
          .action ==
      Action.allow;
}
