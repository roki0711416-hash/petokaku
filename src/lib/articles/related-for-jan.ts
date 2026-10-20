import { articlePath, publishedArticles, type Article } from "./catalog.ts";

export type RelatedArticleLink = {
  href: string;
  title: string;
};

// 記事の商品リンクにこのJANが含まれるものだけ返す。無いときは空。
export function articlesLinkingToJan(janCode: string, articles: readonly Article[]): RelatedArticleLink[] {
  if (!/^[0-9]{13}$/.test(janCode)) {
    return [];
  }
  const productHref = `/products/jan/${janCode}`;
  return publishedArticles(articles).flatMap((article) => {
    if (!article.products.some((product) => product.href === productHref)) {
      return [];
    }
    return [{ href: articlePath(article.slug), title: article.title }];
  });
}
