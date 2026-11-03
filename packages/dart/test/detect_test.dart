import 'dart:convert';
import 'dart:io';

import 'package:italian_profanity/italian_profanity.dart';
import 'package:test/test.dart';
import '../tool/fixture_options.dart';

void main() {
  final files = Directory('../../data/fixtures')
      .listSync()
      .whereType<File>()
      .where((file) => file.path.endsWith('.jsonl'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));
  final fixtures = files
      .expand((file) => file
          .readAsLinesSync(encoding: utf8)
          .where((line) => line.trim().isNotEmpty)
          .map((line) => jsonDecode(line) as Map<String, Object?>))
      .toList();
  group('rilevamento e policy: attese condivise', () {
    for (final fixture in fixtures) {
      test(fixture['id']! as String, () {
        if (fixture.containsKey('expectedError')) {
          expect(() => createChecker(fixtureOptions(fixture)),
              throwsArgumentError);
          return;
        }
        final input = fixture['input']! as String;
        final checker = createChecker(fixtureOptions(fixture));
        final result = checker.check(input);
        final matches = result.matches.map((match) => match.toJson()).toList();
        if (fixture.containsKey('action')) {
          expect(result.action.name, fixture['action']);
        }
        if (fixture.containsKey('expectedMatches')) {
          expect(matches, fixture['expectedMatches']);
        }
        final ids = result.matches.map((match) => match.ruleId).toList();
        for (final id in (fixture['rules'] as List<Object?>? ?? [])) {
          expect(ids, contains(id));
        }
        for (final id in (fixture['mustNotMatch'] as List<Object?>? ?? [])) {
          expect(ids, isNot(contains(id)));
        }
        expect(
            checker.findMatches(input).map((match) => match.toJson()).toList(),
            matches);
        expect(checker.isClean(input), result.action == Action.allow);
        for (final match in result.matches) {
          expect(match.range.start, greaterThanOrEqualTo(0));
          expect(match.range.end, greaterThan(match.range.start));
          expect(match.range.end, lessThanOrEqualTo(input.length));
        }
      });
    }
  });
  final sample = fixtures.firstWhere((item) =>
      item['action'] == 'block' &&
      item.containsKey('expectedMatches') &&
      item['contacts'] != true);
  group('API pubblica e isolamento', () {
    test('espone funzioni e facciata equivalenti al checker', () {
      final input = sample['input']! as String;
      expect(check(input).matches.map((match) => match.toJson()).toList(),
          findMatches(input).map((match) => match.toJson()).toList());
      expect(isClean(input), isFalse);
      expect(ItalianProfanity.check(input).action, Action.block);
      expect(ItalianProfanity.isClean(input), isFalse);
    });
    test('non legge oltre il prefisso ammesso, anche per i contatti', () {
      expect(
          check('${' ' * 1000000}${sample['input']}',
                  const CheckerOptions(contacts: true))
              .toJson(),
          {'action': 'allow', 'matches': <Object>[]});
    });
    test('compila una copia indipendente delle opzioni dell’app', () {
      final original = fixtures.firstWhere((item) =>
          item['action'] == 'block' &&
          item.containsKey('extraRules') &&
          !item.containsKey('expectedError'));
      final copy = jsonDecode(jsonEncode(original)) as Map<String, Object?>;
      final options = fixtureOptions(copy);
      final thresholds = {options.extraRules.first.category: 2};
      final checker = createChecker(CheckerOptions(
          extraRules: options.extraRules, thresholds: thresholds));
      final input = original['input']! as String;
      expect(checker.check(input).action, Action.block);
      options.extraRules.first.terms.clear();
      thresholds.clear();
      expect(checker.check(input).action, Action.block);
    });
  });
}
