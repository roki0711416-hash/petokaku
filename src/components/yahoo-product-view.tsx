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
import { comparisonMallOf, offersComparableAsNew } from "@/lib/pricing/malls";
import { confirmedPriceSummary, isRakutenReferencePrice } from "@/lib/pricing/shop-compare";
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
  priceSummary,
  priceSeries = [],
  priceCheckedAt,
  retrievalLimited = false,
  rakutenShopScope = "off",
}: {
  product: ProductDetail;
  pageHref: string;
  sizeChoices?: YahooSizeChoice[];
  priceSummary?: PriceHistorySummary | null;
  priceSeries?: DailyPricePoint[];
  priceCheckedAt?: string;
  retrievalLimited?: boolean;
  rakutenShopScope?: "off" | "ready" | "limited";
}) {
  const category = getCategory(product.category);
  const imageUrl = safeHttpUrl(product.imageUrl);
  const visibleName = compactVisibleTitle(cleanListingTitle(product.name));
  const confirmed = confirmedPriceSummary(product.offers.filter((offer) => comparisonMallOf(offer)));
  const hasAffiliate = product.offers.some((offer) => shopProductLink(offer).affiliate);
  const crumbs: Crumb[] = [
    { label: "ホーム", href: "/" },
    { label: category.label, href: categorySearchHref(category.id) },
    { label: visibleName, href: pageHref, current: true },
  ];

  const capacity = product.sizeLabel && product.sizeLabel !== unknownQuantityLabel ? product.sizeLabel : null;
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
      <header className="mt-3 flex min-w-0 items-start gap-3">
        <div className="w-16 shrink-0 sm:w-24">
          <ProductImage imageUrl={imageUrl} alt={visibleName} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-sage">{product.brand.trim() ? `メーカー ${product.brand.trim()}` : "メーカー情報なし"}</p>
          <h1 className="mt-0.5 text-base leading-snug font-medium tracking-tight text-ink sm:text-xl">{visibleName}</h1>
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
      <PriceSummary lowestPrice={confirmed.lowestPrice} shopCount={confirmed.shopCount} />
      {product.offers.length > 0 ? (
        <section id="compare" aria-labelledby="compare-heading" className="mt-5 scroll-mt-24">
          <h2 id="compare-heading" className="text-lg font-medium tracking-tight text-ink">
            価格比較
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">価格・送料・在庫は変更される場合があります。購入前にショップでご確認ください。</p>
          <div className="mt-3">
            <MallCompare
              offers={product.offers}
              quantity={product.quantity}
              quantityUnit={product.quantityUnit}
              unitPriceType={product.unitPriceType}
            />
          </div>
          <CompareNotes retrievalLimited={retrievalLimited} rakutenShopScope={rakutenShopScope} hasAffiliate={hasAffiliate} />
        </section>
      ) : (
        <p className="mt-5 text-sm text-muted">比較できる掲載はありません。</p>
      )}

      {priceSummary !== undefined ? (
        <PriceHistory summary={priceSummary} offers={product.offers} series={priceSeries} now={priceCheckedAt} />
      ) : null}
      {priceSummary !== undefined ? (
        <PriceHistory summary={priceSummary} offers={product.offers} series={priceSeries} now={priceCheckedAt} chart />
      ) : null}
    </article>
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
        <p>楽天市場とYahoo!ショッピングを、同じ順で見られます。はじめに5件、続きは10件ずつ表示します。</p>
        <p>送料が確認できない掲載は「送料不明」と表示し、合計価格は出していません。</p>
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

function ProductImage({ imageUrl, alt }: { imageUrl: string | null; alt: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      {imageUrl ? (
        // Yahooの画像URLは取得のたびにホストが変わり得るため、next/imageの許可リストには載せない。
        <img src={imageUrl} alt={alt} className="mx-auto aspect-square w-full object-contain p-1.5" />
      ) : (
        <div className="grid aspect-square place-items-center bg-moss px-1 text-center">
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
