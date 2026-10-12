import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { listingFitsCategory, listingFitsPet, petById, petCategory, petPages, rakutenPetGenreIds, yahooPetGenreCategoryIds } from "./pets.ts";
import {
  listingDiscoveryRequests,
  listingPageHref,
  listingPageNumber,
  loadPetListings,
  petDiscoveryRequests,
  petPageRevalidateSeconds,
  rakutenDiscoveryCards,
  rakutenListingHits,
  rakutenStatus,
  retryAfterMs,
  yahooListingResults,
  type RakutenTransport,
} from "./pets-listings.ts";
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
    assert.equal(pet.categories.length, 4);
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
  assert.deepEqual(
    dog.categories.map((item) => item.label),
    ["ドッグフード", "おやつ", "トイレ用品", "おもちゃ"],
  );
  assert.deepEqual(
    cat.categories.map((item) => item.label),
    ["キャットフード", "猫砂", "おやつ", "おもちゃ"],
  );
  assert.deepEqual(
    petById("small-animal").categories.map((item) => item.label),
    ["フード", "ケージ", "床材", "おやつ"],
  );
  assert.deepEqual(
    petById("bird").categories.map((item) => item.label),
    ["鳥用フード", "ケージ", "おもちゃ", "飼育用品"],
  );
  assert.deepEqual(
    petById("fish").categories.map((item) => item.label),
    ["魚用フード", "水槽", "フィルター", "水質管理用品"],
  );
  assert.deepEqual(
    petById("reptile").categories.map((item) => item.label),
    ["フード", "ケージ", "ライト", "飼育用品"],
  );
  assert.equal(dog.related.some((item) => item.href === "/categories/dog-food"), true);
  assert.equal(cat.related.some((item) => item.href === "/categories/cat-food"), true);
  assert.equal(cat.related.some((item) => item.href === "/categories/cat-litter"), true);
  assert.equal(petCategory(dog, undefined), null);
  assert.equal(petCategory(dog, "missing"), null);
  assert.equal(petCategory(dog, "food")?.query, "ドッグフード");
  assert.equal(listingFitsPet("ロイヤルカナン 犬用 8kg", ["犬用品"], dog), true);
  assert.equal(listingFitsPet("金魚 餌", ["観賞魚"], dog), false);
  assert.equal(listingFitsPet("猫砂 鉱物", ["猫用品"], cat), true);
  assert.equal(listingFitsPet("ドッグフード 成犬", ["犬用品"], cat), false);
  assert.equal(listingFitsPet("犬印 マタニティショーツ", [], dog), false);
  assert.equal(listingFitsPet("犬印本舗 産褥ショーツ", ["犬用品"], dog), false);
  assert.equal(listingFitsPet("アーテミス アガリクスI/S 小粒", ["ドッグフード", "犬用品"], dog), true);
  assert.equal(listingFitsPet("アーテミス アガリクスI/S 小粒", [], dog), false);
  assert.equal(listingFitsPet("自動給水器 猫 犬 ステンレス", ["犬用品"], cat), true);
  assert.equal(listingFitsPet("ペットシーツ レギュラー", ["犬用品"], cat), false);
  assert.equal(listingFitsPet("デジタルカメラ", ["カメラ"], petById("reptile")), false);
  assert.equal(listingFitsPet("ジェルネイル UVライト", ["爬虫類、両生類用品"], petById("reptile")), false);
  assert.equal(listingFitsPet("パネルヒーター 爬虫類", ["爬虫類、両生類用品"], petById("reptile")), true);
});

