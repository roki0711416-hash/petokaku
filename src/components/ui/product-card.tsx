import Link from "next/link";
import { formatUnitAmount, formatYen } from "@/lib/format";
import { readableListingTitle } from "@/lib/pricing/display-title";
import type { SearchCandidateCard } from "@/lib/sources/yahoo/search-candidates";
import { safeHttpUrl } from "@/lib/urls";

export function ProductCard({ card }: { card: SearchCandidateCard }) {
  const imageUrl = safeHttpUrl(card.imageUrl);
  const productUrl = safeHttpUrl(card.productUrl);
  const title = readableListingTitle(card.name);

  return (
    <li className="lift flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-card">
      <div className="flex h-32 items-center justify-center bg-sand/60 px-3 md:h-40">
        {imageUrl ? (
          <img src={imageUrl} alt={card.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <p className="text-xs text-muted">画像なし</p>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-4">
        {card.brand ? <p className="line-clamp-1 text-xs text-forest">{card.brand}</p> : null}
        <h3 className="mt-1 line-clamp-2 text-sm leading-5 font-medium text-ink">{title}</h3>
        {card.sizeLabel ? <p className="mt-2 text-xs text-ink">{card.sizeLabel}</p> : null}
        {card.salesUnitLabel ? <p className="mt-1 text-xs text-muted">{card.salesUnitLabel}</p> : null}
        <div className="mt-auto pt-3">
          {card.sellingPrice != null ? (
            <p className="price-num text-xl leading-none text-ink md:text-2xl">
              {formatYen(card.sellingPrice)}
              {card.priceFrom ? "〜" : ""}
            </p>
          ) : (
            <p className="text-xs leading-5 text-muted">在庫のある販売価格は確認できませんでした。</p>
          )}
          {card.unitYen != null && card.unitLabel ? (
            <p className="mt-2 text-xs text-muted">
              {formatUnitAmount({ yen: card.unitYen, exact: card.unitExact }, card.unitLabel)}
            </p>
          ) : null}
          {card.shopLabel ? <p className="mt-2 text-xs text-ink">{card.shopLabel}</p> : null}
          {card.href ? (
            <Link
              href={card.href}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-3 text-sm text-white hover:bg-forest-deep"
            >
              価格を見る
            </Link>
          ) : (
            <div className="mt-3 text-xs leading-5 text-muted">
              <p>JANがないため、ショップはまとめていません。</p>
              {productUrl ? (
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center font-medium text-forest underline-offset-4 hover:underline"
                >
                  商品を見る
                  <span className="sr-only">（外部サイトを開きます）</span>
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
