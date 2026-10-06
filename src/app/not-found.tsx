import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <p className="text-sm font-bold text-forest-deep">404</p>
      <h1 className="mt-2 text-3xl font-bold">ページが見つかりません</h1>
      <p className="mt-3 text-muted">アドレスが違うか、このサイトにないページです。商品名から探し直してください。</p>
      <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-full bg-forest px-5 font-bold text-card">
        トップへ戻る
      </Link>
    </div>
  );
}
