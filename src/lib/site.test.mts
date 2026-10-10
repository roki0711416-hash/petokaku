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
  "https://petokaku.com/guide",
  "https://petokaku.com/contact",
  "https://petokaku.com/privacy",
  "https://petokaku.com/terms",
  "https://petokaku.com/affiliate",
  "https://petokaku.com/products/jan/3182550706933",
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

test("サイトマップは公開固定ページと確認済みJANだけをサイトURLのオリジンで出す", () => {
  withEnv({ NEXT_PUBLIC_SITE_URL: "https://petokaku.com/unused" }, () => {
    const entries = sitemapEntries();
    assert.deepEqual(
      entries.map((entry) => entry.url),
      publicSitemap,
    );
    assert.equal(
      entries.some((entry) => entry.url.includes("/search") || entry.url.includes("/products/yahoo-preview")),
      false,
    );
    assert.equal(entries.filter((entry) => entry.url.includes("/products/jan/")).length, 1);
    assert.equal(entries[0]?.priority, 1);
    assert.ok(entries.slice(1).every((entry) => entry.priority === 0.6 && entry.changeFrequency === "weekly"));
  });
});

test("確認済みJANは13桁だけを上限まで選ぶ", () => {
  assert.deepEqual(indexedJanProducts, [{ janCode: "3182550706933", label: "ロイヤルカナンの猫用4kg商品" }]);
  assert.equal(selectIndexedJans(indexedJanProducts).length, 1);
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
  assert.equal(selected[0]?.janCode, "3182550706933");
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
  for (const path of ["../app/search/page.tsx", "../app/products/yahoo-preview/page.tsx", "../app/products/page.tsx", "../app/products/[id]/page.tsx"]) {
    const source = read(path);
    assert.match(source, /privateRobots\(\)/);
    assert.doesNotMatch(source, /robotsMetadata\(\)/);
  }
  const jan = read("../app/products/jan/[jan]/page.tsx");
  assert.match(jan, /janPageRobots\(true\)/);
  assert.match(jan, /janPageRobots\(false\)/);
  const home = read("../app/page.tsx");
  const cards = read("../components/comparable-products.tsx");
  const site = read("./site.ts");
  assert.match(home, /selectIndexedJans\(indexedJanProducts\)/);
  assert.match(home, /ComparableProducts/);
  assert.match(cards, /価格比較できる商品/);
  assert.match(cards, /indexedJanPath\(card\.janCode\)/);
  assert.match(cards, /loadYahooJan/);
  assert.doesNotMatch(cards, /searchYahooItems|loadYahooKeywordSearch/);
  assert.match(site, /3182550706933/);
  assert.doesNotMatch(home, /searchYahooItems|loadYahooJan|loadYahooKeywordSearch/);
  assert.doesNotMatch(site, /searchYahooItems|loadYahooJan/);
  assert.doesNotMatch(read("../app/sitemap.ts"), /searchYahooItems|loadYahooJan/);
  assert.doesNotMatch(`${home}\n${site}`, /人気商品|売れ筋/);
});
