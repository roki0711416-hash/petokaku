import { authorizePriceRefresh } from "@/lib/pricing/price-refresh-auth";
import { petPages } from "@/lib/pets";
import { probeRakutenProduct } from "@/lib/sources/rakuten/product-search";
import { probeRakutenItemSearch } from "@/lib/sources/rakuten/probe";
import { diagnoseRakutenReviewSearch } from "@/lib/sources/rakuten/review-search-diagnose";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.RAKUTEN_PROBE_SECRET?.trim() ?? "";
  if (secret === "" || !authorizePriceRefresh(request.headers.get("authorization"), secret)) {
    return new Response(null, { status: 404 });
  }
  const keyword = new URL(request.url).searchParams.get("keyword")?.trim() ?? "";
  const allowed = new Set(petPages().map((pet) => pet.query));
  if (keyword !== "") {
    if (!allowed.has(keyword)) {
      return Response.json({ error: "unsupported-keyword" }, { status: 400 });
    }
    return Response.json(await diagnoseRakutenReviewSearch(keyword));
  }
  const [itemSearch, productSearch] = await Promise.all([
    probeRakutenItemSearch("猫砂"),
    probeRakutenProduct("3182550706933"),
  ]);
  return Response.json({ itemSearch, productSearch });
}
