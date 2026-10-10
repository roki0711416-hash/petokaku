import Link from "next/link";
import { FooterPriceNote } from "@/components/footer-price-note";

const columns = [
  {
    title: "ペトカクについて",
    links: [
      { href: "/about", label: "ペトカクについて" },
      { href: "/guide", label: "サイトの使い方" },
      { href: "/contact", label: "お問い合わせ" },
    ],
  },
  {
    title: "表示と規約",
    links: [
      { href: "/terms", label: "利用規約" },
      { href: "/privacy", label: "プライバシーポリシー" },
      { href: "/affiliate", label: "広告・アフィリエイト" },
    ],
  },
];

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/petokaku/" },
  { label: "X", href: "https://x.com/petokaku" },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img src="/logo.png" alt="ペトカク" className="h-8 w-auto" />
          <p className="mt-2 text-sm text-muted">かしこく買って、もっと一緒に。</p>
          <FooterPriceNote />
          <div className="mt-6">
            <p className="text-xs tracking-[0.14em] text-muted">SNS</p>
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="SNS">
              {socials.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center rounded-full bg-paper px-3 text-xs text-ink underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs leading-6 text-muted">
          © 2026 ペトカク。商品の販売は行っていません。購入前に、販売店のページで価格・送料・在庫を確認してください。
        </p>
      </div>
    </footer>
  );
}
