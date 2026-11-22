// 本番エイリアスと petokaku.com は同じデプロイなので、ALLOW_INDEXING では区別できない。
// Next.js は has.value を ^value$ でホスト名（小文字、ポートなし）に完全一致させる。

export const canonicalOrigin = "https://petokaku.com";

export const productionAliasHostPattern = "petokaku\\.vercel\\.app";

export const nonAliasVercelHostPattern = ".+\\.vercel\\.app";

export const noindexRobotsTag = "noindex";

export const productionAliasRedirect = {
  source: "/:path*",
  has: [{ type: "host" as const, value: productionAliasHostPattern }],
  destination: `${canonicalOrigin}/:path*`,
  permanent: true as const,
};

export const nonAliasVercelNoindexHeader = {
  source: "/:path*",
  has: [{ type: "host" as const, value: nonAliasVercelHostPattern }],
  missing: [{ type: "host" as const, value: productionAliasHostPattern }],
  headers: [{ key: "X-Robots-Tag", value: noindexRobotsTag }],
};

export type HostRouting = "redirect-alias" | "noindex" | "unchanged";

export function hostnameFromHostHeader(hostHeader: string | null | undefined): string {
  return (hostHeader ?? "").trim().split(":", 1)[0].toLowerCase();
}

function hostMatches(pattern: string, hostname: string): boolean {
  return new RegExp(`^${pattern}$`).test(hostname);
}

export function hostRouting(hostHeader: string | null | undefined): HostRouting {
  const hostname = hostnameFromHostHeader(hostHeader);
  if (hostMatches(productionAliasHostPattern, hostname)) {
    return "redirect-alias";
  }
  if (hostMatches(nonAliasVercelHostPattern, hostname)) {
    return "noindex";
  }
  return "unchanged";
}
