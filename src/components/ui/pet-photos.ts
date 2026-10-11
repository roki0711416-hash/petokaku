import type { StaticImageData } from "next/image";
import bird from "@/assets/pets/bird.jpg";
import cat from "@/assets/pets/cat.jpg";
import dog from "@/assets/pets/dog.jpg";
import fish from "@/assets/pets/fish.jpg";
import rabbit from "@/assets/pets/rabbit.jpg";
import reptile from "@/assets/pets/reptile.jpg";
import type { CatalogGlyph } from "@/components/ui/catalog-card";
import { categorySearchHref } from "@/lib/categories";

export type PetPhoto = {
  label: string;
  href: string;
  alt: string;
  image: StaticImageData;
  glyph: CatalogGlyph;
  position: string;
};

export const petPhotos: PetPhoto[] = [
  {
    label: "犬",
    href: categorySearchHref("dog"),
    alt: "こちらを見上げる茶色のラブラドール",
    image: dog,
    glyph: "dog",
    position: "object-[center_35%]",
  },
  {
    label: "猫",
    href: categorySearchHref("cat"),
    alt: "青い目でこちらを見る猫",
    image: cat,
    glyph: "cat",
    position: "object-center",
  },
  {
    label: "小動物",
    href: categorySearchHref("small-animal"),
    alt: "立ち上がった黒いロップイヤーのうさぎ",
    image: rabbit,
    glyph: "rabbit",
    position: "object-[center_18%]",
  },
  {
    label: "鳥",
    href: categorySearchHref("bird"),
    alt: "枝に止まった黄色いセキセイインコ",
    image: bird,
    glyph: "bird",
    position: "object-[center_40%]",
  },
  {
    label: "魚・アクアリウム",
    href: categorySearchHref("fish"),
    alt: "水槽の中でこちらを見る金魚",
    image: fish,
    glyph: "fish",
    position: "object-center",
  },
  {
    label: "爬虫類・両生類",
    href: `/search?q=${encodeURIComponent("爬虫類 用品")}`,
    alt: "葉の上にいるフトアゴヒゲトカゲ",
    image: reptile,
    glyph: "reptile",
    position: "object-[center_28%]",
  },
];
