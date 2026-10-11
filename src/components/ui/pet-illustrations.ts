import type { StaticImageData } from "next/image";
import bird from "@/assets/pets/illustrations/bird.jpg";
import cat from "@/assets/pets/illustrations/cat.jpg";
import dog from "@/assets/pets/illustrations/dog.jpg";
import fish from "@/assets/pets/illustrations/fish.jpg";
import gecko from "@/assets/pets/illustrations/gecko.jpg";
import rabbit from "@/assets/pets/illustrations/rabbit.jpg";
import type { CatalogGlyph } from "@/components/ui/catalog-card";
import { petPath } from "@/lib/pets";

export type PetIllustration = {
  label: string;
  href: string;
  alt: string;
  image: StaticImageData;
  glyph: CatalogGlyph;
};

export const petIllustrations: PetIllustration[] = [
  {
    label: "犬",
    href: petPath("dog"),
    alt: "ゴールデンレトリバーのイラスト",
    image: dog,
    glyph: "dog",
  },
  {
    label: "猫",
    href: petPath("cat"),
    alt: "キジトラ猫のイラスト",
    image: cat,
    glyph: "cat",
  },
  {
    label: "小動物",
    href: petPath("small-animal"),
    alt: "垂れ耳ウサギのイラスト",
    image: rabbit,
    glyph: "rabbit",
  },
  {
    label: "鳥",
    href: petPath("bird"),
    alt: "オカメインコのイラスト",
    image: bird,
    glyph: "bird",
  },
  {
    label: "魚・アクアリウム",
    href: petPath("fish"),
    alt: "カクレクマノミと青い魚のイラスト",
    image: fish,
    glyph: "fish",
  },
  {
    label: "爬虫類・両生類",
    href: petPath("reptile"),
    alt: "ヒョウモントカゲモドキのイラスト",
    image: gecko,
    glyph: "reptile",
  },
];
