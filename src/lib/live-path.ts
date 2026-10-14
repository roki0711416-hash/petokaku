export function isLiveStorePath(pathname: string): boolean {
  return pathname === "/search" || pathname === "/products/yahoo-preview" || pathname.startsWith("/products/jan/");
}

export function isSampleCatalogPath(pathname: string): boolean {
  void pathname;
  return false;
}
