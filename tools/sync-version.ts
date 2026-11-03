// Allinea il pacchetto Dart alla versione npm decisa da Changesets (SPECIFICHE.md §9, §10):
// versione in pubspec.yaml e CHANGELOG.md copiato. Uso: node tools/sync-version.ts
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { readJson } from "./lib/json.ts"
import { DART_PKG, JS_PKG } from "./lib/paths.ts"

const { version } = readJson<{ version: string }>(join(JS_PKG, "package.json"))
const pubspecPath = join(DART_PKG, "pubspec.yaml")
const pubspec = readFileSync(pubspecPath, "utf8")
const updated = pubspec.replace(/^version:\s*\S+/m, `version: ${version}`)

if (updated !== pubspec) writeFileSync(pubspecPath, updated)

const changelog = join(JS_PKG, "CHANGELOG.md")
if (existsSync(changelog)) copyFileSync(changelog, join(DART_PKG, "CHANGELOG.md"))

console.log(`✓ pacchetto Dart allineato alla versione ${version}`)
