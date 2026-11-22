import { authorizePriceRefresh } from "@/lib/pricing/price-refresh-auth";
import { logPriceRefresh } from "@/lib/pricing/price-refresh-log";
import { refreshRecentJanPrices } from "@/lib/supabase/daily-price-refresh";
import { withPriceRefreshLock } from "@/lib/supabase/price-refresh-lock";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

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
    logPriceRefresh("denied");
    return denied();
  }
  if (!isSupabaseConfigured()) {
    logPriceRefresh("not-configured", { reason: "supabase" });
    return Response.json({ ok: false, stopped: "not-configured" }, { status: 503 });
  }
  try {
    const guarded = await withPriceRefreshLock(() => refreshRecentJanPrices());
    if (!guarded.acquired) {
      logPriceRefresh("locked");
      return Response.json({ ok: false }, { status: 409 });
    }
    const report = guarded.value;
    logPriceRefresh("done", {
      targets: report.targets,
      skipped: report.skipped,
      deferred: report.deferred,
      yahooCalls: report.yahooCalls,
      succeeded: report.succeeded,
      failed: report.failed,
      inserted: report.inserted,
      confirmed: report.confirmed,
      stopped: report.stopped ?? "none",
    });
    if (report.stopped === "not-configured") {
      return Response.json(
        {
          ok: false,
          stopped: report.stopped,
          failed: report.failed,
          yahooCalls: report.yahooCalls,
        },
        { status: 503 },
      );
    }
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
      stopped: report.stopped,
    });
  } catch {
    logPriceRefresh("error");
    return Response.json({ ok: false }, { status: 500 });
  }
}

export function GET(request: Request) {
  return handle(request);
}

export function POST(request: Request) {
  return handle(request);
}
