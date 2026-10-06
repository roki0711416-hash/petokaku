import Link from "next/link";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";

const mainLinks = [
  { href: "/search", label: "商品を探す" },
  { href: "/#dog", label: "犬" },
  { href: "/#cat", label: "猫" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-1.5 md:py-2.5">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="主なメニュー">
          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 text-sm">
              {link.label}
            </Link>
          ))}
          <span className="px-3 py-2 text-sm text-muted" title="準備中">
            お気に入り
          </span>
        </nav>
        <div className="flex items-center gap-1 md:hidden">
          <Link href="/search" aria-label="商品を探す" className="grid h-10 w-10 place-items-center rounded-full">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 16.5 20 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Link>
          <MobileMenu links={[...mainLinks, { href: "/about", label: "ペトカクについて" }]} />
        </div>
      </div>
    </header>
  );
}
