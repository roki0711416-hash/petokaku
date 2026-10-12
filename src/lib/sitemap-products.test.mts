import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canonicalJanPaths } from "./sitemap-products.ts";

test("サイトマップの商品URLは比較ページの正規JANだけにする", () => {
  const jan = "3182550706933";
  const other = "4900000000018";
  assert.deepEqual(
    canonicalJanPaths([
      `/products/jan/${jan}`,
      `/products/jan/${jan}?with=${other}`,
      `https://petokaku.com/products/jan/${other}`,
      "/search?q=猫砂",
      "/products/yahoo-preview",
      "/products/sample-food",
      "https://example.com/products/jan/4900000000025",
      "",
    ]),
    [`/products/jan/${jan}`, `/products/jan/${other}`],
  );
});

test("商品サイトマップは掲載中の比較結果だけを読み、JAN検索は直接しない", () => {
  const source = readFileSync(new URL("./sitemap-products.ts", import.meta.url), "utf8");
  assert.match(source, /loadPetListings/);
  assert.match(source, /group.status !== "ready"/);
  assert.match(source, /card.compare/);
  assert.doesNotMatch(source, /searchYahooItems|loadYahooJan|affiliateUrl/);
});
