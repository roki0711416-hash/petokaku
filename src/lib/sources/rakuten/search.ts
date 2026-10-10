import type { Offer } from "../../types.ts";
import { rakutenGet } from "./http.ts";
import { rakutenProductOfferFromPayload, rakutenProductSearchRequest } from "./product-search.ts";

export type RakutenJanResult = { ok: true; offers: Offer[] } | { ok: false; reason: "not-configured" | "not-shop-level" };

export function rakutenCredentials(): { applicationId: string; accessKey: string } | null {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID?.trim() ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim() ?? "";
  if (applicationId === "" || accessKey === "") {
    return null;
  }
  return { applicationId, accessKey };
}

// 楽天市場商品検索APIはJANを返さない。商品価格ナビはJANで同一製品を特定できるが、店舗ごとの送料は返さない。
// ここで出すのは、productCodeがページのJANと一致し、中古を除く購入可能価格がある製品だけ。
export async function loadRakutenJanOffers(
  janCode: string,
  transport: typeof rakutenGet = rakutenGet,
): Promise<RakutenJanResult> {
  if (!/^[0-9]{13}$/.test(janCode)) {
    return { ok: false, reason: "not-shop-level" };
  }
  const credentials = rakutenCredentials();
  if (!credentials) {
    return { ok: false, reason: "not-configured" };
  }
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID?.trim() ?? "";
  const { url, headers } = rakutenProductSearchRequest(credentials.applicationId, credentials.accessKey, janCode, affiliateId);
  try {
    const response = await transport(url, headers);
    if (response.status < 200 || response.status >= 300) {
      return { ok: true, offers: [] };
    }
    const offer = rakutenProductOfferFromPayload(JSON.parse(response.text) as unknown, janCode, new Date().toISOString(), affiliateId !== "");
    return { ok: true, offers: offer ? [offer] : [] };
  } catch {
    return { ok: true, offers: [] };
  }
}
