import { HeaderSearch } from "@/components/header-search";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 min-w-0 overflow-x-clip border-b border-line/80 bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex min-w-0 max-w-6xl flex-wrap items-center gap-x-3 px-4 py-2 md:gap-x-5">
        <div className="order-1 shrink-0">
          <Logo />
        </div>
        <HeaderSearch />
      </div>
    </header>
  );
}
