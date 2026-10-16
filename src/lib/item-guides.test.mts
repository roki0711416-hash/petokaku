import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  categoryGuidePaths,
  guideListingQuery,
  itemGuideBySlug,
  itemGuides,
  listingMatchesGuide,
} from "./item-guides.ts";
import { sitemapEntries } from "./site.ts";

test("品目ページは4件だけで、title・説明・見出し・FAQがそれぞれ違う", () => {
  assert.deepEqual(
    itemGuides.map((guide) => guide.slug),
    ["dog-food", "cat-food", "cat-litter", "pet-sheets"],
  );
  assert.deepEqual(categoryGuidePaths(), [
    "/categories/dog-food",
    "/categories/cat-food",
    "/categories/cat-litter",
    "/categories/pet-sheets",
  ]);
  const titles = itemGuides.map((guide) => guide.title);
  const descriptions = itemGuides.map((guide) => guide.description);
  const questions = itemGuides.flatMap((guide) => guide.faqs.map((faq) => faq.question));
  const answers = itemGuides.flatMap((guide) => guide.faqs.map((faq) => faq.answer));
  const pointBodies = itemGuides.flatMap((guide) => guide.points.map((point) => point.body));
  for (const values of [titles, descriptions, questions, answers, pointBodies]) {
    assert.equal(new Set(values).size, values.length);
  }
  assert.equal(itemGuides.every((guide) => guide.h1 === guide.title), true);
  assert.equal(itemGuides.every((guide) => guide.description.length >= 40 && guide.description.length <= 160), true);
  assert.equal(itemGuideBySlug("unknown"), null);
  assert.equal(itemGuideBySlug("dog-food")?.query, "ドッグフード");
});

test("品目ページは専用検索と取得掲載を出さず、候補は検索ページへつなぐ", () => {
  const page = readFileSync(new URL("../components/item-guide-page.tsx", import.meta.url), "utf8");
  const route = readFileSync(new URL("../components/category-guide-route.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /この品目で探す|取得できた掲載|入力した言葉は/);
  assert.match(page, /\/search\?q=/);
  assert.doesNotMatch(route, /loadGuideListings/);
});

test("猫砂ガイドは既存の種類記事と猫用品カテゴリへつなぐ", () => {
  const litter = itemGuideBySlug("cat-litter");
  assert.ok(litter);
  assert.deepEqual(litter.relatedGuides, [
    { href: "/articles/cat-litter-types", label: "猫砂の種類と選び方" },
    { href: "/pets/cat?category=litter", label: "猫用品の猫砂カテゴリ" },
  ]);
});

test("品目ガイドは重点商品へ1〜2件だけつなぎ、記事カードと重複しすぎない", () => {
  const dog = itemGuideBySlug("dog-food");
  const cat = itemGuideBySlug("cat-food");
  const litter = itemGuideBySlug("cat-litter");
  const sheets = itemGuideBySlug("pet-sheets");
  assert.ok(dog && cat && litter && sheets);

  assert.deepEqual(
    dog.relatedProducts?.map((item) => item.href),
    ["/products/jan/4562358781780"],
  );
  assert.deepEqual(
    cat.relatedProducts?.map((item) => item.href),
    ["/products/jan/3182550706933"],
  );
  assert.deepEqual(
    litter.relatedProducts?.map((item) => item.href),
    ["/products/jan/4905009714353", "/products/jan/4903351011250"],
  );
  assert.deepEqual(
    sheets.relatedProducts?.map((item) => item.href),
    ["/products/jan/4520699667989"],
  );

  assert.equal(dog.relatedGuides?.[0]?.href, "/articles/how-to-choose-dog-food");
  assert.equal(cat.relatedGuides?.[0]?.href, "/articles/how-to-choose-cat-food");
  assert.equal(sheets.relatedGuides?.[0]?.href, "/articles/how-to-choose-pet-sheets");

  for (const guide of [dog, cat, litter, sheets]) {
    assert.ok((guide.relatedProducts?.length ?? 0) <= 2);
  }

  const page = readFileSync(new URL("../components/item-guide-page.tsx", import.meta.url), "utf8");
  assert.match(page, /ComparableProductCards/);
});

test("品目の検索語は空なら品目名、入力があれば品目名と組み合わせる", () => {
  const dog = itemGuideBySlug("dog-food");
  assert.ok(dog);
  assert.equal(guideListingQuery(dog, "  "), "ドッグフード");
  assert.equal(guideListingQuery(dog, "ロイヤルカナン"), "ドッグフード ロイヤルカナン");
  assert.equal(guideListingQuery(dog, "ドッグフード 8kg"), "ドッグフード 8kg");
  assert.equal(guideListingQuery(dog, "あ".repeat(50)).length <= 80, true);
});

test("品目と関係の薄い掲載は一覧に残さない", () => {
  assert.equal(listingMatchesGuide("dog-food", "ロイヤルカナン ドッグフード 成犬用 8kg", ["犬用品"]), true);
  assert.equal(listingMatchesGuide("dog-food", "犬用 成犬 総合栄養食 4kg", []), true);
  assert.equal(listingMatchesGuide("dog-food", "猫砂 鉱物 7L", ["猫用品"]), false);
  assert.equal(listingMatchesGuide("dog-food", "犬用おやつ ジャーキー", []), false);

  assert.equal(listingMatchesGuide("cat-food", "銀のスプーン キャットフード 1.5kg", []), true);
  assert.equal(listingMatchesGuide("cat-food", "猫缶 パウチ 総合栄養食", ["猫用品"]), true);
  assert.equal(listingMatchesGuide("cat-food", "ドッグフード 成犬用", []), false);
  assert.equal(listingMatchesGuide("cat-food", "木の猫砂 7L", []), false);

  assert.equal(listingMatchesGuide("cat-litter", "木の猫砂 7L", ["猫用品"]), true);
  assert.equal(listingMatchesGuide("cat-litter", "猫トイレ 本体 フード付き", []), false);
  assert.equal(listingMatchesGuide("cat-litter", "キャットフード ドライ", []), false);
  assert.equal(listingMatchesGuide("cat-litter", "ペットシーツ ワイド", []), false);

  assert.equal(listingMatchesGuide("pet-sheets", "ペットシーツ ワイド 100枚", ["犬用品"]), true);
  assert.equal(listingMatchesGuide("pet-sheets", "猫砂 鉱物", []), false);
  assert.equal(listingMatchesGuide("pet-sheets", "ドッグフード 8kg", []), false);
  assert.equal(listingMatchesGuide("pet-sheets", "犬用 服", []), false);
});

test("サイトマップは実在する品目ページだけを指し、TOPはペットの種類から開く", () => {
  const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const illustrations = readFileSync(new URL("../components/ui/pet-illustrations.ts", import.meta.url), "utf8");
  const categoryPage = readFileSync(new URL("../components/category-guide-route.tsx", import.meta.url), "utf8");
  const urls = sitemapEntries().map((entry) => entry.url);
  for (const path of categoryGuidePaths()) {
    assert.equal(
      urls.some((url) => url.endsWith(path)),
      true,
    );
  }
  assert.match(home, /PetPhotoGrid/);
  assert.match(illustrations, /petPath\("dog"\)/);
  assert.match(illustrations, /petPath\("reptile"\)/);
  assert.doesNotMatch(home, /\/categories\//);
  assert.match(categoryPage, /privateRobots\(\)/);
  assert.doesNotMatch(categoryPage, /FAQPage/);
  assert.doesNotMatch(categoryPage, /searchYahooItems/);
});
