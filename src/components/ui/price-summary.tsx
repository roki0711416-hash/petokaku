import { formatUnitAmount, formatYen } from "@/lib/format";
import type { SingleSizeQuote } from "@/lib/sources/yahoo/size-family";

export function PriceSummary({ quote }: { quote: SingleSizeQuote }) {
  return (
    <div className="rounded-[1.8rem] bg-card px-5 py-5">
      <p className="text-sm text-muted">現在の最安価格</p>
      <p className="price-num mt-2 text-4xl leading-none text-ink md:text-5xl">
        {quote.sellingPrice == null ? "確認できません" : formatYen(quote.sellingPrice)}
      </p>
      {quote.sellingPrice != null && !quote.sellingShippingKnown ? (
        <p className="mt-2 text-sm text-ink">送料はショップで確認</p>
      ) : null}
      {quote.shippingTotal != null ? (
        <p className="mt-4 text-sm text-muted">
          送料込み最安 <span className="price-num text-xl text-ink">{formatYen(quote.shippingTotal)}</span>
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">送料が分かるショップがないため、送料込み最安は出していません。</p>
      )}
      {quote.itemUnitYen != null && quote.unitLabel ? (
        <p className="mt-2 text-sm text-muted">
          参考単価 {formatUnitAmount({ yen: quote.itemUnitYen, exact: quote.itemUnitExact }, quote.unitLabel)}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">内容量が確定できないため、参考単価は出していません。</p>
      )}
    </div>
  );
}
