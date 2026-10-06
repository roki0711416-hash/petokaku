import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { OfferList } from "@/components/offer-list";
import { PriceHistory } from "@/components/ui/price-history";
import { PriceSummary } from "@/components/ui/price-summary";
import { SectionHeading } from "@/components/ui/section-heading";
import { categorySearchHref, getCategory } from "@/lib/categories";
import { groupOffersBySalesUnit } from "@/lib/catalog";
import { formatPriceChecked, formatUnitAmount, formatYen } from "@/lib/format";
import type { DailyPricePoint, PriceHistorySummary } from "@/lib/pricing/price-history-summary";
import { comparisonCountLabel } from "@/lib/pricing/visible-offers";
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
  const salesGroups = groupOffersBySalesUnit(product.offers);
  const comparisonLabel = comparisonCountLabel(product.offers);
  const crumbs: Crumb[] = [
    { label: "ホーム", href: "/" },
    { label: category.label, href: categorySearchHref(category.id) },
    { label: product.name, href: pageHref, current: true },
  ];

  return (
    <article className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <Breadcrumbs items={crumbs} />
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="overflow-hidden rounded-[2rem] bg-sand/70">
          {imageUrl ? (
            // Yahooの画像URLは取得のたびにホストが変わり得るため、next/imageの許可リストには載せない。
            <img src={imageUrl} alt={product.name} className="aspect-square w-full object-contain md:aspect-[4/3]" />
          ) : (
            <p className="grid aspect-square place-items-center text-muted md:aspect-[4/3]">画像なし</p>
          )}
        </div>
        <div>
          <p className="text-sm text-forest">{product.brand || "ブランドは販売店の表記によります"}</p>
          <h1 className="mt-2 text-2xl leading-snug font-medium tracking-tight md:text-4xl">{product.name}</h1>
          <p className="mt-3 inline-flex min-h-8 items-center rounded-full bg-sand px-3 text-sm">{product.sizeLabel}</p>
          <p className="mt-2 text-xs text-muted">{category.label}</p>
          <div className="mt-5">
            <PriceSummary quote={quote} />
          </div>
          {product.janCode ? <p className="mt-3 text-xs text-muted">JAN {product.janCode}</p> : null}
          {sizeChoices.length > 1 ? (
            <section aria-labelledby="size-choice-heading" className="mt-6">
              <h2 id="size-choice-heading" className="text-sm font-bold">
                容量を選ぶ
              </h2>
              <ul className="mt-2 grid gap-2">
                {sizeChoices.map((choice) => (
                  <li key={choice.janCode}>
                    <Link
                      href={choice.href}
                      aria-current={choice.current ? "page" : undefined}
                      className={`block rounded-2xl border px-3 py-3 ${choice.current ? "border-forest bg-moss" : "border-line bg-card"}`}
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold">{choice.label}</span>
                        {choice.isBestItemUnit ? (
                          <span className="rounded-full bg-moss px-2 py-0.5 text-xs font-bold text-forest-deep">参考単価がこの中で低い</span>
                        ) : null}
                      </span>
                      {choice.quote.sellingPrice != null ? (
                        <span className="mt-1 block text-sm">最安価格 {formatYen(choice.quote.sellingPrice)}</span>
                      ) : null}
                      {choice.quote.itemUnitYen != null && choice.quote.unitLabel ? (
                        <span className="mt-1 block text-xs text-muted">
                          参考単価{" "}
                          {formatUnitAmount(
                            { yen: choice.quote.itemUnitYen, exact: choice.quote.itemUnitExact },
                            choice.quote.unitLabel,
                          )}
                        </span>
                      ) : null}
                      {choice.quote.shippingUnitYen != null && choice.quote.unitLabel ? (
                        <span className="mt-1 block text-xs text-muted">
                          送料込み単価{" "}
                          {formatUnitAmount(
                            { yen: choice.quote.shippingUnitYen, exact: choice.quote.shippingUnitExact },
                            choice.quote.unitLabel,
                          )}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      {priceSummary !== undefined ? (
        <PriceHistory summary={priceSummary} offers={product.offers} series={priceSeries} now={priceCheckedAt} />
      ) : null}

      <p className="mt-6">
        <a href="#compare" className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 text-sm text-white hover:bg-forest-deep">
          ショップを比較
        </a>
      </p>

      {priceSummary !== undefined ? (
        <PriceHistory summary={priceSummary} offers={product.offers} series={priceSeries} now={priceCheckedAt} chart />
      ) : null}

      <section id="compare" aria-labelledby="compare-heading" className="mt-12 scroll-mt-24">
        <SectionHeading
          id="compare-heading"
          title="ショップを比較"
          lead="送料が分かるショップを、支払総額の安い順に並べています。送料が不明な掲載は0円にしません。セットは別の一覧です。"
        />
        <div className="mt-5 grid gap-1 rounded-[1.6rem] bg-moss px-5 py-5">
          {salesGroups.map((group) =>
            group.lowestTotal != null ? (
              <p key={group.heading} className="text-sm font-bold text-forest-deep">
                {group.heading}の送料込み最安：{formatYen(group.lowestTotal)}
              </p>
            ) : (
              <p key={group.heading} className="text-sm font-bold text-forest-deep">
                {group.heading}は、支払総額を確定できるショップがありません。
              </p>
            ),
          )}
          <p className="mt-2 text-sm">{comparisonLabel}</p>
          <p className="mt-1 text-sm text-muted">{formatPriceChecked(product.latestCheckedAt)}</p>
        </div>
        <div className="mt-5">
          <OfferList
            offers={product.offers}
            quantity={product.quantity}
            quantityUnit={product.quantityUnit}
            unitPriceType={product.unitPriceType}
          />
        </div>
      </section>

      <section aria-labelledby="notice-heading" className="mt-10 rounded-[1.8rem] bg-honey/50 px-5 py-6">
        <h2 id="notice-heading" className="text-xl font-bold">
          購入前に確認すること
        </h2>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-7">
          <li>金額、送料、在庫は取得時点の情報です。ショップ側で変わることがあります。</li>
          <li>購入前に、ショップのページで価格、送料、在庫、内容量を確認してください。</li>
          <li>このページは最安を保証しません。</li>
          <li>ペトカクは商品を販売せず、購入の契約には入りません。</li>
        </ul>
      </section>
    </article>
  );
}
