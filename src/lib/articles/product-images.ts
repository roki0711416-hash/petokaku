import { loadYahooJan } from "@/lib/sources/yahoo/preview";
import { safeHttpUrl } from "@/lib/urls";
import { isAllowedArticleProductImageUrl } from "./product-href";

export { isAllowedArticleProductImageUrl, janFromArticleProductHref } from "./product-href";

// 指定JANのYahoo取得画像だけを返す。JAN不一致・ホスト外・取得失敗は null（プレースホルダー用）。
export async function articleProductImageUrl(janCode: string): Promise<string | null> {
  try {
    const loaded = await loadYahooJan(janCode);
    if (!loaded.ok) {
      return null;
    }
    if (loaded.adapted.detail.janCode !== janCode) {
      return null;
    }
    const url = safeHttpUrl(loaded.adapted.detail.imageUrl);
    if (!url || !isAllowedArticleProductImageUrl(url)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}
