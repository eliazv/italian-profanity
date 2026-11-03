import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
export const DATA = join(ROOT, "data")
export const JS_PKG = join(ROOT, "packages", "js")
export const DART_PKG = join(ROOT, "packages", "dart")
export const CACHE = join(ROOT, ".cache")