test("カテゴリは検索語とジャンルで確認し、商品名だけでは戻さない", () => {
  const food = petCategory(petById("dog"), "food");
  const tank = petCategory(petById("fish"), "tank");
  const litter = petCategory(petById("cat"), "litter");
  assert.ok(food);
  assert.ok(tank);
  assert.ok(litter);
  assert.equal(listingFitsCategory("ロイヤルカナン 成犬 8kg", ["ドッグフード"], food), true);
  assert.equal(listingFitsCategory("ロイヤルカナン 4kg", ["ドッグフード"], food), true);
  assert.equal(listingFitsCategory("犬 ロープおもちゃ", [], food), false);
  assert.equal(listingFitsCategory("犬 トイレシーツ", ["犬用品"], food), false);
  assert.equal(listingFitsCategory("収納ケース", ["犬のおもちゃ"], food), false);
  assert.equal(listingFitsCategory("おもちゃ付き", ["ドッグフード"], food), false);
  assert.equal(listingFitsCategory("犬 サプリ 関節", ["ドッグフード"], food), false);
  assert.equal(listingFitsCategory("猫砂 鉱物 5L", ["猫用品"], litter), true);
  assert.equal(listingFitsCategory("キャットフード 成猫", [], litter), false);
  assert.equal(listingFitsCategory("ガラス水槽 60cm", ["熱帯魚、アクアリウム用品"], tank), true);
  assert.equal(listingFitsCategory("上部フィルター", ["フィルター"], tank), false);
  assert.equal(listingFitsCategory("メダカ 20匹セット", ["熱帯魚、アクアリウム用品"], tank), false);
  const treat = petCategory(petById("dog"), "treat");
  assert.ok(treat);
  assert.equal(listingFitsCategory("犬 歯磨き 歯磨き粉", ["犬用品"], treat), false);
  assert.equal(listingFitsCategory("犬 ささみジャーキー", ["犬用品"], treat), true);
  const cards = rakutenDiscoveryCards(
    {
      items: [
        { itemName: "ロイヤルカナン 成犬 8kg", catchcopy: "3182550706933", itemPrice: 1000, shopName: "A店", shopCode: "shop-a", itemCode: "a:1", reviewCount: 2, genreName: "ドッグフード" },
        { itemName: "ロイヤルカナン 成犬 8kg", catchcopy: "3182550706933", itemPrice: 1200, shopName: "B店", shopCode: "shop-b", itemCode: "b:9", reviewCount: 1, genreName: "ドッグフード" },
        { itemName: "犬 ロープおもちゃ", itemPrice: 800, shopName: "B店", itemCode: "b:2", reviewCount: 1 },
        { itemName: "収納ケース", itemPrice: 500, shopName: "C店", itemCode: "c:3", reviewCount: 1, genreName: "犬のおもちゃ" },
      ],
    },
    petById("dog"),
    food,
  );
  assert.deepEqual(cards.map((card) => card.name), ["ロイヤルカナン 成犬 8kg"]);
});

test("選択したカテゴリは公式ジャンルを保ったまま検索語だけ変える", async () => {
  const previous = {
    app: process.env.RAKUTEN_APPLICATION_ID,
    key: process.env.RAKUTEN_ACCESS_KEY,
    yahoo: process.env.YAHOO_CLIENT_ID,
  };
  process.env.RAKUTEN_APPLICATION_ID = "app-id";
  process.env.RAKUTEN_ACCESS_KEY = "access-key";
  delete process.env.YAHOO_CLIENT_ID;
  const calls: string[] = [];
  const transport: RakutenTransport = async (url) => {
    calls.push(`${url.searchParams.get("genreId")}:${url.searchParams.get("keyword")}`);
    return {
      status: 200,
      text: JSON.stringify({
        items: [
          { itemName: "犬 ロープおもちゃ", itemPrice: 800, shopName: "B店", itemCode: "b:2", reviewCount: 1 },
        ],
      }),
    };
  };
  try {
    const food = petCategory(petById("dog"), "food");
    const listings = await loadPetListings(petById("dog"), transport, async () => undefined, food);
    assert.deepEqual(calls, ["507513:ドッグフード"]);
    assert.equal(listings.rakuten.status, "empty");
    assert.equal(listings.yahoo.status, "not-configured");
  } finally {
    if (previous.app == null) delete process.env.RAKUTEN_APPLICATION_ID;
    else process.env.RAKUTEN_APPLICATION_ID = previous.app;
    if (previous.key == null) delete process.env.RAKUTEN_ACCESS_KEY;
    else process.env.RAKUTEN_ACCESS_KEY = previous.key;
    if (previous.yahoo == null) delete process.env.YAHOO_CLIENT_ID;
    else process.env.YAHOO_CLIENT_ID = previous.yahoo;
  }
});

