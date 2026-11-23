import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import productsFile from "../data/products.json" with { type: "json" };
import {
  categoryProductGroups,
  categoryUpdatedAtFromRows,
  classifyCategoryLabel,
  extraLiveProducts,
  isUnsafeCategoryLabel,
  mergeCategoryProducts,
  parseLiveProductRows,
  productsForGuide,
  type CategoryProduct,
} from "./category-products.ts";

test("品目の商品は確認済みのJANだけで、架空サンプルとAmazonの価格を混ぜない", () => {
  const samples = productsFile.products.map((product) => product.name);
  const listed = (["dog-food", "cat-food", "cat-litter", "pet-sheets", "treats", "cat-tower", "pet-toilet"] as const).flatMap((slug) =>
    productsForGuide(slug).map((product) => ({ slug, ...product })),
  );
  assert.equal(listed.length > 0, true);
  for (const product of listed) {
    assert.match(product.href, /^\/products\/jan\/[0-9]{13}$/);
    assert.equal(product.href.endsWith(product.janCode), true);
    assert.equal(/amazon|アマゾン|架空|サンプル|円/.test(product.label), false);
    assert.equal(samples.includes(product.label), false);
    assert.equal("price" in product, false);
  }
  assert.deepEqual(
    productsForGuide("dog-food").map((product) => product.janCode),
    ["4562358781780", "4562358781797", "4580518141427"],
  );
  assert.deepEqual(
    productsForGuide("cat-food").map((product) => product.janCode),
    ["3182550706933", "3182550702423"],
  );
  assert.deepEqual(
    productsForGuide("cat-litter").map((product) => product.janCode),
    ["4905009714353", "4903351011250", "4959283036137"],
  );
  assert.deepEqual(productsForGuide("treats"), []);
  assert.deepEqual(
    productsForGuide("cat-tower").map((product) => product.label),
    ["キャットタワー スリム 据え置き 高さ142cm"],
  );
  assert.deepEqual(
    productsForGuide("pet-toilet").map((product) => product.janCode),
    ["4520699282786", "4520699618851", "4520699632291"],
  );
  const toiletGroups = categoryProductGroups("pet-toilet").map((group) => [group.heading, group.products.length]);
  assert.deepEqual(toiletGroups, [
    ["トイレ本体・専用シート", 3],
    ["猫砂", 3],
    ["ペットシーツ", 1],
  ]);
});

test("短い商品名は品目が一つに決まるときだけ割り当てる", () => {
  assert.equal(classifyCategoryLabel("POCHI ザ・ドッグフード ベーシック 3kg"), "dog-food");
  assert.equal(classifyCategoryLabel("ロイヤルカナン インドア 成猫用 4kg"), "cat-food");
  assert.equal(classifyCategoryLabel("キャットタワー 据え置き"), "cat-tower");
  assert.equal(classifyCategoryLabel("汎用ブラシ"), null);
  assert.equal(isUnsafeCategoryLabel("架空のおやつ 1,200円"), true);
  assert.equal(classifyCategoryLabel("架空のおやつ 1,200円"), null);
});

test("取得行は既存JANの更新時刻に使い、価格の列は読まない", () => {
  const rows = parseLiveProductRows([
    {
      name: "ニュートロ シュプレモ 小型犬 成犬用",
      updated_at: "2026-11-02T00:00:00.000Z",
      category: "dog",
      price: 3980,
      variants: [{ jan_code: "4562358781780", size_label: "3kg", price: 3980 }],
    },
    {
      name: "架空のキャットタワー",
      updated_at: "2026-11-20T00:00:00.000Z",
      category: "cat",
      variants: [{ jan_code: "4582701000467", size_label: "120cm" }],
    },
    {
      name: "犬用 ささみジャーキー",
      updated_at: "2026-11-05T00:00:00.000Z",
      category: "dog",
      variants: [{ jan_code: "4900000000018", size_label: "80g" }],
    },
    { name: "日付なし", updated_at: "昨日", category: "dog", variants: [] },
  ]);
  assert.equal(rows.some((row) => JSON.stringify(row).includes("3980")), false);
  assert.equal(rows.some((row) => row.name.includes("架空")), false);
  const updated = categoryUpdatedAtFromRows(rows);
  assert.equal(updated["/categories/dog-food"], "2026-11-02T00:00:00.000Z");
  assert.equal(updated["/categories/treats"], "2026-11-05T00:00:00.000Z");
  assert.equal(updated["/categories/cat-tower"], undefined);

  const extra = extraLiveProducts("treats", rows);
  assert.deepEqual(extra, [
    { janCode: "4900000000018", href: "/products/jan/4900000000018", label: "犬用 ささみジャーキー 80g" },
  ]);
  const primary: CategoryProduct[] = [
    { janCode: "4562358781780", href: "/products/jan/4562358781780", label: "既存" },
  ];
  const merged = mergeCategoryProducts(primary, [
    ...extra,
    { janCode: "4562358781780", href: "/products/jan/4562358781780", label: "重複" },
    { janCode: "123", href: "https://www.amazon.co.jp/dp/B00TEST", label: "外部" },
  ]);
  assert.deepEqual(
    merged.map((product) => product.janCode),
    ["4562358781780", "4900000000018"],
  );
});

test("品目ページは商品一覧を静的データから出し、AmazonのURLを構造化データに入れない", () => {
  const page = readFileSync(new URL("../components/item-guide-page.tsx", import.meta.url), "utf8");
  const index = readFileSync(new URL("../app/categories/page.tsx", import.meta.url), "utf8");
  const footer = readFileSync(new URL("../components/site-footer.tsx", import.meta.url), "utf8");
  assert.match(page, /loadCategoryProductGroups/);
  assert.doesNotMatch(page, /amazon\.co\.jp|sellingPrice|lowestPrice/);
  assert.match(index, /\/categories/);
  assert.match(footer, /\/categories\/treats/);
  assert.match(footer, /\/categories\/cat-tower/);
  assert.match(footer, /\/categories\/pet-toilet/);
  assert.match(footer, /href: "\/categories"/);
});
