"use client";

import { useState } from "react";
import { OfferStack } from "@/components/offer-stack";
import type { Offer } from "@/lib/types";

export type CompareGroup = {
  key: string;
  tabLabel: string;
  note: string;
  initial: Offer[];
  rest: Offer[];
  lowestTotal: number | null;
};

export function OfferCompare({ groups }: { groups: CompareGroup[] }) {
  const usualIndex = groups.findIndex((group) => group.key === "unknown");
  const [index, setIndex] = useState(usualIndex >= 0 ? usualIndex : 0);
  const current = groups[index] ?? groups[0];
  if (!current) {
    return null;
  }
  const mainKey = usualIndex >= 0 ? "unknown" : groups[0]?.key;

  return (
    <div>
      {groups.length > 1 ? (
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="tablist" aria-label="販売単位">
          {groups.map((group, groupIndex) => {
            const selected = groupIndex === index;
            return (
              <button
                key={group.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setIndex(groupIndex)}
                className={
                  selected
                    ? "inline-flex min-h-11 shrink-0 items-center border-b-2 border-ink px-3 text-sm font-medium text-ink"
                    : "inline-flex min-h-11 shrink-0 items-center border-b-2 border-transparent px-3 text-sm text-muted"
                }
              >
                {group.tabLabel}
              </button>
            );
          })}
        </div>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-muted">{current.note}</p>
      <div className="mt-2" role="tabpanel">
        <OfferStack
          initial={current.initial}
          rest={current.rest}
          lowestTotal={current.lowestTotal}
          markLowest={current.key === mainKey}
        />
      </div>
    </div>
  );
}
