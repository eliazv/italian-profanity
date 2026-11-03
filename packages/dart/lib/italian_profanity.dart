/// Riconoscimento di bestemmie, insulti e volgarità in italiano in testi brevi.
///
/// Stato: fase M0 (struttura). Il rilevatore arriva nelle fasi M1-M2
/// (SPECIFICHE.md §11). Gli esiti sono identici a quelli del pacchetto npm
/// `italian-profanity`.
library;

export 'src/generated/data.dart' show dataVersion, version;
