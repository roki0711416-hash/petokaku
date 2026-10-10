import assert from "node:assert/strict";
import test from "node:test";
import { payableTotal } from "../../pricing/visible-offers.ts";
import { rakutenFixtureItems } from "./fixture.ts";
import { rakutenOffersForJan } from "./offers.ts";
import { loadRakutenJanOffers } from "./search.ts";
import type { RakutenSourceItem } from "./types.ts";

const observedAt = "2026-10-10T00:00:00.000Z";

test("楽天の掲載は一致したJANだけを共通形式にし、送料不明の合計は出さない", () => {
  const unknown: RakutenSourceItem = {
    name: "ロイヤルカナン ミニ インドア アダルト 4kg",
    price: 5900,
    url: "https://item.rakuten.co.jp/example/fee-unknown/",
    imageUrl: null,
    shopName: "送料不明店",
    shopCode: "unknown-shop",
    itemCode: "unknown-shop:1",
    janCode: "3182550849647",
    shippingFee: 700,
    shippingStatus: null,
    inStock: true,
  };
  const otherJan: RakutenSourceItem = {
    ...rakutenFixtureItems[0],
    janCode: "3182550849654",
    shopCode: "other-size",
    itemCode: "other-size:1",
    name: "ロイヤルカナン ミニ インドア アダルト 8kg",
  };
  const setItem: RakutenSourceItem = {
    ...rakutenFixtureItems[0],
    name: "ロイヤルカナン ミニ インドア アダルト 4kg 2個セット",
    shopCode: "set-shop",
    itemCode: "set-shop:1",
    affiliateUrl: "https://hb.afl.rakuten.co.jp/hgc/affiliate-id/",
  };
  const foreignAffiliate: RakutenSourceItem = {
    ...rakutenFixtureItems[0],
    shopCode: "foreign-shop",
    itemCode: "foreign-shop:1",
    affiliateUrl: "https://shopping.yahoo.co.jp/item",
  };
  const previousAffiliate = process.env.RAKUTEN_AFFILIATE_ID;
  process.env.RAKUTEN_AFFILIATE_ID = "affiliate-id";
  let offers: ReturnType<typeof rakutenOffersForJan> = [];
  try {
    offers = rakutenOffersForJan([...rakutenFixtureItems, unknown, otherJan, setItem, foreignAffiliate], "3182550849647", observedAt);
  } finally {
    if (previousAffiliate == null) delete process.env.RAKUTEN_AFFILIATE_ID;
    else process.env.RAKUTEN_AFFILIATE_ID = previousAffiliate;
  }
  assert.deepEqual(offers.map((offer) => offer.shopName), ["楽天サンプル店", "送料不明店", "楽天サンプル店", "楽天サンプル店"]);
  assert.equal(offers[0]?.affiliateUrl, null);
  assert.equal(offers[2]?.affiliateUrl, "https://hb.afl.rakuten.co.jp/hgc/affiliate-id/");
  assert.equal(offers[3]?.affiliateUrl, null);
  assert.equal(offers.every((offer) => offer.provider === "rakuten" && offer.isSample === false), true);
  const free = offers[0];
  const missingFee = offers[1];
  const setOffer = offers[2];
  assert.equal(free ? payableTotal(free) : null, 5720);
  assert.equal(missingFee ? payableTotal(missingFee) : 0, null);
  assert.equal(setOffer?.packCount, 2);
});

test("楽天の認証が無いときは接続せず、JANが一致した製品だけを載せる", async () => {
  const previousId = process.env.RAKUTEN_APPLICATION_ID;
  const previousKey = process.env.RAKUTEN_ACCESS_KEY;
  const previousAffiliate = process.env.RAKUTEN_AFFILIATE_ID;
  let called = 0;
  const transport = () => {
    called += 1;
    return Promise.resolve({
      status: 200,
      text: JSON.stringify({
        products: [
          {
            productCode: "3182550849647",
            productName: "ロイヤルカナン ミニ インドア アダルト 4kg",
            usedExcludeSalesMinPrice: 5900,
            usedExcludeSalesItemCount: 3,
            productUrlPC: "https://product.rakuten.co.jp/product/-/3182550849647/",
          },
        ],
      }),
    });
  };
  try {
    delete process.env.RAKUTEN_APPLICATION_ID;
    delete process.env.RAKUTEN_ACCESS_KEY;
    delete process.env.RAKUTEN_AFFILIATE_ID;
    const missing = await loadRakutenJanOffers("3182550849647", transport);
    assert.deepEqual(missing, { ok: false, reason: "not-configured" });
    assert.equal(called, 0);
    process.env.RAKUTEN_APPLICATION_ID = "test-app";
    process.env.RAKUTEN_ACCESS_KEY = "test-key";
    const present = await loadRakutenJanOffers("3182550849647", transport);
    assert.equal(present.ok, true);
    assert.equal(present.ok ? present.offers[0]?.price : null, 5900);
    assert.equal(present.ok ? present.offers[0]?.affiliateUrl : "sent", null);
    const other = await loadRakutenJanOffers("4900000000000", transport);
    assert.deepEqual(other, { ok: true, offers: [] });
    assert.equal(called, 2);
  } finally {
    if (previousId == null) delete process.env.RAKUTEN_APPLICATION_ID;
    else process.env.RAKUTEN_APPLICATION_ID = previousId;
    if (previousKey == null) delete process.env.RAKUTEN_ACCESS_KEY;
    else process.env.RAKUTEN_ACCESS_KEY = previousKey;
    if (previousAffiliate == null) delete process.env.RAKUTEN_AFFILIATE_ID;
    else process.env.RAKUTEN_AFFILIATE_ID = previousAffiliate;
  }
});
