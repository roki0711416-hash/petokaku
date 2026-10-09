import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "ペトカクについて",
  description: "ペトカクは、ペット用品の価格と送料を見比べるためのサイトです。運営はペトカク運営事務局です。",
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
      <p>いまの販売店へのリンクは、アフィリエイトリンクではありません。報酬のあるリンクにするときは、広告であることが分かるように表示します。</p>
      <p>運営者は、ペトカク運営事務局です。</p>
      <p>
        連絡先は
        <a href="mailto:petokaku@outlook.jp" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          petokaku@outlook.jp
        </a>
        です。詳しくはお問い合わせのページにも案内しています。
      </p>
    </InfoArticle>
  );
}