test("楽天の掲載はJANがあるときだけ価格比較へ進み、レビュー件数は合算しない", () => {
  const cards = rakutenDiscoveryCards(
    {
      items: [
        {
          itemName: "犬用フード 3182550706933",
          itemPrice: 5980,
          shopName: "A店",
          shopCode: "shop-a",
          itemCode: "a:1",
          reviewCount: 12,
          availability: 1,
        },
        {
          itemName: "犬用フード 3182550706933",
          itemPrice: 6200,
          shopName: "F店",
          shopCode: "shop-f",
          itemCode: "f:1",
          reviewCount: 1,
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
        {
          itemName: "犬印 マタニティショーツ",
          itemPrice: 2480,
          shopName: "D店",
          itemCode: "d:4",
          reviewCount: 80,
        },
        {
          itemName: "アーテミス アガリクス 小粒 3kg",
          itemPrice: 4980,
          shopName: "E店",
          itemCode: "e:5",
          reviewCount: 30,
        },
      ],
    },
    petById("dog"),
  );
  assert.deepEqual(
    cards.map((card) => [card.compare, card.href, card.reviewCount]),
    [[true, "/products/jan/3182550706933", 12]],
  );
  assert.equal(cards.some((card) => card.name.includes("犬印")), false);
  assert.equal(cards.some((card) => card.name.includes("金魚")), false);
  assert.equal(cards.some((card) => card.href.startsWith("/search")), false);
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

test("楽天の失敗種別はステータスで分かれ、再試行の待ちはRetry-Afterに従う", () => {
  assert.equal(rakutenStatus(429), "rate-limited");
  assert.equal(rakutenStatus(401), "unauthorized");
  assert.equal(rakutenStatus(403), "unauthorized");
  assert.equal(rakutenStatus(400), "parameter");
  assert.equal(rakutenStatus(503), "unavailable");
  assert.equal(rakutenStatus(418), "request-failed");
  assert.equal(retryAfterMs("1"), 1100);
  assert.equal(retryAfterMs("60"), 1100);
  assert.equal(retryAfterMs(null), 1100);
});

test("JANがない楽天掲載は一覧に出さない", () => {
  const cards = rakutenDiscoveryCards(
    {
      items: [
        { itemName: "犬用おもちゃ ロープ", itemPrice: 500, shopName: "A店", itemCode: "a:1", reviewCount: 3 },
        { itemName: "犬用おもちゃ ボール", itemPrice: 600, shopName: "B店", itemCode: "b:2", reviewCount: 2 },
      ],
    },
    petById("dog"),
  );
  assert.equal(cards.length, 0);
});

test("429のあと1回だけ再取得し、認証エラーと検索条件エラーは再試行しない", async () => {
  const previous = {
    app: process.env.RAKUTEN_APPLICATION_ID,
    key: process.env.RAKUTEN_ACCESS_KEY,
    yahoo: process.env.YAHOO_CLIENT_ID,
  };
  process.env.RAKUTEN_APPLICATION_ID = "app-id";
  process.env.RAKUTEN_ACCESS_KEY = "access-key";
  delete process.env.YAHOO_CLIENT_ID;
  const pauses: number[] = [];
  const calls: Array<{ revalidate: number | null; accessKeyInUrl: boolean; header: string | undefined; genreId: string | null; keyword: string | null; sort: string | null; hits: string | null; page: string | null }> = [];
  const scripted = [
    { status: 429, text: "", retryAfter: "1" },
    {
      status: 200,
      text: JSON.stringify({
        items: [{ itemName: "犬用フード", itemPrice: 1000, shopName: "A店", itemCode: "a:1", reviewCount: 4 }],
      }),
    },
  ];
  const transport: RakutenTransport = async (url, headers, revalidate) => {
    calls.push({
      revalidate,
      accessKeyInUrl: url.search.includes("access-key") || url.search.includes("accessKey"),
      header: headers.accessKey,
      genreId: url.searchParams.get("genreId"),
      keyword: url.searchParams.get("keyword"),
      sort: url.searchParams.get("sort"),
      hits: url.searchParams.get("hits"),
      page: url.searchParams.get("page"),
    });
    const next = scripted.shift();
    if (!next) {
      throw new Error("extra call");
    }
    return next;
  };
  try {
    const listings = await loadPetListings(petById("dog"), transport, async (ms) => {
      pauses.push(ms);
    });
    assert.deepEqual(pauses, [1100]);
    assert.equal(calls.length, 2);
    assert.equal(calls.every((call) => call.revalidate === 3600 && call.accessKeyInUrl === false && call.header === "access-key"), true);
    assert.equal(calls.every((call) => call.genreId === "507513" && call.keyword === "犬 用品" && call.sort === "-reviewCount"), true);
    assert.equal(calls.every((call) => call.hits === String(rakutenListingHits) && call.page === "1"), true);
    assert.equal(yahooListingResults, 50);
    assert.equal(rakutenListingHits, 30);
    assert.equal(listings.rakuten.status, "empty");
    assert.equal(listings.rakuten.cards.length, 0);
    assert.equal(listings.yahoo.status, "not-configured");

    const blocked: number[] = [];
    const denied = await loadPetListings(
      petById("dog"),
      async () => ({ status: 403, text: "{\"error\":\"forbidden\"}" }),
      async (ms) => {
        blocked.push(ms);
      },
    );
    assert.equal(denied.rakuten.status, "unauthorized");
    assert.deepEqual(blocked, []);

    const invalid = await loadPetListings(
      petById("fish"),
      async () => ({ status: 400, text: "" }),
      async () => {
        throw new Error("should not retry");
      },
    );
    assert.equal(invalid.rakuten.status, "parameter");

    const timedOut = await loadPetListings(
      petById("dog"),
      async () => {
        const error = new Error("timeout");
        error.name = "TimeoutError";
        throw error;
      },
      async () => undefined,
    );
    assert.equal(timedOut.rakuten.status, "timeout");
    assert.equal(timedOut.rakuten.cards.length, 0);
  } finally {
    if (previous.app == null) delete process.env.RAKUTEN_APPLICATION_ID;
    else process.env.RAKUTEN_APPLICATION_ID = previous.app;
    if (previous.key == null) delete process.env.RAKUTEN_ACCESS_KEY;
    else process.env.RAKUTEN_ACCESS_KEY = previous.key;
    if (previous.yahoo == null) delete process.env.YAHOO_CLIENT_ID;
    else process.env.YAHOO_CLIENT_ID = previous.yahoo;
  }
});

test("ペット別の公式ジャンルIDは6種類とも確認済みの値だけ", () => {
  assert.deepEqual(yahooPetGenreCategoryIds, {
    dog: 4772,
    cat: 4820,
    "small-animal": 32938,
    bird: 4816,
    fish: 4798,
    reptile: 33966,
  });
  assert.deepEqual(rakutenPetGenreIds, {
    dog: 507513,
    cat: 507524,
    "small-animal": 565699,
    bird: 204183,
    fish: 203107,
    reptile: 560198,
  });
});

test("商品一覧は4ページまでで、カテゴリを保って送る", () => {
  assert.equal(listingPageNumber(undefined), 1);
  assert.equal(listingPageNumber("2"), 2);
  assert.equal(listingPageNumber("4"), 4);
  assert.equal(listingPageNumber("0"), 1);
  assert.equal(listingPageNumber("9"), 1);
  assert.equal(listingPageHref("/pets/cat", null, 1), "/pets/cat");
  assert.equal(listingPageHref("/pets/cat", "litter", 2), "/pets/cat?category=litter&page=2");
});

test("価格比較できる楽天商品を一覧の前に出す", () => {
  const cards = rakutenDiscoveryCards(
    {
      items: [
        { itemName: "犬用おもちゃ", itemPrice: 500, shopName: "A店", itemCode: "a:1", reviewCount: 10 },
        { itemName: "犬用フード 3182550706933", itemPrice: 1000, shopName: "B店", shopCode: "shop-b", itemCode: "b:1", reviewCount: 1 },
        { itemName: "犬用フード 3182550706933", itemPrice: 1100, shopName: "C店", shopCode: "shop-c", itemCode: "c:1", reviewCount: 2 },
      ],
    },
    petById("dog"),
  );
  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.compare, true);
  assert.equal(cards[0]?.href, "/products/jan/3182550706933");
});

test("6種類のペットは公式ジャンルの中で複数の検索語から候補を集める", () => {
  for (const pet of petPages()) {
    const requests = petDiscoveryRequests[pet.id];
    assert.ok(requests.length >= 3);
    assert.ok(requests.length <= 5);
    assert.equal(requests.every((request) => request.query.trim() !== ""), true);
    assert.equal(requests.every((request) => request.start == null || request.start === 51), true);
    assert.deepEqual(listingDiscoveryRequests(pet, null, 1), [...requests]);
    const category = pet.categories[0];
    assert.ok(category);
    assert.deepEqual(listingDiscoveryRequests(pet, category, 1), [{ query: category.query }]);
    assert.deepEqual(listingDiscoveryRequests(pet, null, 2), [{ query: pet.query, start: 51 }]);
  }
  assert.equal(petDiscoveryRequests.fish.some((request) => request.query === "テトラ フレーク"), true);
  assert.equal(petDiscoveryRequests["small-animal"].some((request) => request.query === "チモシー"), true);
});

test("ペット別ページの再取得間隔は5分ずつずれている", () => {
  for (const pet of petPages()) {
    const source = readFileSync(new URL(`../app/pets/${pet.id}/page.tsx`, import.meta.url), "utf8");
    assert.match(source, new RegExp(`export const revalidate = ${petPageRevalidateSeconds[pet.id]};`));
  }
});
