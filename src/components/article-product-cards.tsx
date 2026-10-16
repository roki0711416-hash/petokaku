import type { Article } from "@/lib/articles/catalog";
import { ComparableProductCards } from "@/components/comparable-product-cards";

export async function ArticleProductCards({ article }: { article: Article }) {
  return <ComparableProductCards sectionId={`products-${article.slug}`} products={article.products} />;
}
