const janHrefPattern = /^\/products\/jan\/([0-9]{13})$/;

const allowedImageHosts = new Set(["item-shopping.c.yimg.jp", "thumbnail.image.rakuten.co.jp"]);

export function janFromArticleProductHref(href: string): string | null {
  const match = janHrefPattern.exec(href);
  return match?.[1] ?? null;
}

export function isAllowedArticleProductImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && allowedImageHosts.has(url.hostname);
  } catch {
    return false;
  }
}
