import assert from "node:assert/strict";
import test from "node:test";
import { curatedJanSeo, janProductMetadata } from "./jan-metadata.ts";

test("商品詳細のtitleとdescriptionとcanonicalはJANごとに決まる", () => {
  const metadata = janProductMetadata({
    jan: "3182550706940",
    name: "【正規品】ロイヤルカナン 猫 10kg 3182550706940",
    brand: "ロイヤルカナン",
    imageUrl: "http://example.com/item.jpg",
  });
  assert.match(String(metadata.title), /価格比較/);
  assert.doesNotMatch(String(metadata.title), /3182550706940/);
  assert.match(String(metadata.description), /JAN 3182550706940/);
  assert.match(String(metadata.description), /ロイヤルカナン/);
  assert.equal(metadata.alternates?.canonical, "/products/jan/3182550706940");
  assert.equal(metadata.openGraph?.url, "/products/jan/3182550706940");
  assert.equal(metadata.openGraph?.images, undefined);
});

test("重点5商品はモール見出しではなく短い比較向けtitle・descriptionを使う", () => {
  const cases = [
    {
      jan: "4903351011250",
      name: "LION ライオンペット ニオイをとる砂 5L×4個 ニオイをとる砂 猫砂 ベントナイト 消臭 抗菌 まとめ買い",
      brand: "LION",
      title: "LION ニオイをとる砂 5L×4個の価格比較",
      descriptionIncludes: ["ニオイをとる砂", "5L×4個", "複数ショップ", "送料込みの支払総額"],
      descriptionExcludes: ["ベントナイト", "まとめ買いの価格比較（JAN", "最安"],
    },
    {
      jan: "4520699667989",
      name: "(セール)デオシート レギュラー ジャンボパック 112枚入 4袋 ペットシーツ ユニ・チャーム",
      brand: "ユニ・チャーム",
      title: "デオシート レギュラー 112枚×4袋の価格比較",
      descriptionIncludes: ["デオシート", "112枚", "4袋", "複数ショップ", "送料込みの支払総額"],
      descriptionExcludes: ["(セール)", "ジャンボパック", "最安"],
    },
    {
      jan: "3182550706933",
      name: "ロイヤルカナン 猫 4kg インドア キャットフード キャット 室内猫 成猫用 キャットフード 猫用 フード 猫",
      brand: "フィーライン ヘルス ニュートリション",
      title: "ロイヤルカナン インドア 成猫用 4kgの価格比較",
      descriptionIncludes: ["ロイヤルカナン", "インドア", "4kg", "複数ショップ", "送料込みの支払総額"],
      descriptionExcludes: ["フィーライン", "キャットフード 猫用 フード", "最安"],
    },
    {
      jan: "4562358781780",
      name: "公認店 ニュートロ シュプレモ 小型犬 成犬用 3kg 小型犬 成犬 ドッグフード ニュートロドッグフード",
      brand: "ニュートロ",
      title: "ニュートロ シュプレモ 小型犬 成犬用 3kgの価格比較",
      descriptionIncludes: ["シュプレモ", "小型犬", "3kg", "複数ショップ", "送料込みの支払総額"],
      descriptionExcludes: ["公認店", "ニュートロドッグフード", "最安"],
    },
    {
      jan: "4905009714353",
      name: "猫砂 紙 固まる 流せる 燃やせる 多頭飼い ペレット 燃えるゴミ 紙ペレット 大容量 猫トイレ アイリスオーヤマ 紙の猫砂 7L",
      brand: "IRIS OHYAMA",
      title: "アイリスオーヤマ 紙の猫砂 7Lの価格比較",
      descriptionIncludes: ["紙の猫砂", "7L", "複数ショップ", "送料込みの支払総額"],
      descriptionExcludes: ["流せる", "燃やせる", "IRIS OHYAMAの猫砂 紙", "最安"],
    },
  ] as const;

  for (const item of cases) {
    const curated = curatedJanSeo(item.jan);
    assert.ok(curated);
    assert.equal(curated.title, item.title);
    assert.doesNotMatch(item.title, /ペトカク|セール|公認店|最安/);
    assert.ok(item.title.length <= 32, `${item.jan} title too long for SERP: ${item.title.length}`);
    const metadata = janProductMetadata({
      jan: item.jan,
      name: item.name,
      brand: item.brand,
    });
    assert.equal(metadata.title, item.title);
    assert.equal(metadata.description, curated.description);
    assert.equal(metadata.alternates?.canonical, `/products/jan/${item.jan}`);
    assert.equal(metadata.openGraph?.title, item.title);
    assert.equal(metadata.openGraph?.description, curated.description);
    const description = String(metadata.description);
    for (const word of item.descriptionIncludes) {
      assert.match(description, new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    for (const word of item.descriptionExcludes) {
      assert.equal(description.includes(word), false, `${item.jan} should not include ${word}`);
    }
    assert.doesNotMatch(description, /最安|保証|必ず/);
    assert.ok(description.length >= 60 && description.length <= 140, `${item.jan} description length ${description.length}`);
  }
});
