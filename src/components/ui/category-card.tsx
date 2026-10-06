import Link from "next/link";
import { CategoryIcon } from "@/components/product-art";
import type { CategoryId } from "@/lib/types";

export function CategoryCard({
  href,
  label,
  note,
  icon,
}: {
  href: string;
  label: string;
  note?: string;
  icon: CategoryId;
}) {
  return (
    <Link
      href={href}
      className="lift flex min-h-32 min-w-[9.75rem] snap-start flex-col justify-between rounded-[1.6rem] bg-card p-4"
    >
      <CategoryIcon category={icon} />
      <span>
        <span className="block text-base font-medium text-ink">{label}</span>
        {note ? <span className="mt-1 block text-xs leading-5 text-muted">{note}</span> : null}
      </span>
    </Link>
  );
}
