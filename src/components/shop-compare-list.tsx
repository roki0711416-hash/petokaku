import { formatYen, stockLabel } from "@/lib/format";
import type { QuantityUnit, UnitPriceType } from "@/lib/pricing/calculate";
import { mallVisitLabel } from "@/lib/pricing/malls";
import { referenceLiterUnitLines } from "@/lib/pricing/reference-unit";
import type { CompareSort } from "@/lib/pricing/shop-compare";
import { shopProductLink } from "@/lib/pricing/shop-link";
import { payableTotal } from "@/lib/pricing/visible-offers";
import { offerUnitLabel, shippingCell, shippingLine } from "@/components/ui/shop-card";
import type { Offer } from "@/lib/types";

const mallLabel: Record<string, string> = {
  yahoo: "Yahoo!ショッピング",
  rakuten: "楽天市場",
};

export function ShopCompareList({
  offers,
  ranks,
  sort = "item",
  quantity = null,
  quantityUnit = null,
  unitPriceType = "none",
}: {
  offers: Offer[];
  ranks: (number | null)[] | null;
  sort?: CompareSort;
  quantity?: number | null;
  quantityUnit?: QuantityUnit | null;
  unitPriceType?: UnitPriceType;
}) {
  return (
    <>
      <ol className="grid gap-2 md:hidden">
        {offers.map((offer, index) => (
          <MobileShop
            key={offer.id}
            offer={offer}
            rank={ranks ? (ranks[index] ?? null) : null}
            showRank={ranks != null}
            sort={sort}
            quantity={quantity}
            quantityUnit={quantityUnit}
            unitPriceType={unitPriceType}
          />
        ))}
      </ol>
      <div className="hidden overflow-hidden rounded-xl border border-line bg-card md:block">
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
              <DesktopRow
                key={offer.id}
                offer={offer}
                rank={ranks ? (ranks[index] ?? null) : null}
                showRank={ranks != null}
                sort={sort}
                quantity={quantity}
                quantityUnit={quantityUnit}
                unitPriceType={unitPriceType}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function UnitHints({
  offer,
  quantity,
  quantityUnit,
  unitPriceType,
  align = "left",
}: {
  offer: Offer;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
  align?: "left" | "right";
}) {
  const unit = offerUnitLabel(offer, quantity, quantityUnit, unitPriceType);
  const liter = referenceLiterUnitLines(offer, quantity, quantityUnit, unitPriceType);
  if (!unit && !liter.item && !liter.shippingTotal) {
    return null;
  }
  return (
    <div className={`grid gap-0.5 text-xs leading-5 text-muted ${align === "right" ? "text-right" : ""}`}>
      {unit ? <p>参考単価 {unit}</p> : liter.item ? <p>{liter.item}</p> : null}
      {liter.shippingTotal ? <p>{liter.shippingTotal}</p> : null}
    </div>
  );
}

function MobileShop({
  offer,
  rank,
  showRank,
  sort,
  quantity,
  quantityUnit,
  unitPriceType,
}: {
  offer: Offer;
  rank: number | null;
  showRank: boolean;
  sort: CompareSort;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
}) {
  const first = rank === 1;
  const total = payableTotal(offer);
  const totalReady = total != null;
  const emphasizeTotal = sort === "total" && totalReady;
  const headline = emphasizeTotal ? formatYen(total) : offer.price == null ? "情報なし" : formatYen(offer.price);
  const headlineLabel = emphasizeTotal ? "送料込み" : "商品価格";
  return (
    <li className={first ? "rounded-2xl border border-forest bg-moss/60 px-3 py-3" : "rounded-2xl border border-line bg-card px-3 py-3"}>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {showRank ? <RankLabel rank={rank} /> : null}
        {first && emphasizeTotal ? (
          <span className="rounded-full bg-forest px-2 py-0.5 text-xs font-bold text-white">送料込み最安</span>
        ) : null}
        <p className="text-xs font-medium text-sage">{mallLabel[offer.provider] ?? "ショップ"}</p>
      </div>
      <h3 className="mt-0.5 break-words text-base leading-6 font-bold text-ink">{offer.shopName}</h3>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">{headlineLabel}</p>
          <p className="price-num text-3xl leading-none font-semibold text-ink">{headline}</p>
        </div>
        <div className="w-[8.25rem] shrink-0">
          <VisitLink offer={offer} buyLabel />
        </div>
      </div>

      <p className="mt-2 text-sm leading-5 text-ink">
        {totalReady ? shippingCell(offer) : shippingLine(offer)}
        <span className="px-1.5 text-line">/</span>
        {stockLabel(offer.stockStatus, offer.isSample)}
        {emphasizeTotal && offer.price != null ? (
          <>
            <span className="px-1.5 text-line">/</span>
            本体 {formatYen(offer.price)}
          </>
        ) : null}
        {!emphasizeTotal && totalReady ? (
          <>
            <span className="px-1.5 text-line">/</span>
            送料込み {formatYen(total)}
          </>
        ) : null}
      </p>
      <div className="mt-1">
        <UnitHints offer={offer} quantity={quantity} quantityUnit={quantityUnit} unitPriceType={unitPriceType} />
      </div>
    </li>
  );
}

function DesktopRow({
  offer,
  rank,
  showRank,
  sort,
  quantity,
  quantityUnit,
  unitPriceType,
}: {
  offer: Offer;
  rank: number | null;
  showRank: boolean;
  sort: CompareSort;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
}) {
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
        <UnitHints offer={offer} quantity={quantity} quantityUnit={quantityUnit} unitPriceType={unitPriceType} />
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

function VisitLink({ offer, buyLabel = false }: { offer: Offer; buyLabel?: boolean }) {
  const link = shopProductLink(offer);
  const label = buyLabel ? "ショップで購入" : mallVisitLabel(offer.provider);
  const className = buyLabel
    ? "inline-flex min-h-11 w-full items-center justify-center rounded-full bg-forest px-2 text-[13px] font-bold whitespace-nowrap text-white hover:bg-forest-deep"
    : "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-forest px-3 text-sm font-medium text-white hover:bg-forest-deep";
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
    </div>
  );
}
