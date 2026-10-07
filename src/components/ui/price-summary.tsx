import { formatUnitAmount, formatYen } from "@/lib/format";
import type { SingleSizeQuote } from "@/lib/sources/yahoo/size-family";

function shippingLine(quote: SingleSizeQuote): string | null {
  if (quote.sellingPrice == null) {
    return null;
  }
  if (!quote.sellingShippingKnown) {
    return "送料はショップで確認";
  }
  if (quote.shippingTotal != null && quote.shippingTotal === quote.sellingPrice) {
    return "送料無料";
  }
  if (quote.shippingTotal != null) {
    return `送料込み最安 ${formatYen(quote.shippingTotal)}`;
  }
  return "送料はショップで確認";
}

export function PriceSummary({ quote, shopLabel }: { quote: SingleSizeQuote; shopLabel: string }) {
  const shipping = shippingLine(quote);

  return (
    <div>
      <p className="text-sm text-muted">最安価格</p>
      <p className="price-num mt-1 text-4xl leading-none text-ink md:text-5xl">
        {quote.sellingPrice == null ? "確認できません" : formatYen(quote.sellingPrice)}
      </p>
      {shipping ? <p className="mt-3 text-sm text-ink">{shipping}</p> : null}
      {quote.itemUnitYen != null && quote.unitLabel ? (
        <p className="mt-1 text-sm text-muted">
          参考単価 {formatUnitAmount({ yen: quote.itemUnitYen, exact: quote.itemUnitExact }, quote.unitLabel)}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">内容量が確定できないため、参考単価は出していません。</p>
      )}
      <p className="mt-3 text-sm text-ink">{shopLabel}</p>
    </div>
  );
}
