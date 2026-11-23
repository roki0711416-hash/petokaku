import { ShopOutboundLink } from "@/components/shop-outbound-link";

export function AmazonAssociateLink({ url }: { url: string }) {
  return (
    <section aria-labelledby="amazon-heading" className="mt-4 rounded-2xl border border-line bg-card px-3 py-3 sm:px-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 id="amazon-heading" className="text-base font-medium text-ink">
            Amazon
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">Amazonの価格はAmazonのページで表示されます。</p>
        </div>
        <div className="sm:w-56 sm:shrink-0">
          <ShopOutboundLink
            href={url}
            affiliate
            shop="amazon"
            shopName="Amazon"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-forest px-4 text-sm font-medium text-white hover:bg-forest-deep"
          >
            Amazonで価格を見る
            <span aria-hidden="true" className="ml-1">
              ↗
            </span>
          </ShopOutboundLink>
          <p className="mt-1 text-center text-xs text-muted">広告</p>
        </div>
      </div>
    </section>
  );
}
