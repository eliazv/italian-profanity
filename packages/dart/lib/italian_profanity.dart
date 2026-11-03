/// Riconoscimento di bestemmie, insulti e volgarità in italiano in testi brevi.
///
/// Normalizzazione e segmentazione sono interne. Rilevatore e policy pubblici
/// hanno gli stessi esiti del pacchetto npm `italian-profanity`.
library;

export 'src/generated/data.dart' show dataVersion, version;
export 'src/types.dart';
export 'src/detect.dart'
    show
        ItalianProfanity,
        ProfanityChecker,
        createChecker,
        findMatches,
        check,
        isClean;
