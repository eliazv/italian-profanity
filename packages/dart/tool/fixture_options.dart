import 'package:italian_profanity/italian_profanity.dart';

// Lettura delle opzioni condivisa dai test e dal runner; nessun termine nel codice.
CheckerOptions fixtureOptions(Map<String, Object?> fixture) => CheckerOptions(
      profile: Profile.values.byName(fixture['profile']! as String),
      mode: InputMode.values.byName((fixture['mode'] as String?) ?? 'short'),
      contacts: (fixture['contacts'] as bool?) ?? false,
      maxLength: fixture['maxLength'] as num?,
      languages: (fixture['languages'] as List<Object?>?)?.cast<String>() ??
          const ['it'],
      thresholds: (fixture['thresholds'] as Map<String, Object?>? ?? {}).map(
          (key, value) => MapEntry(Category.values.byName(key), value as int?)),
      exceptions: (fixture['exceptions'] as List<Object?>? ?? []).map((entry) {
        final data = entry! as Map<String, Object?>;
        return RuleException(
            ruleId: data['ruleId']! as String, word: data['word']! as String);
      }).toList(),
      extraRules: (fixture['extraRules'] as List<Object?>? ?? []).map((entry) {
        final data = entry! as Map<String, Object?>;
        return ExtraRule(
            id: data['id'] as String?,
            kind: RuleKind.values.byName(data['kind']! as String),
            terms: (data['terms']! as List<Object?>).cast<String>(),
            category: Category.values.byName(data['category']! as String),
            severity: data['severity']! as int,
            confidence: Confidence.values
                .byName((data['confidence'] as String?) ?? 'high'));
      }).toList(),
    );
