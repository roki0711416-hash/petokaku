import assert from "node:assert/strict";
import test from "node:test";
import { bestItemUnitIds, groupSizeFamilies, quoteSingleSize, readSizeIdentity, type SizeFamilyMember } from "./size-family.ts";

function member(overrides: Partial<SizeFamilyMember> & Pick<SizeFamilyMember, "id" | "janCode" | "titles">): SizeFamilyMember {
  return {
    animal: "cat",
    brand: "フィーライン ヘルス ニュートリション",
    genreName: "猫用ドライフード",
    ...overrides,
  };
}

const cat4 = member({
  id: "cat4",
  janCode: "3182550706933",
  titles: [
    "ロイヤルカナン インドア 4kg / 室内で生活する成猫用(生後12ヵ月齢から7歳まで) / ドライフード ジッパー有り[正規品]",
    "【お得な2個セット】ロイヤルカナン インドア 4kg / 室内で生活する成猫用(生後12ヵ月齢から7歳まで) / ドライフード",
    "【4kg×2袋】ロイヤルカナン FHN インドア 室内で生活する成猫用 生後12ヵ月齢から7歳まで",
    "ロイヤルカナン キャット インドア 4kg",
    "ロイヤルカナン FHN インドア 成猫用 4kg",
  ],
});

const cat10 = member({
  id: "cat10",
  janCode: "3182550706940",
  titles: [
    "ロイヤルカナン インドア 10kg / 室内で生活する成猫用(生後12ヵ月齢から7歳まで) / ドライフード",
    "ロイヤルカナン 猫 インドア 10kg 室内猫・成猫用 D キャットフード",
    "ロイヤルカナン キャット インドア 10kg",
    "【10kg×2袋】ロイヤルカナン FHN インドア 室内で生活する成猫用 生後12ヵ月齢から7歳まで",
    "ロイヤルカナン インドア 10kg 成猫用 生後12カ月齢以上〜7歳まで 室内で生活する猫用",
  ],
});

const catSet = member({
  id: "catset",
  janCode: "2250002883875",
  titles: ["ロイヤルカナン 猫 インドア 室内で生活する成猫用 生後12ヵ月齢から7歳まで 4kg×2袋"],
});

const plus7 = member({
  id: "plus7",
  janCode: "3182550784399",
  titles: ["ロイヤルカナン 猫用インドア +7 1.5kg D キャットフード"],
});

const urinary = member({
  id: "urinary",
  janCode: "3182550901062",
  brand: "ユリナリーS/O",
  genreName: "キャットフード　療法食、療養食",
  titles: ["猫S O4kg 療法食 ロイヤルカナン 猫用 ユリナリーS O ドライ 4kg"],
});

const wet = member({
  id: "wet",
  janCode: "2250002948840",
  genreName: "猫缶、ウエットフード",
  titles: ["ロイヤルカナン 猫 FHN-WET 室内で生活する成猫用 インドア グレービー 85g×48袋"],
});

const dog4 = member({
  id: "dog4",
  janCode: "3182550849647",
  animal: "dog",
  brand: "サイズ ヘルス ニュートリション",
  genreName: "ドッグフード ドライフード",
  titles: [
    "ロイヤルカナン SHN ミニ インドア アダルト 室内で生活する小型犬 成犬用 生後10ヵ月齢以上 4kg (犬・ドッグ)",
    "ロイヤルカナン ミニ インドア アダルト 成犬用 8kg 小型犬".replace("8kg", "4kg"),
    "ロイヤルカナン SHN ミニ インドア アダルト 4kg",
    "【4kg×2袋】ロイヤルカナン SHN ミニ インドア アダルト 室内で生活する小型犬 成犬用 生後10ヵ月齢以上",
    "ロイヤルカナン ミニ インドア アダルト 4kg 成犬用 チキン ターキー 小型犬",
    "正規品 ロイヤルカナン 犬ドライ ミニ インドア アダルト 4kg 室内で生活する小型犬の成犬用(生後10ヵ月〜8歳)",
  ],
});

const dog8 = member({
  id: "dog8",
  janCode: "3182550849654",
  animal: "dog",
  brand: "サイズ ヘルス ニュートリション",
  genreName: "ドッグフード ドライフード",
  titles: [
    "ロイヤルカナン ミニ インドア アダルト 成犬用 8kg 小型犬",
    "ロイヤルカナン SHN ミニ インドア アダルト 室内で生活する小型犬 成犬用 生後10ヵ月齢以上 8kg",
    "【8kg×2袋】ロイヤルカナン SHN ミニ インドア アダルト 室内で生活する小型犬 成犬用 生後10ヵ月齢以上",
    "ロイヤルカナン SHN ミニ インドア アダルト 8kg",
    "ロイヤルカナン ミニ インドア アダルト 8kg 成犬用 チキン ターキー 小型犬",
  ],
});

