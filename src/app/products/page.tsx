import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { privateRobots } from "@/lib/site";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: privateRobots(),
};

export default function ProductsPage() {
  notFound();
}
