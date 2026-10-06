export type JanViewRecord = {
  janCode: string;
  lastViewedAt: string;
  viewCount: number;
};

export type JanViewPlan = {
  action: "insert" | "touch";
  janCode: string;
  lastViewedAt: string;
  viewCount: number;
};

export function janViewInsertValues(plan: JanViewPlan): {
  janCode: string;
  lastViewedAt: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
} {
  return {
    janCode: plan.janCode,
    lastViewedAt: plan.lastViewedAt,
    viewCount: plan.viewCount,
    createdAt: plan.lastViewedAt,
    updatedAt: plan.lastViewedAt,
  };
}

export function planJanView(janCode: string, viewedAt: string, existing: JanViewRecord | null): JanViewPlan | null {
  if (!/^[0-9]{13}$/.test(janCode)) {
    return null;
  }
  if (!existing) {
    return { action: "insert", janCode, lastViewedAt: viewedAt, viewCount: 1 };
  }
  if (existing.janCode !== janCode || !Number.isInteger(existing.viewCount) || existing.viewCount < 1) {
    return null;
  }
  return {
    action: "touch",
    janCode,
    lastViewedAt: viewedAt,
    viewCount: existing.viewCount + 1,
  };
}
