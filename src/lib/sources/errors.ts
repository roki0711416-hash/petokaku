import type { PriceUpdateError } from "@/lib/sources/types";

const recentErrors: PriceUpdateError[] = [];

export function recordPriceError(error: PriceUpdateError): void {
  recentErrors.push(error);
  if (recentErrors.length > 50) {
    recentErrors.shift();
  }
  console.error("[petokaku] 価格は更新しませんでした", error);
}

export function getRecentPriceErrors(): PriceUpdateError[] {
  return [...recentErrors];
}
