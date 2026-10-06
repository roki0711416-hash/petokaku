import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ListingFilters } from "@/components/listing-filters";
import { ProductCard } from "@/components/product-card";
import { SearchForm } from "@/components/search-form";
import { getCategory } from "@/lib/categories";
import { getAllProducts, toProductCard } from "@/lib/catalog";
import {
  activeFilterCount,
  clearFiltersHref,
  listingHref,
  pageSize,
  parseProductQuery,
  queryProducts,
  type ParsedProductQuery,
  type ProductQueryInput,
  type SortKey,
} from "@/lib/query";
import { listBrands } from "@/lib/search";
import { privateRobots } from "@/lib/site";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "おすすめ順" },
  { value: "price-asc", label: "価格が安い順" },
  { value: "price-desc", label: "価格が高い順" },
];

type ProductsPageProps = {
  searchParams: Promise<ProductQueryInput>;
};

function preservedSearchFields(query: ParsedProductQuery): { name: string; value: string }[] {
  const fields: { name: string; value: string }[] = [];
  if (query.category) {
    fields.push({ name: "category", value: query.category });
  }
  if (query.brand) {
    fields.push({ name: "brand", value: query.brand });
  }
  if (query.priceBand) {
    fields.push({ name: "price", value: query.priceBand });
  }
  if (query.sort !== "recommended") {
    fields.push({ name: "sort", value: query.sort });
  }
  return fields;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const query = parseProductQuery(await searchParams);
  if (query.q) {
    return {
      title: `「${query.q}」の検索結果`,
      description: "キーワードに合うサンプル商品です。表示価格は架空のデータです。",
      robots: privateRobots(),
    };
  }
  if (query.category) {
    const category = getCategory(query.category);
    return {
      title: category.label,
      description: `${category.label}のサンプル商品です。価格と送料は架空のデータです。`,
      robots: privateRobots(),
    };
  }
  return {
    title: "商品一覧",
    description: "ペット用品のサンプル商品を、種類・価格・キーワードで探せます。表示価格は架空のデータです。",
    robots: privateRobots(),
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const query = parseProductQuery(await searchParams);
  const products = getAllProducts();
  const result = queryProducts(products, query);
  const brands = listBrands(products);

  const title = query.q
    ? `「${query.q}」の検索結果：${result.total}件`
    : query.category
      ? getCategory(query.category).label
      : "商品一覧";
  const rangeStart = result.total === 0 ? 0 : (result.page - 1) * pageSize + 1;
  const rangeEnd = Math.min(result.page * pageSize, result.total);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "ホーム", href: "/" },
          { label: query.q ? `「${query.q}」の検索結果` : title, href: listingHref(query, result.page), current: true },
        ]}
      />
      <h1 className="mt-6 text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted">
        価格の安い順・高い順は、送料が分かる商品は送料込みの最安価格、送料が不明な商品は商品価格で並べます。送料不明を0円にはしません。
      </p>
      <div className="mt-6">
        <SearchForm id="list-search" defaultValue={query.q} hidden={preservedSearchFields(query)} />
      </div>

      <ListingFilters query={query} brands={brands} />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p aria-live="polite" className="text-sm text-muted">
          {result.total === 0 ? "0件" : `${result.total}件中 ${rangeStart}–${rangeEnd}件`}
        </p>
        <form action="/products" method="get" className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
          {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
          {query.brand ? <input type="hidden" name="brand" value={query.brand} /> : null}
          {query.priceBand ? <input type="hidden" name="price" value={query.priceBand} /> : null}
          <label className="text-sm font-bold" htmlFor="sort">
            並び替え
          </label>
          <select id="sort" name="sort" defaultValue={query.sort} className="h-12 rounded-full border border-line bg-card px-4">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="submit" className="min-h-12 rounded-full border border-line bg-card px-4 text-sm font-bold">
            並べ替える
          </button>
        </form>
      </div>

      {result.total === 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-line bg-card px-5 py-10">
          <h2 className="text-xl font-bold">条件に一致する商品が見つかりませんでした。</h2>
          <p className="mt-2 text-muted">条件を変更して検索してください。</p>
          <p className="mt-4">
            <Link
              href={activeFilterCount(query) > 0 ? clearFiltersHref(query) : "/products"}
              className="text-sm font-bold text-forest-deep underline-offset-4 hover:underline"
            >
              条件をクリア
            </Link>
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((product) => (
            <li key={product.id}>
              <ProductCard product={toProductCard(product)} />
            </li>
          ))}
        </ul>
      )}

      {result.pageCount > 1 ? (
        <nav aria-label="ページ" className="mt-8 flex flex-wrap items-center gap-2">
          {result.page > 1 ? (
            <Link
              href={listingHref(query, result.page - 1)}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-bold"
            >
              前のページ
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-muted">前のページ</span>
          )}
          {Array.from({ length: result.pageCount }, (_, index) => index + 1).map((page) => (
            <Link
              key={page}
              href={listingHref(query, page)}
              aria-current={page === result.page ? "page" : undefined}
              className={`grid h-11 w-11 place-items-center rounded-full text-sm font-bold ${
                page === result.page ? "bg-forest text-card" : "border border-line bg-card"
              }`}
            >
              {page}
            </Link>
          ))}
          {result.page < result.pageCount ? (
            <Link
              href={listingHref(query, result.page + 1)}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-bold"
            >
              次のページ
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-muted">次のページ</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
