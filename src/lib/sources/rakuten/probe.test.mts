import assert from "node:assert/strict";
import test from "node:test";
import { probeRakutenItemSearch, rakutenProbeRequest } from "./probe.ts";

test("接続確認はアフィリエイトIDを送らず、アクセスキーをURLに載せない", () => {
  const { url, headers } = rakutenProbeRequest("app-id", "猫砂");
  assert.equal(url.origin + url.pathname, "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701");
  assert.equal(url.searchParams.get("applicationId"), "app-id");
  assert.equal(url.searchParams.get("affiliateId"), null);
  assert.equal(url.searchParams.get("accessKey"), null);
  assert.equal(headers.get("accessKey"), null);
  assert.equal(url.searchParams.get("hits"), "1");
});

test("認証が無い接続確認は通信しない", async () => {
  const previousId = process.env.RAKUTEN_APPLICATION_ID;
  const previousKey = process.env.RAKUTEN_ACCESS_KEY;
  const previousFetch = globalThis.fetch;
  let called = 0;
  globalThis.fetch = (() => {
    called += 1;
    return Promise.resolve(new Response("{}"));
  }) as typeof fetch;
  try {
    delete process.env.RAKUTEN_APPLICATION_ID;
    delete process.env.RAKUTEN_ACCESS_KEY;
    const result = await probeRakutenItemSearch("猫砂");
    assert.equal(result.reason, "not-configured");
    assert.equal(called, 0);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousId == null) delete process.env.RAKUTEN_APPLICATION_ID;
    else process.env.RAKUTEN_APPLICATION_ID = previousId;
    if (previousKey == null) delete process.env.RAKUTEN_ACCESS_KEY;
    else process.env.RAKUTEN_ACCESS_KEY = previousKey;
  }
});

test("接続できた応答から項目の有無だけを残し、JANが無ければ無しと出す", async () => {
  const previousId = process.env.RAKUTEN_APPLICATION_ID;
  const previousKey = process.env.RAKUTEN_ACCESS_KEY;
  const previousFetch = globalThis.fetch;
  process.env.RAKUTEN_APPLICATION_ID = "app-id";
  process.env.RAKUTEN_ACCESS_KEY = "access-key";
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.get("affiliateId"), null);
    assert.equal(url.searchParams.get("accessKey"), null);
    assert.equal(new Headers(init?.headers).get("accessKey"), "access-key");
    return new Response(
      JSON.stringify({
        count: 12,
        items: [
          {
            itemName: "猫砂",
            itemPrice: 980,
            itemUrl: "https://item.rakuten.co.jp/example/1/",
            shopName: "サンプル店",
            mediumImageUrls: ["https://thumbnail.image.rakuten.co.jp/example.jpg"],
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const result = await probeRakutenItemSearch("猫砂");
    assert.equal(result.ok, true);
    assert.equal(result.janFieldPresent, false);
    assert.equal(result.hasItemName && result.hasItemPrice && result.hasItemUrl && result.hasShopName && result.hasImageUrl, true);
    assert.equal(JSON.stringify(result).includes("access-key"), false);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousId == null) delete process.env.RAKUTEN_APPLICATION_ID;
    else process.env.RAKUTEN_APPLICATION_ID = previousId;
    if (previousKey == null) delete process.env.RAKUTEN_ACCESS_KEY;
    else process.env.RAKUTEN_ACCESS_KEY = previousKey;
  }
});
