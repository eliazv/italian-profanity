import 'dart:convert';
import 'dart:io';

import 'package:italian_profanity/src/normalize.dart';
import 'package:italian_profanity/src/segment.dart';
import 'package:test/test.dart';

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

  group('contratto M1 condiviso', () {
    for (final fixture in fixtures) {
      if (!fixture.containsKey('expectedSegments') &&
          !fixture.containsKey('expectedError')) {
        continue;
      }
      test(fixture['id'] as String, () {
        final input = fixture['input'] as String;
        final maxLength = (fixture['maxLength'] as num?) ?? 64;
        if (fixture.containsKey('expectedError')) {
          expect(() => segment(input, maxLength), throwsArgumentError);
          return;
        }
        final actual =
            segment(input, maxLength).map((part) => part.toJson()).toList();
        final expected = fixture['expectedSegments']! as List<Object?>;
        expect(actual.length, expected.length);
        for (var index = 0; index < expected.length; index++) {
          final fields = expected[index]! as Map<String, Object?>;
          for (final entry in fields.entries) {
            expect(actual[index][entry.key], entry.value, reason: entry.key);
          }
        }
      });
    }
  });

  group('invarianti della provenienza', () {
    for (final fixture
        in fixtures.where((item) => !item.containsKey('expectedError'))) {
      test(fixture['id'] as String, () {
        final input = fixture['input'] as String;
        final maxLength = (fixture['maxLength'] as num?) ?? 64;
        final prefix =
            String.fromCharCodes(input.runes.take(maxLength.toInt()));
        expect(fold(fold(prefix)), fold(prefix));
        final units = foldWithOrigins(input, maxLength);
        expect(units.map((unit) => unit.char).join(), fold(prefix));
        var previous = 0;
        for (final unit in units) {
          expect(unit.range.start, greaterThanOrEqualTo(previous));
          expect(unit.range.end, greaterThan(unit.range.start));
          expect(unit.range.end, lessThanOrEqualTo(prefix.length));
          previous = unit.range.start;
        }
        for (final part in segment(input, maxLength)) {
          expect(part.baseOrigins.length, part.base.runes.length);
          expect(part.deleetOrigins.length, part.deleet.runes.length);
          expect(part.squeeze.map((run) => run.char * run.count).join(),
              part.deleet);
        }
      });
    }
    test('rifiuta limiti non finiti', () {
      for (final limit in [
        double.nan,
        double.infinity,
        double.negativeInfinity
      ]) {
        expect(() => segment('', limit), throwsArgumentError);
      }
    });
  });
}
