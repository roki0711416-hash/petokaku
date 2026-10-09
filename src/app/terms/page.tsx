import type { Metadata } from "next";
import { InfoArticle } from "@/components/info-article";

export const metadata: Metadata = {
  title: "利用規約",
  description: "ペトカクの利用条件です。商品の販売は行っていません。",
};

export default function TermsPage() {
  return (
    <InfoArticle
      title="利用規約"
      path="/terms"
      lead="ペトカクは、ペット用品の価格を見比べるための情報サイトです。"
    >
      <p>運営者は、ペトカク運営事務局です。商品の販売者ではありません。購入契約は、利用者と販売店のあいだで成立します。</p>
      <p>
        販売店の検索結果に出る価格、送料、在庫は、取得時点の情報です。その後にショップ側で変わることがあります。購入前に、販売店のページで内容量、価格、送料、在庫を確認してください。
      </p>
      <p>このサイトは、表示した金額が必ず最安であることや、購入がお得であることを保証しません。</p>
      <p>商品一覧のうち、JANコードの商品ページ以外には、動作確認用の架空データがあります。販売店の検索結果とは別です。</p>
      <p>いまの販売店へのリンクは、アフィリエイトリンクではありません。</p>
      <p>
        このサイトへの連絡は
        <a href="mailto:petokaku@outlook.jp" className="mx-1 font-medium text-forest-deep underline underline-offset-4">
          petokaku@outlook.jp
        </a>
        で受け付けます。
      </p>
    </InfoArticle>
  );
}
