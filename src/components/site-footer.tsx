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
  { label: "Instagram", href: "https://www.instagram.com/petokaku/" },
  { label: "X", href: "https://x.com/petokaku" },
];

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
            <p className="text-xs tracking-[0.14em] text-muted">SNS</p>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="SNS">
              {socials.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-sm text-ink hover:bg-paper"
                  >
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
