export function AmazonAssociateLink({ url }: { url: string }) {
  return (
    <section aria-labelledby="amazon-heading" className="mt-5 rounded-xl border border-line bg-card px-4 py-4">
      <h2 id="amazon-heading" className="text-lg font-medium tracking-tight text-ink">
        Amazonでも商品を確認
      </h2>
      <div className="mt-3 sm:max-w-xs">
        <a
          href={url}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-forest px-4 text-sm font-medium text-white hover:bg-forest-deep"
        >
          Amazonで見る
          <span aria-hidden="true" className="ml-1">
            ↗
          </span>
        </a>
        <p className="mt-1 text-center text-xs text-muted">広告</p>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">価格・在庫はAmazonでご確認ください。</p>
    </section>
  );
}