const puppy = member({
  id: "puppy",
  janCode: "3182550849593",
  animal: "dog",
  brand: "サイズ ヘルス ニュートリション",
  genreName: "ドッグフード ドライフード",
  titles: ["ロイヤルカナン ミニ インドア パピー 4kg 室内で生活する小型犬の子犬用(生後10ヵ月齢まで)"],
});

const shiba = member({
  id: "shiba",
  janCode: "3182550823906",
  animal: "dog",
  brand: "ロイヤルカナン",
  genreName: "ドッグフード ドライフード",
  titles: ["ロイヤルカナン 犬 成犬用 柴犬 3kg ドッグフード フード 犬用 ごはん"],
});

test("猫のインドアは4kgと10kgだけを同一商品にし、セットと別レシピは残す", () => {
  const families = groupSizeFamilies([cat4, cat10, catSet, plus7, urinary, wet]);
  assert.equal(families.length, 1);
  assert.deepEqual(
    families[0]?.members.map((item) => item.janCode),
    ["3182550706933", "3182550706940"],
  );
  assert.equal(families[0]?.label, "4kg・10kgあり");
  assert.equal(readSizeIdentity(catSet), null);
  assert.equal(readSizeIdentity(urinary), null);
  assert.notEqual(readSizeIdentity(plus7)?.tokenKey, readSizeIdentity(cat4)?.tokenKey);
});

test("犬のミニ インドア アダルトは4kgと8kgだけをまとめ、子犬と柴犬は別", () => {
  const families = groupSizeFamilies([dog4, dog8, puppy, shiba]);
  assert.equal(families.length, 1);
  assert.deepEqual(
    families[0]?.members.map((item) => [item.janCode, item.sizeLabel]),
    [
      ["3182550849647", "4kg"],
      ["3182550849654", "8kg"],
    ],
  );
  assert.equal(families[0]?.label, "4kg・8kgあり");
  assert.notEqual(readSizeIdentity(puppy)?.stage, "adult");
  assert.notEqual(readSizeIdentity(shiba)?.tokenKey, readSizeIdentity(dog8)?.tokenKey);
});

test("犬と猫で商品名が似ていてもまとめない", () => {
  const families = groupSizeFamilies([
    cat4,
    member({
      ...dog4,
      id: "dog-as-cat-name",
      janCode: "3182550849647",
      animal: "dog",
      brand: cat4.brand,
      genreName: cat4.genreName,
      titles: cat10.titles,
    }),
  ]);
  assert.equal(families.length, 0);
});

test("同じ容量の別JANは容量違いとしてまとめない", () => {
  const other = member({ ...cat4, id: "other4", janCode: "3182550706999" });
  assert.equal(groupSizeFamilies([cat4, other, cat10]).length, 0);
});

test("商品名の元テキストは判定で書き換えない", () => {
  const original = cat4.titles[0];
  readSizeIdentity(cat4);
  assert.equal(cat4.titles[0], original);
});

test("送料不明の安い販売価格は送料込み単価に使わない", () => {
  const quote = quoteSingleSize({
    quantity: 4000,
    quantityUnit: "g",
    quantityConfidence: "high",
    unitPriceType: "per_100g",
    offers: [
      { price: 1000, shippingFee: null, stockStatus: "in_stock", packCount: null, listingTitle: "インドア 4kg" },
      { price: 2000, shippingFee: 0, stockStatus: "in_stock", packCount: null, listingTitle: "インドア 4kg" },
      { price: 500, shippingFee: 0, stockStatus: "in_stock", packCount: 2, listingTitle: "インドア 4kg×2袋" },
    ],
  });
  assert.equal(quote.sellingPrice, 1000);
  assert.equal(quote.sellingShippingKnown, false);
  assert.equal(quote.shippingTotal, 2000);
  assert.equal(quote.shippingUnitYen, 50);
});

test("容量が確定していないときは単価を出さない", () => {
  const quote = quoteSingleSize({
    quantity: null,
    quantityUnit: null,
    quantityConfidence: "medium",
    unitPriceType: "none",
    offers: [{ price: 6000, shippingFee: 0, stockStatus: "in_stock", packCount: null, listingTitle: "インドア 4kg" }],
  });
  assert.equal(quote.sellingPrice, 6000);
  assert.equal(quote.itemUnitYen, null);
  assert.equal(quote.shippingUnitYen, null);
});

test("全員の参考単価が揃ったときだけ、一番低い容量をお得にする", () => {
  assert.deepEqual(
    bestItemUnitIds([
      { id: "4kg", itemUnitYen: 150 },
      { id: "10kg", itemUnitYen: 138 },
    ]),
    ["10kg"],
  );
  assert.deepEqual(
    bestItemUnitIds([
      { id: "4kg", itemUnitYen: 150 },
      { id: "10kg", itemUnitYen: null },
    ]),
    [],
  );
});
