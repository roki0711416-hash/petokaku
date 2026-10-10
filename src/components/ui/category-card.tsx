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
      className="lift flex min-h-36 flex-col justify-between rounded-[1.6rem] border border-line bg-card p-4 hover:border-sage"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-moss">
        <CategoryIcon category={icon} />
      </span>
      <span>
        <span className="block text-base font-medium text-ink">{label}</span>
        {note ? <span className="mt-1 block text-xs leading-5 text-muted">{note}</span> : null}
      </span>
    </Link>
  );
}
