import assert from "node:assert/strict";
import test from "node:test";
import { probeRakutenItemSearch, rakutenProbeRequest } from "./probe.ts";

test("接続確認はアフィリエイトIDを送らず、アクセスキーをURLに載せない", () => {
  const { url, headers } = rakutenProbeRequest("app-id", "猫砂", "access-key");
  assert.equal(url.origin + url.pathname, "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701");
  assert.equal(url.searchParams.get("applicationId"), "app-id");
  assert.equal(url.searchParams.get("affiliateId"), null);
  assert.equal(url.searchParams.get("accessKey"), null);
  assert.equal(headers.accessKey, "access-key");
  assert.equal(headers.Referer, "https://petokaku.com/");
  assert.equal(url.searchParams.get("hits"), "1");
});

test("認証が無い接続確認は通信しない", async () => {
  const previousId = process.env.RAKUTEN_APPLICATION_ID;
  const previousKey = process.env.RAKUTEN_ACCESS_KEY;
  delete process.env.RAKUTEN_APPLICATION_ID;
  delete process.env.RAKUTEN_ACCESS_KEY;
  try {
    const result = await probeRakutenItemSearch("猫砂");
    assert.equal(result.reason, "not-configured");
  } finally {
    if (previousId == null) delete process.env.RAKUTEN_APPLICATION_ID;
    else process.env.RAKUTEN_APPLICATION_ID = previousId;
    if (previousKey == null) delete process.env.RAKUTEN_ACCESS_KEY;
    else process.env.RAKUTEN_ACCESS_KEY = previousKey;
  }
});
