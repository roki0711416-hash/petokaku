# ペトカク

ペット用品の価格を見比べるサイトの、最初の画面です。表示している商品と価格は、すべて架空のサンプルです。

## 起動する

1. このフォルダで、次のコマンドを実行します。

```bash
npm run dev
```

2. ブラウザで http://localhost:3000 を開きます。
3. 終了するときは、そのターミナルで Control を押しながら C を押します。

## いまの価格データ

商品は `src/data/products.json`、ショップごとの価格は `src/data/offers.json` に分かれています。外部の通販サイトへは接続しません。

## 広告（AdSense）

表示広告のスロットIDは、次の環境変数です。説明は `.env.example` にあります。

- `NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT` … 商品ページ。価格比較の下
- `NEXT_PUBLIC_ADSENSE_SLOT_LIST` … トップ、ペット、品目、検索結果。商品一覧のあと
- `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE` … 記事の途中と末尾

未設定のときは枠を出しません。IDは AdSense で広告ユニットを作ってから `.env.local` と Vercel に置きます。このREADMEと `.env.example` には書きません。管理画面で自動広告を有効にする場合は、これらのIDは不要です。
