import "server-only";

import { janViewInsertValues, planJanView, type JanViewRecord } from "../pricing/jan-view.ts";
import { getSupabaseServerClient } from "./server.ts";

function recordFailed(): never {
  throw new Error("閲覧の記録に失敗しました");
}

async function readView(janCode: string): Promise<JanViewRecord | null> {
  const result = await getSupabaseServerClient().from("jan_views").select("jan_code, last_viewed_at, view_count").eq("jan_code", janCode).maybeSingle();
  if (result.error) {
    recordFailed();
  }
  if (!result.data) {
    return null;
  }
  return {
    janCode: result.data.jan_code,
    lastViewedAt: result.data.last_viewed_at,
    viewCount: result.data.view_count,
  };
}

export async function recordDisplayedJanView(janCode: string, viewedAt = new Date().toISOString()): Promise<"insert" | "touch" | "skip"> {
  const existing = /^[0-9]{13}$/.test(janCode) ? await readView(janCode) : null;
  const plan = planJanView(janCode, viewedAt, existing);
  if (!plan) {
    return "skip";
  }
  const supabase = getSupabaseServerClient();
  if (plan.action === "insert") {
    const values = janViewInsertValues(plan);
    const inserted = await supabase.from("jan_views").insert({
      jan_code: values.janCode,
      last_viewed_at: values.lastViewedAt,
      view_count: values.viewCount,
      created_at: values.createdAt,
      updated_at: values.updatedAt,
    });
    if (!inserted.error) {
      return "insert";
    }
    if (inserted.error.code !== "23505") {
      recordFailed();
    }
    const raced = await readView(plan.janCode);
    const retry = planJanView(plan.janCode, viewedAt, raced);
    if (!retry || retry.action !== "touch") {
      recordFailed();
    }
    const updated = await supabase
      .from("jan_views")
      .update({ last_viewed_at: retry.lastViewedAt, view_count: retry.viewCount, updated_at: retry.lastViewedAt })
      .eq("jan_code", retry.janCode);
    if (updated.error) {
      recordFailed();
    }
    return "touch";
  }
  const updated = await supabase
    .from("jan_views")
    .update({ last_viewed_at: plan.lastViewedAt, view_count: plan.viewCount, updated_at: plan.lastViewedAt })
    .eq("jan_code", plan.janCode);
  if (updated.error) {
    recordFailed();
  }
  return "touch";
}
