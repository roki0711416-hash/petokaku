const safeKey = /^[a-z][a-zA-Z0-9]{0,40}$/;

export function logPriceRefresh(event: string, fields: Record<string, number | string | null | undefined> = {}): void {
  const name = /^[a-z-]{1,40}$/.test(event) ? event : "event";
  const parts = Object.entries(fields).flatMap(([key, value]) => {
    if (!safeKey.test(key) || value == null) {
      return [];
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return [`${key}=${value}`];
    }
    if (typeof value === "string" && value.length > 0 && value.length <= 40 && /^[a-z0-9-]+$/.test(value)) {
      return [`${key}=${value}`];
    }
    return [];
  });
  console.info(`[price-refresh] ${name}${parts.length > 0 ? ` ${parts.join(" ")}` : ""}`);
}
