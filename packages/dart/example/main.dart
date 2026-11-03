import 'package:italian_profanity/italian_profanity.dart';

// Esempio da terminale: dart run example/main.dart "testo da verificare"
void main(List<String> arguments) {
  final checker = ItalianProfanity.createChecker(
    profile: Profile.balanced,
    languages: ['it', 'en'],
  );
  final result = checker.check(arguments.join(' '));
  print(result.action.name);
}
