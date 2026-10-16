"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { MobileMenu } from "@/components/mobile-menu";
import { SearchForm } from "@/components/search-form";
import { petPath } from "@/lib/pets";

const navLinks = [
  { href: petPath("dog"), label: "犬用品" },
  { href: petPath("cat"), label: "猫用品" },
  { href: "/articles", label: "選び方" },
  { href: "/about", label: "サイトについて" },
];

const phoneQuery = "(max-width: 767px)";

export function HeaderSearch() {
  const pathname = usePathname();
  return <HeaderSearchControls key={pathname} home={pathname === "/"} />;
}

function HeaderSearchControls({ home }: { home: boolean }) {
  const [open, setOpen] = useState(!home);
  const [collapsed, setCollapsed] = useState(false);
  const shouldFocus = useRef(false);
  const wasAway = useRef(false);
  const holdOpenUntil = useRef(0);
  const shown = open && !collapsed;

  useEffect(() => {
    if (!shown || !shouldFocus.current) {
      return;
    }
    document.getElementById("header-search")?.focus();
    shouldFocus.current = false;
  }, [shown]);

  useEffect(() => {
    const media = window.matchMedia(phoneQuery);
    let mobile = media.matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!mobile) {
        setCollapsed(false);
        return;
      }
      if (Date.now() < holdOpenUntil.current) {
        return;
      }
      const panel = document.getElementById("header-search-panel");
      if (panel?.contains(document.activeElement)) {
        return;
      }
      const y = window.scrollY;
      if (y > 64) {
        wasAway.current = true;
        setCollapsed(true);
        return;
      }
      if (y <= 4 && wasAway.current) {
        wasAway.current = false;
        setCollapsed(false);
        setOpen(!home);
      }
    };

    const onScroll = () => {
      if (frame !== 0) {
        return;
      }
      frame = window.requestAnimationFrame(update);
    };
    const onMedia = () => {
      mobile = media.matches;
      if (!mobile) {
        setCollapsed(false);
      }
    };

    media.addEventListener("change", onMedia);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      media.removeEventListener("change", onMedia);
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [home]);

  function toggleSearch() {
    if (!shown) {
      shouldFocus.current = true;
      holdOpenUntil.current = Date.now() + 700;
      setCollapsed(false);
      setOpen(true);
      return;
    }
    setOpen(false);
  }

  function closeFromKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    setOpen(false);
    document.getElementById("header-search-toggle")?.focus();
  }

  return (
    <>
      <div className="order-3 ml-auto flex shrink-0 items-center gap-1">
        <button
          id="header-search-toggle"
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-white"
          aria-expanded={shown}
          aria-controls="header-search-panel"
          aria-label={shown ? "検索欄を閉じる" : "商品を検索"}
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
      <div
        id="header-search-panel"
        hidden={!shown}
        className={shown ? "order-4 mt-1 w-full min-w-0 basis-full pb-1 md:order-2 md:mt-0 md:w-auto md:flex-1 md:basis-auto md:pb-0" : "hidden"}
        onKeyDown={closeFromKeyboard}
      >
        <SearchForm
          id="header-search"
          compact
          action="/search"
          label="商品名・ブランド・JANコード"
          buttonLabel="検索"
          placeholder="商品名・ブランド・JANコード"
        />
      </div>
    </>
  );
}
