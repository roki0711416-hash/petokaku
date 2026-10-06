import Link from "next/link";
import { productPath } from "@/lib/catalog";
import { getCategory } from "@/lib/categories";
import { formatPriceRange } from "@/lib/format";
import type { ProductCardModel } from "@/lib/types";
import { ProductArt } from "@/components/product-art";

export function ProductCard({
  product,
  headingLevel = "h2",
}: {
  product: ProductCardModel;
  headingLevel?: "h2" | "h3";
}) {
  const Title = headingLevel;
  const category = getCategory(product.category);
  const href = productPath(product);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-card shadow-[0_10px_30px_rgba(28,40,34,0.04)]">
      <Link href={href} className="flex flex-1 flex-col hover:bg-paper">
        <ProductArt category={product.category} variant={product.variant} name={product.name} />
        <div className="flex flex-1 flex-col p-4">
          <p className="flex flex-wrap items-center gap-2 text-xs font-bold text-forest-deep">
            <span className="rounded-full bg-moss px-2.5 py-1">{category.label}</span>
            <span className="rounded-full bg-sand px-2.5 py-1">サンプルデータ</span>
          </p>
          <Title className="mt-3 text-lg leading-snug font-bold">{product.name}</Title>
          <p className="mt-1 text-sm text-muted">
            {product.brand} / {product.sizeLabel}
          </p>
          <p className="mt-4 text-xs font-bold tracking-wide text-muted">商品価格（サンプル）</p>
          <p className="price-num text-2xl leading-none text-ink">
            {formatPriceRange(product.lowestPrice, product.highestPrice)}
          </p>
          <p className="mt-2 text-sm text-muted">{product.shopCount}ショップのサンプル価格</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Link
          href={href}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-forest px-4 text-sm font-bold text-card hover:bg-forest-deep"
        >
          価格を比較する
        </Link>
      </div>
    </article>
  );
}
