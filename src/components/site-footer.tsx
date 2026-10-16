import Link from "next/link";
import { FooterPriceNote } from "@/components/footer-price-note";

const columns = [
  {
    title: "ペトカクについて",
    links: [{ href: "/about", label: "ペトカクについて" }],
  },
  {
    title: "ご利用ガイド",
    links: [
      { href: "/pets/dog", label: "犬用品の価格比較" },
      { href: "/pets/cat", label: "猫用品の価格比較" },
      { href: "/articles", label: "ペット用品の選び方" },
      { href: "/guide", label: "サイトの使い方" },
    ],
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

const dataProviderCreditsHtml = `<div><!-- Rakuten Web Services Attribution Snippet FROM HERE -->
<a href="https://developers.rakuten.com/" target="_blank">Supported by Rakuten Developers</a>
<!-- Rakuten Web Services Attribution Snippet TO HERE --></div>
<div><!-- Begin Yahoo! JAPAN Web Services Attribution Snippet -->
<span style="margin:15px 15px 15px 15px"><a href="https://developer.yahoo.co.jp/sitemap/">Webサービス by Yahoo! JAPAN</a></span>
<!-- End Yahoo! JAPAN Web Services Attribution Snippet --></div>`;

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/petokaku/",
    icon: InstagramIcon,
  },
  {
    label: "X",
    href: "https://x.com/petokaku",
    icon: XIcon,
  },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.6]">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[15px] w-[15px] fill-current">
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
            <ul className="mt-4 flex gap-6" aria-label="公式アカウント">
              {socials.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.label}（新しいタブで開く）`}
                    className="group grid justify-items-center gap-2"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-line bg-sand text-forest transition-colors duration-200 group-hover:border-forest group-hover:bg-forest group-hover:text-card">
                      <item.icon />
                    </span>
                    <span className="text-[11px] tracking-[0.14em] text-muted transition-colors group-hover:text-forest">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title} className="min-w-0">
              <nav aria-label={column.title}>
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
              {column.title === "お問い合わせ" ? (
                <section aria-label="データ提供・外部サービス" className="mt-6">
                  <p className="text-sm font-medium text-ink">データ提供・外部サービス</p>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    商品情報の取得には、楽天ウェブサービスおよびYahoo!ショッピングのAPIを利用しています。
                  </p>
                  <div className="official-api-credit mt-3 text-sm leading-7" dangerouslySetInnerHTML={{ __html: dataProviderCreditsHtml }} />
                </section>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <p className="text-sm leading-6 text-muted">Amazonのアソシエイトとして、ペトカク運営事務局は適格販売により収入を得ています。</p>
          <p className="mt-2 text-xs leading-6 text-muted">
            © 2026 ペトカク。商品の販売は行っていません。購入前に、販売店のページで価格・送料・在庫を確認してください。
          </p>
        </div>
      </div>
    </footer>
  );
}
