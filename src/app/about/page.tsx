import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "ペトカクについて",
  description: "ペトカクは、ペット用品の価格と送料を見比べるためのサイトです。表示は取得時点の販売店の掲載です。",
};

export default function AboutPage() {
  return (
    <InfoArticle
      title="ペトカクについて"
      path="/about"
      lead="ペット用品の価格を、かんたん比較。ほしい商品を探して、ショップごとの金額を並べて見るためのサイトです。"
    >
      <p>
        ペトカクは、犬・猫・小動物・鳥・魚などの用品を対象にしています。商品そのものは販売しません。購入は、各販売店のページで行います。
      </p>
      <p>
        商品名で検索した価格、送料、在庫は、販売店の掲載を取得した時点の情報です。その後にショップ側で変わることがあります。購入前に、ショップのページで確認してください。
      </p>
      <p>ペトカクは、表示した金額が必ず最安であることや、購入がお得であることを保証しません。</p>
      <p>収益は、商品紹介によるアフィリエイト報酬と、将来の広告を想定しています。広告を置くときは、広告であることが分かるように表示します。</p>
    </InfoArticle>
  );
}
