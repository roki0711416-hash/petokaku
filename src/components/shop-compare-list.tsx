import { formatYen, stockLabel } from "@/lib/format";
import { mallVisitLabel } from "@/lib/pricing/malls";
import { itemPriceGap } from "@/lib/pricing/shop-compare";
import { shopProductLink } from "@/lib/pricing/shop-link";
import { payableTotal } from "@/lib/pricing/visible-offers";
import { shippingCell } from "@/components/ui/shop-card";
import type { Offer } from "@/lib/types";

const mallLabel: Record<string, string> = {
  yahoo: "Yahoo!ショッピング",
  rakuten: "楽天市場",
};

export function ShopCompareList({
  offers,
  lowestItemPrice,
  showGap = true,
}: {
  offers: Offer[];
  lowestItemPrice: number | null;
  showGap?: boolean;
}) {
  return (
    <>
      <ol className="grid gap-2 lg:hidden">
        {offers.map((offer) => (
          <MobileShop key={offer.id} offer={offer} lowestItemPrice={lowestItemPrice} showGap={showGap} />
        ))}
      </ol>
      <div className="hidden overflow-hidden rounded-xl border border-line bg-card lg:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-sand/70 text-xs text-muted">
              <th className="w-[14%] px-3 py-2 font-medium">商品価格</th>
              {showGap ? <th className="w-[12%] px-3 py-2 font-medium">差額</th> : null}
              <th className="w-[12%] px-3 py-2 font-medium">送料</th>
              <th className="w-[14%] px-3 py-2 font-medium">合計価格</th>
              <th className="px-3 py-2 font-medium">ショップ名</th>
              <th className="w-[12%] px-3 py-2 font-medium">在庫状況</th>
              <th className="w-[16%] px-3 py-2 font-medium">購入リンク</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <DesktopRow key={offer.id} offer={offer} lowestItemPrice={lowestItemPrice} showGap={showGap} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MobileShop({ offer, lowestItemPrice, showGap }: { offer: Offer; lowestItemPrice: number | null; showGap: boolean }) {
  const gap = showGap ? itemPriceGap(offer.price, lowestItemPrice) : null;
  const cheapest = gap === 0;
  const total = payableTotal(offer);
  return (
    <li className={cheapest ? "rounded-xl border border-forest bg-moss/70 p-3" : "rounded-xl border border-line bg-card p-3"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-sage">{mallLabel[offer.provider] ?? "ショップ"}</p>
          <h3 className="text-sm font-medium leading-5 text-ink">{offer.shopName}</h3>
        </div>
        <div className="shrink-0 text-right">
          {showGap ? <Gap gap={gap} /> : null}
          <p className="price-num text-2xl leading-none text-ink">{offer.price == null ? "情報なし" : formatYen(offer.price)}</p>
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-sm text-ink">
        <div>
          <dt className="text-xs text-muted">送料</dt>
          <dd className="mt-0.5">{shippingCell(offer)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">合計</dt>
          <dd className="price-num mt-0.5">{total == null ? "不明" : formatYen(total)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">在庫</dt>
          <dd className="mt-0.5">{stockLabel(offer.stockStatus, offer.isSample)}</dd>
        </div>
      </dl>
      <div className="mt-3">
        <VisitLink offer={offer} />
      </div>
    </li>
  );
}

function DesktopRow({ offer, lowestItemPrice, showGap }: { offer: Offer; lowestItemPrice: number | null; showGap: boolean }) {
  const gap = showGap ? itemPriceGap(offer.price, lowestItemPrice) : null;
  const cheapest = gap === 0;
  const total = payableTotal(offer);
  return (
    <tr className={cheapest ? "border-b border-line bg-moss/80" : "border-b border-line"}>
      <td className="px-3 py-3 align-middle">
        <span className="price-num text-xl text-ink">{offer.price == null ? "情報なし" : formatYen(offer.price)}</span>
      </td>
      {showGap ? (
        <td className="px-3 py-3 align-middle">
          <Gap gap={gap} />
        </td>
      ) : null}
      <td className="px-3 py-3 align-middle text-sm text-ink">{shippingCell(offer)}</td>
      <td className="px-3 py-3 align-middle">
        <span className="price-num text-base text-ink">{total == null ? "不明" : formatYen(total)}</span>
      </td>
      <td className="px-3 py-3 align-middle">
        <p className="text-xs text-sage">{mallLabel[offer.provider] ?? "ショップ"}</p>
        <p className="break-words text-sm font-medium leading-5 text-ink">{offer.shopName}</p>
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{stockLabel(offer.stockStatus, offer.isSample)}</td>
      <td className="px-3 py-3 align-middle">
        <VisitLink offer={offer} />
      </td>
    </tr>
  );
}

function Gap({ gap }: { gap: number | null }) {
  if (gap == null) {
    return <span className="text-sm text-muted">—</span>;
  }
  if (gap === 0) {
    return <span className="inline-flex rounded-full bg-forest px-2 py-0.5 text-xs font-medium text-white">最安値</span>;
  }
  return <span className="text-sm text-muted">+{formatYen(gap)}</span>;
}

function VisitLink({ offer }: { offer: Offer }) {
  const link = shopProductLink(offer);
  const label = mallVisitLabel(offer.provider);
  const className =
    "inline-flex min-h-10 w-full items-center justify-center rounded-full bg-forest px-3 text-sm font-medium text-white hover:bg-forest-deep";
  if (!link.href) {
    return (
      <button type="button" className={`${className} cursor-not-allowed opacity-70`} disabled>
        {label}
      </button>
    );
  }
  return (
    <div>
      {link.affiliate ? <p className="mb-1 text-xs font-medium text-clay">広告</p> : null}
      <a
        href={link.href}
        target="_blank"
        rel={link.affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
        className={className}
      >
        {label}
      </a>
    </div>
  );
}
