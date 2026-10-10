import type { Offer } from "../../types.ts";

export type RakutenJanResult = { ok: true; offers: Offer[] } | { ok: false; reason: "not-configured" | "not-shop-level" };

export function rakutenCredentials(): { applicationId: string; accessKey: string } | null {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID?.trim() ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim() ?? "";
  if (applicationId === "" || accessKey === "") {
    return null;
  }
  return { applicationId, accessKey };
}

// 楽天の商品検索APIはJANではショップ別掲載を特定できない。
// プロダクトAPIはJANで製品を特定できるが、ショップ別の送料つき価格は返さない。
// 認証があっても、別商品を混ぜる検索には接続しない。アフィリエイトIDは送らない。
export async function loadRakutenJanOffers(janCode: string): Promise<RakutenJanResult> {
  if (!/^[0-9]{13}$/.test(janCode)) {
    return { ok: false, reason: "not-shop-level" };
  }
  if (!rakutenCredentials()) {
    return { ok: false, reason: "not-configured" };
  }
  return { ok: false, reason: "not-shop-level" };
}
