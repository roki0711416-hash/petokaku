import Link from "next/link";
import { HeaderSearch } from "@/components/header-search";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { categorySearchHref } from "@/lib/categories";

const navLinks = [
  { href: categorySearchHref("dog"), label: "犬用品" },
  { href: categorySearchHref("cat"), label: "猫用品" },
  { href: "/#categories", label: "カテゴリー" },
  { href: "/about", label: "サイトについて" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 min-w-0 overflow-x-clip border-b border-line/80 bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex min-w-0 max-w-6xl items-center gap-3 px-4 py-2 md:gap-5 lg:gap-8">
        <Logo />
        <HeaderSearch placement="row" />
        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="主なメニュー">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 text-sm text-ink hover:bg-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto shrink-0 lg:ml-0 lg:hidden">
          <MobileMenu />
        </div>
      </div>
      <HeaderSearch placement="bar" />
    </header>
  );
}
