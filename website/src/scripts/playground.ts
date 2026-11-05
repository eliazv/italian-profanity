import { createChecker, VERSION } from "italian-profanity";
import type { Profile } from "italian-profanity";

// Playground copy for the page language (<html lang>); the default is English.
const strings = {
  en: {
    yourTurn: "YOUR TURN",
    prompt: "Enter a nickname to see what happens.",
    actions: { allow: "ALLOW", review: "REVIEW", block: "BLOCK" },
    match: (n: number) => (n === 1 ? "1 MATCH" : n + " MATCHES"),
    allowWithMatches: "The active policy allows this input.",
    noMatches: "No lexical matches detected.",
    review: "Ambiguous input. Consider a manual review.",
    block: "The active policy would block this input.",
    severity: "severity",
    more: "more",
    unavailable: "UNAVAILABLE",
    error: "This input could not be processed.",
    copied: "COPIED ✓",
    manual: "SELECT & COPY",
  },
  it: {
    yourTurn: "TOCCA A TE",
    prompt: "Scrivi un nickname per vedere il risultato.",
    actions: { allow: "CONSENTITO", review: "DA RIVEDERE", block: "BLOCCATO" },
    match: (n: number) => n + " MATCH",
    allowWithMatches: "La policy attiva consente questo testo.",
    noMatches: "Nessuna parola problematica trovata.",
    review: "Testo ambiguo: meglio una verifica manuale.",
    block: "La policy attiva bloccherebbe questo testo.",
    severity: "gravità",
    more: "altri",
    unavailable: "NON DISPONIBILE",
    error: "Impossibile elaborare questo testo.",
    copied: "COPIATO ✓",
    manual: "SELEZIONA E COPIA",
  },
};
const t = document.documentElement.lang === "it" ? strings.it : strings.en;

const input = document.querySelector<HTMLTextAreaElement>("#demo-input");
const profileInput = document.querySelector<HTMLSelectElement>("#demo-profile");
const languageInput = document.querySelector<HTMLSelectElement>("#demo-language");
const output = document.querySelector<HTMLElement>(".demo-output");
const actionLabel = document.querySelector<HTMLElement>("#demo-action");
const description = document.querySelector<HTMLElement>("#demo-explanation");
const icon = document.querySelector<HTMLElement>("#demo-status-icon");
const count = document.querySelector<HTMLElement>("#demo-match-count");
const matchesContainer = document.querySelector<HTMLElement>("#demo-matches");
const version = document.querySelector<HTMLElement>("#demo-version");

const elements = [input, profileInput, languageInput, output, actionLabel, description, icon, count, matchesContainer, version];

if (elements.every(Boolean)) {
  // Assertions only after the full element set has been checked.
  const field = input!;
  const profile = profileInput!;
  const language = languageInput!;
  const resultBox = output!;
  const action = actionLabel!;
  const explanation = description!;
  const stateIcon = icon!;
  const matchedCount = count!;
  const chips = matchesContainer!;
  const versionLabel = version!;

  versionLabel.textContent = "v" + VERSION;

  const clearMatches = () => {
    chips.replaceChildren();
    chips.hidden = true;
  };

  const render = () => {
    const value = field.value;
    clearMatches();

    if (!value.trim()) {
      resultBox.dataset.state = "idle";
      action.textContent = t.yourTurn;
      explanation.textContent = t.prompt;
      stateIcon.textContent = "→";
      matchedCount.textContent = "—";
      return;
    }

    try {
      const checker = createChecker({
        profile: profile.value as Profile,
        languages: language.value === "it-en" ? ["it", "en"] : ["it"],
        contacts: false,
        maxLength: 120,
      });
      const result = checker.check(value);
      const n = result.matches.length;
      resultBox.dataset.state = result.action;
      action.textContent = t.actions[result.action];
      stateIcon.textContent = result.action === "allow" ? "✓" : result.action === "review" ? "?" : "!";
      matchedCount.textContent = t.match(n);
      if (result.action === "allow") {
        explanation.textContent = n ? t.allowWithMatches : t.noMatches;
      } else if (result.action === "review") {
        explanation.textContent = t.review;
      } else {
        explanation.textContent = t.block;
      }

      for (const match of result.matches.slice(0, 6)) {
        const chip = document.createElement("span");
        chip.className = "match-chip";
        chip.textContent = match.category + " · " + t.severity + " " + match.severity;
        chips.append(chip);
      }
      if (n > 6) {
        const more = document.createElement("span");
        more.className = "match-chip";
        more.textContent = "+" + (n - 6) + " " + t.more;
        chips.append(more);
      }
      chips.hidden = n === 0;
    } catch {
      resultBox.dataset.state = "error";
      action.textContent = t.unavailable;
      explanation.textContent = t.error;
      stateIcon.textContent = "!";
      matchedCount.textContent = "—";
    }
  };

  field.addEventListener("input", render);
  profile.addEventListener("change", render);
  language.addEventListener("change", render);
  document.querySelectorAll<HTMLButtonElement>("[data-example]").forEach((button) => {
    button.addEventListener("click", () => {
      field.value = button.dataset.example || "";
      render();
      field.focus();
    });
  });
  render();
}

document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    if (!value) return;
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = t.copied;
    } catch {
      button.textContent = t.manual;
      // Clipboard access can be denied outside secure contexts.
    }
    window.setTimeout(() => { button.textContent = original; }, 1600);
  });
});
