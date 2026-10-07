import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { OfferList } from "@/components/offer-list";
import { SizeCompare, type SizeCard } from "@/components/size-compare";
import { ProductArt } from "@/components/product-art";
import { RememberProduct } from "@/components/recently-viewed";
import { categoryHref, getCategory } from "@/lib/categories";
import { formatPriceInfo } from "@/lib/format";
import { getAllProducts, getOtherSizes, getProduct, getSizeGroup, productPath } from "@/lib/catalog";
import { compareSizes } from "@/lib/pricing/calculate";
import { privateRobots } from "@/lib/site";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ id: product.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product || id !== product.slug) {
    return { title: "商品が見つかりません" };
  }
  return {
    title: product.name,
    description: `${product.brand}の${product.name}（${product.sizeLabel}）について、ショップごとのサンプル価格と送料を比較します。実在店舗の価格ではありません。`,
    alternates: {
      canonical: productPath(product),
    },
    robots: privateRobots(),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product || id !== product.slug) {
    notFound();
  }

  const category = getCategory(product.category);
  const sizeGroup = getSizeGroup(product);
  const otherSizes = sizeGroup.length > 0 ? [] : getOtherSizes(product);
  const sizeRows = compareSizes(
    sizeGroup.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      quantityUnit: item.quantityUnit,
      unitPriceType: item.unitPriceType,
      offers: item.offers.map((offer) => ({ price: offer.price, shipping: offer.shippingFee })),
    })),
  );
  const sizeCards: SizeCard[] = sizeGroup.map((item) => {
    const row = sizeRows.find((entry) => entry.id === item.id);
    return {
      product: item,
      total: row?.total ?? null,
      effectiveUnit: row?.effectiveUnit ?? null,
      unitLabel: row?.unitLabel ?? null,
      isBestUnitPrice: row?.isBestUnitPrice ?? false,
      isCurrent: item.id === product.id,
    };
  });

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <RememberProduct id={product.id} />
      <Breadcrumbs
        items={[
          { label: "ホーム", href: "/" },
          { label: category.label, href: categoryHref(category.id) },
          { label: product.name, href: productPath(product), current: true },
        ]}
      />
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-line bg-card">
          <ProductArt category={product.category} variant={product.variant} name={product.name} large />
        </div>
        <div>
          <p className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-moss px-2.5 py-1 text-forest-deep">{category.label}</span>
            <span className="rounded-full bg-sand px-2.5 py-1 text-clay">サンプル商品</span>
          </p>
          <h1 className="mt-3 text-3xl leading-tight font-bold md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-muted">{product.brand}</p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-card px-4 py-3">
              <dt className="text-muted">カテゴリー</dt>
              <dd className="font-bold">{category.label}</dd>
            </div>
            <div className="rounded-2xl bg-card px-4 py-3">
              <dt className="text-muted">内容量・サイズ</dt>
              <dd className="font-bold">{product.sizeLabel}</dd>
            </div>
            <div className="rounded-2xl bg-card px-4 py-3">
              <dt className="text-muted">ブランド</dt>
              <dd className="font-bold">{product.brand}</dd>
            </div>
            <div className="rounded-2xl bg-card px-4 py-3">
              <dt className="text-muted">JANコード</dt>
              <dd className="font-bold">{product.janCode ?? "未登録"}</dd>
            </div>
            <div className="rounded-2xl bg-card px-4 py-3">
              <dt className="text-muted">型番</dt>
              <dd className="font-bold">{product.modelNumber ?? "未登録"}</dd>
            </div>
          </dl>
          <p className="mt-6 leading-8">{product.description}</p>
          {otherSizes.length > 0 ? (
            <div className="mt-6 rounded-3xl border border-line bg-card p-4">
              <h2 className="text-base font-bold">内容量が違う商品</h2>
              <p className="mt-1 text-sm text-muted">名前が同じでも、内容量やサイズが違うものは別商品として比較しています。</p>
              <ul className="mt-3 grid gap-2">
                {otherSizes.map((item) => (
                  <li key={item.id}>
                    <Link href={productPath(item)} className="font-bold text-forest-deep underline-offset-4 hover:underline">
                      {item.name}（{item.sizeLabel}）
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <section aria-labelledby="compare-heading" className="mt-12">
        <h2 id="compare-heading" className="text-2xl font-bold">
          この商品の価格を比較
        </h2>
        <p className="mt-3 text-sm font-bold text-forest-deep">{formatPriceInfo(product.latestCheckedAt)}</p>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
          ショップ名と金額は、動作確認用の架空データです。いちばん大きい金額は商品の販売価格です。送料が分かるショップは、支払総額の安い順に並べています。
        </p>
        <div className="mt-5">
          <OfferList offers={product.offers} />
        </div>
      </section>

      <SizeCompare items={sizeCards} />

      <section aria-labelledby="notice-heading" className="mt-10 rounded-[1.75rem] bg-moss px-5 py-6">
        <h2 id="notice-heading" className="text-xl font-bold">
          購入前に確認すること
        </h2>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-7">
          <li>このページの金額、送料、在庫はサンプルであり、実在ショップの情報ではありません。</li>
          <li>商品リンクは、将来アフィリエイト広告になる予定です。現在のサンプルには購入リンクを置いていません。</li>
          <li>実際に買うときは、販売店のページで価格・送料・在庫・内容量を確認してください。</li>
          <li>ペトカクは商品を販売せず、購入の契約には入りません。</li>
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/affiliate" className="font-bold text-forest-deep underline-offset-4 hover:underline">
            広告・アフィリエイトに関する表示
          </Link>
        </p>
      </section>
    </article>
  );
}
