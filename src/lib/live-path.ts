export function isLiveStorePath(pathname: string): boolean {
  return pathname === "/search" || pathname === "/products/yahoo-preview" || pathname.startsWith("/products/jan/");
}

export function isSampleCatalogPath(pathname: string): boolean {
  if (pathname === "/products") {
    return true;
  }
  if (!pathname.startsWith("/products/")) {
    return false;
  }
  return !pathname.startsWith("/products/jan/") && !pathname.startsWith("/products/yahoo-preview");
}
