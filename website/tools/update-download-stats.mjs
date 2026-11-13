// Collect public registry statistics and save verifiable daily snapshots.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const LATEST = resolve(ROOT, "website/public/stats/downloads.json");
const HISTORY = resolve(ROOT, "stats/downloads-history.json");
const DAY = 86400000;
const count = (n) => Number.isSafeInteger(n) && n >= 0;
const isoDay = (date) => new Date(date).toISOString().slice(0, 10);
const offset = (date, days) => isoDay(Date.parse(date + "T00:00:00Z") + days * DAY);
async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, "utf8")); }
  catch (error) { if (error?.code === "ENOENT") return fallback; throw error; }
}
async function get(url, html = false) {
  const response = await fetch(url, {
    headers: { "User-Agent": "italian-profanity-stats/1.0", Accept: html ? "text/html" : "application/json" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw Error("HTTP " + response.status + " (" + url + ")");
  return html ? response.text() : response.json();
}
async function npmTotal() {
  const metadata = await get("https://registry.npmjs.org/italian-profanity");
  if (!metadata.time?.created) throw Error("Missing npm publication date");
  const first = isoDay(metadata.time.created);
  const through = isoDay(Date.now() - 2 * DAY);
  if (first > through) throw Error("No completed npm download day");
  let sum = 0;
  for (let start = first; start <= through;) {
    // The downloads API supports bounded windows, not a single unbounded query.
    const end = [offset(start, 364), through].sort()[0];
    const result = await get("https://api.npmjs.org/downloads/point/" + start + ":" + end + "/italian-profanity");
    if (!count(result.downloads)) throw Error("Invalid npm count");
    sum += result.downloads;
    start = offset(end, 1);
  }
  return { total: sum, through };
}
function weeklyFrom(raw) {
  const item = raw?.scorecard?.weeklyVersionDownloads ?? raw;
  const series = item?.totalWeeklyDownloads;
  if (!Array.isArray(series) || series.length === 0 || series.some((n) => !count(n))) return null;
  const date = item.newestDate;
  return { total: series.reduce((a, b) => a + b, 0), weeks: series.length,
    through: typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null };
}
// A 52-week sum is lifetime only while the package is younger than the window.
// Later we add the archived cumulative count immediately preceding that window.
export function lifetimeFromWeekly(weekly, firstPublished, entries) {
  if (!weekly || !firstPublished) return null;
  const end = weekly.through ?? isoDay(Date.now() - DAY);
  const age = Math.floor((Date.parse(end + "T00:00:00Z") - Date.parse(isoDay(firstPublished) + "T00:00:00Z")) / DAY);
  if (age < weekly.weeks * 7) return weekly.total;
  if (!weekly.through || weekly.weeks !== 52) return null;
  const previousEnd = offset(weekly.through, -364);
  const previous = entries.find((row) => row.pubDev?.through === previousEnd && count(row.pubDev?.total));
  return previous ? previous.pubDev.total + weekly.total : null;
}
async function pubTotal(entries) {
  const [metadata, score] = await Promise.all([
    get("https://pub.dev/api/packages/italian_profanity"),
    get("https://pub.dev/api/packages/italian_profanity/score"),
  ]);
  const published = metadata.versions?.map((v) => v.published).filter(Boolean).sort()[0];
  if (!published) throw Error("Missing pub.dev publication date");
  let weekly = null;
  try {
    const html = await get("https://pub.dev/packages/italian_profanity/score", true);
    const encoded = html.match(/data-downloads-chart-points="([^"]+)"/)?.[1];
    if (encoded) weekly = weeklyFrom(JSON.parse(Buffer.from(encoded, "base64").toString("utf8")));
  } catch (error) { console.warn("pub.dev score chart:", error.message); }
  if (!weekly) {
    try { weekly = weeklyFrom(await get("https://pub.dev/api/packages/italian_profanity/metrics")); }
    catch (error) { console.warn("pub.dev optional metrics:", error.message); }
  }
  const weeksTotal = lifetimeFromWeekly(weekly, published, entries);
  if ((Date.now() - Date.parse(published)) / DAY < 30 && count(score.downloadCount30Days)) {
    return { total: Math.max(score.downloadCount30Days, weeksTotal ?? 0), through: weekly?.through ?? isoDay(Date.now() - DAY), method: "new-package-30d" };
  }
  if (weeksTotal !== null) return { total: weeksTotal, through: weekly?.through ?? null, method: "weekly-history" };
  throw Error("No verified all-time pub.dev count; the last snapshot will be retained");
}
async function main() {
  const old = await readJson(LATEST, null);
  const archive = await readJson(HISTORY, { version: 1, entries: [] });
  if (!Array.isArray(archive.entries)) throw Error("Invalid downloads archive");
  let npm = old?.npm ?? null;
  let pubDev = old?.pubDev ?? null;
  try { npm = await npmTotal(); } catch (error) { console.warn("npm:", error.message); }
  try { pubDev = await pubTotal(archive.entries); } catch (error) { console.warn("pub.dev:", error.message); }
  if (!count(npm?.total) || !count(pubDev?.total)) {
    console.warn("Incomplete counts: the published statistics remain unchanged.");
    return;
  }
  npm.total = Math.max(npm.total, old?.npm?.total ?? 0);
  pubDev.total = Math.max(pubDev.total, old?.pubDev?.total ?? 0);
  const updatedAt = new Date().toISOString();
  const latest = { updatedAt, total: npm.total + pubDev.total, npm, pubDev };
  const date = updatedAt.slice(0, 10);
  archive.entries = archive.entries.filter((item) => item.date !== date);
  archive.entries.push({ date, total: latest.total, npm, pubDev });
  archive.entries.sort((a, b) => a.date.localeCompare(b.date));
  await mkdir(dirname(LATEST), { recursive: true });
  await mkdir(dirname(HISTORY), { recursive: true });
  await writeFile(LATEST, JSON.stringify(latest, null, 2) + "\n");
  await writeFile(HISTORY, JSON.stringify(archive, null, 2) + "\n");
  console.log("Total downloads " + latest.total + " (npm: " + npm.total + ", pub.dev: " + pubDev.total + ")");
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
