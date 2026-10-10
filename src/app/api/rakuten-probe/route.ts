import { authorizePriceRefresh } from "@/lib/pricing/price-refresh-auth";
import { probeRakutenItemSearch } from "@/lib/sources/rakuten/probe";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.RAKUTEN_PROBE_SECRET?.trim() ?? "";
  if (secret === "" || !authorizePriceRefresh(request.headers.get("authorization"), secret)) {
    return new Response(null, { status: 404 });
  }
  const result = await probeRakutenItemSearch("猫砂");
  return Response.json(result);
}
