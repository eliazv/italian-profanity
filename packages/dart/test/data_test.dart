import 'package:italian_profanity/italian_profanity.dart';
import 'package:italian_profanity/src/generated/data.dart' show rulesData;
import 'package:italian_profanity/src/normalize.dart';
import 'package:test/test.dart';

void main() {
  group('dati generati', () {
    test('espone versione e versione dei dati', () {
      expect(version, matches(RegExp(r'^\d+\.\d+\.\d+')));
      expect(dataVersion, matches(RegExp(r'^[0-9a-f]{12}$')));
    });

    test('non contiene i campi riservati ai curatori', () {
      for (final rule in rulesData) {
        expect(rule.containsKey('provenance'), isFalse);
        expect(rule.containsKey('note'), isFalse);
      }
    });
  });

  group('fold', () {
    const cases = {
      'CAZZO': 'cazzo',
      'Perché': 'perche',
      'Perché': 'perche',
      'ｃａｚｚｏ': 'cazzo',
      'сazzо': 'cazzo',
      'caz​zo': 'cazzo',
      'Straße': 'strasse',
      'p0r-cò_Dio': 'p0r-co_dio',
    };
    cases.forEach((input, expected) {
      test('$input → $expected', () => expect(fold(input), expected));
    });
  });
}
