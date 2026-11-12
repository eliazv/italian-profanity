import assert from "node:assert/strict";
import test from "node:test";
import { lifetimeFromWeekly } from "./update-download-stats.mjs";
test("young package sums each week once", () => {
  assert.equal(lifetimeFromWeekly({ total: 42, weeks: 52, through: "2026-11-11" }, "2026-11-01", []), 42);
});
test("older package adds precisely the previous non-overlapping history", () => {
  const old = [{ date: "2026-11-12", pubDev: { total: 100, through: "2026-11-12" } }];
  assert.equal(lifetimeFromWeekly({ total: 50, weeks: 52, through: "2027-11-11" }, "2026-11-01", old), 150);
});
test("older package without archive does not pretend a rolling total is lifetime", () => {
  assert.equal(lifetimeFromWeekly({ total: 50, weeks: 52, through: "2027-11-11" }, "2026-11-01", []), null);
});
