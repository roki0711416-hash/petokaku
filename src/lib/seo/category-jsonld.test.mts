import assert from "node:assert/strict";
import test from "node:test";
import { itemGuideBySlug } from "../item-guides.ts";
import { categoryFaqJsonLd, categoryItemListJsonLd, categoryListHref, jsonLdHtml } from "./category-jsonld.ts";

function hasKey(value: unknown, key: string): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => hasKey(item, key));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).some(([name, nested]) => name === key || hasKey(nested, key));
  }
  return false;
}

test("品目のItemListは商品か品目のURLだけで、価格とAmazonを入れない", () => {
  assert.equal(categoryListHref("https://www.amazon.co.jp/dp/B0015U0NB0"), null);
  assert.equal(categoryListHref("/search?q=猫砂"), null);
  const data = categoryItemListJsonLd({
    pageUrl: "https://petokaku.com/categories/cat-food",
    items: [
      { name: "ロイヤルカナン インドア 成猫用 4kg", href: "/products/jan/3182550706933" },
      { name: "Amazonのフード", href: "/products/jan/3182550706940" },
      { name: "1,280円のフード", href: "/products/jan/3182550702423" },
      { name: "外部", href: "https://www.amazon.co.jp/dp/B0015U0NB0" },
    ],
  });
  assert.equal(data?.["@type"], "ItemList");
  assert.equal(data?.numberOfItems, 1);
  const items = data?.itemListElement as Array<Record<string, unknown>>;
  assert.equal(items[0]?.url, "https://petokaku.com/products/jan/3182550706933");
  assert.equal(hasKey(data, "offers"), false);
  assert.equal(hasKey(data, "price"), false);
  assert.equal(JSON.stringify(data).includes("amazon"), false);
  assert.equal(categoryItemListJsonLd({ pageUrl: "https://petokaku.com/categories/treats", items: [] }), null);
});

test("FAQPageはページに出す質問と回答と同じ文にする", () => {
  const guide = itemGuideBySlug("cat-litter");
  assert.ok(guide);
  const data = categoryFaqJsonLd(guide.faqs);
  assert.equal(data?.["@type"], "FAQPage");
  const entities = data?.mainEntity as Array<Record<string, unknown>>;
  assert.equal(entities.length, guide.faqs.length);
  guide.faqs.forEach((faq, index) => {
    const answer = entities[index]?.acceptedAnswer as Record<string, unknown>;
    assert.equal(entities[index]?.name, faq.question);
    assert.equal(answer.text, faq.answer);
  });
  const html = jsonLdHtml(data ?? {});
  assert.equal(html.includes("<"), false);
  const escaped = jsonLdHtml({ "@context": "https://schema.org", note: "</script>" });
  assert.equal(escaped.includes("<"), false);
  assert.match(escaped, /\\u003c\/script>/);
});
