import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllProducts } from "@/lib/catalog";

const slugByInternalId = new Map(getAllProducts().map((product) => [product.id, product.slug]));

export function middleware(request: NextRequest) {
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
  matcher: "/products/:product",
};
