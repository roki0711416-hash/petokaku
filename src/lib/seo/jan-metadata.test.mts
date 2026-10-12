import assert from "node:assert/strict";
import test from "node:test";
import { janProductMetadata } from "./jan-metadata.ts";

test("商品詳細のtitleとdescriptionとcanonicalはJANごとに決まる", () => {
  const metadata = janProductMetadata({
    jan: "3182550706933",
    name: "【正規品】ロイヤルカナン 猫 4kg 3182550706933",
    brand: "ロイヤルカナン",
    imageUrl: "http://example.com/item.jpg",
  });
  assert.match(String(metadata.title), /価格比較/);
  assert.doesNotMatch(String(metadata.title), /3182550706933/);
  assert.match(String(metadata.description), /JAN 3182550706933/);
  assert.match(String(metadata.description), /ロイヤルカナン/);
  assert.equal(metadata.alternates?.canonical, "/products/jan/3182550706933");
  assert.equal(metadata.openGraph?.url, "/products/jan/3182550706933");
  assert.equal(metadata.openGraph?.images, undefined);
});
