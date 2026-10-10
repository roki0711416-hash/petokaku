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
    return `送料込みの掲載 ${formatYen(quote.shippingTotal)}`;
  }
  return "送料はショップで確認";
}

export function PriceSummary({ quote, shopLabel }: { quote: SingleSizeQuote; shopLabel: string }) {
  const shipping = shippingLine(quote);

  return (
    <div>
      <p className="text-sm text-muted">商品価格</p>
      <p className="mt-1 text-xs leading-5 text-muted">
        {quote.sellingPrice == null
          ? quote.sellingPriceWithheld
            ? "送料が確認できた単品がないため、最安値は出していません。"
            : "同じ容量の単品として比べられる掲載がないため、最安値は出していません。"
          : "在庫がある単品で、送料が確認できた掲載のうち、送料込みの合計がいちばん低い商品価格です。"}
      </p>
      <p className="price-num mt-1 text-5xl leading-none text-ink lg:text-6xl">
        {quote.sellingPrice == null ? "出していません" : formatYen(quote.sellingPrice)}
      </p>
      {shipping ? <p className="mt-2 text-base text-ink">{shipping}</p> : null}
      {quote.itemUnitYen != null && quote.unitLabel ? (
        <p className="mt-1 text-base font-medium text-forest-deep">
          参考単価 {formatUnitAmount({ yen: quote.itemUnitYen, exact: quote.itemUnitExact }, quote.unitLabel)}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">内容量が確定できないため、参考単価は出していません。</p>
      )}
      <p className="mt-2 text-sm text-ink">{shopLabel}</p>
    </div>
  );
}
