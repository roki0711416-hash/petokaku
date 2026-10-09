import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "サイトの使い方",
  description: "ペトカクで商品を探し、ショップごとの価格と送料を見比べる手順です。",
};

export default function GuidePage() {
  return (
    <InfoArticle
      title="サイトの使い方"
      path="/guide"
      lead="商品を探して、ショップごとの金額を見比べ、買う前に販売店で最終確認します。"
    >
      <h2 className="text-xl font-bold">1. 商品を探す</h2>
      <p>
        トップの検索窓に商品名やブランド名を入れると、販売店の掲載から商品を探します。犬・猫からは、フードやトイレなどの検索にも進めます。
      </p>
      <h2 className="text-xl font-bold">2. 条件を狭める</h2>
      <p>検索結果では、犬・猫などの種類で絞れます。カードの金額は、在庫がある通常販売の販売価格です。セットは通常販売の価格に混ぜません。</p>
      <h2 className="text-xl font-bold">3. ショップを見比べる</h2>
      <p>
        商品のページでは、ショップごとに商品価格、送料、在庫を表示します。送料が確認できたときは、送料込みの金額も出します。送料が未確認のときは、送料込みの合計を計算せず、送料はショップで確認する旨を出します。取得した日時そのものは、ページには出していません。
      </p>
      <h2 className="text-xl font-bold">4. 内容量の違いに注意する</h2>
      <p>名前が同じでも、1.5kgと4kgのように内容量が違う商品は、別の商品として並べます。同じ一覧には混ぜません。</p>
      <h2 className="text-xl font-bold">5. 買う前に販売店を確認する</h2>
      <p>
        検索して開いた商品は、取得時点の販売店の価格です。買う前に、販売店のページで価格、送料、在庫を確認してください。
      </p>
    </InfoArticle>
  );
}
