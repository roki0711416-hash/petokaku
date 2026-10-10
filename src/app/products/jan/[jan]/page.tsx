import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YahooProductView, type YahooSizeChoice } from "@/components/yahoo-product-view";
import { confirmedJanOffers } from "@/lib/pricing/malls";
import { loadRakutenJanOffers } from "@/lib/sources/rakuten/search";
import { loadYahooJan } from "@/lib/sources/yahoo/preview";
import type { PriceHistorySummary } from "@/lib/pricing/price-history-summary";
import { loadJanPriceView } from "@/lib/supabase/price-history-summary";
import { recordDisplayedJanView } from "@/lib/supabase/record-jan-view";
import { saveDisplayedJanPrices } from "@/lib/supabase/save-price-history";
import { validJanCode } from "@/lib/sources/yahoo/adapter";
import { classifyPetKind } from "@/lib/sources/yahoo/pet-kind";
import { bestItemUnitIds, groupSizeFamilies, quoteSingleSize, sizeFamilyHref, type SizeFamilyMember } from "@/lib/sources/yahoo/size-family";
import { getSiteUrl, janPageRobots } from "@/lib/site";
import { safeHttpUrl } from "@/lib/urls";
import type { ProductDetail } from "@/lib/types";

export const dynamic = "force-dynamic";

const fetchError = "商品情報を取得できませんでした。時間をおいてもう一度お試しください。";

type JanPageProps = {
  params: Promise<{ jan: string }>;
  searchParams: Promise<{ with?: string | string[] }>;
};

function relatedJans(value: string | string[] | undefined, current: string): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  const seen = new Set<string>();
  const jans: string[] = [];
  for (const part of raw.split(",")) {
    const jan = validJanCode(part.trim());
    if (!jan || jan === current || seen.has(jan)) {
      continue;
    }
    seen.add(jan);
    jans.push(jan);
  }
  return jans.slice(0, 2);
}

function memberFromDetail(detail: ProductDetail): SizeFamilyMember | null {
  if (!detail.janCode) {
    return null;
  }
  const titles = detail.offers.flatMap((offer) => (offer.listingTitle ? [offer.listingTitle] : []));
  const kind = classifyPetKind({
    genreNames: detail.sourceCategoryName ? [detail.sourceCategoryName] : [],
    brandName: detail.brand,
    title: titles[0] ?? detail.name,
  });
  return {
    id: detail.janCode,
    janCode: detail.janCode,
    animal: kind.kind,
    brand: detail.brand || null,
    genreName: detail.sourceCategoryName,
    titles,
  };
}

function sizeChoicesFor(current: ProductDetail, companions: ProductDetail[]): YahooSizeChoice[] {
  const details = [current, ...companions];
  const members = details.flatMap((detail) => {
    const member = memberFromDetail(detail);
    return member ? [member] : [];
  });
  const family = groupSizeFamilies(members).find((item) => item.members.some((member) => member.janCode === current.janCode));
  if (!family) {
    return [];
  }
  const jans = family.members.map((member) => member.janCode);
  const choices = family.members.flatMap((member) => {
    const detail = details.find((item) => item.janCode === member.janCode);
    if (!detail) {
      return [];
    }
    return [
      {
        janCode: member.janCode,
        label: member.sizeLabel,
        href: sizeFamilyHref(member.janCode, jans),
        current: member.janCode === current.janCode,
        quote: quoteSingleSize({
          offers: detail.offers,
          quantity: detail.quantity,
          quantityUnit: detail.quantityUnit,
          quantityConfidence: detail.quantityConfidence,
          unitPriceType: detail.unitPriceType,
        }),
      },
    ];
  });
  const best = new Set(bestItemUnitIds(choices.map((choice) => ({ id: choice.janCode, itemUnitYen: choice.quote.itemUnitYen }))));
  return choices.map((choice) => ({ ...choice, isBestItemUnit: best.has(choice.janCode) }));
}

export async function generateMetadata({ params }: JanPageProps): Promise<Metadata> {
  const { jan } = await params;
  if (!validJanCode(jan)) {
    return { title: "商品が見つかりません", robots: janPageRobots(false) };
  }
  const result = await loadYahooJan(jan);
  if (!result.ok) {
    return { title: "商品を表示できません", robots: janPageRobots(false) };
  }
  const detail = result.adapted.detail;
  const name = detail.name.trim();
  const title = name || "商品の価格比較";
  const brand = detail.brand.trim();
  const brandPrefix = brand && !title.includes(brand) ? `${brand}の` : "";
  const janLabel = detail.janCode ? `（JAN ${detail.janCode}）` : "";
  const description = `${brandPrefix}${title}${janLabel}の販売価格と送料を、ショップごとに見比べられます。購入前にショップで確認してください。`;
  const imageUrl = safeHttpUrl(result.adapted.detail.imageUrl);
  const canonical = `/products/jan/${jan}`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: janPageRobots(true),
    openGraph: {
      title,
      description,
      url: new URL(canonical, getSiteUrl()).toString(),
      siteName: "ペトカク",
      locale: "ja_JP",
      type: "website",
      images: imageUrl?.startsWith("https://") ? [{ url: imageUrl, alt: title }] : undefined,
    },
  };
}

export default async function YahooJanPage({ params, searchParams }: JanPageProps) {
  const { jan } = await params;
  const { with: withJans } = await searchParams;
  if (!validJanCode(jan)) {
    notFound();
  }
  const result = await loadYahooJan(jan);
  if (!result.ok) {
    return (
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">商品を表示できません</h1>
        <p className="mt-4 leading-8 text-muted">
          {result.reason === "no-jan" ? "この商品の販売情報は見つかりませんでした。" : fetchError}
        </p>
        <p className="mt-6">
          <Link href="/search" className="font-bold text-forest-deep underline-offset-4 hover:underline">
            商品を検索する
          </Link>
        </p>
      </article>
    );
  }

  try {
    await saveDisplayedJanPrices(jan, result.adapted);
  } catch {
    // 価格履歴が保存できなくても、取得済みの価格比較は表示する。
  }

  try {
    await recordDisplayedJanView(jan);
  } catch {
    // 閲覧記録が残せなくても、商品詳細は表示する。
  }

  const now = new Date().toISOString();
  let priceSummary: PriceHistorySummary | null = null;
  let priceSeries: Awaited<ReturnType<typeof loadJanPriceView>>["series"] = [];
  try {
    const priceView = await loadJanPriceView(jan, now);
    priceSummary = priceView.summary;
    priceSeries = priceView.series;
  } catch {
    priceSummary = null;
  }

  const companions: ProductDetail[] = [];
  for (const related of relatedJans(withJans, jan)) {
    const loaded = await loadYahooJan(related);
    if (loaded.ok) {
      companions.push(loaded.adapted.detail);
    }
  }

  const rakuten = await loadRakutenJanOffers(jan);
  const product = {
    ...result.adapted.detail,
    offers: confirmedJanOffers(jan, [
      { janCode: result.adapted.detail.janCode, offers: result.adapted.detail.offers },
      { janCode: jan, offers: rakuten.ok ? rakuten.offers : [] },
    ]),
  };

  return (
    <YahooProductView
      product={product}
      pageHref={`/products/jan/${jan}`}
      sizeChoices={sizeChoicesFor(result.adapted.detail, companions)}
      priceSummary={priceSummary}
      priceSeries={priceSeries}
      priceCheckedAt={now}
    />
  );
}
