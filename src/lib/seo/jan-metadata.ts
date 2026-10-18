import type { Metadata } from "next";
import { readableListingTitle as compactVisibleTitle } from "../pricing/display-title.ts";
import { janPageRobots } from "../site.ts";
import { readableListingTitle as cleanListingTitle } from "../sources/yahoo/listing-title.ts";

export type JanSeoCopy = {
  title: string;
  description: string;
};

// 重点商品だけ、モール見出しのノイズを避けた短い比較向け文言を使う。
// title は layout の「| ペトカク」と合わせて、商品名・容量・価格比較が先に伝わる長さにする。
// 容量・セット数は確認済みの事実のみ。最安・店舗数・固定の金額は書かない。
const curatedJanSeoCopy: Readonly<Record<string, JanSeoCopy>> = {
  "4903351011250": {
    title: "LION ニオイをとる砂 5L×4個の価格比較",
    description:
      "LION ニオイをとる砂（5L×4個）の複数ショップ価格を、送料込みの支払総額つきで比較できます。金額は取得時点の掲載です。購入前にショップでご確認ください。",
  },
  "4520699667989": {
    title: "デオシート レギュラー 112枚×4袋の価格比較",
    description:
      "デオシート レギュラー（112枚入×4袋）の複数ショップ価格を、送料込みの支払総額つきで比較できます。枚数やサイズ違いの商品は別ページです。購入前にショップでご確認ください。",
  },
  "3182550706933": {
    title: "ロイヤルカナン インドア 成猫用 4kgの価格比較",
    description:
      "ロイヤルカナン インドア（成猫用・4kg）の複数ショップ価格を、送料込みの支払総額つきで比較できます。容量違いの袋は別ページです。購入前にショップでご確認ください。",
  },
  "4562358781780": {
    title: "ニュートロ シュプレモ 小型犬 成犬用 3kgの価格比較",
    description:
      "ニュートロ シュプレモ（小型犬・成犬用・3kg）の複数ショップ価格を、送料込みの支払総額つきで比較できます。容量違いの袋は別ページです。購入前にショップでご確認ください。",
  },
  "4905009714353": {
    title: "アイリスオーヤマ 紙の猫砂 7Lの価格比較",
    description:
      "アイリスオーヤマ 紙の猫砂（7L）の複数ショップ価格を、送料込みの支払総額つきで比較できます。セット販売は別ページです。購入前にショップでご確認ください。",
  },
};

export function curatedJanSeo(jan: string): JanSeoCopy | null {
  return curatedJanSeoCopy[jan] ?? null;
}

function autoJanSeo(input: { jan: string; name: string; brand: string }): JanSeoCopy {
  const visible = compactVisibleTitle(cleanListingTitle(input.name));
  const title = `${visible || "商品"}の価格比較`;
  const brand = input.brand.trim();
  const brandPrefix = brand !== "" && !title.includes(brand) ? `${brand}の` : "";
  const description = `${brandPrefix}${title}（JAN ${input.jan}）の販売価格と送料を、ショップごとに見比べられます。購入前にショップで確認してください。`;
  return { title, description };
}

export function janProductMetadata(input: { jan: string; name: string; brand: string; imageUrl?: string | null }): Metadata {
  const copy = curatedJanSeo(input.jan) ?? autoJanSeo(input);
  const canonical = `/products/jan/${input.jan}`;
  const image = input.imageUrl?.startsWith("https://") ? input.imageUrl : null;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical },
    robots: janPageRobots(true),
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonical,
      siteName: "ペトカク",
      locale: "ja_JP",
      type: "website",
      images: image ? [{ url: image, alt: copy.title }] : undefined,
    },
  };
}
