/// Riconoscimento di bestemmie, insulti e volgarità in italiano in testi brevi.
///
/// M1 completata: normalizzazione e segmentazione sono interne. Il rilevatore
/// pubblico arriva in M2 (SPECIFICHE.md §11), con gli stessi esiti del pacchetto
/// npm `italian-profanity`.
library;

export 'src/generated/data.dart' show dataVersion, version;
