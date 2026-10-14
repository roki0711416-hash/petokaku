import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllProducts } from "@/lib/catalog";

const slugByInternalId = new Map(getAllProducts().map((product) => [product.id, product.slug]));

const missingPage = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>ページが見つかりません | ペトカク</title></head><body><h1>ページが見つかりません</h1><p>アドレスが違うか、このサイトにないページです。</p><p><a href="/">トップへ戻る</a></p></body></html>`;

function isUnpublishedProductPath(pathname: string): boolean {
  if (pathname === "/products") {
    return true;
  }
  const match = pathname.match(/^\/products\/([^/]+)$/);
  if (!match) {
    return false;
  }
  return match[1] !== "yahoo-preview";
}

export function middleware(request: NextRequest) {
  if (isUnpublishedProductPath(request.nextUrl.pathname)) {
    return new NextResponse(missingPage, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }

  const match = request.nextUrl.pathname.match(/^\/products\/([^/]+)$/);
  if (!match) {
    return NextResponse.next();
  }

  const key = decodeURIComponent(match[1]);
  const slug = slugByInternalId.get(key);
  if (!slug || slug === key) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/products/${slug}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/products", "/products/:product"],
};
