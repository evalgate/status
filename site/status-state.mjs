export function currentStatus(report, now = Date.now()) {
  const checkedAt = Date.parse(report?.checkedAt);
  if (!Number.isFinite(checkedAt) || checkedAt > now + 60000 || now - checkedAt > 20 * 60000 || !["operational", "degraded", "unavailable"].includes(report?.status)) return "unknown";
  return report.status;
}
