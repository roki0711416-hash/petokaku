"use client";

import {
  consentCookieAssignment,
  consentCookieName,
  consentStorageKey,
  isAnalyticsCookieName,
  resolveAnalyticsChoice,
  type AnalyticsChoice,
} from "@/lib/consent";

export type { AnalyticsChoice };

const consentEvent = "petokaku-consent";

export function readClientAnalyticsChoice(): AnalyticsChoice | null {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(consentStorageKey);
  } catch {
    stored = null;
  }
  const cookieHeader = typeof document === "undefined" ? null : document.cookie;
  return resolveAnalyticsChoice(stored, cookieHeader);
}

function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((part) => part.slice(0, part.indexOf("=") === -1 ? part.length : part.indexOf("=")).trim())
    .filter((name) => isAnalyticsCookieName(name));
  for (const name of names) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

export function writeAnalyticsChoice(choice: AnalyticsChoice): AnalyticsChoice | null {
  const previous = readClientAnalyticsChoice();
  try {
    localStorage.setItem(consentStorageKey, choice);
  } catch {
    // Cookieだけでも次の表示に使う。
  }
  document.cookie = consentCookieAssignment(choice);
  if (choice === "denied") {
    clearAnalyticsCookies();
  }
  window.dispatchEvent(new Event(consentEvent));
  return previous;
}

export function applyAnalyticsChoice(choice: AnalyticsChoice) {
  const previous = writeAnalyticsChoice(choice);
  if (choice === "denied" && previous === "granted") {
    window.location.reload();
  }
}
