import { preferDetailImageUrl, searchYahooItems, yahooJanSearchLimit } from "@/lib/sources/yahoo/search";
import { validJanCode } from "@/lib/sources/yahoo/adapter";
import { safeHttpUrl } from "@/lib/urls";
import { isAllowedArticleProductImageUrl } from "./product-href";

export { isAllowedArticleProductImageUrl, janFromArticleProductHref } from "./product-href";

// 指定JANのYahoo掲載から、そのJANに紐づく画像だけを返す。
// ビルド時の失敗を長時間焼き込まないよう、呼び出し側で connection() してリクエスト時に使う。
export async function articleProductImageUrl(janCode: string): Promise<string | null> {
  if (!validJanCode(janCode)) {
    return null;
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const matched = await searchYahooItems({
        janCode,
        results: yahooJanSearchLimit,
        // 商品詳細より長めに持ち、記事カード用の再取得失敗で空欄へ落ちにくくする
        revalidate: 3600,
      });
      if (!matched.ok) {
        continue;
      }

      const item = matched.items.find((entry) => validJanCode(entry.janCode) === janCode && entry.imageUrl);
      if (!item?.imageUrl) {
        continue;
      }

      const url = safeHttpUrl(preferDetailImageUrl(item.imageUrl));
      if (!url || !isAllowedArticleProductImageUrl(url)) {
        continue;
      }
      return url;
    } catch {
      // 次の試行へ
    }
  }

  return null;
}
