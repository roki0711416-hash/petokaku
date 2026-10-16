import Image from "next/image";
import Link from "next/link";
import type { Article, ArticleProductLink } from "@/lib/articles/catalog";
import { janFromArticleProductHref } from "@/lib/articles/product-href";
import { articleProductImageUrl } from "@/lib/articles/product-images";

type CardModel = {
  href: string;
  label: string;
  note?: string;
  imageUrl: string | null;
};

export async function ArticleProductCards({ article }: { article: Article }) {
  if (article.products.length === 0) {
    return null;
  }

  const cards = await Promise.all(article.products.map((product) => loadCard(product)));

  return (
    <section aria-labelledby={`products-${article.slug}`} className="rounded-2xl border border-line bg-card p-3 sm:p-4">
      <h2 id={`products-${article.slug}`} className="text-base font-medium text-ink">
        関連商品の価格を比較する
      </h2>
      <p className="mt-1.5 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
        価格と送料は商品ページで見比べます。この欄には金額を出していません。
      </p>
      <ul className="mt-3 grid gap-2.5">
        {cards.map((card) => (
          <li key={card.href} className="min-w-0 rounded-xl border border-line/80 bg-sand/70 p-2.5 sm:p-3">
            <div className="flex min-w-0 items-start gap-3">
              <ProductThumb src={card.imageUrl} alt={card.label} />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm leading-5 font-medium text-ink">{card.label}</p>
                {card.note ? <p className="mt-1 text-xs leading-5 text-muted">{card.note}</p> : null}
              </div>
            </div>
            <Link
              href={card.href}
              className="mt-2.5 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-forest px-4 text-sm font-medium text-white hover:bg-forest-deep"
            >
              価格を比較する
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductThumb({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-card sm:h-[4.5rem] sm:w-[4.5rem]">
      {src ? (
        <Image src={src} alt={alt} width={72} height={72} sizes="72px" className="h-full w-full object-contain p-1" />
      ) : (
        <span className="px-1 text-center text-[10px] leading-3 text-muted">画像なし</span>
      )}
    </div>
  );
}

async function loadCard(product: ArticleProductLink): Promise<CardModel> {
  const janCode = janFromArticleProductHref(product.href);
  const imageUrl = janCode ? await articleProductImageUrl(janCode) : null;
  return {
    href: product.href,
    label: product.label,
    note: product.note,
    imageUrl,
  };
}
