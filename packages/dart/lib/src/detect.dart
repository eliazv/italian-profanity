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
  _View(this.chars, this.origins, this.flexible,
      [this.trimmed = false, this.masked = false]);
  final List<String> chars;
  final List<TextRange> origins;
  final bool flexible;
  final bool masked;

  /// Vista senza le cifre esterne: usata solo se le viste complete non trovano
  /// la regola.
  final bool trimmed;

  /// Riunisce due o più parole vere separate da punteggiatura: niente ricerca
  /// `infix`.
  bool joined = false;
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
        a = _strings(data['a']).map(_Pattern.new).toList(),
        infix = data['kind'] == 'word'
            ? _strings(data['infix']).map(_Pattern.new).toList()
            : <_Pattern>[] {
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
  final List<_Pattern> infix;
  late final List<_Pattern> forms;
  late final List<_Pattern> prefixes;
}

// Stesso confronto per sequenze del motore TS: nessuna riduzione delle doppie.
int? _consume(_View view, _Pattern term, [int start = 0]) {
  // Ogni asterisco interno corrisponde a un solo carattere, senza squeeze.
  if (view.masked) {
    var cursor = start;
    for (final run in term.runs) {
      for (var index = 0; index < run.count; index++) {
        if (cursor >= view.chars.length ||
            (view.chars[cursor] != run.char && view.chars[cursor] != '*')) {
          return null;
        }
        cursor++;
      }
    }
    return cursor;
  }
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

// Prima occorrenza della radice in qualunque punto della vista (D26).
(int, int)? _inside(_View view, _Pattern term) {
  for (var start = 0; start < view.chars.length; start++) {
    final end = _consume(view, term, start);
    if (end != null) return (start, end);
  }
  return null;
}

int? _suffix(_View view, _Pattern term) {
  for (var start = 0; start < view.chars.length; start++) {
    if (_consume(view, term, start) == view.chars.length) return start;
  }
  return null;
}

final _digit = RegExp(r'^[0-9]$');
final _digitText = RegExp(r'^[0-9]+$');
final _letter = RegExp(r'^[a-z]$');
final _upper = RegExp(r'^[A-Z]$');

// Restringe una vista all'intervallo UTF-16 [from, to).
_View _within(_View view, int from, int to) {
  final inside = [
    for (var index = 0; index < view.origins.length; index++)
      if (view.origins[index].start >= from && view.origins[index].end <= to)
        index
  ];
  return _View([for (final index in inside) view.chars[index]],
      [for (final index in inside) view.origins[index]], view.flexible, true);
}

// Le cifre attaccate a inizio o fine parola (`stronzo_99`, `88puttana`) sono
// spesso un suffisso del nickname, non leet: il deleet le trasforma in lettere
// e la forma non corrisponde più. Si aggiungono le viste della parte centrale,
// senza sostituire quelle complete: prima senza i frammenti di sole cifre
// (`c4zz0_99` → `c4zz0`), poi senza le cifre esterne (`puttana88` → `puttana`).
// Le parole unite in CamelCase (`StronzoRutto`, `FuckYou`) danno una vista per
// ogni pezzo che inizia con una maiuscola ASCII dopo una minuscola ASCII, e
// le parole con più frammenti di lettere una vista per frammento (D25).
List<_View> _trimmedViews(
    Segment part, _View base, _View deleet, String input) {
  final spans = <TextRange>[];
  final cuts = [0];
  for (var index = 1; index < base.origins.length; index++) {
    final previous = input[base.origins[index - 1].start];
    final current = input[base.origins[index].start];
    if (_letter.hasMatch(previous) && _upper.hasMatch(current)) cuts.add(index);
  }
  if (cuts.length > 1) {
    cuts.add(base.origins.length);
    for (var index = 0; index + 1 < cuts.length; index++) {
      spans.add(TextRange(base.origins[cuts[index]].start,
          base.origins[cuts[index + 1] - 1].end));
    }
  }
  final lettered = part.fragments
      .where((fragment) => !_digitText.hasMatch(fragment.text))
      .toList();
  if (lettered.isNotEmpty && lettered.length < part.fragments.length) {
    spans.add(TextRange(lettered.first.range.start, lettered.last.range.end));
  }
  // I frammenti uniti dalla punteggiatura (`sborra_verde`, `adolf-nigger`) danno
  // anche una vista ciascuno, senza le cifre esterne del frammento: nei nickname
  // `_` e `-` separano parole vere più spesso di quanto mascherino una parola.
  if (lettered.length > 1) {
    for (final fragment in lettered) {
      final inside = [
        for (var index = 0; index < base.origins.length; index++)
          if (base.origins[index].start >= fragment.range.start &&
              base.origins[index].end <= fragment.range.end)
            index,
      ];
      var low = 0;
      var high = inside.length;
      while (low < high && _digit.hasMatch(base.chars[inside[low]])) {
        low++;
      }
      while (high > low && _digit.hasMatch(base.chars[inside[high - 1]])) {
        high--;
      }
      // Prima il frammento intero (`n3gr4` resta leet), poi senza cifre esterne.
      for (final (left, right) in [(0, inside.length), (low, high)]) {
        if (left < right) {
          spans.add(TextRange(base.origins[inside[left]].start,
              base.origins[inside[right - 1]].end));
        }
      }
    }
  }
  var start = 0;
  var end = base.chars.length;
  while (start < end && _digit.hasMatch(base.chars[start])) {
    start++;
  }
  while (end > start && _digit.hasMatch(base.chars[end - 1])) {
    end--;
  }
  if ((start > 0 || end < base.chars.length) && start < end) {
    spans.add(TextRange(base.origins[start].start, base.origins[end - 1].end));
  }
  final result = <_View>[];
  final seen = <String>{};
  for (final span in spans) {
    if (!seen.add('${span.start}:${span.end}')) continue;
    final trimmedBase = _within(base, span.start, span.end);
    if (!trimmedBase.chars.any(_letter.hasMatch)) continue;
    result.addAll([trimmedBase, _within(deleet, span.start, span.end)]);
  }
  return result;
}

// Una vista che attraversa due frammenti di almeno tre caratteri unisce parole
// vere (`rosco_patorn`): cercarvi una radice troverebbe sequenze a cavallo del
// separatore. Le lettere isolate (`s.b.o.r.r.a`) sono invece un'elusione.
bool _isJoined(_View view, Segment part) {
  var words = 0;
  for (final fragment in part.fragments) {
    if (_digitText.hasMatch(fragment.text) || fragment.text.runes.length < 3) {
      continue;
    }
    if (view.origins.any((origin) =>
        origin.start >= fragment.range.start &&
        origin.end <= fragment.range.end)) {
      words++;
    }
  }
  return words > 1;
}

// Uno o due asterischi interni a una parola, senza jolly tra separatori.
final _maskedLetterOrDigit = RegExp(r'^[a-z0-9]$');
final _maskedAllowed = RegExp(r'^[a-z0-9*]$');

_View? _maskedView(Segment part, String input) {
  if (part.kind != 'word') return null;
  final source = input.substring(part.range.start, part.range.end);
  if (!source.contains('*')) return null;
  final chars = <String>[];
  final origins = <TextRange>[];
  for (final unit in foldWithOrigins(source, source.runes.length)) {
    final value = leetTable[unit.char] ?? unit.char;
    for (final code in value.runes) {
      chars.add(String.fromCharCode(code));
      origins.add(TextRange(part.range.start + unit.range.start,
          part.range.start + unit.range.end));
    }
  }
  final masks = chars.where((char) => char == '*').length;
  if (masks < 1 ||
      masks > 2 ||
      chars.length < 3 ||
      !_maskedLetterOrDigit.hasMatch(chars.first) ||
      !_maskedLetterOrDigit.hasMatch(chars.last) ||
      chars.any((char) => !_maskedAllowed.hasMatch(char))) {
    return null;
  }
  return _View(chars, origins, false, false, true);
}

// Un dollaro puo indicare z, ma la vista originale mantiene $ -> s.
_View? _dollarView(Segment part, String input) {
  if (part.kind != 'word') return null;
  final source = input.substring(part.range.start, part.range.end);
  if (!source.contains(r'$')) return null;
  final chars = <String>[];
  final origins = <TextRange>[];
  var dollars = 0;
  for (final unit in foldWithOrigins(source, source.runes.length)) {
    if (unit.char == r'$') dollars++;
    final value = unit.char == r'$' ? 'z' : (leetTable[unit.char] ?? unit.char);
    for (final code in value.runes) {
      chars.add(String.fromCharCode(code));
      origins.add(TextRange(part.range.start + unit.range.start,
          part.range.start + unit.range.end));
    }
  }
  if (dollars < 1 ||
      dollars > 2 ||
      chars.length < 3 ||
      !_maskedLetterOrDigit.hasMatch(chars.first) ||
      !_maskedLetterOrDigit.hasMatch(chars.last) ||
      chars.any((char) => !_maskedLetterOrDigit.hasMatch(char))) {
    return null;
  }
  return _View(chars, origins, false);
}

List<_View> _views(Segment part, String input) {
  final base = _View(part.base.runes.map(String.fromCharCode).toList(),
      part.baseOrigins, false);
  final deleet = _View(part.deleet.runes.map(String.fromCharCode).toList(),
      part.deleetOrigins, true);
  final trimmed = _trimmedViews(part, base, deleet, input);
  // Conserva la grafia inglese originale: la k->c e' solo un'alternativa.
  final kViews = <_View>[
    for (final view in [deleet, ...trimmed.where((view) => view.flexible)])
      if (view.chars.contains('k'))
        _View([for (final char in view.chars) char == 'k' ? 'c' : char],
            view.origins, view.flexible, view.trimmed)
  ];
  final dollar = _dollarView(part, input);
  final dollarK = dollar != null && dollar.chars.contains('k')
      ? _View([for (final char in dollar.chars) char == 'k' ? 'c' : char],
          dollar.origins, false)
      : null;
  final masked = _maskedView(part, input);
  final maskedK = masked != null && masked.chars.contains('k')
      ? _View([for (final char in masked.chars) char == 'k' ? 'c' : char],
          masked.origins, false, false, true)
      : null;
  final all = [
    base,
    deleet,
    ...trimmed,
    ...kViews,
    if (dollar != null) dollar,
    if (dollarK != null) dollarK,
    if (masked != null) masked,
    if (maskedK != null) maskedK
  ];
  for (final view in all) {
    view.joined = _isJoined(view, part);
  }
  return all;
}

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
    final viewMap = {for (final part in parts) part: _views(part, input)};
    // Le eccezioni valgono per ogni vista della parola, comprese quelle senza
    // cifre: `cazzola99` resta coperto dall'eccezione su `cazzola`.
    final wordMap = {
      for (final part in parts)
        part: [for (final view in viewMap[part]!) view.chars.join()]
    };
    final found = <String, ProfanityMatch>{};
    bool add(_PreparedRule rule, MatchRange? range, [Segment? owner]) {
      if (range == null ||
          (owner != null &&
              _exceptions.any((exception) =>
                  exception.ruleId == rule.id &&
                  wordMap[owner]!.contains(exception.word)))) {
        return false;
      }
      found['${rule.id}:${range.start}:${range.end}'] = ProfanityMatch(
          ruleId: rule.id,
          category: rule.category,
          kind: rule.kind,
          severity: rule.severity,
          confidence: rule.confidence,
          range: range);
      return true;
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
        var hit = false;
        for (final view in viewMap[part]!) {
          if (view.chars.isEmpty || (view.trimmed && hit)) continue;
          if (rule.kind == RuleKind.word || rule.kind == RuleKind.prefix) {
            if (rule.terms.any((term) => rule.kind == RuleKind.prefix
                ? _consume(view, term) != null
                : _full(view, term))) {
              hit = add(rule, _interval(view), part) || hit;
            } else if (!view.joined) {
              for (final term in rule.infix) {
                final found = _inside(view, term);
                if (found != null) {
                  hit = add(rule, _interval(view, found.$1, found.$2), part) ||
                      hit;
                  break;
                }
              }
            }
          } else if (rule.kind == RuleKind.compound) {
            for (final term in rule.terms) {
              if (rule.anchor != 'end') {
                final end = _consume(view, term);
                if (end != null) {
                  hit = add(rule, _interval(view, 0, end), part) || hit;
                }
              }
              if (rule.anchor != 'start') {
                final start = _suffix(view, term);
                if (start != null) {
                  hit = add(rule, _interval(view, start), part) || hit;
                }
              }
            }
          } else if (rule.kind == RuleKind.combo) {
            for (final divine in rule.a) {
              final split = _consume(view, divine);
              if (split != null &&
                  [...rule.forms, ...rule.prefixes]
                      .any((term) => _consume(view, term, split) != null)) {
                hit = add(rule, _interval(view), part) || hit;
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
                if (insult) hit = add(rule, _interval(view), part) || hit;
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
