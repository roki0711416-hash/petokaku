export const articleDiagramIds = [
  "litter-materials",
  "dry-wet",
  "food-checklist",
  "dog-life",
  "dog-cost",
  "sheet-size",
  "sheet-unit-price",
] as const;

export type ArticleDiagramId = (typeof articleDiagramIds)[number];

export type ArticleBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "note"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "diagram"; id: ArticleDiagramId }
  | { type: "source"; label: string; href: string }
  | { type: "link"; label: string; href: string }
  | { type: "products" };

export type ArticleProductLink = {
  href: string;
  label: string;
  note?: string;
};

export type ArticleImage = {
  src: string;
  alt: string;
  credit?: string;
  creditUrl?: string;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  publishedOn: string;
  updatedOn: string;
  published: boolean;
  image?: ArticleImage;
  takeaways?: string[];
  blocks: ArticleBlock[];
  relatedSlugs: string[];
  products: ArticleProductLink[];
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const articleImagePattern = /^\/article-images\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:png|webp|jpg)$/;
const productHrefPattern = /^\/products\/jan\/[0-9]{13}$/;
const categoryHrefPattern = /^\/categories\/[a-z0-9-]+$/;
const petsCategoryHrefPattern = /^\/pets\/(?:dog|cat)\?category=[a-z]+$/;
const articleHrefPattern = /^\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
  return productHrefPattern.test(href) || categoryHrefPattern.test(href) || petsCategoryHrefPattern.test(href);
}

export function isArticleInternalHref(href: string): boolean {
  return categoryHrefPattern.test(href) || petsCategoryHrefPattern.test(href) || articleHrefPattern.test(href);
}

const sourceHosts = new Set(["pffta.org", "www.pffta.org", "petfood.or.jp", "www.petfood.or.jp"]);
const creditHosts = new Set(["commons.wikimedia.org", "unsplash.com", "creativecommons.org"]);

function httpsHost(value: string, hosts: Set<string>): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && hosts.has(url.hostname);
  } catch {
    return false;
  }
}

function blockOk(block: ArticleBlock): boolean {
  if (block.type === "ul") {
    return block.items.length > 0 && block.items.every((item) => item.trim() !== "");
  }
  if (block.type === "table") {
    return (
      block.headers.length > 0 &&
      block.headers.every((header) => header.trim() !== "") &&
      block.rows.length > 0 &&
      block.rows.every((row) => row.length === block.headers.length && row.every((cell) => cell.trim() !== ""))
    );
  }
  if (block.type === "diagram") {
    return articleDiagramIds.includes(block.id);
  }
  if (block.type === "source") {
    return block.label.trim() !== "" && block.label.length <= 80 && httpsHost(block.href, sourceHosts);
  }
  if (block.type === "link") {
    return block.label.trim() !== "" && block.label.length <= 80 && isArticleInternalHref(block.href);
  }
  if (block.type === "products") {
    return true;
  }
  return block.text.trim() !== "";
}

export function articleImageIsValid(image: ArticleImage | undefined): boolean {
  if (!image) {
    return true;
  }
  if (!articleImagePattern.test(image.src) || image.alt.trim() === "" || image.alt.length > 80) {
    return false;
  }
  if (image.credit != null && (image.credit.trim() === "" || image.credit.length > 120)) {
    return false;
  }
  if (image.creditUrl != null && !httpsHost(image.creditUrl, creditHosts)) {
    return false;
  }
  return true;
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
  if (!articleImageIsValid(article.image)) {
    return false;
  }
  if (article.takeaways && (article.takeaways.length < 2 || article.takeaways.length > 6 || article.takeaways.some((item) => item.trim() === "" || item.length > 90))) {
    return false;
  }
  if (!calendarDate(article.publishedOn) || !calendarDate(article.updatedOn) || article.updatedOn < article.publishedOn) {
    return false;
  }
  if (article.blocks.length === 0 || !article.blocks.every(blockOk)) {
    return false;
  }
  if (
    !article.products.every(
      (product) => product.label.trim() !== "" && isArticleProductHref(product.href) && (product.note == null || (product.note.trim() !== "" && product.note.length <= 120)),
    )
  ) {
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
    ...(article.image ? { image: new URL(article.image.src, pageUrl).toString() } : {}),
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
