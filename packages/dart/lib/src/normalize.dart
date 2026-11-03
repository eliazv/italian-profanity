import 'generated/data.dart';

/// Intervallo nel testo originale, espresso in unità UTF-16.
class TextRange {
  TextRange(this.start, this.end);
  final int start;
  int end;

  TextRange copy() => TextRange(start, end);
  Map<String, Object> toJson() => {'start': start, 'end': end};
}

/// Un punto di codice normalizzato e la sua provenienza.
class OriginChar {
  OriginChar(this.char, this.range);
  final String char;
  final TextRange range;
}

/// Normalizza solo il prefisso ammesso, senza spezzare coppie surrogate.
List<OriginChar> foldWithOrigins(String input, [num maxLength = 64]) {
  if (!maxLength.isFinite ||
      maxLength <= 0 ||
      maxLength != maxLength.truncateToDouble()) {
    throw ArgumentError.value(
        maxLength, 'maxLength', 'Deve essere un intero positivo finito');
  }
  final output = <OriginChar>[];
  var offset = 0;
  var count = 0;
  for (final code in input.runes) {
    if (count++ >= maxLength) break;
    final char = String.fromCharCode(code);
    final start = offset;
    offset += char.length;
    final value = foldTable[char] ?? char;
    // I segni eliminati estendono anche tutti i caratteri di un'espansione.
    if (value.isEmpty &&
        code >= 0x0300 &&
        code <= 0x036f &&
        output.isNotEmpty) {
      final originStart = output.last.range.start;
      for (var index = output.length - 1; index >= 0; index--) {
        final unit = output[index];
        if (unit.range.start != originStart) break;
        unit.range.end = offset;
      }
    }
    for (final normalized in value.runes) {
      output.add(OriginChar(
          String.fromCharCode(normalized), TextRange(start, offset)));
    }
  }
  return output;
}

/// Vista `base` a livello di carattere (SPECIFICHE.md §4.3): minuscole, accenti
/// rimossi, fullwidth e caratteri simili ricondotti al latino, invisibili
/// eliminati. Usa solo la tabella generata, identica nel pacchetto TypeScript.
String fold(String input) {
  final output = StringBuffer();
  for (final rune in input.runes) {
    final char = String.fromCharCode(rune);
    output.write(foldTable[char] ?? char);
  }
  return output.toString();
}
