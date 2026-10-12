"use client";

import { useFormStatus } from "react-dom";

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
  const showSkeleton = action === "/search" && !compact;
  return (
    <form action={action} method="get" role="search" className={prominent || compact ? "min-w-0" : "mt-4"}>
      {hidden?.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
      <label htmlFor={id} className={prominent || compact ? "sr-only" : "mb-2 block text-sm font-medium"}>
        {label}
      </label>
      <div
        className={`flex min-w-0 gap-2 ${
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
          className={`min-w-0 bg-card text-ink ${compact ? "h-10 w-0 flex-1 text-sm" : prominent ? "h-14 w-full rounded-xl px-4 text-base" : "h-14 w-full rounded-full border border-line px-5 text-base"}`}
        />
        <SearchSubmitButton compact={compact} prominent={prominent} buttonLabel={buttonLabel} />
      </div>
      <SearchPending showSkeleton={showSkeleton} />
    </form>
  );
}

function SearchSubmitButton({
  compact,
  prominent,
  buttonLabel,
}: {
  compact: boolean;
  prominent: boolean;
  buttonLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label={buttonLabel}
      aria-busy={pending}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-white hover:bg-forest-deep ${compact ? "h-10 w-10" : prominent ? "h-14 w-full px-5 md:w-auto" : "h-14 px-8"}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 16.5 20 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {compact ? <span className="sr-only">{buttonLabel}</span> : <span className="ml-1">{pending ? "検索中" : buttonLabel}</span>}
    </button>
  );
}

function SearchPending({ showSkeleton }: { showSkeleton: boolean }) {
  const { pending } = useFormStatus();
  if (!pending) {
    return null;
  }
  return (
    <div className={showSkeleton ? "mt-6" : "sr-only"} aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted">商品を探しています</p>
      {showSkeleton ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {["a", "b", "c", "d"].map((item) => (
            <li key={item} className="h-64 rounded-2xl border border-line bg-card" />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
