import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { breadcrumbListJsonLd } from "./breadcrumb-list.ts";
import { homeCategoryCards, homeKeywordLinks, hubPageCrumbs, productPageCrumbs } from "./indexable-hubs.ts";

const siteUrl = "https://petokaku.com";

test("人気カテゴリは品目ページかペットページへつなぎ、検索へは出さない", () => {
  assert.deepEqual(
    homeCategoryCards.map((card) => [card.label, card.href]),
    [
      ["ドッグフード", "/categories/dog-food"],
      ["キャットフード", "/categories/cat-food"],
      ["猫砂・トイレ用品", "/categories/cat-litter"],
      ["ペットシーツ", "/categories/pet-sheets"],
      ["おやつ", "/pets/dog?category=treat"],
      ["おもちゃ・グッズ", "/pets/cat?category=toy"],
    ],
  );
  for (const card of homeCategoryCards) {
    assert.match(card.href, /^\/(categories|pets)\//);
    assert.equal(card.href.includes("/search"), false);
    assert.equal(card.href.includes("#"), false);
  }
});

test("キーワードは種類なら索引ページ、ブランドだけ検索のまま", () => {
  const byLabel = new Map(homeKeywordLinks.map((link) => [link.label, link.href]));
  assert.equal(byLabel.get("ドッグフード"), "/categories/dog-food");
  assert.equal(byLabel.get("キャットフード"), "/categories/cat-food");
  assert.equal(byLabel.get("猫砂"), "/categories/cat-litter");
  assert.equal(byLabel.get("ペットシーツ"), "/categories/pet-sheets");
  assert.equal(byLabel.get("おやつ"), "/pets/dog?category=treat");
  assert.equal(byLabel.get("おもちゃ"), "/pets/cat?category=toy");
  assert.equal(byLabel.get("チモシー"), "/pets/small-animal");
  assert.equal(byLabel.get("ロイヤルカナン"), "/search?q=%E3%83%AD%E3%82%A4%E3%83%A4%E3%83%AB%E3%82%AB%E3%83%8A%E3%83%B3");
  assert.equal(byLabel.get("ネクトン"), "/search?q=%E3%83%8D%E3%82%AF%E3%83%88%E3%83%B3");

  for (const label of ["ドッグフード", "キャットフード", "猫砂", "ペットシーツ", "おやつ", "おもちゃ", "チモシー"]) {
    const href = byLabel.get(label);
    assert.ok(href);
    assert.equal(href.startsWith("/search"), false);
  }
});

test("商品パンくずは品目ページかペットページを絶対URLにする", () => {
  const sheets = productPageCrumbs({
    name: "ペットシーツ ワイド レギュラー 厚型 アイリスオーヤマ 業務用 400枚 200枚 厚手 ペットシート 脱臭 ペット トイレ",
    category: "dog",
    genreNames: ["犬用品"],
    productLabel: "ペットシーツ ワイド",
    productHref: "/products/jan/4967576499620",
  });
  const sheetsLd = breadcrumbListJsonLd(sheets, siteUrl);
  assert.deepEqual(
    sheetsLd.itemListElement.map((item) => [item.name, item.item]),
    [
      ["ホーム", "https://petokaku.com/"],
      ["ペットシーツ", "https://petokaku.com/categories/pet-sheets"],
      ["ペットシーツ ワイド", "https://petokaku.com/products/jan/4967576499620"],
    ],
  );

  const food = breadcrumbListJsonLd(
    productPageCrumbs({
      name: "ニュートロ シュプレモ 小型犬 成犬用 3kg",
      category: "dog",
      productLabel: "ニュートロ シュプレモ 小型犬 成犬用 3kg",
      productHref: "/products/jan/4562358781780",
    }),
    siteUrl,
  );
  assert.equal(food.itemListElement[1]?.item, "https://petokaku.com/categories/dog-food");

  const collar = breadcrumbListJsonLd(
    productPageCrumbs({
      name: "犬用 首輪 レザー",
      category: "dog",
      productLabel: "犬用 首輪 レザー",
      productHref: "/products/jan/4900000000001",
    }),
    siteUrl,
  );
  assert.deepEqual(
    collar.itemListElement.map((item) => item.item),
    ["https://petokaku.com/", "https://petokaku.com/pets/dog", "https://petokaku.com/products/jan/4900000000001"],
  );
  assert.equal(collar.itemListElement[1]?.name, "犬用品");

  const reptile = breadcrumbListJsonLd(
    productPageCrumbs({
      name: "フトアゴ フード 200g",
      category: "other",
      productLabel: "フトアゴ フード 200g",
      productHref: "/products/jan/4900000000002",
    }),
    siteUrl,
  );
  assert.equal(reptile.itemListElement[1]?.item, "https://petokaku.com/pets/reptile");
  assert.equal(reptile.itemListElement[1]?.name, "爬虫類・両生類");

  const unknown = productPageCrumbs({
    name: "汎用 お手入れ ブラシ",
    category: "other",
    productLabel: "汎用 お手入れ ブラシ",
    productHref: "/products/jan/4900000000003",
  });
  assert.deepEqual(
    unknown.map((item) => item.href),
    ["/", "/products/jan/4900000000003"],
  );

  for (const payload of [sheetsLd, food, collar, reptile]) {
    const serialized = JSON.stringify(payload);
    assert.equal(serialized.includes("/search"), false);
    assert.equal(serialized.includes("#"), false);
  }
});

test("品目ページとペットページのパンくずにハッシュを入れない", () => {
  const category = breadcrumbListJsonLd(hubPageCrumbs({ label: "ドッグフード", href: "/categories/dog-food" }), siteUrl);
  const pet = breadcrumbListJsonLd(hubPageCrumbs({ label: "犬", href: "/pets/dog" }), siteUrl);
  assert.deepEqual(
    category.itemListElement.map((item) => [item.name, item.item]),
    [
      ["ホーム", "https://petokaku.com/"],
      ["ドッグフード", "https://petokaku.com/categories/dog-food"],
    ],
  );
  assert.deepEqual(
    pet.itemListElement.map((item) => [item.name, item.item]),
    [
      ["ホーム", "https://petokaku.com/"],
      ["犬", "https://petokaku.com/pets/dog"],
    ],
  );
});

test("トップの構造化データは検索アクションを出さず、検索フォームは残す", () => {
  const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const topics = readFileSync(new URL("../components/home-topics.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(home, /potentialAction|"@type": "SearchAction"/);
  assert.match(home, /action="\/search"/);
  assert.match(topics, /homeCategoryCards/);
  assert.match(topics, /homeKeywordLinks/);
  assert.doesNotMatch(topics, /\/search\?q=\$\{encodeURIComponent/);
  const productView = readFileSync(new URL("../components/yahoo-product-view.tsx", import.meta.url), "utf8");
  const categoryPage = readFileSync(new URL("../components/item-guide-page.tsx", import.meta.url), "utf8");
  const petPage = readFileSync(new URL("../components/pet-kind-page.tsx", import.meta.url), "utf8");
  assert.match(productView, /productPageCrumbs/);
  assert.doesNotMatch(productView, /categorySearchHref|\/search\?q=/);
  assert.match(categoryPage, /hubPageCrumbs/);
  assert.doesNotMatch(categoryPage, /#home-search/);
  assert.match(petPage, /hubPageCrumbs/);
  assert.doesNotMatch(petPage, /#categories/);
});
