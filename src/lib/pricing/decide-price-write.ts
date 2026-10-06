import type { ShippingStatus, StockStatus } from "../types.ts";

export type CommercialState = {
  price: number | null;
  shippingFee: number | null;
  shippingStatus: ShippingStatus;
  stockStatus: StockStatus;
};

export type StoredPriceObservation = CommercialState & {
  id: string;
  observedAt: string;
};

export type PriceWriteDecision =
  | { action: "insert"; observedOn: string }
  | { action: "confirm"; observationId: string; observedOn: string };

const tokyoDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function tokyoObservationDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    throw new Error("価格の取得時刻を日本時間の日付にできません");
  }
  return tokyoDateFormat.format(date);
}

function sameCommercialState(left: CommercialState, right: CommercialState): boolean {
  return (
    left.price === right.price &&
    left.shippingFee === right.shippingFee &&
    left.shippingStatus === right.shippingStatus &&
    left.stockStatus === right.stockStatus
  );
}

export function decidePriceWrite(input: {
  now: string;
  observations: StoredPriceObservation[];
  next: CommercialState;
}): PriceWriteDecision {
  const observedOn = tokyoObservationDate(input.now);
  const today = input.observations
    .filter((observation) => tokyoObservationDate(observation.observedAt) === observedOn)
    .sort((left, right) => right.observedAt.localeCompare(left.observedAt) || right.id.localeCompare(left.id));
  const latest = today[0];
  if (!latest || !sameCommercialState(latest, input.next)) {
    return { action: "insert", observedOn };
  }
  return { action: "confirm", observationId: latest.id, observedOn };
}
