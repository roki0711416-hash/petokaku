"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MobileMenu } from "@/components/mobile-menu";
import { SearchForm } from "@/components/search-form";
import { petPath } from "@/lib/pets";

const navLinks = [
  { href: petPath("dog"), label: "犬用品" },
  { href: petPath("cat"), label: "猫用品" },
  { href: "/#categories", label: "カテゴリー" },
  { href: "/about", label: "サイトについて" },
];

export function HeaderSearch() {
  const pathname = usePathname();
  return <HeaderSearchControls key={pathname} home={pathname === "/"} />;
}

function HeaderSearchControls({ home }: { home: boolean }) {
  const [open, setOpen] = useState(!home);
  const shouldFocus = useRef(false);

  useEffect(() => {
    if (!open || !shouldFocus.current) {
      return;
    }
    document.getElementById("header-search")?.focus();
    shouldFocus.current = false;
  }, [open]);

  function toggleSearch() {
    shouldFocus.current = !open;
    setOpen((current) => !current);
  }

  return (
    <>
      <div className="order-3 ml-auto flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-white"
          aria-expanded={open}
          aria-controls="header-search-panel"
          aria-label={open ? "検索欄を閉じる" : "商品を検索"}
          onClick={toggleSearch}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 16.5 20 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="主なメニュー">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 text-sm text-ink hover:bg-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="lg:hidden">
          <MobileMenu />
        </div>
      </div>
      {open ? (
        <div id="header-search-panel" className="order-4 mt-1 w-full min-w-0 basis-full pb-1 md:order-2 md:mt-0 md:w-auto md:flex-1 md:basis-auto md:pb-0">
          <SearchForm
            id="header-search"
            compact
            action="/search"
            label="商品名・ブランド・JANコード"
            buttonLabel="検索"
            placeholder="商品名・ブランド・JANコード"
          />
        </div>
      ) : null}
    </>
  );
}
