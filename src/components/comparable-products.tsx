import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatYen } from "@/lib/format";
import { readableListingTitle } from "@/lib/pricing/display-title";
import { indexedJanPath, type IndexedJanProduct } from "@/lib/site";
import { loadYahooJan } from "@/lib/sources/yahoo/preview";
import { readableListingTitle as cleanListingTitle } from "@/lib/sources/yahoo/listing-title";
import { quoteSingleSize } from "@/lib/sources/yahoo/size-family";
import { safeHttpUrl } from "@/lib/urls";

export async function ComparableProducts({ products }: { products: readonly IndexedJanProduct[] }) {
  if (products.length === 0) {
    return null;
  }

  const cards = await Promise.all(products.map((product) => loadCard(product)));

  return (
    <section aria-labelledby="comparable-products" className="px-4 py-14 md:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="comparable-products"
          title="価格比較できる商品"
          lead="表示を確認した商品です。ショップごとの価格は、商品ページで見られます。"
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.janCode}>
              <Link href={indexedJanPath(card.janCode)} className="lift flex h-full flex-col overflow-hidden rounded-3xl bg-card">
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt={card.name} className="aspect-[4/3] w-full bg-sand object-contain" />
                ) : (
                  <span className="grid aspect-[4/3] place-items-center bg-moss text-sm text-muted">商品画像なし</span>
                )}
                <span className="flex flex-1 flex-col px-5 py-5">
                  {card.brand ? <span className="text-xs tracking-[0.08em] text-sage">{card.brand}</span> : null}
                  <span className="mt-1 text-base leading-7 font-medium text-ink">{card.name}</span>
                  {card.priceLabel ? <span className="mt-3 text-sm text-ink">{card.priceLabel}</span> : <span className="mt-3 text-sm text-muted">価格は商品ページで確認できます。</span>}
                  <span className="mt-4 text-sm text-forest">価格を比較する</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function loadCard(product: IndexedJanProduct): Promise<{
  janCode: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  priceLabel: string | null;
}> {
  const fallback = {
    janCode: product.janCode,
    name: product.label,
    brand: "",
    imageUrl: null,
    priceLabel: null,
  };
  try {
    const loaded = await loadYahooJan(product.janCode);
    if (!loaded.ok) {
      return fallback;
    }
    const detail = loaded.adapted.detail;
    const name = readableListingTitle(cleanListingTitle(detail.name)).trim() || product.label;
    const quote = quoteSingleSize({
      offers: detail.offers,
      quantity: detail.quantity,
      quantityUnit: detail.quantityUnit,
      quantityConfidence: detail.quantityConfidence,
      unitPriceType: detail.unitPriceType,
    });
    return {
      janCode: product.janCode,
      name,
      brand: detail.brand.trim(),
      imageUrl: safeHttpUrl(detail.imageUrl),
      priceLabel: quote.sellingPrice == null ? null : `商品価格 ${formatYen(quote.sellingPrice)}`,
    };
  } catch {
    return fallback;
  }
}
