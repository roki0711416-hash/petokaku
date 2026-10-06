import type { PriceSource } from "@/lib/sources/types";

const sampleSource: PriceSource = {
  id: "sample",
  label: "サンプルデータ",
  isConfigured() {
    return true;
  },
  async fetchOffers() {
    return {
      ok: false,
      source: "sample",
      message: "サンプルモードでは、外部の通販サイトへ価格を取りにいきません。",
      at: new Date().toISOString(),
    };
  },
};

const sources: Record<string, PriceSource> = {
  sample: sampleSource,
};

export function getPriceSource(id: string): PriceSource | null {
  return sources[id] ?? null;
}
