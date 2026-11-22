import { presentShippingHistory, type RankedShippingPoint } from "@/lib/pricing/shipping-history";
import type { Offer } from "@/lib/types";
import { ShippingPriceHistoryView } from "@/components/price-history-chart";

export function PriceHistory({
  offers,
  history = [],
  fetchedAt = null,
  recordedDays = null,
}: {
  offers: Offer[];
  history?: RankedShippingPoint[];
  fetchedAt?: string | null;
  recordedDays?: number | null;
}) {
  const view = presentShippingHistory({
    offers,
    history,
    fetchedAt,
  });
  return <ShippingPriceHistoryView view={view} recordedDays={recordedDays} />;
}
