const measurementIdPattern = /^G-[A-Z0-9]+$/;

export function googleAnalyticsId(raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID): string | null {
  const value = raw?.trim() ?? "";
  if (!measurementIdPattern.test(value)) {
    return null;
  }
  return value;
}
