import type { StockStatus } from "@/lib/types";
import type { MoneyQuote } from "@/lib/pricing/calculate";

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

export function formatYen(value: number): string {
  return yen.format(value);
}

export function formatUnitAmount(quote: MoneyQuote, unitLabel: string): string {
  const amount = `${formatYen(quote.yen)} / ${unitLabel}`;
  return quote.exact ? amount : `約${amount}`;
}

export function formatPriceRange(lowest: number | null, highest: number | null): string {
  if (lowest == null) {
    return "価格未確認";
  }
  if (highest == null || lowest === highest) {
    return formatYen(lowest);
  }
  return `${formatYen(lowest)}〜${formatYen(highest)}`;
}

function tokyoParts(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

export function formatCheckedAt(value: string | null): string {
  if (!value) {
    return "未確認";
  }
  const parts = tokyoParts(value);
  if (!parts) {
    return "未確認";
  }
  return `${parts.year}年${parts.month}月${parts.day}日 ${parts.hour}:${parts.minute}`;
}

export function formatPriceChecked(value: string | null): string {
  if (!value) {
    return "価格確認：未確認";
  }
  const parts = tokyoParts(value);
  if (!parts) {
    return "価格確認：未確認";
  }
  return `価格確認：${parts.month}月${parts.day}日 ${parts.hour}:${parts.minute}`;
}

export function formatPriceInfo(value: string | null): string {
  const checked = formatCheckedAt(value);
  if (checked === "未確認") {
    return "価格情報：未確認";
  }
  return `価格情報：${checked}確認`;
}

export function stockLabel(status: StockStatus, sample = true): string {
  switch (status) {
    case "in_stock":
      return sample ? "在庫あり（サンプル）" : "在庫あり";
    case "out_of_stock":
      return sample ? "在庫なし（サンプル）" : "在庫なし";
    case "unknown":
      return "在庫は未確認";
  }
}
