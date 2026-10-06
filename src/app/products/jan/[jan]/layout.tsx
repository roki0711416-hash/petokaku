import { notFound } from "next/navigation";
import { validJanCode } from "@/lib/sources/yahoo/adapter";

export default async function JanLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ jan: string }>;
}) {
  const { jan } = await params;
  if (!validJanCode(jan)) {
    notFound();
  }
  return children;
}
