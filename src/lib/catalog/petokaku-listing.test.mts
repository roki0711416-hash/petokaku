import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { sameCatalogOffer } from "./petokaku-listing.ts";
import { yahooListingToPetokaku } from "./yahoo-listing.ts";
import { adaptRakutenItems } from "../sources/rakuten/adapter.ts";
import { rakutenFixtureItems } from "../sources/rakuten/fixture.ts";

const observedAt = "2026-10-05T07:00:00.000Z";

test("Yahooの掲載は共通形式でもYahooの販売者と商品コードのまま", () => {
  const product = yahooListingToPetokaku({
    name: "ロイヤルカナン 4kg",
    brand: "ロイヤルカナン",
    category: "dog",
    unitPriceType: "per_100g",
    imageUrl: null,
    janCode: "3182550849647",
    sizeLabel: "4kg",
    offers: [
      {
        shopName: "モコペット",
        productUrl: "https://store.shopping.yahoo.co.jp/1096dog/50676.html",
        affiliateUrl: null,
        sellerId: "1096dog",
        itemCode: "1096dog_50676",
        listingTitle: "ロイヤルカナン 4kg",
        packCount: null,
        packUnit: null,
        price: 5956,
        shippingFee: 0,
        shippingStatus: "free",
        stockStatus: "in_stock",
        observedAt,
      },
    ],
  });
  assert.equal(product.variant.offers[0]?.provider, "yahoo");
  assert.equal(product.variant.offers[0]?.sellerId, "1096dog");
  assert.equal(product.variant.offers[0]?.itemCode, "1096dog_50676");
});

test("楽天はJANがあるものだけまとめ、名前だけではYahooと結合しない", () => {
  const products = adaptRakutenItems(rakutenFixtureItems, observedAt);
  assert.equal(products.length, 3);
  const withJan = products.find((product) => product.variant.janCode === "3182550849647");
  assert.equal(withJan?.variant.offers.length, 1);
  assert.equal(withJan?.variant.offers[0]?.provider, "rakuten");
  assert.equal(withJan?.category, null);
  const unnamed = products.filter((product) => product.variant.janCode == null);
  assert.equal(unnamed.length, 2);
  assert.equal(unnamed[1]?.variant.offers[0]?.observation.shippingFee, null);
  assert.equal(unnamed[1]?.variant.offers[0]?.observation.shippingStatus, "unknown");

  const yahoo = yahooListingToPetokaku({
    name: "名前だけでJANがないフード",
    brand: "",
    category: "dog",
    unitPriceType: "none",
    imageUrl: null,
    janCode: null,
    sizeLabel: "容量未確認",
    offers: [
      {
        shopName: "楽天サンプル店",
        productUrl: null,
        affiliateUrl: null,
        sellerId: "rakuten-shop",
        itemCode: "rakuten-shop:10001",
        listingTitle: "名前だけでJANがないフード",
        packCount: null,
        packUnit: null,
        price: 5720,
        shippingFee: 0,
        shippingStatus: "free",
        stockStatus: "in_stock",
        observedAt,
      },
    ],
  });
  assert.equal(sameCatalogOffer(yahoo.variant.offers[0]!, withJan!.variant.offers[0]!), false);
});

test("楽天Adapterは通信しない", () => {
  const adapter = readFileSync(new URL("../sources/rakuten/adapter.ts", import.meta.url), "utf8");
  assert.doesNotMatch(adapter, /fetch\(|YAHOO_CLIENT_ID|SUPABASE_SECRET_KEY|rakuten\.co\.jp\/services/);
});
