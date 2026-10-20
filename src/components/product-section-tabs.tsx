"use client";

import { useEffect, useRef, useState } from "react";

export type ProductSectionTab = {
  id: string;
  label: string;
};

export function ProductSectionTabs({ tabs }: { tabs: ProductSectionTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const navRef = useRef<HTMLElement>(null);

  const tabIds = tabs.map((tab) => tab.id).join(",");

  useEffect(() => {
    const header = document.querySelector("header.sticky");
    const nav = navRef.current;
    if (!header || !nav) {
      return;
    }
    const apply = () => {
      const headerHeight = Math.ceil(header.getBoundingClientRect().height);
      nav.style.top = `${headerHeight}px`;
      const offset = headerHeight + nav.offsetHeight + 8;
      document.documentElement.style.setProperty("--product-section-offset", `${offset}px`);
    };
    const schedule = () => {
      requestAnimationFrame(() => requestAnimationFrame(apply));
    };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(header);
    if (header.firstElementChild) {
      resizeObserver.observe(header.firstElementChild);
    }
    const panel = document.getElementById("header-search-panel");
    const mutationObserver = new MutationObserver(schedule);
    if (panel) {
      mutationObserver.observe(panel, { attributes: true, attributeFilter: ["hidden", "class"] });
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    apply();
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.documentElement.style.removeProperty("--product-section-offset");
    };
  }, []);

  useEffect(() => {
    if (!tabIds) {
      return;
    }
    const ids = tabIds.split(",");
    const sections = ids.map((id) => document.getElementById(id)).filter((node): node is HTMLElement => node != null);
    if (sections.length === 0) {
      return;
    }

    const updateActive = () => {
      const header = document.querySelector("header.sticky");
      const nav = navRef.current;
      const offset = Math.ceil((header?.getBoundingClientRect().height ?? 0) + (nav?.offsetHeight ?? 0) + 8);
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= offset + 1) {
          current = section.id;
        }
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [tabIds]);

  if (tabs.length === 0) {
    return null;
  }

  function jump(id: string) {
    const node = document.getElementById(id);
    const nav = navRef.current;
    const header = document.querySelector("header.sticky");
    if (!node || !nav || !header) {
      return;
    }
    const offset = Math.ceil(header.getBoundingClientRect().height) + nav.offsetHeight + 8;
    const top = node.getBoundingClientRect().top + window.scrollY - offset;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
    setActive(id);
  }

  return (
    <nav
      ref={navRef}
      aria-label="商品ページ内ナビゲーション"
      className="sticky top-14 z-20 -mx-4 mt-3 border-b border-line bg-card/95 px-4 backdrop-blur-md md:hidden"
    >
      <div className="flex min-w-0" role="tablist">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => jump(tab.id)}
              className={
                selected
                  ? "min-h-12 flex-1 border-b-2 border-forest px-2 text-sm font-medium text-forest-deep"
                  : "min-h-12 flex-1 border-b-2 border-transparent px-2 text-sm text-muted"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
