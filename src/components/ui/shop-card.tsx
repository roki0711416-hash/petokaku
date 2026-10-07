import { formatUnitAmount, formatYen, stockLabel } from "@/lib/format";
import { calculateUnitPrices, type QuantityUnit, type UnitPriceType } from "@/lib/pricing/calculate";
import { unitPriceQuantity } from "@/lib/pricing/quantity-parse";
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
      return "送料はショップで確認";
    case "amount":
      return `送料 ${formatYen(offer.shippingFee ?? 0)}`;
  }
}

export function shippingCell(offer: Offer): string {
  switch (shippingKind(offer)) {
    case "conditional":
      return "条件付き";
    case "free":
      return "無料";
    case "unknown":
      return "未確認";
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

function ShopVisit({ offer, compact }: { offer: Offer; compact?: boolean }) {
  const link = shopProductLink(offer);
  const href = link.href;
  const isAdvertisement = link.affiliate;
  const className = compact
    ? "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-accent px-3 text-sm whitespace-nowrap text-white hover:bg-forest-deep"
    : "inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-4 text-sm whitespace-nowrap text-white hover:bg-forest-deep";

  if (!href) {
    return (
      <div className={compact ? "text-right" : ""}>
        <button type="button" className={`${className} cursor-not-allowed opacity-80`} disabled>
          商品を見る
        </button>
        <p className="mt-1 text-xs leading-5 text-muted">サンプルのため、販売ページはありません。</p>
      </div>
    );
  }

  return (
    <div className={compact ? "text-right" : ""}>
      {isAdvertisement ? <p className="mb-1 text-xs font-medium text-clay">広告</p> : null}
      <a
        href={href}
        target="_blank"
        rel={isAdvertisement ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
        className={className}
      >
        商品を見る →
      </a>
    </div>
  );
}

export function ShopCard({
  offer,
  lowestTotal,
  rank,
}: {
  offer: Offer;
  lowestTotal: number | null;
  rank: number;
}) {
  const { total, isLowestTotal, headline } = offerHeadline(offer, lowestTotal, rank);

  return (
    <li className={isLowestTotal ? "rounded-2xl border border-forest bg-moss px-3 py-3" : "rounded-2xl border border-line bg-card px-3 py-3"}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={isLowestTotal ? "text-xs font-medium text-forest-deep" : "text-xs text-muted"}>
            {isLowestTotal ? "最安" : `${rank}位`}
          </p>
          <h3 className="mt-0.5 truncate text-sm font-medium text-ink">{offer.shopName}</h3>
          {offer.isSample ? <p className="mt-1 text-xs text-clay">サンプル</p> : null}
          <p className="price-num mt-1 text-2xl leading-none text-ink">{headline == null ? "価格未確認" : formatYen(headline)}</p>
          <p className="mt-1 text-xs text-muted">
            {shippingLine(offer)} ・ {stockLabel(offer.stockStatus, offer.isSample)}
          </p>
          {total == null ? (
            <p className="mt-1 text-xs leading-5 text-muted">送料が未確認のため、送料込み最安には含めていません。</p>
          ) : null}
        </div>
        <ShopVisit offer={offer} compact />
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
}: {
  offers: Offer[];
  lowestTotal: number | null;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
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
          const { total, isLowestTotal, headline } = offerHeadline(offer, lowestTotal, rank);
          const unit = offerUnitLabel(offer, quantity, quantityUnit, unitPriceType);
          return (
            <tr key={offer.id} className={isLowestTotal ? "border-b border-line bg-moss" : "border-b border-line"}>
              <td className="py-3 pr-2 align-middle">
                {isLowestTotal ? (
                  <span className="rounded-full bg-forest px-2 py-0.5 text-xs text-white">最安</span>
                ) : (
                  <span className="text-muted">{rank}位</span>
                )}
              </td>
              <td className="price-num py-3 pr-2 align-middle text-xl text-ink">
                {headline == null ? "価格未確認" : formatYen(headline)}
                {total == null ? <span className="mt-1 block text-xs font-normal text-muted">送料未確認</span> : null}
              </td>
              <td className="py-3 pr-2 align-middle">{shippingCell(offer)}</td>
              <td className="py-3 pr-2 align-middle">{stockLabel(offer.stockStatus, offer.isSample)}</td>
              <td className="py-3 pr-2 align-middle text-forest-deep">{unit ?? "—"}</td>
              <td className="truncate py-3 pr-2 align-middle font-medium text-ink">
                {offer.shopName}
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
