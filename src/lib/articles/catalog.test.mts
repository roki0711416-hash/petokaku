import assert from "node:assert/strict";
import test from "node:test";
import { articles } from "../../data/articles.ts";
import {
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
  assert.equal(isArticleProductHref("https://example.com/item"), false);
  assert.equal(isArticleProductHref("/search?q=猫砂"), false);
  const broken = article({ products: [{ href: "https://www.amazon.co.jp/dp/B00TEST", label: "外部" }] });
  assert.equal(articleIsValid(broken, [broken]), false);
  assert.deepEqual(publishedArticles([broken]), []);
  const early = article({ updatedOn: "2026-10-12" });
  assert.equal(articleIsValid(early, [early]), false);
});

test("初期の公開記事は比較ルールだけで、未確認の評価は含まない", () => {
  const howTo = publishedArticles(articles).find((item) => item.slug === "how-to-compare-pet-prices");
  assert.ok(howTo);
  const liveText = [
    howTo.title,
    howTo.description,
    ...howTo.blocks.flatMap((block) => (block.type === "ul" ? block.items : block.type === "table" ? [...block.headers, ...block.rows.flat()] : [block.text])),
    ...howTo.products.map((product) => product.label),
  ].join("\n");
  for (const word of ["ランキング", "レビュー", "体験談", "おすすめ", "最安"]) {
    assert.equal(liveText.includes(word), false);
  }
  const live = publishedArticles(articles);
  assert.equal(live.length, 2);
  assert.equal(live.some((item) => item.slug === "cat-litter-types"), true);
  assert.deepEqual(howTo.products, [{ href: "/products/jan/3182550706933", label: "ロイヤルカナンの猫用4kg商品の価格比較" }]);
  const data = articleStructuredData(howTo, "https://petokaku.com/articles/how-to-compare-pet-prices");
  assert.equal(data["@type"], "Article");
  assert.equal(data.headline, "ペット用品の価格比較の見方");
  assert.equal(data.datePublished, "2026-10-13");
  assert.equal(data.dateModified, "2026-10-13");
  assert.equal(data.mainEntityOfPage, "https://petokaku.com/articles/how-to-compare-pet-prices");
});
