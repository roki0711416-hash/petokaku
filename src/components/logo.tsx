import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2 py-0.5">
      <img src="/logo.png" alt="ペトカク" className="h-6 w-auto max-w-[6.25rem] shrink-0 object-contain sm:h-7 sm:max-w-[8.5rem] md:h-8 md:max-w-[10rem]" />
      <span className="text-[10px] leading-tight text-muted sm:text-xs">
        ペット用品の
        <br className="sm:hidden" />
        価格比較サイト
      </span>
    </Link>
  );
}
