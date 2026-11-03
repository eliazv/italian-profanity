import 'generated/data.dart';
import 'normalize.dart';

class Fragment {
  Fragment(this.text, this.range);
  final String text;
  final TextRange range;
  Map<String, Object> toJson() => {'text': text, 'range': range.toJson()};
}

class Repetition {
  Repetition(this.char, this.count, this.range);
  final String char;
  int count;
  final TextRange range;
  Map<String, Object> toJson() =>
      {'char': char, 'count': count, 'range': range.toJson()};
}

/// Struttura interna M1: nessuna ricerca lessicale e nessuna policy.
class Segment {
  Segment(
      {required this.kind,
      required this.range,
      required this.fragments,
      required this.base,
      required this.deleet,
      required this.baseOrigins,
      required this.deleetOrigins,
      required this.squeeze});
  final String kind;
  final TextRange range;
  final List<Fragment> fragments;
  final String base;
  final String deleet;
  final List<TextRange> baseOrigins;
  final List<TextRange> deleetOrigins;
  final List<Repetition> squeeze;

  Map<String, Object> toJson() => {
        'kind': kind,
        'range': range.toJson(),
        'fragments': fragments.map((part) => part.toJson()).toList(),
        'base': base,
        'deleet': deleet,
        'baseOrigins': baseOrigins.map((origin) => origin.toJson()).toList(),
        'deleetOrigins':
            deleetOrigins.map((origin) => origin.toJson()).toList(),
        'squeeze': squeeze.map((run) => run.toJson()).toList(),
      };
}

bool _isLetter(String char) {
  final code = char.runes.first;
  return code >= 0x61 && code <= 0x7a;
}

// Stessa classificazione esplicita del motore TS; i caratteri sconosciuti
// restano nel testo e non creano nuove corrispondenze lessicali.
bool _isSpace(String char) {
  final code = char.runes.first;
  return (code >= 0x09 && code <= 0x0d) ||
      code == 0x20 ||
      code == 0x85 ||
      code == 0xa0 ||
      code == 0x1680 ||
      (code >= 0x2000 && code <= 0x200a) ||
      code == 0x2028 ||
      code == 0x2029 ||
      code == 0x202f ||
      code == 0x205f ||
      code == 0x3000;
}

bool _isSeparator(String char) {
  final code = char.runes.first;
  return (code >= 0x21 && code <= 0x2f) ||
      (code >= 0x3a && code <= 0x40) ||
      (code >= 0x5b && code <= 0x60) ||
      (code >= 0x7b && code <= 0x7e) ||
      (code >= 0x2010 && code <= 0x2015) ||
      (code >= 0x2018 && code <= 0x201f) ||
      code == 0xab ||
      code == 0xbb ||
      code == 0x2026 ||
      code == 0x20ac;
}

TextRange _span(List<OriginChar> units) => TextRange(
      units.isEmpty ? 0 : units.first.range.start,
      units.isEmpty ? 0 : units.last.range.end,
    );

List<Repetition> _repetitions(List<OriginChar> units) {
  final result = <Repetition>[];
  for (final unit in units) {
    final last = result.isEmpty ? null : result.last;
    if (last != null && _isLetter(unit.char) && last.char == unit.char) {
      last.count++;
      last.range.end = unit.range.end;
    } else {
      result.add(Repetition(unit.char, 1, unit.range.copy()));
    }
  }
  return result;
}

Segment _makeSegment(List<OriginChar> units, String kind) {
  final fragments = <Fragment>[];
  var fragment = <OriginChar>[];
  void flush() {
    if (fragment.isNotEmpty) {
      fragments.add(
          Fragment(fragment.map((unit) => unit.char).join(), _span(fragment)));
      fragment = [];
    }
  }

  for (final unit in units) {
    if (_isSeparator(unit.char)) {
      flush();
    } else {
      fragment.add(unit);
    }
  }
  flush();
  final hasLetter = units.any((unit) => _isLetter(unit.char));
  final base = units.where((unit) => !_isSeparator(unit.char)).toList();
  final deleet = <OriginChar>[];
  for (final unit in units) {
    final value = (hasLetter ? leetTable[unit.char] : null) ?? unit.char;
    for (final code in value.runes) {
      final char = String.fromCharCode(code);
      if (!_isSeparator(char)) deleet.add(OriginChar(char, unit.range.copy()));
    }
  }
  return Segment(
      kind: kind,
      range: _span(units),
      fragments: fragments,
      base: base.map((unit) => unit.char).join(),
      deleet: deleet.map((unit) => unit.char).join(),
      baseOrigins: base.map((unit) => unit.range.copy()).toList(),
      deleetOrigins: deleet.map((unit) => unit.range.copy()).toList(),
      squeeze: _repetitions(deleet));
}

/// Mantiene le parole originali e aggiunge candidati per le lettere spaziate.
List<Segment> segment(String input, [num maxLength = 64]) {
  final words = <List<OriginChar>>[];
  var word = <OriginChar>[];
  for (final unit in foldWithOrigins(input, maxLength)) {
    if (_isSpace(unit.char)) {
      if (word.isNotEmpty) words.add(word);
      word = [];
    } else {
      word.add(unit);
    }
  }
  if (word.isNotEmpty) words.add(word);
  final segments = words.map((units) => _makeSegment(units, 'word')).toList();
  var letters = <OriginChar>[];
  void flush() {
    if (letters.length >= 3) segments.add(_makeSegment(letters, 'spaced'));
    letters = [];
  }

  for (final units in words) {
    if (units.length == 1 && _isLetter(units.first.char)) {
      letters.add(units.first);
    } else {
      flush();
    }
  }
  flush();
  segments.sort((a, b) {
    final startOrder = a.range.start.compareTo(b.range.start);
    return startOrder != 0 ? startOrder : a.range.end.compareTo(b.range.end);
  });
  return segments;
}
