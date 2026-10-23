import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function classifyProbe(kind, status, body, contentType) {
  if (status !== 200) return "unavailable";
  if (kind === "homepage") return contentType.includes("text/html") && !/Application error: a (?:client|server)-side exception/i.test(body) ? "operational" : "degraded";
  let data;
  try { data = JSON.parse(body); } catch { return "degraded"; }
  if (kind === "liveness") return data.ok === true && data.status === "live" ? "operational" : "degraded";
  return data.status === "healthy" && data.checks?.database?.status === "healthy" && data.checks?.redis?.status === "healthy" ? "operational" : "degraded";
}

export async function probe(fetcher = fetch) {
  const checks = [];
  for (const [kind, route] of [["homepage", "/"], ["liveness", "/api/health/live"], ["readiness", "/api/health"]]) {
    const start = performance.now();
    try {
      const response = await fetcher(`https://www.evalgate.com${route}`, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(10000) });
      const body = await response.text();
      checks.push({ kind, path: route, httpStatus: response.status, status: classifyProbe(kind, response.status, body, response.headers.get("content-type") ?? ""), durationMs: Math.round(performance.now() - start) });
    } catch {
      checks.push({ kind, path: route, httpStatus: null, status: "unavailable", durationMs: Math.round(performance.now() - start) });
    }
  }
  return { checkedAt: new Date().toISOString(), status: checks.every((check) => check.status === "operational") ? "operational" : checks.some((check) => check.status === "unavailable") ? "unavailable" : "degraded", checks, sourceCommit: process.env.GITHUB_SHA ?? null, workflowUrl: process.env.GITHUB_RUN_ID ? `https://github.com/evalgate/status/actions/runs/${process.env.GITHUB_RUN_ID}` : null };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync("site", { recursive: true });
  writeFileSync("site/status.json", JSON.stringify(await probe(), null, 2));
}
