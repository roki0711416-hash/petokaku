import { formatPriceChecked, formatUnitAmount, formatYen, stockLabel } from "@/lib/format";
import { calculateUnitPrices, type QuantityUnit, type UnitPriceType } from "@/lib/pricing/calculate";
import { salesUnitLabel } from "@/lib/pricing/pack-count";
import { unitPriceQuantity } from "@/lib/pricing/quantity-parse";
import { shopProductLink } from "@/lib/pricing/shop-link";
import { payableTotal } from "@/lib/pricing/visible-offers";
import type { Offer } from "@/lib/types";

function shippingLine(offer: Offer): string {
  if (offer.shippingStatus === "conditional_free") {
    return "条件付き送料無料（金額はショップで確認）";
  }
  if (offer.shippingFee === 0 || offer.shippingStatus === "free") {
    return "送料無料";
  }
  if (offer.shippingFee == null) {
    return "送料はショップで確認";
  }
  return `送料 ${formatYen(offer.shippingFee)}`;
}

function ViewProductButton({ offer }: { offer: Offer }) {
  const link = shopProductLink(offer);
  const href = link.href;
  const isAdvertisement = link.affiliate;
  const className =
    "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-sm text-white hover:bg-forest-deep";

  if (!href) {
    return (
      <div>
        <button type="button" className={`${className} cursor-not-allowed opacity-80`} disabled>
          商品を見る
        </button>
        <p className="mt-2 text-xs leading-5 text-muted">サンプルのため、販売ページはありません。</p>
      </div>
    );
  }

  return (
    <div>
      {isAdvertisement ? <p className="mb-2 text-xs font-medium text-clay">広告</p> : null}
      <a
        href={href}
        target="_blank"
        rel={isAdvertisement ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
        className={className}
      >
        商品を見る
      </a>
      <p className="mt-2 text-xs leading-5 text-muted">
        {isAdvertisement ? "このリンクはアフィリエイト広告です。" : "外部サイトを開きます。"}
      </p>
    </div>
  );
}

export function ShopCard({
  offer,
  lowestTotal,
  rank,
  quantity,
  quantityUnit,
  unitPriceType,
}: {
  offer: Offer;
  lowestTotal: number | null;
  rank: number;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
}) {
  const total = payableTotal(offer);
  const pricedQuantity = offer.unitPriceReady ? unitPriceQuantity(quantity, offer.packCount, offer.totalQuantity) : null;
  const unitPrice = calculateUnitPrices({
    price: offer.price,
    shipping: offer.shippingFee,
    quantity: pricedQuantity,
    quantityUnit,
    unitPriceType,
  });
  const referenceUnit = unitPrice.itemUnit;
  const isLowestTotal = rank === 1 && total != null && total === lowestTotal;
  const headline = isLowestTotal && total != null ? total : offer.price;

  return (
    <li className={`lift flex h-full flex-col rounded-[1.8rem] bg-card p-5 ${isLowestTotal ? "ring-2 ring-forest" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        {isLowestTotal ? <p className="rounded-full bg-forest px-3 py-1 text-xs text-white">最安</p> : null}
        {offer.isSample ? <p className="rounded-full bg-sand px-3 py-1 text-xs text-clay">サンプル</p> : null}
      </div>
      <p className="price-num mt-3 text-4xl leading-none text-ink">{headline == null ? "価格未確認" : formatYen(headline)}</p>
      <h3 className="mt-3 text-lg font-medium text-ink">{offer.shopName}</h3>
      {offer.listingTitle ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{offer.listingTitle}</p> : null}
      {offer.packCount != null ? <p className="mt-2 text-sm text-ink">{salesUnitLabel(offer.packCount, offer.packUnit)}</p> : null}
      {isLowestTotal && total != null ? (
        <p className="mt-3 text-sm text-muted">
          販売価格 <span className="price-num text-ink">{offer.price == null ? "価格未確認" : formatYen(offer.price)}</span>
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">{total == null ? "支払総額はショップで確認" : `支払総額 ${formatYen(total)}`}</p>
      )}
      <p className="mt-2 text-sm text-ink">{shippingLine(offer)}</p>
      {referenceUnit && unitPrice.unitLabel ? (
        <p className="mt-3 text-sm text-muted">
          {offer.packCount != null && offer.packCount > 1 ? "セット全体の参考単価 " : "参考単価 "}
          {formatUnitAmount(referenceUnit, unitPrice.unitLabel)}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-muted">{formatPriceChecked(offer.priceCheckedAt)}</p>
      <p className="mt-2 text-sm">
        <span className="text-muted">在庫 </span>
        {stockLabel(offer.stockStatus, offer.isSample)}
      </p>
      {total == null ? <p className="mt-3 text-xs leading-5 text-muted">送料が未確認のため、送料込み最安には含めていません。</p> : null}
      <div className="mt-4">
        <ViewProductButton offer={offer} />
      </div>
    </li>
  );
}
