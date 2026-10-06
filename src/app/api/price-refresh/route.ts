import { authorizePriceRefresh } from "@/lib/pricing/price-refresh-auth";
import { refreshRecentJanPrices } from "@/lib/supabase/daily-price-refresh";
import { withPriceRefreshLock } from "@/lib/supabase/price-refresh-lock";

export const dynamic = "force-dynamic";

function denied() {
  return Response.json({ ok: false }, { status: 401 });
}

function isAuthorized(request: Request): boolean {
  const authorization = request.headers.get("authorization");
  return (
    authorizePriceRefresh(authorization, process.env.PRICE_REFRESH_SECRET) ||
    authorizePriceRefresh(authorization, process.env.CRON_SECRET)
  );
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return denied();
  }
  try {
    const guarded = await withPriceRefreshLock(() => refreshRecentJanPrices());
    if (!guarded.acquired) {
      return Response.json({ ok: false }, { status: 409 });
    }
    const report = guarded.value;
    return Response.json({
      ok: true,
      targets: report.targets,
      skipped: report.skipped,
      deferred: report.deferred,
      yahooCalls: report.yahooCalls,
      succeeded: report.succeeded,
      failed: report.failed,
      inserted: report.inserted,
      confirmed: report.confirmed,
    });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

export function GET(request: Request) {
  return handle(request);
}

export function POST(request: Request) {
  return handle(request);
}
