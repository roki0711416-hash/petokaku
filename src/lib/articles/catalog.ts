export type ArticleBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type ArticleProductLink = {
  href: string;
  label: string;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  publishedOn: string;
  updatedOn: string;
  published: boolean;
  blocks: ArticleBlock[];
  relatedSlugs: string[];
  products: ArticleProductLink[];
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const productHrefPattern = /^\/products\/jan\/[0-9]{13}$/;

function calendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if (year == null || month == null || day == null) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isArticleProductHref(href: string): boolean {
  return productHrefPattern.test(href);
}

function blockOk(block: ArticleBlock): boolean {
  if (block.type === "ul") {
    return block.items.length > 0 && block.items.every((item) => item.trim() !== "");
  }
  return block.text.trim() !== "";
}

export function articleIsValid(article: Article, all: readonly Article[]): boolean {
  if (!slugPattern.test(article.slug) || article.slug.length > 80) {
    return false;
  }
  if (all.filter((item) => item.slug === article.slug).length !== 1) {
    return false;
  }
  if (article.title.trim() === "" || article.description.trim() === "") {
    return false;
  }
  if (!calendarDate(article.publishedOn) || !calendarDate(article.updatedOn) || article.updatedOn < article.publishedOn) {
    return false;
  }
  if (article.blocks.length === 0 || !article.blocks.every(blockOk)) {
    return false;
  }
  if (!article.products.every((product) => product.label.trim() !== "" && isArticleProductHref(product.href))) {
    return false;
  }
  const slugs = new Set(all.map((item) => item.slug));
  return article.relatedSlugs.every((slug) => slug !== article.slug && slugs.has(slug) && article.relatedSlugs.filter((item) => item === slug).length === 1);
}

export function publishedArticles(articles: readonly Article[]): Article[] {
  return articles.filter((article) => article.published && articleIsValid(article, articles));
}

export function publishedArticle(slug: string, articles: readonly Article[]): Article | null {
  return publishedArticles(articles).find((article) => article.slug === slug) ?? null;
}

export function relatedArticles(article: Article, articles: readonly Article[]): Article[] {
  const published = new Map(publishedArticles(articles).map((item) => [item.slug, item]));
  return article.relatedSlugs.flatMap((slug) => {
    const related = published.get(slug);
    return related ? [related] : [];
  });
}

export function articlePath(slug: string): string {
  return `/articles/${slug}`;
}

export function articleSitemapPaths(articles: readonly Article[]): string[] {
  return publishedArticles(articles).map((article) => articlePath(article.slug));
}

export function formatArticleDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function articleStructuredData(article: Article, pageUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedOn,
    dateModified: article.updatedOn,
    mainEntityOfPage: pageUrl,
    author: { "@type": "Organization", name: "ペトカク運営事務局" },
    publisher: {
      "@type": "Organization",
      name: "ペトカク",
      logo: { "@type": "ImageObject", url: new URL("/logo.png", pageUrl).toString() },
    },
  };
}
