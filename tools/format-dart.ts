// I dati generati appartengono al build, non al formatter del runtime locale.
// Questo evita diff al variare della versione del formatter Dart.
import { execFileSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { join } from "node:path"
import { DART_PKG } from "./lib/paths.ts"

function files(dir = ""): string[] {
  return readdirSync(join(DART_PKG, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      return ["generated", ".dart_tool", "build", ".git"].includes(entry.name) ? [] : files(path)
    }
    return entry.name.endsWith(".dart") ? [path] : []
  })
}

const args = [
  "format",
  ...(process.argv.includes("--write") ? [] : ["--output=none", "--set-exit-if-changed"]),
  ...files().sort(),
]
try {
  if (process.platform === "win32") {
    execFileSync("cmd.exe", ["/d", "/s", "/c", "dart", ...args], {
      cwd: DART_PKG,
      stdio: "inherit",
    })
  } else execFileSync("dart", args, { cwd: DART_PKG, stdio: "inherit" })
} catch {
  process.exit(1)
}
