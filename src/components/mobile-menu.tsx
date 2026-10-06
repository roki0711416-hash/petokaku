"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { categories, categorySearchHref } from "@/lib/categories";

type MenuLink = {
  href: string;
  label: string;
};

const closeDurationMs = 250;

export function MobileMenu({ links }: { links: MenuLink[] }) {
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const openFrameRef = useRef<number | null>(null);
  const hasOpenedRef = useRef(false);
  const [rendered, setRendered] = useState(false);
  const [active, setActive] = useState(false);

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function cancelOpenFrame() {
    if (openFrameRef.current !== null) {
      window.cancelAnimationFrame(openFrameRef.current);
      openFrameRef.current = null;
    }
  }

  function openMenu() {
    clearCloseTimer();
    cancelOpenFrame();
    hasOpenedRef.current = true;
    setRendered(true);
    openFrameRef.current = window.requestAnimationFrame(() => {
      openFrameRef.current = window.requestAnimationFrame(() => {
        openFrameRef.current = null;
        setActive(true);
      });
    });
  }

  function closeMenu() {
    cancelOpenFrame();
    setActive(false);
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setRendered(false);
      closeTimerRef.current = null;
    }, closeDurationMs);
  }

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!rendered) {
      return;
    }

    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [rendered]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("[data-menu-close]")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useEffect(() => {
    if (!hasOpenedRef.current || rendered) {
      return;
    }
    triggerRef.current?.focus();
  }, [rendered]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    function onChange() {
      if (media.matches) {
        clearCloseTimer();
        setActive(false);
        setRendered(false);
      }
    }
    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
      cancelOpenFrame();
    };
  }, []);

  const drawer =
    rendered && typeof document !== "undefined"
      ? createPortal(
          <div className={active ? "mobile-menu is-open" : "mobile-menu"}>
            <button type="button" className="mobile-menu-overlay" aria-label="メニューを閉じる" onClick={closeMenu} />
            <div
              ref={dialogRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="mobile-menu-drawer"
            >
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
                <p id={titleId} className="text-base font-bold">
                  メニュー
                </p>
                <button
                  type="button"
                  data-menu-close
                  className="grid h-12 w-12 place-items-center rounded-full border border-line bg-paper text-ink"
                  aria-label="メニューを閉じる"
                  onClick={closeMenu}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <nav aria-label="スマートフォン用メニュー" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                <ul className="grid gap-0.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="mobile-menu-link" onClick={closeMenu}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="my-3 border-t border-line" />
                <p className="px-3 pb-1 text-xs font-bold text-forest-deep">ペットの種類から探す</p>
                <ul className="grid gap-0.5">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link href={categorySearchHref(category.id)} className="mobile-menu-link" onClick={closeMenu}>
                        {category.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="grid h-10 w-10 place-items-center md:hidden"
        aria-expanded={active}
        aria-controls={rendered ? "mobile-menu" : undefined}
        onClick={() => (active ? closeMenu() : openMenu())}
      >
        <span className="sr-only">メニュー</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
          <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {drawer}
    </>
  );
}
