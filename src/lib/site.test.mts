import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  indexedJanLimit,
  indexedJanProducts,
  indexingAllowed,
  janPageRobots,
  privateRobots,
  robotsMetadata,
  robotsPolicy,
  selectIndexedJans,
  sitemapEntries,
} from "./site.ts";

const envKeys = ["ALLOW_INDEXING", "PRICE_SOURCE", "NEXT_PUBLIC_SITE_URL"] as const;

function withEnv(values: Partial<Record<(typeof envKeys)[number], string | undefined>>, run: () => void) {
  const previous = new Map(envKeys.map((key) => [key, process.env[key]]));
  for (const key of envKeys) {
    if (!Object.hasOwn(values, key)) {
      continue;
    }
    const value = values[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  try {
    run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

const publicSitemap = [
  "https://petokaku.com/",
  "https://petokaku.com/about",
  "https://petokaku.com/price-data",
  "https://petokaku.com/guide",
  "https://petokaku.com/articles",
  "https://petokaku.com/contact",
  "https://petokaku.com/privacy",
  "https://petokaku.com/cookies",
  "https://petokaku.com/terms",
  "https://petokaku.com/affiliate",
  "https://petokaku.com/categories/dog-food",
  "https://petokaku.com/categories/cat-food",
  "https://petokaku.com/categories/cat-litter",
  "https://petokaku.com/categories/pet-sheets",
  "https://petokaku.com/categories/treats",
  "https://petokaku.com/categories/cat-tower",
  "https://petokaku.com/categories/pet-toilet",
  "https://petokaku.com/categories",
  "https://petokaku.com/pets/dog",
  "https://petokaku.com/pets/cat",
  "https://petokaku.com/pets/small-animal",
  "https://petokaku.com/pets/bird",
  "https://petokaku.com/pets/fish",
  "https://petokaku.com/pets/reptile",
];

test("ALLOW_INDEXING=true かつ PRICE_SOURCE=sample でも公開ページを許可する", () => {
  withEnv({ ALLOW_INDEXING: "true", PRICE_SOURCE: "sample", NEXT_PUBLIC_SITE_URL: "https://petokaku.com" }, () => {
    assert.equal(indexingAllowed(), true);
    assert.deepEqual(robotsPolicy(), {
      rules: [{ userAgent: "*", allow: "/", disallow: ["/search", "/products/yahoo-preview"] }],
      sitemap: "https://petokaku.com/sitemap.xml",
    });
    assert.deepEqual(robotsMetadata(), { index: true, follow: true });
    assert.deepEqual(
      sitemapEntries().map((entry) => entry.url),
      publicSitemap,
    );
  });
});

test("ALLOW_INDEXING が true でないときはサイト全体を拒否する", () => {
  withEnv({ ALLOW_INDEXING: "false", PRICE_SOURCE: "yahoo", NEXT_PUBLIC_SITE_URL: "https://petokaku.com" }, () => {
    assert.equal(indexingAllowed(), false);
    assert.deepEqual(robotsPolicy(), { rules: [{ userAgent: "*", disallow: "/" }] });
    assert.equal(Object.hasOwn(robotsPolicy(), "sitemap"), false);
    assert.deepEqual(robotsMetadata(), { index: false, follow: false });
  });
});

test("サイトマップの固定ページは公開ページだけで、商品詳細は含めない", () => {
  withEnv({ NEXT_PUBLIC_SITE_URL: "https://petokaku.com/unused" }, () => {
    const entries = sitemapEntries();
    assert.deepEqual(
      entries.map((entry) => entry.url),
      publicSitemap,
    );
    assert.equal(
      entries.some((entry) => entry.url.includes("/search") || entry.url.includes("/products/yahoo-preview") || entry.url.includes("/products/jan/")),
      false,
    );
    assert.equal(entries[0]?.priority, 1);
    assert.ok(entries.slice(1).every((entry) => entry.priority === 0.6 && entry.changeFrequency === "weekly"));
  });
});

test("品目ページの lastmod はデータの更新時刻、無ければ同じ生成時刻を使う", () => {
  const now = new Date("2026-11-23T03:00:00.000Z");
  withEnv({ NEXT_PUBLIC_SITE_URL: "https://petokaku.com" }, () => {
    const dated = sitemapEntries({
      now,
      categoryUpdatedAt: {
        "/categories/cat-litter": "2026-10-16T01:00:00.000Z",
        "/categories/dog-food": "not-a-date",
      },
    });
    const litter = dated.find((entry) => entry.url.endsWith("/categories/cat-litter"));
    const dog = dated.find((entry) => entry.url.endsWith("/categories/dog-food"));
    const treats = dated.find((entry) => entry.url.endsWith("/categories/treats"));
    const index = dated.find((entry) => entry.url.endsWith("/categories"));
    const pet = dated.find((entry) => entry.url.endsWith("/pets/dog"));
    const about = dated.find((entry) => entry.url.endsWith("/about"));
    assert.equal(litter?.lastModified instanceof Date && litter.lastModified.toISOString(), "2026-10-16T01:00:00.000Z");
    assert.equal(dog?.lastModified, now);
    assert.equal(treats?.lastModified, now);
    assert.equal(index?.lastModified, now);
    assert.equal(pet?.lastModified, now);
    assert.equal(about?.lastModified, undefined);

    const onlyData = sitemapEntries({
      now,
      categoryUpdatedAt: {
        "/categories/dog-food": "2026-10-01T00:00:00.000Z",
        "/categories/cat-food": "2026-10-17T00:00:00.000Z",
        "/categories/cat-litter": "2026-10-16T00:00:00.000Z",
        "/categories/pet-sheets": "2026-10-14T00:00:00.000Z",
        "/categories/treats": "2026-10-02T00:00:00.000Z",
        "/categories/cat-tower": "2026-10-03T00:00:00.000Z",
        "/categories/pet-toilet": "2026-10-04T00:00:00.000Z",
      },
    });
    const indexFromData = onlyData.find((entry) => entry.url.endsWith("/categories"));
    assert.equal(indexFromData?.lastModified instanceof Date && indexFromData.lastModified.toISOString(), "2026-10-17T00:00:00.000Z");
    const tower = onlyData.find((entry) => entry.url.endsWith("/categories/cat-tower"));
    const sheets = onlyData.find((entry) => entry.url.endsWith("/categories/pet-sheets"));
    assert.notEqual(tower?.lastModified, sheets?.lastModified);
  });
});

test("確認済みJANは13桁だけを上限まで選ぶ", () => {
  assert.deepEqual(
    indexedJanProducts.map((item) => item.janCode),
    ["4903351011250", "4520699667989", "3182550706933", "4562358781780", "4905009714353"],
  );
  assert.equal(selectIndexedJans(indexedJanProducts).length, 5);
  assert.ok(indexedJanProducts.every((item) => /\d/.test(item.label)));
  const extra = [
    ...indexedJanProducts,
    { janCode: "123", label: "桁不足" },
    { janCode: "3182550706933", label: "重複" },
    ...Array.from({ length: indexedJanLimit + 2 }, (_, index) => ({
      janCode: `3182550706${String(index).padStart(3, "0")}`,
      label: "上限確認",
    })),
  ];
  const selected = selectIndexedJans(extra);
  assert.equal(selected.length, indexedJanLimit);
  assert.equal(selected[0]?.janCode, "4903351011250");
  assert.ok(selected.every((item) => /^[0-9]{13}$/.test(item.janCode)));
  assert.equal(new Set(selected.map((item) => item.janCode)).size, selected.length);
});

test("商品を取得できないJANページはnoindex、取得できたページは公開判定に従う", () => {
  withEnv({ ALLOW_INDEXING: "true", PRICE_SOURCE: "sample" }, () => {
    assert.deepEqual(janPageRobots(true), { index: true, follow: true });
    assert.deepEqual(janPageRobots(false), { index: false, follow: false });
  });
  withEnv({ ALLOW_INDEXING: "false" }, () => {
    assert.deepEqual(janPageRobots(true), { index: false, follow: false });
    assert.deepEqual(janPageRobots(false), { index: false, follow: false });
  });
});

test("検索・プレビュー・サンプル商品は noindex、JANページは公開判定に従う", () => {
  assert.deepEqual(privateRobots(), { index: false, follow: false });
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  for (const path of ["../app/search/page.tsx", "../app/products/yahoo-preview/page.tsx"]) {
    const source = read(path);
    assert.match(source, /privateRobots\(\)/);
    assert.doesNotMatch(source, /robotsMetadata\(\)/);
  }
  const middleware = read("../middleware.ts");
  assert.match(middleware, /status: 404/);
  assert.match(middleware, /pathname === "\/products"/);
  assert.match(middleware, /yahoo-preview/);
  assert.doesNotMatch(middleware, /\/products\/jan/);
  for (const path of ["../app/products/page.tsx", "../app/products/[id]/page.tsx"]) {
    const source = read(path);
    assert.match(source, /notFound\(\)/);
    assert.match(source, /privateRobots\(\)/);
    assert.doesNotMatch(source, /getAllProducts|サンプル商品|robotsMetadata\(\)/);
  }
  const jan = read("../app/products/jan/[jan]/page.tsx");
  const janMetadata = read("./seo/jan-metadata.ts");
  assert.match(jan, /janProductMetadata/);
  assert.match(jan, /janPageRobots\(false\)/);
  assert.match(jan, /export async function generateMetadata\(\{ params \}/);
  assert.match(janMetadata, /janPageRobots\(input\.hasComparableOffers !== false\)/);
  assert.match(jan, /hasComparableOffers/);
  assert.match(janMetadata, /alternates: \{ canonical \}/);
  assert.doesNotMatch(janMetadata, /searchParams/);
  const home = read("../app/page.tsx");
  const cards = read("../components/comparable-products.tsx");
  const site = read("./site.ts");
  const share = read("./seo/share-metadata.ts");
  assert.match(home, /ペットの種類から探す/);
  assert.match(home, /サイトの使い方/);
  assert.match(home, /お役立ち記事/);
  assert.match(home, /shareMetadata\(\{/);
  assert.match(home, /path: "\/"/);
  assert.match(share, /alternates: \{ canonical: input\.path \}/);
  assert.match(home, /loadHomeCatalog/);
  assert.match(home, /HomeCatalogSections/);
  assert.match(home, /publishedArticles\(articles\)/);
  assert.doesNotMatch(home, /価格比較できる商品|取得できた掲載/);
  assert.doesNotMatch(home, /ComparableProducts/);
  assert.match(cards, /価格比較できる商品/);
  assert.match(cards, /indexedJanPath\(card\.janCode\)/);
  assert.match(cards, /loadYahooJan/);
  assert.doesNotMatch(cards, /searchYahooItems|loadYahooKeywordSearch/);
  assert.match(site, /3182550706933/);
  assert.match(site, /4903351011250/);
  assert.match(site, /4562358781780/);
  const guide = read("../app/guide/page.tsx");
  assert.match(guide, /indexedJanProducts/);
  assert.match(guide, /価格比較の例/);
  assert.match(guide, /金額や店舗数はこの一覧には出していません/);
  assert.doesNotMatch(home, /searchYahooItems|loadYahooJan|loadYahooKeywordSearch/);
  const catalog = read("../components/home-catalog-sections.tsx");
  const browser = read("../components/home-catalog-browser.tsx");
  const articleCards = read("../components/home-article-cards.tsx");
  assert.match(catalog, /人気のペット用品/);
  assert.match(catalog, /カテゴリ別の商品/);
  assert.match(catalog, /ペット用品のお役立ち記事|HomeArticleCards/);
  assert.match(catalog, /確定した金額としては扱っていません/);
  assert.doesNotMatch(catalog, /売れ筋/);
  assert.match(browser, /もっと商品を見る/);
  assert.match(browser, /閉じる/);
  assert.match(browser, /useState/);
  assert.match(browser, /homePreviewCount/);
  assert.doesNotMatch(browser, /searchYahooItems|loadYahooJan/);
  assert.match(articleCards, /ペット用品のお役立ち記事/);
  assert.match(articleCards, /すべての記事を見る/);
  assert.match(articleCards, /grid-cols-2/);
  assert.match(articleCards, /md:grid-cols-3/);
  assert.doesNotMatch(site, /searchYahooItems|loadYahooJan/);
  const sitemap = read("../app/sitemap.ts");
  assert.doesNotMatch(sitemap, /searchYahooItems|loadYahooJan/);
  assert.match(sitemap, /publishedProductPaths/);
  assert.match(sitemap, /articleSitemapPaths/);
  assert.match(sitemap, /revalidate = 3600/);
  assert.doesNotMatch(sitemap, /3182550706933/);
  const robots = robotsPolicy.toString();
  assert.equal(robots.includes("/products/jan"), false);
  assert.doesNotMatch(`${home}\n${site}`, /人気商品|売れ筋/);
  assert.doesNotMatch(home, /人気検索キーワード/);
});
