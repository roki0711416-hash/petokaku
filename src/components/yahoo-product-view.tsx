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

  const summary = <PriceSummary quote={quote} shopLabel={shopLabel} />;
  const sizes = <SizeChoices choices={sizeChoices} sizeLabel={product.sizeLabel} />;
  const image = <ProductImage imageUrl={imageUrl} alt={visibleName} />;

  return (
    <article className="mx-auto max-w-xl px-4 py-5 lg:max-w-6xl lg:py-8">
      <Breadcrumbs items={crumbs} />
      <div className="mt-4 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="lg:col-start-2">
          <p className="text-sm text-forest">{product.brand || "ブランドは販売店の表記によります"}</p>
          <h1 className="mt-1 text-xl leading-snug font-medium tracking-tight lg:text-3xl">{visibleName}</h1>
          <div className="mt-3 lg:mt-4">{sizes}</div>
          <div className="mt-4 rounded-[1.6rem] bg-card px-4 py-4 lg:mt-5 lg:bg-transparent lg:px-0 lg:py-0">{summary}</div>
          {product.offers.length > 0 ? (
            <p className="mt-5 hidden lg:block">
              <a
                href="#lowest-shop"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm text-white hover:bg-forest-deep"
              >
                最安ショップを見る
              </a>
            </p>
          ) : null}
        </div>
        <div className="mt-3 lg:col-start-1 lg:row-start-1 lg:mt-0">{image}</div>
      </div>
      {product.offers.length > 0 ? (
        <p className="mt-4 lg:hidden">
          <a
            href="#compare"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 text-sm text-white hover:bg-forest-deep"
          >
            価格比較を見る
          </a>
        </p>
      ) : null}
      <section id="compare" aria-labelledby="compare-heading" className="mt-8 scroll-mt-24 lg:mt-12">
        <div className="rounded-[1.6rem] bg-forest px-4 py-4 text-white lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0 lg:text-ink">
          <h2 id="compare-heading" className="text-lg font-medium lg:text-2xl">
            価格比較
          </h2>
          <p className="mt-1 text-sm text-white/90 lg:text-muted">ショップごとの価格です。</p>
        </div>
        <div className="mt-4">
          <OfferList
            offers={product.offers}
            quantity={product.quantity}
            quantityUnit={product.quantityUnit}
            unitPriceType={product.unitPriceType}
          />
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

function ProductImage({ imageUrl, alt }: { imageUrl: string | null; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] bg-sand/70">
      {imageUrl ? (
        // Yahooの画像URLは取得のたびにホストが変わり得るため、next/imageの許可リストには載せない。
        <img src={imageUrl} alt={alt} className="mx-auto h-36 w-full object-contain lg:h-72" />
      ) : (
        <p className="grid h-36 place-items-center text-muted lg:h-72">画像なし</p>
      )}
    </div>
  );
}

function SizeChoices({ choices, sizeLabel }: { choices: YahooSizeChoice[]; sizeLabel: string }) {
  if (choices.length <= 1) {
    return <p className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm text-card">{sizeLabel}</p>;
  }
  return (
    <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="容量">
      {choices.map((choice) => (
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
