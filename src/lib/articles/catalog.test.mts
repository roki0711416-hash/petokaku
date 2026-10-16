import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { articles } from "../../data/articles.ts";
import {
  articleImageIsValid,
  articleIsValid,
  articleSitemapPaths,
  articleStructuredData,
  isArticleProductHref,
  publishedArticle,
  publishedArticles,
  type Article,
} from "./catalog.ts";

function article(patch: Partial<Article> = {}): Article {
  return {
    slug: "sample-note",
    title: "見方",
    description: "比較の見方です。",
    publishedOn: "2026-10-13",
    updatedOn: "2026-10-13",
    published: true,
    blocks: [{ type: "p", text: "同じJANだけをまとめます。" }],
    relatedSlugs: [],
    products: [],
    ...patch,
  };
}

test("公開記事だけを一覧とサイトマップに出す", () => {
  const draft = article({ slug: "draft-note", published: false });
  const live = article();
  assert.deepEqual(publishedArticles([draft, live]).map((item) => item.slug), ["sample-note"]);
  assert.equal(publishedArticle("draft-note", [draft, live]), null);
  assert.deepEqual(articleSitemapPaths([draft, live]), ["/articles/sample-note"]);
});

test("商品リンクは既存のJAN詳細だけを受け、不正な記事は公開しない", () => {
  assert.equal(isArticleProductHref("/products/jan/3182550706933"), true);
  assert.equal(isArticleProductHref("/categories/cat-litter"), true);
  assert.equal(isArticleProductHref("/pets/cat?category=litter"), true);
  assert.equal(isArticleProductHref("https://example.com/item"), false);
  assert.equal(isArticleProductHref("/search?q=猫砂"), false);
  const broken = article({ products: [{ href: "https://www.amazon.co.jp/dp/B00TEST", label: "外部" }] });
  assert.equal(articleIsValid(broken, [broken]), false);
  assert.deepEqual(publishedArticles([broken]), []);
  const early = article({ updatedOn: "2026-10-12" });
  assert.equal(articleIsValid(early, [early]), false);
  assert.equal(articleImageIsValid(undefined), true);
  assert.equal(articleImageIsValid({ src: "/article-images/cat-litter-types.png", alt: "図" }), true);
  assert.equal(articleImageIsValid({ src: "https://example.com/photo.jpg", alt: "外部" }), false);
  const remote = article({ image: { src: "https://example.com/photo.jpg", alt: "外部" } });
  assert.equal(articleIsValid(remote, [remote]), false);
});

test("初期の公開記事は比較ルールだけで、未確認の評価は含まない", () => {
  const howTo = publishedArticles(articles).find((item) => item.slug === "how-to-compare-pet-prices");
  assert.ok(howTo);
  const liveText = [
    howTo.title,
    howTo.description,
    ...howTo.blocks.flatMap((block) => {
      if (block.type === "ul") {
        return block.items;
      }
      if (block.type === "table") {
        return [...block.headers, ...block.rows.flat()];
      }
      if (block.type === "p" || block.type === "h2" || block.type === "h3" || block.type === "note") {
        return [block.text];
      }
      if (block.type === "source") {
        return [block.label];
      }
      return [];
    }),
    ...howTo.products.map((product) => product.label),
  ].join("\n");
  for (const word of ["ランキング", "レビュー", "体験談", "おすすめ", "最安"]) {
    assert.equal(liveText.includes(word), false);
  }
  const live = publishedArticles(articles);
  assert.equal(live.length, 5);
  for (const slug of ["cat-litter-types", "how-to-choose-cat-food", "how-to-choose-dog-food", "how-to-choose-pet-sheets"]) {
    assert.equal(live.some((item) => item.slug === slug), true);
  }
  assert.equal(articleSitemapPaths(articles).includes("/articles/how-to-choose-pet-sheets"), true);
  const sheets = live.find((item) => item.slug === "how-to-choose-pet-sheets");
  assert.ok(sheets);
  assert.equal(sheets.products[0]?.href, "/products/jan/4520699667989");
  assert.equal(sheets.image, undefined);
  assert.equal(howTo.products[0]?.href, "/products/jan/3182550706933");
  assert.equal(howTo.products[0]?.label, "ロイヤルカナン インドア 成猫用 4kg");
  const dogFood = live.find((item) => item.slug === "how-to-choose-dog-food");
  assert.ok(dogFood);
  assert.equal(dogFood.products[0]?.href, "/products/jan/4562358781780");
  assert.equal(dogFood.products.some((product) => product.href === "/products/jan/4562358781797"), true);
  const litter = live.find((item) => item.slug === "cat-litter-types");
  assert.ok(litter);
  assert.equal(litter.products.filter((product) => product.href === "/products/jan/4905009714353").length, 1);
  assert.equal(litter.products.filter((product) => product.href === "/products/jan/4903351011250").length, 1);
  const data = articleStructuredData(howTo, "https://petokaku.com/articles/how-to-compare-pet-prices");
  assert.equal(data["@type"], "Article");
  assert.equal(data.headline, "ペット用品の価格比較の見方");
  assert.equal(data.image, "https://petokaku.com/article-images/how-to-compare-pet-prices.png");
  assert.equal(data.datePublished, "2026-10-13");
  for (const item of live) {
    assert.equal(item.published, true);
    if (!item.image) {
      continue;
    }
    assert.equal(item.image.src.startsWith("/article-images/"), true);
    assert.equal(existsSync(new URL(`../../../public${item.image.src}`, import.meta.url)), true);
  }
  assert.equal(data.dateModified, "2026-10-17");
  assert.equal(data.mainEntityOfPage, "https://petokaku.com/articles/how-to-compare-pet-prices");
});
