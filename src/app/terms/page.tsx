import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "利用規約",
  description: "ペトカクの利用条件の下書きです。公開前に内容の確認が必要です。",
};

export default function TermsPage() {
  return (
    <InfoArticle
      title="利用規約"
      path="/terms"
      lead="サイトの位置づけを示す下書きです。公開する前に、運営方法に合わせて見直してください。"
      draft
    >
      <p>ペトカクは、ペット用品の価格を見比べるための情報サイトです。商品の販売者ではありません。購入契約は、利用者と販売店のあいだで成立します。</p>
      <p>
        販売店の検索結果に出る価格、送料、在庫は、取得時点の情報です。その後にショップ側で変わることがあります。購入前に、ショップのページで内容量、価格、送料、在庫を確認してください。
      </p>
      <p>このサイトは、表示した金額が必ず最安であることや、購入がお得であることを保証しません。</p>
      <p>種類から開く商品一覧の一部は、動作確認用の架空データです。販売店の検索結果とは別です。</p>
    </InfoArticle>
  );
}
