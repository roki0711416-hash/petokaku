export function SearchForm({
  id,
  defaultValue = "",
  prominent = false,
  hidden,
  action = "/products",
  placeholder = "例：チモシー、金魚のえさ",
  label = "商品名・キーワード",
  buttonLabel = "検索する",
}: {
  id: string;
  defaultValue?: string;
  prominent?: boolean;
  hidden?: { name: string; value: string }[];
  action?: string;
  placeholder?: string;
  label?: string;
  buttonLabel?: string;
}) {
  return (
    <form action={action} method="get" role="search" className={prominent ? "" : "mt-4"}>
      {hidden?.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
      <label htmlFor={id} className={prominent ? "sr-only" : "mb-2 block text-sm font-medium"}>
        {label}
      </label>
      <div className={`flex gap-2 ${prominent ? "flex-col rounded-[1.8rem] bg-card p-2 shadow-[0_10px_30px_rgba(44,40,36,0.06)] md:flex-row" : "max-w-2xl flex-col sm:flex-row"}`}>
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          maxLength={80}
          enterKeyHint="search"
          placeholder={placeholder}
          className={`w-full bg-card px-4 text-base text-ink ${prominent ? "h-14 rounded-[1.4rem]" : "h-14 rounded-full border border-line px-5"}`}
        />
        <button
          type="submit"
          className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-white hover:bg-forest-deep ${prominent ? "h-14 w-full px-4 md:w-auto md:min-w-14" : "h-14 px-8"}`}
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
