export type BreadcrumbItem = {
  label: string;
  href: string;
  current?: boolean;
};

export function breadcrumbListJsonLd(items: readonly BreadcrumbItem[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.href, siteUrl).toString(),
    })),
  };
}
