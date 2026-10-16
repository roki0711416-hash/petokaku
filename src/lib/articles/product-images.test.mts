import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedArticleProductImageUrl, janFromArticleProductHref } from "./product-href.ts";

test("記事の商品hrefから13桁JANだけを取り出す", () => {
  assert.equal(janFromArticleProductHref("/products/jan/4905009714353"), "4905009714353");
  assert.equal(janFromArticleProductHref("/products/jan/4903351011250"), "4903351011250");
  assert.equal(janFromArticleProductHref("/categories/cat-litter"), null);
  assert.equal(janFromArticleProductHref("/pets/cat?category=litter"), null);
  assert.equal(janFromArticleProductHref("/products/jan/123"), null);
});

test("記事カードの商品画像は許可ホストだけを使う", () => {
  assert.equal(isAllowedArticleProductImageUrl("https://item-shopping.c.yimg.jp/i/l/example"), true);
  assert.equal(isAllowedArticleProductImageUrl("https://thumbnail.image.rakuten.co.jp/example.jpg"), true);
  assert.equal(isAllowedArticleProductImageUrl("https://example.com/photo.jpg"), false);
  assert.equal(isAllowedArticleProductImageUrl("javascript:alert(1)"), false);
});
