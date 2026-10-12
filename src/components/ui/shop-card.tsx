import { formatUnitAmount, formatYen, stockLabel } from "@/lib/format";
import { calculateUnitPrices, type QuantityUnit, type UnitPriceType } from "@/lib/pricing/calculate";
import { unitPriceQuantity } from "@/lib/pricing/quantity-parse";
import { mallVisitLabel } from "@/lib/pricing/malls";
import { shopProductLink } from "@/lib/pricing/shop-link";
import { payableTotal } from "@/lib/pricing/visible-offers";
import type { Offer } from "@/lib/types";

function shippingKind(offer: Offer): "conditional" | "free" | "unknown" | "amount" {
  if (offer.shippingStatus === "conditional_free") {
    return "conditional";
  }
  if (offer.shippingFee === 0 || offer.shippingStatus === "free") {
    return "free";
  }
  if (offer.shippingFee == null) {
    return "unknown";
  }
  return "amount";
}

export function shippingLine(offer: Offer): string {
  switch (shippingKind(offer)) {
    case "conditional":
      return "条件付き送料無料（金額はショップで確認）";
    case "free":
      return "送料無料";
    case "unknown":
      return "送料不明";
    case "amount":
      return `送料 ${formatYen(offer.shippingFee ?? 0)}`;
  }
}

export function shippingCell(offer: Offer): string {
  switch (shippingKind(offer)) {
    case "conditional":
      return "条件付き";
    case "free":
      return "送料無料";
    case "unknown":
      return "送料不明";
    case "amount":
      return formatYen(offer.shippingFee ?? 0);
  }
}

export function offerHeadline(offer: Offer, lowestTotal: number | null, rank: number) {
  const total = payableTotal(offer);
  const isLowestTotal = rank === 1 && total != null && total === lowestTotal;
  const headline = isLowestTotal && total != null ? total : offer.price;
  return { total, isLowestTotal, headline };
}

export function offerUnitLabel(
  offer: Offer,
  quantity: number | null,
  quantityUnit: QuantityUnit | null,
  unitPriceType: UnitPriceType,
): string | null {
  const pricedQuantity = offer.unitPriceReady ? unitPriceQuantity(quantity, offer.packCount, offer.totalQuantity) : null;
  const unitPrice = calculateUnitPrices({
    price: offer.price,
    shipping: offer.shippingFee,
    quantity: pricedQuantity,
    quantityUnit,
    unitPriceType,
  });
  if (!unitPrice.itemUnit || !unitPrice.unitLabel) {
    return null;
  }
  const prefix = offer.packCount != null && offer.packCount > 1 ? "セット全体 " : "";
  return `${prefix}${formatUnitAmount(unitPrice.itemUnit, unitPrice.unitLabel)}`;
}

