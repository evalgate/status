import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyProbe, probe } from "./probe.mjs";
import { currentStatus } from "../site/status-state.mjs";
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
