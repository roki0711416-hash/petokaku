import { formatYen, stockLabel } from "@/lib/format";
import { mallVisitLabel } from "@/lib/pricing/malls";
import type { CompareSort } from "@/lib/pricing/shop-compare";
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
  ranks,
  sort = "item",
}: {
  offers: Offer[];
  ranks: (number | null)[] | null;
  sort?: CompareSort;
}) {
  return (
    <>
      <ol className="grid gap-2 lg:hidden">
        {offers.map((offer, index) => (
          <MobileShop key={offer.id} offer={offer} rank={ranks ? (ranks[index] ?? null) : null} showRank={ranks != null} sort={sort} />
        ))}
      </ol>
      <div className="hidden overflow-hidden rounded-xl border border-line bg-card lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-sand/70 text-xs text-muted">
              {ranks != null ? <th className="w-[8%] px-3 py-2 font-medium">順位</th> : null}
              <th className="w-[16%] px-3 py-2 font-medium">{sort === "total" ? "送料込み合計" : "商品価格"}</th>
              <th className="w-[14%] px-3 py-2 font-medium">送料</th>
              <th className="w-[12%] px-3 py-2 font-medium">在庫</th>
              <th className="px-3 py-2 font-medium">ショップ情報</th>
              <th className="w-[18%] px-3 py-2 font-medium">購入ボタン</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer, index) => (
              <DesktopRow key={offer.id} offer={offer} rank={ranks ? (ranks[index] ?? null) : null} showRank={ranks != null} sort={sort} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MobileShop({ offer, rank, showRank, sort }: { offer: Offer; rank: number | null; showRank: boolean; sort: CompareSort }) {
  const first = rank === 1;
  const total = payableTotal(offer);
  const showTotal = sort === "total" && total != null;
  return (
    <li className={first ? "rounded-xl border border-forest bg-moss/70 p-3" : "rounded-xl border border-line bg-card p-3"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {showRank ? <RankLabel rank={rank} /> : null}
          <p className="mt-1 text-xs font-medium text-sage">{mallLabel[offer.provider] ?? "ショップ"}</p>
          <h3 className="text-base font-medium leading-6 text-ink">{offer.shopName}</h3>
        </div>
        <div className="shrink-0 text-right">
          {showTotal ? <p className="text-xs text-muted">送料込み</p> : null}
          <p className="price-num text-3xl leading-none text-ink">{showTotal ? formatYen(total) : offer.price == null ? "情報なし" : formatYen(offer.price)}</p>
          {showTotal && offer.price != null ? <p className="mt-1 text-xs text-muted">本体 {formatYen(offer.price)}</p> : null}
        </div>
      </div>
      <p className="mt-2 text-sm text-ink">
        {shippingNote(offer)}
        <span className="px-1.5 text-line">/</span>
        {stockLabel(offer.stockStatus, offer.isSample)}
      </p>
      <div className="mt-3">
        <VisitLink offer={offer} />
      </div>
    </li>
  );
}

function DesktopRow({ offer, rank, showRank, sort }: { offer: Offer; rank: number | null; showRank: boolean; sort: CompareSort }) {
  const first = rank === 1;
  const total = payableTotal(offer);
  const showTotal = sort === "total" && total != null;
  return (
    <tr className={first ? "border-b border-line bg-moss/80" : "border-b border-line"}>
      {showRank ? (
        <td className="px-3 py-3 align-middle">
          <RankLabel rank={rank} />
        </td>
      ) : null}
      <td className="px-3 py-3 align-middle">
        <span className="price-num text-2xl text-ink">{showTotal ? formatYen(total) : offer.price == null ? "情報なし" : formatYen(offer.price)}</span>
        {showTotal && offer.price != null ? <p className="mt-1 text-xs text-muted">本体 {formatYen(offer.price)}</p> : null}
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{shippingNote(offer, true)}</td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{stockLabel(offer.stockStatus, offer.isSample)}</td>
      <td className="px-3 py-3 align-middle">
        <p className="text-xs text-sage">{mallLabel[offer.provider] ?? "ショップ"}</p>
        <p className="break-words text-base font-medium leading-6 text-ink">{offer.shopName}</p>
      </td>
      <td className="px-3 py-3 align-middle">
        <VisitLink offer={offer} />
      </td>
    </tr>
  );
}

function shippingNote(offer: Offer, inColumn = false): string {
  const unknown = offer.shippingFee == null && offer.shippingStatus !== "free" && offer.shippingStatus !== "conditional_free";
  if (unknown) {
    return "送料別・合計未確認";
  }
  return inColumn ? shippingCell(offer) : `送料 ${shippingCell(offer)}`;
}

function RankLabel({ rank }: { rank: number | null }) {
  if (rank == null) {
    return <span className="text-sm text-muted">—</span>;
  }
  return <span className={rank === 1 ? "text-base font-medium text-forest" : "text-base font-medium text-ink"}>{rank}位</span>;
}

function VisitLink({ offer }: { offer: Offer }) {
  const link = shopProductLink(offer);
  const label = mallVisitLabel(offer.provider);
  const className =
    "inline-flex min-h-11 w-full items-center justify-center rounded-full bg-forest px-3 text-sm font-medium text-white hover:bg-forest-deep";
  if (!link.href) {
    return (
      <button type="button" className={`${className} cursor-not-allowed opacity-70`} disabled>
        {label}
      </button>
    );
  }
  return (
    <div>
      <a
        href={link.href}
        target="_blank"
        rel={link.affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
        className={className}
      >
        {label}
        <span aria-hidden="true" className="ml-1">
          ↗
        </span>
      </a>
      {link.affiliate ? <p className="mt-1 text-center text-xs text-muted">広告</p> : null}
    </div>
  );
}
