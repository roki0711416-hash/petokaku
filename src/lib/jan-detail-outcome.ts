export type YahooDetailFailure = "not-configured" | "request-failed" | "no-jan";
export type RakutenDetailState = "ready" | "temporary" | "none";
export type JanDetailOutcome = "rakuten" | "temporary" | "missing";

// Yahooが通信に失敗したときは、楽天が空でも「商品がない」とは扱わない。
export function janDetailOutcome(yahoo: YahooDetailFailure, rakuten: RakutenDetailState): JanDetailOutcome {
  if (rakuten === "ready") {
    return "rakuten";
  }
  if (yahoo === "no-jan" && rakuten === "none") {
    return "missing";
  }
  return "temporary";
}
