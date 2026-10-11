import assert from "node:assert/strict";
import test from "node:test";
import { listingFitsPet, petById, petPages } from "./pets.ts";
import { rakutenDiscoveryCards } from "./pets-listings.ts";
import { sitemapEntries } from "./site.ts";

test("ペット別ページは6件で、見出しと説明が重複しない", () => {
  const pages = petPages();
  assert.deepEqual(pages.map((pet) => pet.path), [
    "/pets/dog",
    "/pets/cat",
    "/pets/small-animal",
    "/pets/bird",
    "/pets/fish",
    "/pets/reptile",
  ]);
  assert.equal(new Set(pages.map((pet) => pet.h1)).size, 6);
  assert.equal(new Set(pages.map((pet) => pet.title)).size, 6);
  assert.equal(new Set(pages.map((pet) => pet.description)).size, 6);
  for (const pet of pages) {
    assert.equal(pet.faqs.length >= 3, true);
    assert.equal(pet.points.length >= 3, true);
    assert.equal(pet.categories.length >= 5, true);
    assert.equal(pet.h1.includes("売上ランキング"), false);
    assert.equal(pet.h1.includes("おすすめ"), false);
    assert.equal(pet.title.includes("おすすめ"), false);
    if (pet.description.includes("売上ランキング")) {
      assert.equal(pet.description.includes("売上ランキングではありません"), true);
    }
  }
});

test("犬と猫は既存の品目ページへつなぎ、別種の強い語は落とす", () => {
  const dog = petById("dog");
  const cat = petById("cat");
  assert.equal(dog.categories.some((item) => item.href === "/categories/dog-food"), true);
  assert.equal(cat.categories.some((item) => item.href === "/categories/cat-food"), true);
  assert.equal(cat.categories.some((item) => item.href === "/categories/cat-litter"), true);
  assert.equal(listingFitsPet("ロイヤルカナン 犬用 8kg", ["犬用品"], dog), true);
  assert.equal(listingFitsPet("金魚 餌", ["観賞魚"], dog), false);
  assert.equal(listingFitsPet("猫砂 鉱物", ["猫用品"], cat), true);
  assert.equal(listingFitsPet("ドッグフード 成犬", ["犬用品"], cat), false);
});

test("楽天の掲載はJANがあるときだけ価格比較へ進み、レビュー件数は合算しない", () => {
  const cards = rakutenDiscoveryCards(
    {
      items: [
        {
          itemName: "犬用フード 3182550706933",
          itemPrice: 5980,
          shopName: "A店",
          itemCode: "a:1",
          reviewCount: 12,
          availability: 1,
        },
        {
          itemName: "犬用おもちゃ",
          itemPrice: 1200,
          shopName: "B店",
          itemCode: "b:2",
          reviewCount: 4,
          availability: 1,
        },
        {
          itemName: "金魚のえさ",
          itemPrice: 300,
          shopName: "C店",
          itemCode: "c:3",
          reviewCount: 99,
        },
      ],
    },
    petById("dog"),
  );
  assert.deepEqual(
    cards.map((card) => [card.compare, card.href.startsWith("/products/jan/"), card.reviewCount]),
    [
      [true, true, 12],
      [false, false, 4],
    ],
  );
  assert.equal(cards[1]?.href.startsWith("/search?q="), true);
  assert.equal(cards.some((card) => card.reviewCount === 12 + 4), false);
});

test("サイトマップに6つのペット別ページがある", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://petokaku.com";
  try {
    const urls = sitemapEntries().map((entry) => entry.url);
    for (const pet of petPages()) {
      assert.equal(urls.includes(`https://petokaku.com${pet.path}`), true);
    }
  } finally {
    if (previous == null) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});
