import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center rounded-2xl py-1">
      <img src="/logo.png" alt="ペトカク" className="h-7 w-auto md:h-8" />
    </Link>
  );
}
