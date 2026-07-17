export function toISOFromDatetimeLocal(localStr) {
  if (!localStr) return null;
  return new Date(localStr).toISOString();
}

export function toDatetimeLocalString(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function computeExpiresISO(mode, customStr) {
  if (mode === "none") return null;
  if (mode === "24h") return new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  if (mode === "7d") return new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  if (mode === "custom") return toISOFromDatetimeLocal(customStr);
  return null;
}

export function humanTimeLeft(
  iso,
  lang = typeof navigator !== "undefined" ? navigator.language || "ja" : "ja"
) {
  if (!iso) return lang.startsWith("en") ? "No expiry" : "期限なし";
  const ms = new Date(iso) - new Date();
  if (ms <= 0) return lang.startsWith("en") ? "Expired" : "期限切れ";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (lang.startsWith("en")) {
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
  if (d > 0) return `${d}日${h}時間${m}分`;
  if (h > 0) return `${h}時間${m}分`;
  return `${m}分`;
}
