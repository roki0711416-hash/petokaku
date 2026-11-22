import assert from "node:assert/strict";
import test from "node:test";
import { defaultShareImage, shareMetadata } from "./share-metadata.ts";

test("共有メタデータはページのタイトル・説明・canonicalとOGPを揃える", () => {
  const metadata = shareMetadata({
    title: "ペトカクについて",
    description: "ペトカクは、ペット用品の価格と送料を販売店ごとに見比べるサイトです。",
    path: "/about",
  });
  assert.equal(metadata.title, "ペトカクについて");
  assert.equal(metadata.description, "ペトカクは、ペット用品の価格と送料を販売店ごとに見比べるサイトです。");
  assert.equal(metadata.alternates?.canonical, "/about");
  assert.equal(metadata.openGraph?.title, "ペトカクについて | ペトカク");
  assert.equal(metadata.openGraph?.description, metadata.description);
  assert.equal(metadata.openGraph?.url, "/about");
  assert.equal(metadata.openGraph?.type, "website");
  assert.deepEqual(metadata.openGraph?.images, [defaultShareImage]);
  assert.equal(metadata.twitter?.card, "summary_large_image");
  assert.equal(metadata.twitter?.title, "ペトカクについて | ペトカク");
  assert.equal(metadata.twitter?.description, metadata.description);
  assert.deepEqual(metadata.twitter?.images, [defaultShareImage]);
});

test("ホームの共有タイトルは文書タイトルそのもの", () => {
  const title = "ペトカク - ペット用品の価格比較ならペトカク";
  const metadata = shareMetadata({
    title,
    description: "説明",
    path: "/",
    absoluteTitle: true,
  });
  assert.deepEqual(metadata.title, { absolute: title });
  assert.equal(metadata.openGraph?.title, title);
  assert.equal(metadata.openGraph?.url, "/");
  assert.equal(metadata.twitter?.card, "summary_large_image");
});
