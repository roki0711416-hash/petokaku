import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { shopProductLink } from "./shop-link.ts";

test("アフィリエイトURLがなければ商品URLを使う", () => {
  assert.deepEqual(
    shopProductLink({
      affiliateUrl: null,
      productUrl: "https://store.shopping.yahoo.co.jp/1096dog/50676.html",
    }),
    { href: "https://store.shopping.yahoo.co.jp/1096dog/50676.html", affiliate: false },
  );
  assert.deepEqual(
    shopProductLink({
      affiliateUrl: "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1",
      productUrl: "https://store.shopping.yahoo.co.jp/1096dog/50676.html",
    }),
    { href: "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1", affiliate: true },
  );
  assert.deepEqual(shopProductLink({ affiliateUrl: null, productUrl: null }), { href: null, affiliate: false });
});

test("アフィリエイトIDはまだ設定しない", () => {
  const source = readFileSync(new URL("./shop-link.ts", import.meta.url), "utf8");
  const card = readFileSync(new URL("../../components/ui/shop-card.tsx", import.meta.url), "utf8");
  assert.match(card, /shopProductLink/);
  assert.doesNotMatch(source, /sid=|aff_id|affiliate_id|YAHOO_CLIENT_ID/);
  const design = readFileSync(new URL("../../../db/favorites-notifications-design.sql", import.meta.url), "utf8");
  assert.match(design, /まだ実行しない/);
  assert.match(design, /unique \(favorite_id, notified_price\)/);
  assert.doesNotMatch(design, /\bDROP\b|\bTRUNCATE\b|\bDELETE\b|CREATE TABLE/);
});
