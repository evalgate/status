export function currentStatus(report, now = Date.now()) {
  const checkedAt = Date.parse(report?.checkedAt);
  if (!Number.isFinite(checkedAt) || checkedAt > now + 60000 || now - checkedAt > 20 * 60000 || !["operational", "degraded", "unavailable"].includes(report?.status)) return "unknown";
  return report.status;
}

/** How long ago the report was observed, in words, or null when its time is unusable. */
export function observationAge(report, now = Date.now()) {
  const checkedAt = Date.parse(report?.checkedAt);
  if (!Number.isFinite(checkedAt) || checkedAt > now + 60000) return null;
  const minutes = Math.max(0, Math.floor((now - checkedAt) / 60000));
  if (minutes < 1) return "less than a minute ago";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}
