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
  };
  const offers = rakutenOffersForJan([...rakutenFixtureItems, unknown, otherJan, setItem], "3182550849647", observedAt);
  assert.deepEqual(offers.map((offer) => offer.shopName), ["楽天サンプル店", "送料不明店", "楽天サンプル店"]);
  assert.equal(offers.every((offer) => offer.provider === "rakuten" && offer.affiliateUrl == null && offer.isSample === false), true);
  const free = offers[0];
  const missingFee = offers[1];
  const setOffer = offers[2];
  assert.equal(free ? payableTotal(free) : null, 5720);
  assert.equal(missingFee ? payableTotal(missingFee) : 0, null);
  assert.equal(setOffer?.packCount, 2);
});

test("楽天の認証が無いときは接続せず、あってもJANのショップ掲載としては取得しない", async () => {
  const previousId = process.env.RAKUTEN_APPLICATION_ID;
  const previousKey = process.env.RAKUTEN_ACCESS_KEY;
  const previousFetch = globalThis.fetch;
  let called = 0;
  globalThis.fetch = (() => {
    called += 1;
    return Promise.resolve(new Response(""));
  }) as typeof fetch;
  try {
    delete process.env.RAKUTEN_APPLICATION_ID;
    delete process.env.RAKUTEN_ACCESS_KEY;
    const missing = await loadRakutenJanOffers("3182550849647");
    assert.deepEqual(missing, { ok: false, reason: "not-configured" });
    process.env.RAKUTEN_APPLICATION_ID = "test-app";
    process.env.RAKUTEN_ACCESS_KEY = "test-key";
    const present = await loadRakutenJanOffers("3182550849647");
    assert.deepEqual(present, { ok: false, reason: "not-shop-level" });
    assert.equal(called, 0);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousId == null) {
      delete process.env.RAKUTEN_APPLICATION_ID;
    } else {
      process.env.RAKUTEN_APPLICATION_ID = previousId;
    }
    if (previousKey == null) {
      delete process.env.RAKUTEN_ACCESS_KEY;
    } else {
      process.env.RAKUTEN_ACCESS_KEY = previousKey;
    }
  }
});
