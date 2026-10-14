import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { privateRobots } from "@/lib/site";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: privateRobots(),
};

export default async function ProductPage({ params }: ProductPageProps) {
  await params;
  notFound();
}
