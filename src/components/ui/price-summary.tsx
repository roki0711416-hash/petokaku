import { formatUnitAmount, formatYen } from "@/lib/format";
import type { SingleSizeQuote } from "@/lib/sources/yahoo/size-family";

export function PriceSummary({
  quote,
  shopLabel,
  retrievalLimited = false,
}: {
  quote: SingleSizeQuote;
  shopLabel: string;
  retrievalLimited?: boolean;
}) {
  const scope = `${retrievalLimited ? "APIの取得上限に達しています。" : ""}取得できた掲載の範囲です。全店舗の最安値ではありません。`;

  return (
    <div className="min-w-0">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-sm text-muted">本体価格の最安</p>
          <p className="mt-1 text-xs leading-5 text-muted">在庫がある同じ販売単位の商品価格です。送料は含みません。{scope}</p>
          <p className="price-num mt-1 text-4xl leading-none text-ink">
            {quote.lowestItemPrice == null ? "出していません" : formatYen(quote.lowestItemPrice)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted">送料込み最安</p>
          <p className="mt-1 text-xs leading-5 text-muted">送料が確認できた掲載の合計です。送料未確認は0円にしていません。{scope}</p>
          <p className="price-num mt-1 text-4xl leading-none text-ink">
            {quote.shippingTotal == null ? "出していません" : formatYen(quote.shippingTotal)}
          </p>
        </div>
      </div>
      {quote.itemUnitYen != null && quote.unitLabel ? (
        <p className="mt-3 text-sm font-medium text-forest-deep">
          送料込み最安の参考単価 {formatUnitAmount({ yen: quote.itemUnitYen, exact: quote.itemUnitExact }, quote.unitLabel)}
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">内容量が確定できないため、参考単価は出していません。</p>
      )}
      <p className="mt-2 text-sm text-ink">{shopLabel}</p>
    </div>
  );
}
