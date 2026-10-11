import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center overflow-hidden rounded-2xl py-1">
      <img src="/logo.png" alt="ペトカク" className="h-7 w-auto max-w-[8.5rem] object-contain md:h-8 md:max-w-[10rem]" />
    </Link>
  );
}
