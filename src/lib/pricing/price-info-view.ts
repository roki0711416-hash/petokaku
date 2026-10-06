import { formatYen } from "../format.ts";
import { summarizePriceHistory, type PriceHistoryOffer, type PriceHistorySummary } from "./price-history-summary.ts";
import type { ShippingStatus, StockStatus } from "../types.ts";

export type PriceInfoOffer = {
  id: string;
  packCount: number | null;
  listingTitle: string | null;
  price: number | null;
  shippingFee: number | null;
  shippingStatus: ShippingStatus;
  stockStatus: StockStatus;
};

export type PriceInfoStat = {
  label: string;
  value: number;
};

export type PriceInfoView = {
  shippingTotal: number | null;
  sellingPrice: number | null;
  sellingNote: string | null;
  history:
    | { kind: "hidden" }
    | { kind: "accumulating"; title: string; lines: string[] }
    | { kind: "reference"; title: string; note: string; stats: PriceInfoStat[] }
    | { kind: "comparable"; title: string; stats: PriceInfoStat[]; lines: string[] };
};

function sellingNote(summary: PriceHistorySummary): string | null {
  if (summary.currentSellingPrice == null) {
    return null;
  }
  if (!summary.currentSellingShippingKnown) {
    return "送料はショップで確認";
  }
  if (summary.currentShippingTotal != null && summary.currentSellingPrice === summary.currentShippingTotal) {
    return "送料無料";
  }
  return "支払総額は送料込み最安を見てください";
}

function dayLabel(days: number): string {
  return `価格データ：${days}日分`;
}

function shippingStats(summary: PriceHistorySummary, prefix: string): PriceInfoStat[] {
  return [
    summary.low30ShippingTotal != null ? { label: `${prefix}送料込みの30日最安`, value: summary.low30ShippingTotal } : null,
    summary.average30ShippingTotal != null ? { label: `${prefix}送料込みの30日平均`, value: summary.average30ShippingTotal } : null,
  ].filter((stat): stat is PriceInfoStat => stat != null);
}

function itemStats(summary: PriceHistorySummary, prefix: string): PriceInfoStat[] {
  return [
    summary.low30SellingPrice != null ? { label: `${prefix}30日の商品価格最安`, value: summary.low30SellingPrice } : null,
    summary.average30SellingPrice != null ? { label: `${prefix}30日の商品価格平均`, value: summary.average30SellingPrice } : null,
  ].filter((stat): stat is PriceInfoStat => stat != null);
}

function comparisonLines(current: number, average: number, low: number, subject: string): string[] {
  const averageYen = Math.round(average);
  const diff = averageYen - current;
  const lines: string[] = [];
  if (diff === 0) {
    lines.push(`${subject}は、過去30日の平均と同じ`);
  } else {
    const percent = averageYen > 0 ? Math.round((Math.abs(diff) / averageYen) * 100) : 0;
    const direction = diff > 0 ? "安い" : "高い";
    const amount = formatYen(Math.abs(diff));
    lines.push(percent > 0 ? `${subject}は、過去30日の平均より${amount}（${percent}%）${direction}` : `${subject}は、過去30日の平均より${amount}${direction}`);
  }
  if (current === low) {
    lines.push("記録期間内の最安値");
  } else if (current > low) {
    lines.push(`記録期間内の最安より${formatYen(current - low)}高い`);
  }
  return lines;
}

function historyFromSummary(summary: PriceHistorySummary): PriceInfoView["history"] {
  if (summary.sufficiency === "accumulating") {
    const lines = ["まだ十分な履歴がないため、価格傾向の判定は行っていません"];
    if (summary.observedDays === 1) {
      lines.unshift("1日分の価格を記録しています");
    }
    return { kind: "accumulating", title: "価格データを蓄積中", lines };
  }
  const shipping = shippingStats(summary, summary.sufficiency === "reference" ? "参考・" : "");
  const stats = shipping.length > 0 ? shipping : itemStats(summary, summary.sufficiency === "reference" ? "参考・" : "");
  if (summary.sufficiency === "reference") {
    return {
      kind: "reference",
      title: dayLabel(summary.observedDays),
      note: "記録が数日分のため、30日の金額は参考です。",
      stats,
    };
  }
  const shippingCurrent = summary.currentShippingTotal;
  const shippingAverage = summary.average30ShippingTotal;
  const shippingLow = summary.low30ShippingTotal;
  const sellingCurrent = summary.currentSellingPrice;
  const sellingAverage = summary.average30SellingPrice;
  const sellingLow = summary.low30SellingPrice;
  const lines =
    shippingCurrent != null && shippingAverage != null && shippingLow != null
      ? comparisonLines(shippingCurrent, shippingAverage, shippingLow, "送料込み")
      : sellingCurrent != null && sellingAverage != null && sellingLow != null
        ? comparisonLines(sellingCurrent, sellingAverage, sellingLow, "商品価格")
        : [];
  return { kind: "comparable", title: dayLabel(summary.observedDays), stats, lines };
}

function viewFromSummary(summary: PriceHistorySummary, history: PriceInfoView["history"]): PriceInfoView {
  return {
    shippingTotal: summary.currentShippingTotal,
    sellingPrice: summary.currentSellingPrice,
    sellingNote: sellingNote(summary),
    history,
  };
}

export function priceInfoView(input: { summary: PriceHistorySummary | null; offers: PriceInfoOffer[]; now?: string }): PriceInfoView {
  if (input.summary) {
    return viewFromSummary(input.summary, historyFromSummary(input.summary));
  }
  const now = input.now ?? new Date().toISOString();
  const offers: PriceHistoryOffer[] = input.offers.map((offer) => ({
    id: offer.id,
    packCount: offer.packCount,
    listingTitle: offer.listingTitle,
    observations: [
      {
        id: offer.id,
        price: offer.price,
        shippingFee: offer.shippingFee,
        shippingStatus: offer.shippingStatus,
        stockStatus: offer.stockStatus,
        observedAt: now,
      },
    ],
  }));
  return viewFromSummary(summarizePriceHistory({ now, offers }), { kind: "hidden" });
}
