import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { priceInfoView } from "./price-info-view.ts";
import { summarizePriceHistory, type PriceHistoryOffer } from "./price-history-summary.ts";

const now = "2026-10-05T07:00:00.000Z";

function offer(id: string, overrides: Partial<PriceHistoryOffer> = {}): PriceHistoryOffer {
  return {
    id,
    packCount: null,
    listingTitle: "ロイヤルカナン ミニ インドア アダルト 4kg",
    observations: [],
    ...overrides,
  };
}

function observation(id: string, price: number, overrides: Partial<PriceHistoryOffer["observations"][number]> = {}) {
  return {
    id,
    price,
    shippingFee: 0,
    shippingStatus: "free" as const,
    stockStatus: "in_stock" as const,
    observedAt: "2026-10-05T06:00:00.000Z",
    ...overrides,
  };
}

function viewOf(offers: PriceHistoryOffer[], at = now) {
  return priceInfoView({ summary: summarizePriceHistory({ now: at, offers }), offers: [] });
}

test("1日分では30日の相場を出さず、送料不明を分けて見せる", () => {
  const view = viewOf([
    offer("single-unknown", {
      observations: [observation("a", 5130, { shippingFee: null, shippingStatus: "unknown" })],
    }),
    offer("single-free", {
      observations: [observation("b", 5720)],
    }),
    offer("set", {
      packCount: 4,
      listingTitle: "【4kg×4袋】ロイヤルカナン ミニ インドア アダルト",
      observations: [observation("c", 23931)],
    }),
  ]);
  assert.equal(view.shippingTotal, 5720);
  assert.equal(view.sellingPrice, 5130);
  assert.equal(view.sellingNote, "送料はショップで確認");
  assert.equal(view.history.kind, "accumulating");
  if (view.history.kind !== "accumulating") {
    return;
  }
  assert.equal(view.history.title, "価格データを蓄積中");
  assert.equal(view.history.lines[0], "1日分の価格を記録しています");
  const text = `${view.history.title}\n${view.history.lines.join("\n")}`;
  assert.match(text, /価格傾向の判定は行っていません/);
  assert.doesNotMatch(text, /30日|買い時|安い|23931/);
});

test("数日分は参考金額だけを出し、買い時とは言わない", () => {
  const view = viewOf([
    offer("shop", {
      observations: [
        observation("d1", 5000, { observedAt: "2026-10-03T01:00:00.000Z" }),
        observation("d2", 4700, { observedAt: "2026-10-05T01:00:00.000Z" }),
      ],
    }),
  ]);
  assert.equal(view.history.kind, "reference");
  if (view.history.kind !== "reference") {
    return;
  }
  assert.equal(view.history.title, "価格データ：2日分");
  assert.match(view.history.note, /参考/);
  assert.deepEqual(
    view.history.stats.map((stat) => stat.value),
    [4700, 4850],
  );
  const text = `${view.history.note}\n${view.history.stats.map((stat) => stat.label).join("\n")}`;
  assert.match(text, /参考/);
  assert.doesNotMatch(text, /買い時|安い/);
});

test("7日以上は平均との差と記録期間内の最安を事実として出す", () => {
  const view = viewOf([
    offer("shop", {
      observations: [1, 2, 3, 4, 5, 6, 7].map((day) =>
        observation(`d${day}`, day === 7 ? 5400 : 6000, { observedAt: `2026-09-${String(22 + day).padStart(2, "0")}T01:00:00.000Z` }),
      ),
    }),
  ]);
  assert.equal(view.history.kind, "comparable");
  if (view.history.kind !== "comparable") {
    return;
  }
  assert.equal(view.history.title, "価格データ：7日分");
  assert.match(view.history.lines.join("\n"), /過去30日の平均より/);
  assert.match(view.history.lines.join("\n"), /記録期間内の最安値/);
  assert.doesNotMatch(view.history.lines.join("\n"), /買い時|絶対/);
});

test("履歴を読めないときは現在価格だけを残し、蓄積中とは出さない", () => {
  const view = priceInfoView({
    summary: null,
    now,
    offers: [
      {
        id: "free",
        packCount: null,
        listingTitle: "ロイヤルカナン 4kg",
        price: 5720,
        shippingFee: 0,
        shippingStatus: "free",
        stockStatus: "in_stock",
      },
    ],
  });
  assert.equal(view.shippingTotal, 5720);
  assert.equal(view.history.kind, "hidden");
});

test("価格情報の画面文言に内部用語を出さない", () => {
  const card = readFileSync(new URL("../../components/price-info-card.tsx", import.meta.url), "utf8");
  const visible = [...card.matchAll(/"([^"\n]*[ぁ-んァ-ン一-龯][^"\n]*)"|>\s*([^<{}\n]*[ぁ-んァ-ン一-龯][^<{}\n]*)\s*</g)]
    .map((match) => match[1] ?? match[2])
    .join("\n");
  assert.match(visible, /いまの価格/);
  assert.match(visible, /送料込み最安/);
  assert.match(visible, /商品価格/);
  assert.doesNotMatch(visible, /商品価格の最安/);
  assert.doesNotMatch(visible, /offer|variant|observation|confidence|provider|Supabase|Yahoo|買い時/);
});
