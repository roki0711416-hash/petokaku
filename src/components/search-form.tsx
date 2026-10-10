export function SearchForm({
  id,
  defaultValue = "",
  prominent = false,
  compact = false,
  hidden,
  action = "/products",
  placeholder = "例：チモシー、金魚のえさ",
  label = "商品名・キーワード",
  buttonLabel = "検索する",
}: {
  id: string;
  defaultValue?: string;
  prominent?: boolean;
  compact?: boolean;
  hidden?: { name: string; value: string }[];
  action?: string;
  placeholder?: string;
  label?: string;
  buttonLabel?: string;
}) {
  return (
    <form action={action} method="get" role="search" className={prominent || compact ? "" : "mt-4"}>
      {hidden?.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
      <label htmlFor={id} className={prominent || compact ? "sr-only" : "mb-2 block text-sm font-medium"}>
        {label}
      </label>
      <div
        className={`flex gap-2 ${
          compact
            ? "items-center rounded-full border border-line bg-card py-1 pr-1 pl-4"
            : prominent
              ? "flex-col rounded-[1.4rem] border border-line bg-card p-2 md:flex-row"
              : "max-w-2xl flex-col sm:flex-row"
        }`}
      >
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          maxLength={80}
          enterKeyHint="search"
          placeholder={placeholder}
          className={`w-full bg-card text-ink ${compact ? "h-10 min-w-0 flex-1 text-sm" : prominent ? "h-14 rounded-xl px-4 text-base" : "h-14 rounded-full border border-line px-5 text-base"}`}
        />
        <button
          type="submit"
          className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-white hover:bg-forest-deep ${compact ? "h-10 px-4 text-sm" : prominent ? "h-14 w-full px-5 md:w-auto" : "h-14 px-8"}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 16.5 20 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="ml-1">{buttonLabel}</span>
        </button>
      </div>
    </form>
  );
}
