import Link from "next/link";
import { FooterPriceNote } from "@/components/footer-price-note";

const columns = [
  {
    title: "ペトカクについて",
    links: [{ href: "/about", label: "ペトカクについて" }],
  },
  {
    title: "ご利用ガイド",
    links: [{ href: "/guide", label: "サイトの使い方" }],
  },
  {
    title: "ポリシー・規約",
    links: [
      { href: "/privacy", label: "プライバシーポリシー" },
      { href: "/terms", label: "利用規約" },
      { href: "/cookies", label: "Cookie設定" },
      { href: "/affiliate", label: "広告・アフィリエイト" },
    ],
  },
  {
    title: "お問い合わせ",
    links: [{ href: "/contact", label: "お問い合わせ" }],
  },
];

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/petokaku/",
    icon: InstagramIcon,
    mark: "bg-moss text-forest group-hover:bg-forest group-hover:text-card",
  },
  {
    label: "X",
    href: "https://x.com/petokaku",
    icon: XIcon,
    mark: "bg-ink text-card group-hover:bg-forest",
  },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
      <path d="M14.7 4h2.6l-5.7 6.5L18.6 20h-4.3l-3.4-4.9L7 20H4.4l6.1-7L4.2 4h4.4l3 4.4L14.7 4Zm-.9 14.4h1.4L8.3 5.5H6.8l7 12.9Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-line bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col gap-8 border-b border-line pb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <img src="/logo.png" alt="ペトカク" className="h-8 w-auto" />
            <p className="mt-3 text-sm text-muted">かしこく買って、もっと一緒に。</p>
            <FooterPriceNote />
          </div>
          <div>
            <p className="text-xs tracking-[0.14em] text-muted">公式アカウント</p>
            <ul className="mt-3 flex flex-wrap gap-3" aria-label="公式アカウント">
              {socials.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.label}（新しいタブで開く）`}
                    className="lift group inline-flex min-h-12 items-center gap-2.5 rounded-full border border-line bg-card py-1 pr-4 pl-1 text-sm text-ink shadow-[0_10px_24px_rgba(32,77,56,0.06)] hover:border-sage"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-full transition-colors ${item.mark}`}>
                      <item.icon />
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-sm font-medium text-ink">{column.title}</p>
              <ul className="mt-3 grid gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs leading-6 text-muted">
          © 2026 ペトカク。商品の販売は行っていません。購入前に、販売店のページで価格・送料・在庫を確認してください。
        </p>
      </div>
    </footer>
  );
}
