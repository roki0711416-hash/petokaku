"use client";

import { usePathname } from "next/navigation";
import { SearchForm } from "@/components/search-form";

export function HeaderSearch({ placement }: { placement: "row" | "bar" }) {
  const pathname = usePathname();
  if (pathname === "/") {
    return null;
  }

  const form = (
    <SearchForm
      id={placement === "row" ? "header-search" : "header-search-mobile"}
      compact
      action="/search"
      label="商品名・ブランド・JANコード"
      buttonLabel="検索"
      placeholder="商品名・ブランド・JANコード"
    />
  );

  if (placement === "row") {
    return <div className="hidden min-w-0 flex-1 md:block">{form}</div>;
  }

  return <div className="mx-auto min-w-0 max-w-6xl px-4 pb-2.5 md:hidden">{form}</div>;
}
