import type { PetId } from "../lib/pets.ts";

// 売れ筋候補から、Yahoo JAN検索で在庫あり2店舗以上・容量/セットの取り違えがないことを
// 確認した商品だけを載せる。価格・在庫はここへ書かない。空配列でも安全。
export type CuratedJanProduct = {
  janCode: string;
  label: string;
  petId: PetId;
};

export const curatedJanProducts: readonly CuratedJanProduct[] = [
  {
    janCode: "4580518141427",
    label: "POCHI ザ・ドッグフード ベーシック ワイルドサーモン 3kg",
    petId: "dog",
  },
  {
    janCode: "4562358781780",
    label: "ニュートロ シュプレモ 小型犬 成犬用 3kg",
    petId: "dog",
  },
  {
    janCode: "4959283036137",
    label: "エバークリーン エクストラフレッシュ 6L×3個セット",
    petId: "cat",
  },
  {
    janCode: "4520699632291",
    label: "デオトイレ 複数ねこ用 消臭・抗菌シート 16枚",
    petId: "cat",
  },
  {
    janCode: "4582701000467",
    label: "キャットタワー スリム 据え置き 高さ142cm",
    petId: "cat",
  },
  {
    janCode: "4520699282786",
    label: "デオトイレ 快適ワイドリラックス+ 本体セット",
    petId: "cat",
  },
  {
    janCode: "4520699618851",
    label: "デオトイレ ハーフカバー 本体セット",
    petId: "cat",
  },
];