function ShopVisit({ offer, wide }: { offer: Offer; wide?: boolean }) {
  const link = shopProductLink(offer);
  const href = link.href;
  const isAdvertisement = link.affiliate;
  const label = mallVisitLabel(offer.provider);
  const className = wide
    ? "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-forest px-4 text-sm font-medium text-white hover:bg-forest-deep"
    : "inline-flex min-h-11 max-w-full items-center justify-center rounded-full bg-forest px-4 text-sm whitespace-nowrap text-white hover:bg-forest-deep";

  if (!href) {
    return (
      <div>
        <button type="button" className={`${className} cursor-not-allowed opacity-80`} disabled>
          {label}
        </button>
        <p className="mt-1 text-xs leading-5 text-muted">サンプルのため、販売ページはありません。</p>
      </div>
    );
  }

  return (
    <div>
      {isAdvertisement ? <p className="mb-1 text-xs font-medium text-clay">広告</p> : null}
      <a
        href={href}
        target="_blank"
        rel={isAdvertisement ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
        className={className}
      >
        {label}
      </a>
    </div>
  );
}

export function ShopCard({
  offer,
  rank,
  mallLabel = null,
  reference = false,
  itemCheapest = false,
  totalCheapest = false,
  quantity = null,
  quantityUnit = null,
  unitPriceType = "none",
}: {
  offer: Offer;
  rank: number;
  mallLabel?: string | null;
  reference?: boolean;
  itemCheapest?: boolean;
  totalCheapest?: boolean;
  quantity?: number | null;
  quantityUnit?: QuantityUnit | null;
  unitPriceType?: UnitPriceType;
}) {
  const total = payableTotal(offer);
  const highlighted = itemCheapest || totalCheapest;
  const unit = offerUnitLabel(offer, quantity, quantityUnit, unitPriceType);
  const showRank = !reference && !mallLabel && rank > 0;

  return (
    <li className={highlighted ? "flex min-w-0 flex-col rounded-2xl border border-forest bg-moss/60 p-4" : "flex min-w-0 flex-col rounded-2xl border border-line bg-card p-4"}>
      <div className="min-w-0">
        {mallLabel ? <p className="text-xs font-medium tracking-wide text-sage">{mallLabel}</p> : null}
        {reference ? <p className="text-xs text-muted">参考価格</p> : null}
        {showRank ? <p className="text-xs text-muted">{rank}位</p> : null}
        <h3 className="mt-0.5 break-words text-base font-medium leading-6 text-ink">{offer.shopName}</h3>
      </div>
      {itemCheapest || totalCheapest ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {itemCheapest ? <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-medium text-forest-deep">本体価格 最安</span> : null}
          {totalCheapest ? <span className="rounded-full bg-forest px-2.5 py-0.5 text-xs font-medium text-white">送料込み 最安</span> : null}
        </div>
      ) : null}
      <p className="price-num mt-3 text-3xl leading-none text-ink">{offer.price == null ? "情報なし" : formatYen(offer.price)}</p>
      {unit ? <p className="mt-1 text-xs text-muted">参考単価 {unit}</p> : null}
      {total == null ? (
        <p className="mt-3 text-sm leading-6 text-muted">{shippingLine(offer)}</p>
      ) : (
        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <dt className="text-xs text-muted">送料</dt>
            <dd className="mt-0.5 text-sm text-ink">{shippingCell(offer)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted">送料込み</dt>
            <dd className="price-num mt-0.5 text-lg text-ink">{formatYen(total)}</dd>
          </div>
        </dl>
      )}
      <p className="mt-2 text-xs text-muted">{stockLabel(offer.stockStatus, offer.isSample)}</p>
      {offer.isSample ? <p className="mt-1 text-xs text-clay">サンプル</p> : null}
      {reference ? <p className="mt-2 text-xs leading-5 text-muted">店舗ごとの個数と送料は未確認です。単品の順位には入れていません。</p> : null}
      <div className="mt-auto pt-4">
        <ShopVisit offer={offer} wide />
      </div>
    </li>
  );
}

export function ShopTable({
  offers,
  lowestTotal,
  quantity,
  quantityUnit,
  unitPriceType,
  mallLabel,
}: {
  offers: Offer[];
  lowestTotal: number | null;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
  mallLabel?: (offer: Offer) => string | null;
}) {
  return (
    <table className="w-full table-fixed border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-line text-xs text-muted">
          <th className="w-16 py-2 pr-2 font-medium">順位</th>
          <th className="w-28 py-2 pr-2 font-medium">価格</th>
          <th className="w-24 py-2 pr-2 font-medium">送料</th>
          <th className="w-28 py-2 pr-2 font-medium">在庫</th>
          <th className="w-36 py-2 pr-2 font-medium">参考単価</th>
          <th className="py-2 pr-2 font-medium">ショップ</th>
          <th className="w-32 py-2 font-medium">購入</th>
        </tr>
      </thead>
      <tbody>
        {offers.map((offer, index) => {
          const rank = index + 1;
          const { total } = offerHeadline(offer, lowestTotal, rank);
          const unit = offerUnitLabel(offer, quantity, quantityUnit, unitPriceType);
          return (
            <tr key={offer.id} className={total != null && total === lowestTotal ? "border-b border-line bg-moss" : "border-b border-line"}>
              <td className="py-3 pr-2 align-middle">
                {total != null && total === lowestTotal ? (
                  <span className="rounded-full bg-forest px-2 py-0.5 text-xs text-white">送料込み最安</span>
                ) : (
                  <span className="text-muted">{rank}位</span>
                )}
              </td>
              <td className="price-num py-3 pr-2 align-middle text-xl text-ink">
                {offer.price == null ? "情報なし" : formatYen(offer.price)}
                {total == null ? null : <span className="mt-1 block text-xs font-normal text-muted">合計 {formatYen(total)}</span>}
              </td>
              <td className="py-3 pr-2 align-middle">{shippingCell(offer)}</td>
              <td className="py-3 pr-2 align-middle">{stockLabel(offer.stockStatus, offer.isSample)}</td>
              <td className="py-3 pr-2 align-middle text-forest-deep">{unit ?? "—"}</td>
              <td className="min-w-0 break-words py-3 pr-2 align-middle font-medium text-ink">
                {offer.shopName}
                {mallLabel?.(offer) ? <span className="mt-0.5 block truncate text-xs font-normal text-muted">{mallLabel(offer)}</span> : null}
                {offer.isSample ? <span className="ml-2 text-xs font-normal text-clay">サンプル</span> : null}
              </td>
              <td className="py-3 align-middle">
                <ShopVisit offer={offer} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
