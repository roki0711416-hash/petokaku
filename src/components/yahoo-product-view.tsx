import Link from "next/link";
import { AmazonAssociateLink } from "@/components/amazon-associate-link";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { MallCompare } from "@/components/mall-compare";
import { ProductSectionTabs } from "@/components/product-section-tabs";
import { PriceHistory } from "@/components/ui/price-history";
import type { RelatedArticleLink } from "@/lib/articles/related-for-jan";
import { categorySearchHref, getCategory } from "@/lib/categories";
import { formatUnitAmount, formatYen } from "@/lib/format";
import { readableListingTitle as compactVisibleTitle } from "@/lib/pricing/display-title";
import { unknownQuantityLabel } from "@/lib/pricing/quantity-parse";
import type { DailyPricePoint, PriceHistorySummary } from "@/lib/pricing/price-history-summary";
import { shopProductLink } from "@/lib/pricing/shop-link";
import { comparisonMallOf, offersComparableAsNew } from "@/lib/pricing/malls";
import { cheapestPrices, listingShopCounts, partitionShopComparison, isRakutenReferencePrice } from "@/lib/pricing/shop-compare";
import { productStructuredData } from "@/lib/seo/product-jsonld";
import { getSiteUrl } from "@/lib/site";
import { readableListingTitle as cleanListingTitle } from "@/lib/sources/yahoo/listing-title";
import type { SingleSizeQuote } from "@/lib/sources/yahoo/size-family";
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
  relatedArticles = [],
  priceSummary,
  priceSeries = [],
  priceCheckedAt,
  retrievalLimited = false,
  rakutenShopScope = "off",
  amazonUrl = null,
}: {
  product: ProductDetail;
  pageHref: string;
  sizeChoices?: YahooSizeChoice[];
  relatedArticles?: RelatedArticleLink[];
  priceSummary?: PriceHistorySummary | null;
  priceSeries?: DailyPricePoint[];
  priceCheckedAt?: string;
  retrievalLimited?: boolean;
  rakutenShopScope?: "off" | "ready" | "limited";
  amazonUrl?: string | null;
}) {
  const category = getCategory(product.category);
  const imageUrl = safeHttpUrl(product.imageUrl);
  const visibleName = compactVisibleTitle(cleanListingTitle(product.name));
  const brand = product.brand.trim();
  const hasAffiliate = Boolean(amazonUrl) || product.offers.some((offer) => shopProductLink(offer).affiliate);
  const crumbs: Crumb[] = [
    { label: "ホーム", href: "/" },
    { label: category.label, href: categorySearchHref(category.id) },
    { label: visibleName, href: pageHref, current: true },
  ];

  const capacity = product.sizeLabel && product.sizeLabel !== unknownQuantityLabel ? product.sizeLabel : null;
  const overview = productOverview(product);
  const tabs = [
    { id: "compare", label: "価格比較" },
    { id: "product-info", label: "商品情報" },
    ...(relatedArticles.length > 0 ? [{ id: "related-articles", label: "関連記事" }] : []),
  ];
  const structured = productStructuredData({
    name: visibleName,
    brand: product.brand,
    janCode: product.janCode,
    imageUrl,
    pageUrl: new URL(pageHref, getSiteUrl()).toString(),
    sizeLabel: capacity,
    offers: offersComparableAsNew(product.offers).flatMap((offer) => {
      if (offer.isSample || isRakutenReferencePrice(offer)) {
        return [];
      }
      return [
        {
          shopName: offer.shopName,
          price: offer.price,
          url: safeHttpUrl(offer.productUrl),
          stockStatus: offer.stockStatus,
        },
      ];
    }),
  });

  return (
    <article className="mx-auto min-w-0 max-w-6xl px-4 py-4 md:py-8">
      <Breadcrumbs items={crumbs} />
      {structured ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} /> : null}

      {/* スマホ：商品概要（画像を大きく、価格を目立たせる） */}
      <div className="mt-2 md:hidden">
        <ProductImage imageUrl={imageUrl} alt={visibleName} size="hero" />
        <p className={imageUrl ? "mt-3 text-sm font-medium text-sage" : "mt-2 text-sm font-medium text-sage"}>
          {brand ? brand : "メーカー情報なし"}
        </p>
        <h1 className="mt-0.5 break-words text-lg leading-snug font-bold tracking-tight text-ink">{visibleName}</h1>
        {capacity ? <p className="mt-0.5 text-sm text-muted">{capacity}</p> : null}
        {hasAffiliate ? <p className="mt-1 text-sm leading-5 text-muted">広告・アフィリエイトリンクを含みます</p> : null}
        <OverviewPrice overview={overview} />
        {sizeChoices.length > 1 ? (
          <div className="mt-3">
            <p className="mb-1.5 text-sm font-bold text-ink">容量・セット</p>
            <SizeChoices choices={sizeChoices} />
          </div>
        ) : null}
      </div>
      <ProductSectionTabs tabs={tabs} />

      {/* PC：従来に近いヘッダー構成 */}
      <header className="mt-3 hidden min-w-0 items-start gap-3 md:flex lg:flex">
        <div className="w-24 shrink-0">
          <ProductImage imageUrl={imageUrl} alt={visibleName} size="thumb" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-sage">{brand ? `メーカー ${brand}` : "メーカー情報なし"}</p>
          <h1 className="mt-0.5 text-xl leading-snug font-medium tracking-tight text-ink">{visibleName}</h1>
          {hasAffiliate ? <p className="mt-1 text-sm leading-5 text-muted">広告・アフィリエイトリンクを含みます</p> : null}
          <p className="mt-1 text-sm leading-5 text-muted">
            容量 {capacity ?? "情報なし"}
            <span className="px-1.5 text-line">/</span>
            JAN {product.janCode ?? "情報なし"}
          </p>
          {sizeChoices.length > 1 ? (
            <div className="mt-2">
              <SizeChoices choices={sizeChoices} />
            </div>
          ) : null}
        </div>
      </header>

      {product.offers.length > 0 ? (
        <section id="compare" aria-labelledby="compare-heading" className="scroll-mt-[var(--product-section-offset,7rem)] lg:scroll-mt-24">
          <MallCompare
            offers={product.offers}
            quantity={product.quantity}
            quantityUnit={product.quantityUnit}
            unitPriceType={product.unitPriceType}
          />
          <CompareNotes retrievalLimited={retrievalLimited} rakutenShopScope={rakutenShopScope} hasAffiliate={hasAffiliate} />
        </section>
      ) : (
        <p id="compare" className="mt-5 scroll-mt-[var(--product-section-offset,7rem)] text-sm text-muted lg:scroll-mt-24">
          比較できる掲載はありません。
        </p>
      )}

      <section id="product-info" aria-labelledby="product-info-heading" className="mt-5 scroll-mt-[var(--product-section-offset,7rem)] md:mt-8 lg:scroll-mt-24">
        <h2 id="product-info-heading" className="text-lg font-bold tracking-tight text-ink">
          商品情報
        </h2>
        <dl className="mt-2 divide-y divide-line rounded-2xl border border-line bg-card">
          <InfoRow label="ブランド" value={brand || null} />
          <InfoRow label="商品名" value={visibleName} />
          <InfoRow label="JANコード" value={product.janCode} />
          <InfoRow label="容量" value={capacity} />
          <InfoRow label="型番" value={product.modelNumber?.trim() || null} />
        </dl>
      </section>

      {relatedArticles.length > 0 ? (
        <section id="related-articles" aria-labelledby="related-articles-heading" className="mt-5 scroll-mt-[var(--product-section-offset,7rem)] md:mt-8 lg:scroll-mt-24">
          <h2 id="related-articles-heading" className="text-lg font-bold tracking-tight text-ink">
            関連記事
          </h2>
          <ul className="mt-2 grid gap-1.5">
            {relatedArticles.map((article) => (
              <li key={article.href}>
                <Link
                  href={article.href}
                  className="flex min-h-11 items-center rounded-xl border border-line bg-card px-4 py-2 text-base font-bold text-ink hover:border-forest"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {amazonUrl ? <AmazonAssociateLink url={amazonUrl} /> : null}

      {priceSummary !== undefined ? (
        <PriceHistory summary={priceSummary} offers={product.offers} series={priceSeries} now={priceCheckedAt} />
      ) : null}
      {priceSummary !== undefined ? (
        <PriceHistory summary={priceSummary} offers={product.offers} series={priceSeries} now={priceCheckedAt} chart />
      ) : null}
    </article>
  );
}

type OverviewQuote = {
  shippingTotal: number | null;
  itemPrice: number | null;
  shopCount: number;
};

function productOverview(product: ProductDetail): OverviewQuote {
  const mallOffers = product.offers.filter((offer) => comparisonMallOf(offer) != null);
  const parts = partitionShopComparison(mallOffers.length > 0 ? mallOffers : product.offers);
  const prices = cheapestPrices(parts.ranked);
  const counts = listingShopCounts(parts.ranked);
  return {
    shippingTotal: prices.shippingTotal,
    itemPrice: prices.itemPrice,
    shopCount: counts.shopCount,
  };
}

function OverviewPrice({ overview }: { overview: OverviewQuote }) {
  if (overview.shippingTotal == null && overview.itemPrice == null && overview.shopCount === 0) {
    return <p className="mt-4 text-sm text-muted">比較できる価格情報がありません。</p>;
  }

  if (overview.shippingTotal != null) {
    return (
      <div className="mt-3 rounded-2xl border border-forest bg-moss/50 px-4 py-3">
        <p className="text-sm font-bold text-forest-deep">最安値（送料込み）</p>
        <p className="price-num mt-0.5 text-4xl leading-none font-semibold text-ink">{formatYen(overview.shippingTotal)}</p>
        <p className="mt-2 text-sm text-muted">
          {overview.shopCount > 0 ? (
            <>
              <span className="price-num text-base text-ink">{overview.shopCount}</span>
              ショップで比較
            </>
          ) : null}
          {overview.itemPrice != null ? (
            <span className={overview.shopCount > 0 ? " ml-2" : undefined}>本体最安 {formatYen(overview.itemPrice)}</span>
          ) : null}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">送料が分かるショップの支払総額です。</p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-line bg-card px-4 py-3">
      <p className="text-sm font-bold text-ink">商品価格（本体）</p>
      <p className="price-num mt-0.5 text-4xl leading-none font-semibold text-ink">
        {overview.itemPrice == null ? "情報なし" : formatYen(overview.itemPrice)}
      </p>
      {overview.shopCount > 0 ? (
        <p className="mt-2 text-sm text-muted">
          <span className="price-num text-base text-ink">{overview.shopCount}</span>
          ショップで比較
        </p>
      ) : null}
      <p className="mt-2 text-sm leading-6 text-muted">送料が分かるショップがないため、送料込み最安は表示していません。</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null;
  }
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 px-3 py-2 text-sm sm:grid-cols-[9rem_minmax(0,1fr)] sm:px-4 sm:py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-ink">{value}</dd>
    </div>
  );
}

function CompareNotes({
  retrievalLimited,
  rakutenShopScope,
  hasAffiliate,
}: {
  retrievalLimited: boolean;
  rakutenShopScope: "off" | "ready" | "limited";
  hasAffiliate: boolean;
}) {
  return (
    <details className="mt-6 rounded-2xl border border-line bg-sand/50 px-4 py-2">
      <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-ink">比較条件について</summary>
      <div className="grid gap-2 pb-2 text-xs leading-6 text-muted">
        <p>同じ商品で、在庫がある同じ販売単位を一つの一覧にしています。セットや在庫なしは別の欄です。</p>
        <p>楽天市場とYahoo!ショッピングを、同じ順で見られます。はじめに5件を表示し、続きはまとめて開けます。</p>
        <p>送料が確認できない掲載は「送料別・合計未確認」と表示し、送料込みの順位には入れていません。</p>
        {rakutenShopScope !== "off" ? (
          <p>楽天市場は、商品名や説明にこのJANコードがある店舗を集めています。すべての店舗が並ぶとは限りません。</p>
        ) : null}
        {rakutenShopScope === "limited" ? <p>楽天市場には、ここに出ていない店舗があります。</p> : null}
        {retrievalLimited ? <p>Yahoo!ショッピングにも、ここに出ていない店舗があります。</p> : null}
        {hasAffiliate ? <p>「広告」とあるリンクは、ショップの紹介に報酬が発生します。表示している価格は、その報酬では決めていません。</p> : null}
        <p>表示は取得時点の掲載です。価格・送料・在庫は変わることがあります。すべての販売店を含むとは限りません。</p>
      </div>
    </details>
  );
}

function ProductImage({ imageUrl, alt, size }: { imageUrl: string | null; alt: string; size: "hero" | "thumb" }) {
  if (!imageUrl && size === "hero") {
    return (
      <div className="flex h-11 items-center justify-center rounded-xl border border-dashed border-line bg-moss/50">
        <p className="text-sm text-sage">画像なし</p>
      </div>
    );
  }
  const frame =
    size === "hero"
      ? "mx-auto flex h-56 w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl border border-line bg-card"
      : "overflow-hidden rounded-xl border border-line bg-card";
  const imageClass = size === "hero" ? "max-h-52 w-full object-contain p-2" : "mx-auto aspect-square w-full object-contain p-1.5";
  return (
    <div className={frame}>
      {imageUrl ? (
        // Yahooの画像URLは取得のたびにホストが変わり得るため、next/imageの許可リストには載せない。
        <img src={imageUrl} alt={alt} className={imageClass} />
      ) : (
        <div className="grid aspect-square place-items-center bg-moss px-2 text-center">
          <p className="text-[10px] leading-4 text-sage">画像なし</p>
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
              ? "inline-flex min-h-11 shrink-0 items-center rounded-full bg-forest px-4 text-sm font-bold text-white ring-2 ring-forest ring-offset-2"
              : "inline-flex min-h-11 shrink-0 items-center rounded-full border border-line bg-card px-4 text-sm font-medium text-muted"
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
