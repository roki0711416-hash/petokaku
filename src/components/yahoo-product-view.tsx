import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { MallCompare } from "@/components/mall-compare";
import { PriceHistory } from "@/components/ui/price-history";
import { PriceSummary } from "@/components/ui/price-summary";
import { categorySearchHref, getCategory } from "@/lib/categories";
import { formatUnitAmount, formatYen } from "@/lib/format";
import { readableListingTitle as compactVisibleTitle } from "@/lib/pricing/display-title";
import { unknownQuantityLabel } from "@/lib/pricing/quantity-parse";
import type { DailyPricePoint, PriceHistorySummary } from "@/lib/pricing/price-history-summary";
import { shopProductLink } from "@/lib/pricing/shop-link";
import { comparisonCountLabel } from "@/lib/pricing/visible-offers";
import { productStructuredData } from "@/lib/seo/product-jsonld";
import { getSiteUrl } from "@/lib/site";
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
  const sizes = <SizeChoices choices={sizeChoices} />;
  const capacity = product.sizeLabel && product.sizeLabel !== unknownQuantityLabel ? product.sizeLabel : null;
  const structured = productStructuredData({
    name: visibleName,
    brand: product.brand,
    janCode: product.janCode,
    imageUrl,
    pageUrl: new URL(pageHref, getSiteUrl()).toString(),
    sizeLabel: capacity,
    offers: product.offers.map((offer) => ({
      shopName: offer.shopName,
      price: offer.price,
      url: shopProductLink(offer).href,
      stockStatus: offer.stockStatus,
    })),
  });

  return (
    <article className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <Breadcrumbs items={crumbs} />
      {structured ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} /> : null}
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
        <ProductImage imageUrl={imageUrl} alt={visibleName} />
        <div>
          <p className="text-sm tracking-[0.08em] text-sage">{product.brand.trim() || "ブランド情報なし"}</p>
          <h1 className="mt-2 text-2xl leading-snug font-medium tracking-tight text-ink md:text-4xl">{visibleName}</h1>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-line py-4">
            <div>
              <dt className="text-xs text-muted">JANコード</dt>
              <dd className="mt-1 text-sm text-ink">{product.janCode ?? "情報なし"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">容量</dt>
              <dd className="mt-1 text-sm text-ink">{capacity ?? "情報なし"}</dd>
            </div>
          </dl>
          {sizeChoices.length > 1 ? <div className="mt-4">{sizes}</div> : null}
          <div className="mt-6">{summary}</div>
          {product.offers.length > 0 ? (
            <p className="mt-6">
              <a
                href="#compare"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 text-sm text-white hover:bg-forest-deep lg:w-auto"
              >
                価格比較を見る
              </a>
            </p>
          ) : null}
        </div>
      </div>
      <section id="compare" aria-labelledby="compare-heading" className="mt-12 scroll-mt-24 border-t border-line pt-10 lg:mt-16">
        <h2 id="compare-heading" className="text-2xl font-medium tracking-tight text-ink">
          モールごとの価格
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          同じJANコードの掲載だけを、モールごとに並べています。容量違い、セット、別商品は混ぜていません。送料が確認できた掲載だけ合計額を出します。
        </p>
        {product.offers.some((offer) => shopProductLink(offer).affiliate) ? (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            報酬のあるリンクには「広告」と表示しています。表示価格は、成果報酬では決めていません。
          </p>
        ) : null}
        <div className="mt-6">
          <MallCompare
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
    </article>
  );
}

function ProductImage({ imageUrl, alt }: { imageUrl: string | null; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-line bg-card">
      {imageUrl ? (
        // Yahooの画像URLは取得のたびにホストが変わり得るため、next/imageの許可リストには載せない。
        <img src={imageUrl} alt={alt} className="aspect-square w-full object-contain p-6 md:p-10" />
      ) : (
        <div className="grid aspect-square place-items-center bg-moss px-8 text-center">
          <div>
            <p className="text-xs tracking-[0.18em] text-sage">PETOKAKU</p>
            <p className="mt-3 text-base text-ink">商品画像なし</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SizeChoices({ choices }: { choices: YahooSizeChoice[] }) {
  if (choices.length <= 1) {
    return null;
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
  const price = choice.quote.sellingPrice == null ? "" : ` 商品価格 ${formatYen(choice.quote.sellingPrice)}`;
  const unit =
    choice.quote.itemUnitYen != null && choice.quote.unitLabel
      ? ` 参考単価 ${formatUnitAmount({ yen: choice.quote.itemUnitYen, exact: choice.quote.itemUnitExact }, choice.quote.unitLabel)}`
      : "";
  const best = choice.isBestItemUnit ? " 参考単価がこの中で低い" : "";
  return `${choice.label}${price}${unit}${best}`;
}
