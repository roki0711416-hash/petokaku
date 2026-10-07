import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { OfferList } from "@/components/offer-list";
import { PriceHistory } from "@/components/ui/price-history";
import { PriceSummary } from "@/components/ui/price-summary";
import { categorySearchHref, getCategory } from "@/lib/categories";
import { formatUnitAmount, formatYen } from "@/lib/format";
import { readableListingTitle as compactVisibleTitle } from "@/lib/pricing/display-title";
import type { DailyPricePoint, PriceHistorySummary } from "@/lib/pricing/price-history-summary";
import { comparisonCountLabel } from "@/lib/pricing/visible-offers";
import { readableListingTitle as cleanListingTitle } from "@/lib/sources/yahoo/listing-title";
import { quoteSingleSize, type SingleSizeQuote } from "@/lib/sources/yahoo/size-family";
import type { ProductDetail } from "@/lib/types";
import { safeHttpUrl } from "@/lib/urls";

export type YahooSizeChoice = {
  janCode: string;
  label: string;
  href: string;
  current: boolean;
  quote: SingleSizeQuote;
  isBestItemUnit: boolean;
};

export function YahooProductView({
  product,
  pageHref,
  sizeChoices = [],
  priceSummary,
  priceSeries = [],
  priceCheckedAt,
}: {
  product: ProductDetail;
  pageHref: string;
  sizeChoices?: YahooSizeChoice[];
  priceSummary?: PriceHistorySummary | null;
  priceSeries?: DailyPricePoint[];
  priceCheckedAt?: string;
}) {
  const quote = quoteSingleSize({
    offers: product.offers,
    quantity: product.quantity,
    quantityUnit: product.quantityUnit,
    quantityConfidence: product.quantityConfidence,
    unitPriceType: product.unitPriceType,
  });
  const category = getCategory(product.category);
  const imageUrl = safeHttpUrl(product.imageUrl);
  const visibleName = compactVisibleTitle(cleanListingTitle(product.name));
  const shopLabel = comparisonCountLabel(product.offers);
  const crumbs: Crumb[] = [
    { label: "ホーム", href: "/" },
    { label: category.label, href: categorySearchHref(category.id) },
    { label: visibleName, href: pageHref, current: true },
  ];

  return (
    <article className="mx-auto max-w-xl px-4 py-5 md:py-8">
      <Breadcrumbs items={crumbs} />
      <p className="mt-5 text-sm text-forest">{product.brand || "ブランドは販売店の表記によります"}</p>
      <h1 className="mt-1 text-2xl leading-snug font-medium tracking-tight">{visibleName}</h1>
      <div className="mt-4 overflow-hidden rounded-[1.6rem] bg-sand/70">
        {imageUrl ? (
          // Yahooの画像URLは取得のたびにホストが変わり得るため、next/imageの許可リストには載せない。
          <img src={imageUrl} alt={visibleName} className="mx-auto h-56 w-full object-contain md:h-72" />
        ) : (
          <p className="grid h-56 place-items-center text-muted md:h-72">画像なし</p>
        )}
      </div>
      {sizeChoices.length > 1 ? (
        <div className="mt-4 flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="容量">
          {sizeChoices.map((choice) => (
            <Link
              key={choice.janCode}
              href={choice.href}
              aria-current={choice.current ? "page" : undefined}
              aria-label={sizeChoiceLabel(choice)}
              className={
                choice.current
                  ? "inline-flex min-h-11 shrink-0 items-center rounded-full bg-ink px-4 text-sm text-card"
                  : "inline-flex min-h-11 shrink-0 items-center rounded-full bg-card px-4 text-sm text-ink"
              }
            >
              {choice.label}
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card">{product.sizeLabel}</p>
      )}
      <hr className="mt-5 border-line" />
      <div className="mt-5">
        <PriceSummary quote={quote} shopLabel={shopLabel} />
      </div>
      {product.offers.length > 0 ? (
        <p className="mt-5">
          <a
            href="#lowest-shop"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 text-sm text-white hover:bg-forest-deep"
          >
            最安ショップを見る
          </a>
        </p>
      ) : null}
      <hr className="mt-6 border-line" />
      <section id="compare" aria-labelledby="compare-heading" className="mt-6 scroll-mt-24">
        <h2 id="compare-heading" className="text-xl font-medium">
          価格比較
        </h2>
        <div className="mt-4">
          <OfferList offers={product.offers} />
        </div>
      </section>

      {priceSummary !== undefined ? (
        <PriceHistory summary={priceSummary} offers={product.offers} series={priceSeries} now={priceCheckedAt} />
      ) : null}
      {priceSummary !== undefined ? (
        <PriceHistory summary={priceSummary} offers={product.offers} series={priceSeries} now={priceCheckedAt} chart />
      ) : null}

      <section aria-labelledby="notice-heading" className="mt-8 rounded-[1.6rem] bg-honey/50 px-4 py-5">
        <h2 id="notice-heading" className="text-base font-medium">
          購入前に確認すること
        </h2>
        <ul className="mt-2 grid list-disc gap-1 pl-5 text-xs leading-6">
          <li>金額、送料、在庫は取得時点の情報です。ショップ側で変わることがあります。</li>
          <li>購入前に、ショップのページで価格、送料、在庫、内容量を確認してください。</li>
          <li>このページは最安を保証しません。ペトカクは商品を販売せず、購入の契約には入りません。</li>
          {product.janCode ? <li>JAN {product.janCode}</li> : null}
        </ul>
      </section>
    </article>
  );
}

function sizeChoiceLabel(choice: YahooSizeChoice): string {
  const price = choice.quote.sellingPrice == null ? "" : ` 最安価格 ${formatYen(choice.quote.sellingPrice)}`;
  const unit =
    choice.quote.itemUnitYen != null && choice.quote.unitLabel
      ? ` 参考単価 ${formatUnitAmount({ yen: choice.quote.itemUnitYen, exact: choice.quote.itemUnitExact }, choice.quote.unitLabel)}`
      : "";
  const best = choice.isBestItemUnit ? " 参考単価がこの中で低い" : "";
  return `${choice.label}${price}${unit}${best}`;
}
