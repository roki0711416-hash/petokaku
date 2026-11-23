import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  googleAnalyticsId,
  isAffiliateHref,
  outboundAnchorRel,
  pageContextFromLocation,
  pageViewToSend,
  shopClickPayload,
  shopFromDestination,
  trackShopClick,
} from "./analytics.ts";

test("測定IDはG-で始まる値だけを使う", () => {
  assert.equal(googleAnalyticsId("G-CC65BDRSTL"), "G-CC65BDRSTL");
  assert.equal(googleAnalyticsId("  G-CC65BDRSTL  "), "G-CC65BDRSTL");
  assert.equal(googleAnalyticsId(""), null);
  assert.equal(googleAnalyticsId(undefined), null);
  assert.equal(googleAnalyticsId("GTM-ABC123"), null);
  assert.equal(googleAnalyticsId("g-l1x99g7567"), null);
});

test("GA4は1か所だけで、自動ページビューと手動送信を重ねない", () => {
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const tag = readFileSync(new URL("../components/google-analytics.tsx", import.meta.url), "utf8");
  assert.equal(layout.match(/<GoogleAnalytics/g)?.length, 1);
  assert.match(tag, /choice !== "granted"/);
  assert.match(tag, /send_page_view:false/);
  assert.match(tag, /installedMeasurementId === measurementId/);
  assert.match(tag, /pageViewToSend/);
  assert.equal(tag.match(/gtag\("config"/g)?.length, 1);
  assert.equal(tag.match(/gtag\("event", "page_view"/g)?.length, 1);
  assert.equal(tag.match(/gtag\/js/g)?.length, 1);
  assert.doesNotMatch(layout, /googletagmanager|gtag\/js/);
  assert.equal(pageViewToSend(null, "/"), "/");
  assert.equal(pageViewToSend("/", "/"), null);
  assert.equal(pageViewToSend("/", "/search?q=a"), "/search?q=a");
  assert.equal(pageViewToSend("/search?q=a", "/search?q=a"), null);
});

test("ショップのリンクはモール名と表示中の商品をbeaconで送る", () => {
  assert.equal(shopFromDestination("https://store.shopping.yahoo.co.jp/x/1.html", "sample"), "yahoo");
  assert.equal(shopFromDestination("https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1", null), "yahoo");
  assert.equal(shopFromDestination("https://hb.afl.rakuten.co.jp/hgc/abc", "rakuten"), "rakuten");
  assert.equal(shopFromDestination("https://www.amazon.co.jp/dp/B07P8YGQTY?tag=petokaku-22"), "amazon");
  assert.equal(shopFromDestination("https://example.com/item"), "other");
  assert.equal(isAffiliateHref("https://www.amazon.co.jp/dp/B07P8YGQTY?tag=petokaku-22"), true);
  assert.equal(isAffiliateHref("https://hb.afl.rakuten.co.jp/hgc/abc"), true);
  assert.equal(isAffiliateHref("https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1"), true);
  assert.equal(isAffiliateHref("https://store.shopping.yahoo.co.jp/x/1.html"), false);
  assert.equal(outboundAnchorRel(true), "sponsored nofollow noopener noreferrer");
  assert.equal(outboundAnchorRel(false), "noopener noreferrer");
  const longName = "あ".repeat(140);
  assert.deepEqual(
    shopClickPayload({
      shop: "rakuten",
      shopName: "楽天市場 ペット館",
      productId: "4520699638385",
      productName: longName,
      price: 1980,
      pageType: "product",
      position: 2,
    }),
    {
      shop: "rakuten",
      shop_name: "楽天市場 ペット館",
      product_id: "4520699638385",
      product_name: "あ".repeat(100),
      price: 1980,
      page_type: "product",
      position: 2,
      transport_type: "beacon",
    },
  );
  assert.deepEqual(shopClickPayload({ shop: "yahoo", price: null, position: 0 }), {
    shop: "yahoo",
    transport_type: "beacon",
  });
  assert.deepEqual(pageContextFromLocation("/products/jan/4520699638385", "デオシートの価格比較 | ペトカク"), {
    productId: "4520699638385",
    productName: "デオシート",
    pageType: "product",
  });
  assert.equal(pageContextFromLocation("/search", "検索 | ペトカク").pageType, "search");
  assert.equal(pageContextFromLocation("/search", "検索 | ペトカク").productName, null);
});

test("shop_clickはgtagがあるときだけ送り、遷移は止めない", () => {
  const link = readFileSync(new URL("../components/shop-outbound-link.tsx", import.meta.url), "utf8");
  assert.match(link, /trackShopClick/);
  assert.match(link, /outboundAnchorRel/);
  assert.doesNotMatch(link, /preventDefault/);
  const surfaces = [
    "../components/shop-compare-list.tsx",
    "../components/shop-price-compare.tsx",
    "../components/ui/shop-card.tsx",
    "../components/amazon-associate-link.tsx",
    "../components/ui/product-card.tsx",
  ];
  for (const surface of surfaces) {
    const source = readFileSync(new URL(surface, import.meta.url), "utf8");
    assert.match(source, /ShopOutboundLink/);
    assert.doesNotMatch(source, /target="_blank"/);
  }
  assert.doesNotThrow(() => trackShopClick({ shop: "rakuten" }));
  const calls: unknown[][] = [];
  const previous = globalThis.window;
  Object.assign(globalThis, {
    window: {
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
    },
  });
  try {
    trackShopClick({
      shop: "amazon",
      productId: "4520699638385",
      productName: "フード",
      price: 1000,
      pageType: "product",
      position: 1,
    });
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0]?.[0], "event");
    assert.deepEqual(calls[0]?.[1], "shop_click");
    assert.equal((calls[0]?.[2] as { transport_type?: string }).transport_type, "beacon");
  } finally {
    if (previous === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      globalThis.window = previous;
    }
  }
});
