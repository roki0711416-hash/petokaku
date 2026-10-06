import { getPriceSource } from "@/lib/sources/registry";

export type PriceMode = "sample" | "unexpected";

export function getPriceMode(): PriceMode {
  const requested = process.env.PRICE_SOURCE?.trim() || "sample";
  if (requested !== "sample") {
    return "unexpected";
  }
  return getPriceSource("sample")?.isConfigured() ? "sample" : "unexpected";
}
