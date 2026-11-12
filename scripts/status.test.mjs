import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyProbe, probe } from "./probe.mjs";
import { currentStatus, observationAge } from "../site/status-state.mjs";
test("a root error or a non-200 cannot become operational", () => {
  assert.equal(classifyProbe("homepage", 500, "ok", "text/html"), "unavailable");
  assert.equal(classifyProbe("homepage", 200, "Application error: a server-side exception", "text/html"), "degraded");
});
test("liveness alone cannot establish readiness", () => {
  assert.equal(classifyProbe("readiness", 200, '{"ok":true,"status":"live"}', "application/json"), "degraded");
  assert.equal(classifyProbe("readiness", 200, '{"status":"healthy","checks":{"database":{"status":"healthy"},"redis":{"status":"degraded"}}}', "application/json"), "degraded");
});
test("missing, stale and future observations are unknown", () => {
  const now = Date.now();
  for (const checkedAt of [undefined, "bad", new Date(now-21*60000).toISOString(), new Date(now+2*60000).toISOString()]) assert.equal(currentStatus({ checkedAt, status: "operational" }, now), "unknown");
  assert.equal(currentStatus({ checkedAt: new Date(now).toISOString(), status: "degraded" }, now), "degraded");
});
test("a transport failure records unavailable without leaking error text", async () => {
  const result = await probe(async () => { throw new Error("private data"); });
  assert.equal(result.status, "unavailable"); assert.equal(result.checks.length, 3); assert.ok(!JSON.stringify(result).includes("private data"));
});
test("observation age is reported in words and never for unusable times", () => {
  const now = Date.parse("2026-11-12T12:00:00Z");
  assert.equal(observationAge({ checkedAt: "2026-11-12T11:59:40Z" }, now), "less than a minute ago");
  assert.equal(observationAge({ checkedAt: "2026-11-12T11:55:00Z" }, now), "5 minutes ago");
  assert.equal(observationAge({ checkedAt: "2026-11-12T07:00:00Z" }, now), "5 hours ago");
  assert.equal(observationAge({ checkedAt: "2026-11-09T12:00:00Z" }, now), "3 days ago");
  for (const checkedAt of [undefined, "bad", "2026-11-12T12:05:00Z"]) assert.equal(observationAge({ checkedAt }, now), null);
});
