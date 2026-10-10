export const consentStorageKey = "petokaku.cookie-choice";
export const consentCookieName = "petokaku.cookie-choice";

export type AnalyticsChoice = "granted" | "denied";

export function parseAnalyticsChoice(raw: string | null | undefined): AnalyticsChoice | null {
  const value = raw?.trim();
  if (value === "granted" || value === "denied") {
    return value;
  }
  return null;
}

export function readCookieValue(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) {
      continue;
    }
    const key = part.slice(0, separator).trim();
    if (key !== name) {
      continue;
    }
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return null;
}

export function resolveAnalyticsChoice(storageValue: string | null | undefined, cookieHeader: string | null | undefined): AnalyticsChoice | null {
  return parseAnalyticsChoice(storageValue) ?? parseAnalyticsChoice(readCookieValue(cookieHeader, consentCookieName));
}

export function consentCookieAssignment(choice: AnalyticsChoice): string {
  return `${consentCookieName}=${encodeURIComponent(choice)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function isAnalyticsCookieName(name: string): boolean {
  return name === "_ga" || name.startsWith("_ga_");
}
