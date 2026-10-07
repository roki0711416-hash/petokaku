import { formatYen, stockLabel } from "@/lib/format";
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
  anchorId,
}: {
  offer: Offer;
  lowestTotal: number | null;
  rank: number;
  anchorId?: string;
}) {
  const total = payableTotal(offer);
  const isLowestTotal = rank === 1 && total != null && total === lowestTotal;
  const headline = isLowestTotal && total != null ? total : offer.price;

  return (
    <li id={anchorId} className="scroll-mt-24 border-b border-line py-5">
      <div className="flex flex-wrap items-center gap-2">
        {isLowestTotal ? (
          <p className="rounded-full bg-forest px-3 py-1 text-xs text-white">最安</p>
        ) : (
          <p className="text-sm text-muted">{rank}位</p>
        )}
        {offer.isSample ? <p className="rounded-full bg-sand px-3 py-1 text-xs text-clay">サンプル</p> : null}
      </div>
      <h3 className="mt-2 text-base font-medium text-ink">{offer.shopName}</h3>
      <p className="price-num mt-2 text-3xl leading-none text-ink">{headline == null ? "価格未確認" : formatYen(headline)}</p>
      <p className="mt-2 text-sm text-ink">{shippingLine(offer)}</p>
      <p className="mt-1 text-sm text-muted">{stockLabel(offer.stockStatus, offer.isSample)}</p>
      {total == null ? <p className="mt-2 text-xs leading-5 text-muted">送料が未確認のため、送料込み最安には含めていません。</p> : null}
      <div className="mt-4">
        <ViewProductButton offer={offer} />
      </div>
    </li>
  );
}
