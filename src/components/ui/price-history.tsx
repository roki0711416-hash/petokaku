import { PriceHistoryChart } from "@/components/price-history-chart";
import { PriceInfoCard } from "@/components/price-info-card";
import type { DailyPricePoint, PriceHistorySummary } from "@/lib/pricing/price-history-summary";
import type { PriceInfoOffer } from "@/lib/pricing/price-info-view";

export function PriceHistory({
  summary,
  offers,
  series = [],
  now,
  chart = false,
}: {
  summary: PriceHistorySummary | null;
  offers: PriceInfoOffer[];
  series?: DailyPricePoint[];
  now?: string;
  chart?: boolean;
}) {
  if (chart) {
    if (series.length === 0 || !now) {
      return null;
    }
    return <PriceHistoryChart points={series} now={now} />;
  }
  return <PriceInfoCard summary={summary} offers={offers} placement="history" />;
}
