import assert from "node:assert/strict";
import test from "node:test";
import type { Article } from "./catalog.ts";
import { articlesLinkingToJan } from "./related-for-jan.ts";

function article(partial: Partial<Article> & Pick<Article, "slug" | "products">): Article {
  return {
    title: partial.title ?? partial.slug,
    description: "説明",
    publishedOn: "2026-01-01",
    updatedOn: "2026-01-02",
    published: partial.published ?? true,
    blocks: [{ type: "p", text: "本文" }],
    relatedSlugs: [],
    ...partial,
  };
}

test("JANに紐づく公開記事だけ返す", () => {
  const list = [
    article({
      slug: "a",
      title: "記事A",
      products: [{ href: "/products/jan/4562358781780", label: "商品" }],
    }),
    article({
      slug: "b",
      title: "記事B",
      products: [{ href: "/products/jan/4903351011250", label: "別商品" }],
    }),
    article({
      slug: "c",
      title: "非公開",
      published: false,
      products: [{ href: "/products/jan/4562358781780", label: "商品" }],
    }),
  ];
  assert.deepEqual(articlesLinkingToJan("4562358781780", list), [{ href: "/articles/a", title: "記事A" }]);
  assert.deepEqual(articlesLinkingToJan("0000000000000", list), []);
});
