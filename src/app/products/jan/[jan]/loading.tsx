export default function JanLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted">ショップの価格を集めています</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="aspect-[4/3] rounded-[2rem] bg-sand" />
        <div className="grid gap-3">
          <div className="h-8 w-2/3 rounded-full bg-sand" />
          <div className="h-28 rounded-2xl bg-card" />
          <div className="h-16 rounded-2xl bg-card" />
        </div>
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <div className="h-40 rounded-[1.75rem] bg-card" />
        <div className="h-40 rounded-[1.75rem] bg-card" />
      </div>
    </div>
  );
}
