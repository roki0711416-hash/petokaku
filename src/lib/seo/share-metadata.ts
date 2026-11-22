import type { Metadata } from "next";

export const defaultShareImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "ペトカク ペット用品を、もっとお得に。",
};

type ShareImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

// 文書タイトルは layout の「%s | ペトカク」。OG と Twitter も同じ文字列にする。
// ホームだけ absolute で、接尾辞を付けない。
export function shareMetadata(input: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  robots?: Metadata["robots"];
  images?: ShareImage[];
}): Metadata {
  const socialTitle = input.absoluteTitle ? input.title : `${input.title} | ペトカク`;
  const images = input.images ?? [defaultShareImage];
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: input.path },
    ...(input.robots ? { robots: input.robots } : {}),
    openGraph: {
      title: socialTitle,
      description: input.description,
      url: input.path,
      siteName: "ペトカク",
      locale: "ja_JP",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: input.description,
      images,
    },
  };
}
