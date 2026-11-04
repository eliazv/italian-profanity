// Prova il bundle ESM in un browser reale, senza installare librerie di test.
// Uso: node tools/smoke-browser.mjs (Chrome/Chromium; BROWSER_BINARY per altri percorsi).
import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { existsSync, mkdirSync, readFileSync } from "node:fs"
import { createServer } from "node:http"
import { resolve } from "node:path"
import { promisify } from "node:util"

const browser = [
  process.env.BROWSER_BINARY,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((path) => path && existsSync(path))
assert.ok(browser, "Impostare BROWSER_BINARY al percorso di Chrome o Chromium")
const fixtures = ["adoption", "english", "consolidation"].flatMap((name) =>
  readFileSync(new URL(`../data/fixtures/${name}.jsonl`, import.meta.url), "utf8")
    .trim()
    .split("\n")
    .map(JSON.parse),
)
const bundle = readFileSync(new URL("../packages/js/dist/index.js", import.meta.url))
const page = `<!doctype html><meta charset="utf-8"><body>In corso<script type="module">
import { check } from '/index.js';
const fixtures = ${JSON.stringify(fixtures).replaceAll("<", "\\u003c")};
const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
try {
  for (const fixture of fixtures) {
    const result = check(fixture.input, fixture);
    if (fixture.action && result.action !== fixture.action) throw Error(fixture.id);
    if (fixture.expectedMatches && JSON.stringify(canonical(result.matches)) !== JSON.stringify(canonical(fixture.expectedMatches))) throw Error(fixture.id);
    for (const id of fixture.rules ?? []) if (!result.matches.some(match => match.ruleId === id)) throw Error(fixture.id);
    for (const id of fixture.mustNotMatch ?? []) if (result.matches.some(match => match.ruleId === id)) throw Error(fixture.id);
  }
  document.body.textContent = 'OK: ' + fixtures.length;
} catch (error) { document.body.textContent = 'ERRORE: ' + error.message; }
</script>`
const server = createServer((request, response) => {
  response.setHeader("Content-Type", request.url === "/index.js" ? "text/javascript" : "text/html")
  response.end(request.url === "/index.js" ? bundle : page)
})
const profile = resolve(".cache/smoke-browser-profile")
mkdirSync(profile, { recursive: true })
try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const address = server.address()
  assert.ok(address && typeof address === "object")
  const { stdout } = await promisify(execFile)(
    browser,
    [
      "--headless",
      "--no-first-run",
      "--disable-default-apps",
      "--disable-extensions",
      `--user-data-dir=${profile}`,
      "--dump-dom",
      `http://127.0.0.1:${address.port}/`,
    ],
    { timeout: 30_000, maxBuffer: 2 * 1024 * 1024, windowsHide: true },
  )
  assert.ok(stdout.includes(`<body>OK: ${fixtures.length}</body>`), stdout)
  console.log(
    `✓ Browser: bundle ESM verificato su ${fixtures.length} fixture, senza dipendenze Node`,
  )
} finally {
  server.closeAllConnections()
  await new Promise((resolve) => server.close(resolve))
}
