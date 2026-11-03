// Esegue le fixture condivise e stampa i risultati in JSON, per tools/parity.ts.
// Il formato di uscita deve restare identico a quello di
// packages/js/test/fixtures-runner.ts.
// Uso: dart run tool/fixtures_runner.dart <cartella fixture>
import 'dart:convert';
import 'dart:io';

import 'package:italian_profanity/src/normalize.dart';
import 'package:italian_profanity/src/segment.dart';
import 'package:italian_profanity/italian_profanity.dart';
import 'fixture_options.dart';

void main(List<String> args) {
  if (args.isEmpty) {
    stderr
        .writeln('uso: dart run tool/fixtures_runner.dart <cartella fixture>');
    exit(2);
  }

  final files = Directory(args.first)
      .listSync()
      .whereType<File>()
      .where((file) => file.path.endsWith('.jsonl'))
      .toList()
    ..sort(
        (a, b) => a.uri.pathSegments.last.compareTo(b.uri.pathSegments.last));

  final results = <Map<String, Object>>[];
  for (final file in files) {
    for (final line in file.readAsLinesSync(encoding: utf8)) {
      if (line.trim().isEmpty) continue;
      final fixture = jsonDecode(line) as Map<String, Object?>;
      final result = <String, Object>{
        'id': fixture['id'] as String,
        'base': fold(fixture['input'] as String),
      };
      try {
        result['segments'] = segment(fixture['input'] as String,
                (fixture['maxLength'] as num?) ?? 64)
            .map((part) => part.toJson())
            .toList();
      } on ArgumentError {
        result['error'] = 'invalidMaxLength';
      }
      if (!result.containsKey('error')) {
        try {
          result.addAll(
              check(fixture['input']! as String, fixtureOptions(fixture))
                  .toJson());
        } on ArgumentError {
          result['error'] = 'invalidOptions';
        }
      }
      results.add(result);
    }
  }

  stdout.add(utf8.encode('${jsonEncode(results)}\n'));
}
