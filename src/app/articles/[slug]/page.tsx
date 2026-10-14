import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { ArticleDiagram } from "@/components/article-diagrams";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { articles } from "@/data/articles";
import {
  articlePath,
  articleStructuredData,
  formatArticleDate,
  publishedArticle,
  publishedArticles,
  relatedArticles,
  type Article,
  type ArticleBlock,
} from "@/lib/articles/catalog";
import { getSiteUrl, privateRobots, robotsMetadata } from "@/lib/site";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return publishedArticles(articles).map((article) => ({ slug: article.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = publishedArticle(slug, articles);
  if (!article) {
    return { title: "記事が見つかりません", robots: privateRobots() };
  }
  const canonical = articlePath(article.slug);
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical },
    robots: robotsMetadata(),
    openGraph: {
      title: article.title,
      description: article.description,
      url: canonical,
      type: "article",
      publishedTime: article.publishedOn,
      modifiedTime: article.updatedOn,
      ...(article.image ? { images: [{ url: article.image.src, alt: article.image.alt }] } : {}),
    },
  };
}

function ProductCards({ article }: { article: Article }) {
  if (article.products.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby={`products-${article.slug}`} className="rounded-2xl border border-line bg-card p-4">
      <h2 id={`products-${article.slug}`} className="text-base font-medium text-ink">
        関連商品の価格を比較する
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">価格と送料は、次の商品ページでショップの掲載を見比べます。この欄には金額を出していません。</p>
      <ul className="mt-3 grid gap-3">
        {article.products.map((product) => (
          <li key={product.href} className="rounded-xl bg-sand px-4 py-4">
            <p className="text-sm leading-6 font-medium text-ink">{product.label}</p>
            {product.note ? <p className="mt-1 text-sm leading-6 text-muted">{product.note}</p> : null}
            <Link
              href={product.href}
              className="mt-3 inline-flex min-h-11 items-center rounded-full bg-forest px-4 text-sm font-medium text-white"
            >
              価格を比較する
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArticleBlockView({ block, index, article }: { block: ArticleBlock; index: number; article: Article }) {
  if (block.type === "h2") {
    return (
      <h2 id={`section-${index}`} className="mt-2 scroll-mt-24 text-lg font-medium tracking-tight text-ink">
        {block.text}
      </h2>
    );
  }
  if (block.type === "h3") {
    return <h3 className="text-base font-medium tracking-tight text-ink">{block.text}</h3>;
  }
  if (block.type === "ul") {
    return (
      <ul className="grid list-disc gap-2 pl-5 text-muted">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === "note") {
    return <p className="text-xs leading-6 text-muted">{block.text}</p>;
  }
  if (block.type === "table") {
    return (
      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full border-collapse text-left text-sm leading-6">
          <thead>
            <tr className="border-b border-line bg-sand/70 text-muted">
              {block.headers.map((header) => (
                <th key={header} scope="col" className="px-3 py-2 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row[0]} className="border-b border-line last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${row[0]}-${cellIndex}`} className="px-3 py-3 align-top text-ink">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "diagram") {
    return <ArticleDiagram id={block.id} />;
  }
  if (block.type === "source") {
    return (
      <p className="text-xs leading-6 text-muted">
        参照:{" "}
        <a href={block.href} className="underline underline-offset-4" rel="noopener noreferrer">
          {block.label}
        </a>
      </p>
    );
  }
  if (block.type === "products") {
    return <ProductCards article={article} />;
  }
  return <p className="text-muted">{block.text}</p>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = publishedArticle(slug, articles);
  if (!article) {
    notFound();
  }
  const pageUrl = new URL(articlePath(article.slug), getSiteUrl()).toString();
  const related = relatedArticles(article, articles);
  const headings = article.blocks.flatMap((block, index) => (block.type === "h2" ? [{ id: `section-${index}`, text: block.text }] : []));

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "ホーム", href: "/" },
          { label: "お役立ち記事", href: "/articles" },
          { label: article.title, href: articlePath(article.slug), current: true },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData(article, pageUrl)) }} />
      {article.image ? (
        <figure className="mt-5">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-sand">
            <Image src={article.image.src} alt={article.image.alt} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
          {article.image.credit ? (
            <figcaption className="mt-2 text-xs leading-5 text-muted">
              写真:{" "}
              {article.image.creditUrl ? (
                <a href={article.image.creditUrl} className="underline underline-offset-4" rel="noopener noreferrer">
                  {article.image.credit}
                </a>
              ) : (
                article.image.credit
              )}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
      <h1 className="mt-4 text-2xl leading-snug font-medium tracking-tight text-ink md:text-3xl">{article.title}</h1>
      <p className="mt-2 text-xs leading-5 text-muted">
        公開 {formatArticleDate(article.publishedOn)}
        <span className="px-1.5 text-line">/</span>
        更新 {formatArticleDate(article.updatedOn)}
      </p>
      <p className="mt-4 text-sm leading-7 text-muted">{article.description}</p>
      {article.takeaways && article.takeaways.length > 0 ? (
        <section aria-labelledby="article-takeaways" className="mt-5 rounded-2xl border border-line bg-honey px-4 py-4">
          <h2 id="article-takeaways" className="text-sm font-medium text-ink">
            この記事で分かること
          </h2>
          <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm leading-6 text-ink">
            {article.takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {headings.length > 1 ? (
        <nav aria-label="目次" className="mt-5 rounded-2xl border border-line bg-card px-4 py-4">
          <p className="text-sm font-medium text-ink">目次</p>
          <ol className="mt-2 grid gap-1 text-sm leading-6">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`} className="text-forest-deep underline-offset-4 hover:underline">
                  {heading.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="mt-6 grid gap-4 text-sm leading-7 text-ink">
        {article.blocks.map((block, index) => (
          <ArticleBlockView key={index} block={block} index={index} article={article} />
        ))}
      </div>
      {article.products.length > 0 && !article.blocks.some((block) => block.type === "products") ? (
        <div className="mt-8">
          <ProductCards article={article} />
        </div>
      ) : null}
      {related.length > 0 ? (
        <section aria-labelledby="related-articles" className="mt-8">
          <h2 id="related-articles" className="text-base font-medium text-ink">
            関連記事
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {related.map((item) => (
              <li key={item.slug} className="min-w-0">
                <ArticleCard article={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
