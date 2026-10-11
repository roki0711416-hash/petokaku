import { formatUnitAmount, formatYen } from "@/lib/format";
import type { SingleSizeQuote } from "@/lib/sources/yahoo/size-family";

export function PriceSummary({ quote, shopLabel }: { quote: SingleSizeQuote; shopLabel: string }) {
  const unit =
    quote.itemUnitYen != null && quote.unitLabel
      ? formatUnitAmount({ yen: quote.itemUnitYen, exact: quote.itemUnitExact }, quote.unitLabel)
      : null;

  return (
    <div className="min-w-0 rounded-2xl border border-line bg-card px-4 py-3">
      <p className="text-xs text-sage">本体価格の最安</p>
      <p className="price-num mt-1 text-4xl leading-none text-forest md:text-5xl">
        {quote.lowestItemPrice == null ? "情報なし" : formatYen(quote.lowestItemPrice)}
      </p>
      {quote.shippingTotal != null ? (
        <p className="mt-2 text-sm text-muted">
          送料込み最安
          <span className="price-num ml-2 text-xl text-ink">{formatYen(quote.shippingTotal)}</span>
        </p>
      ) : null}
      {unit ? <p className="mt-1 text-xs text-muted">参考単価 {unit}</p> : null}
      <p className="mt-2 text-sm font-medium text-ink">{shopLabel}</p>
      <p className="text-xs leading-5 text-muted">取得できた掲載の範囲で比較しています。</p>
    </div>
  );
}
