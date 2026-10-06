export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted">商品を探しています</p>
      <div className="mt-4 h-14 max-w-2xl rounded-full bg-sand" />
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {["a", "b", "c", "d"].map((item) => (
          <li key={item} className="h-64 rounded-2xl border border-line bg-card" />
        ))}
      </ul>
    </div>
  );
}
