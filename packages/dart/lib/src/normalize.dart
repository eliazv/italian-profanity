import 'generated/data.dart';

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
