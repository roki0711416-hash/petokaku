import type { AmazonAssociateEntry } from "../lib/amazon/associate-link.ts";

// 2026-11-22 に Amazon.co.jp の商品ページで、ブランド・商品名・容量または入数が
// ペトカクの JAN と一致したリンクだけを置く。価格・在庫・送料は置かない。
// URL は https://www.amazon.co.jp/dp/{ASIN}?tag=petokaku-22 だけ。
export const amazonAssociateLinks: AmazonAssociateEntry[] = [
  // ロイヤルカナン FHN インドア 成猫用 4kg。メーカー型番と GTIN が JAN。4kg、単品。
  { jan: "3182550706933", url: "https://www.amazon.co.jp/dp/B0015U0NB0?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ロイヤルカナン FHN インドア 成猫用 10kg。GTIN が JAN。表示重量 10kg。
  { jan: "3182550706940", url: "https://www.amazon.co.jp/dp/B000VJW260?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ロイヤルカナン ラブラドールレトリバー 成犬〜高齢犬用 12kg。メーカー型番と GTIN が JAN。12000g。
  { jan: "3182550715645", url: "https://www.amazon.co.jp/dp/B000VJXWUU?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ロイヤルカナン FHN インドア7+ 中高齢猫用 3.5kg。GTIN が JAN。表示重量 3.5kg。
  { jan: "3182550784412", url: "https://www.amazon.co.jp/dp/B00556QPAI?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ロイヤルカナン ダックスフンド 中・高齢犬用 3kg。JAN検索は1件。ブランド一致、ユニット 3000g。
  { jan: "3182550824521", url: "https://www.amazon.co.jp/dp/B00E7NCICO?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ロイヤルカナン ユリナリーケア 成猫用 2kg。メーカー型番が JAN。表示重量 2000g。
  { jan: "3182550842938", url: "https://www.amazon.co.jp/dp/B00PTTO41S?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ロイヤルカナン ライトウェイトケア 成猫用 8kg。JAN検索は1件。ブランド一致、1袋。
  { jan: "3182550843966", url: "https://www.amazon.co.jp/dp/B07YCGTGFJ?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // デオトイレ 快適ワイドリラックス+ 本体セット ナチュラルアイボリー。JAN検索は1件。色まで一致。
  { jan: "4520699282786", url: "https://www.amazon.co.jp/dp/B0GYV16RXH?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // デオトイレ ハーフカバー 本体セット アイボリー。メーカー型番が JAN。本体セットそのもの。
  { jan: "4520699618851", url: "https://www.amazon.co.jp/dp/B09T96M2B3?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ユニ・チャーム デオサンド 複数ねこ用 紙砂 10L。モデル番号が JAN。1袋。
  { jan: "4520699638385", url: "https://www.amazon.co.jp/dp/B07P8YGQTY?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // デオトイレ 飛び散らない消臭・抗菌サンド 4L。モデル番号が JAN。4L×1。
  { jan: "4520699680568", url: "https://www.amazon.co.jp/dp/B003AOBZ9S?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // デオトイレ 緑茶成分入り消臭サンド 4L。モデル番号が JAN。表示容量 4L、パック数 1。
  { jan: "4520699680759", url: "https://www.amazon.co.jp/dp/B003AOBZAC?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ビバリア マルチパネルヒーター 8W。JAN検索は1件。ブランド一致、個数 1。
  { jan: "4582443490069", url: "https://www.amazon.co.jp/dp/B00BHQMQ0I?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ビバリア マルチパネルヒーター 14W。JAN検索は1件。ブランド一致、個数 1。
  { jan: "4582443490083", url: "https://www.amazon.co.jp/dp/B00BHQMQ26?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ビバリア マルチパネルヒーター 16W。JAN検索は1件。ブランド一致、個数 1。
  { jan: "4582443490106", url: "https://www.amazon.co.jp/dp/B00BHQMQ2G?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ビバリア マルチパネルヒーター 32W。JAN検索は1件。タイトルのワット数が一致。
  { jan: "4582443490120", url: "https://www.amazon.co.jp/dp/B00BHQMQ7Q?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ビバリア 太陽NEO RP-126V。型番 RP-126V、ブランド一致、ユニット 1。
  { jan: "4582443490526", url: "https://www.amazon.co.jp/dp/B00CVPB51A?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // レップジャパン ピタリ適温プラス 3号。JAN検索は1件。サイズ 3号。
  { jan: "4595988631521", url: "https://www.amazon.co.jp/dp/B0DG4RKC8T?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // LION ニオイをとる砂 5L×4個。JAN検索の該当はこれ。ブランド LION、パッケージ 4パック。
  { jan: "4903351011250", url: "https://www.amazon.co.jp/dp/B07F7Q2PWT?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ハッピーホリデイ カスタムラックス セキセイブレンド 2.5L。メーカーがピーツー、ユニット 1。
  { jan: "4904769504129", url: "https://www.amazon.co.jp/dp/B004ZKIQ2U?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ミニマルランド バニーグレードチモシー 550g。ブランド一致、550g、単品。
  { jan: "4906456567196", url: "https://www.amazon.co.jp/dp/B07JDFY9L8?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // アイリスオーヤマ ペットシーツ 厚型 レギュラー 400枚。JAN検索は1件。ブランド一致、400枚。
  { jan: "4967576499620", url: "https://www.amazon.co.jp/dp/B08HQ33QSJ?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // アイリスオーヤマ クリーンサンド 5L CLS-5L。型番 CLS-5L、1袋、ブランド一致。
  { jan: "4967576667043", url: "https://www.amazon.co.jp/dp/B0C2P5JLM1?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // キョーリン レオパゲル 60g。メーカー型番が JAN。60g、単品。
  { jan: "4971618206053", url: "https://www.amazon.co.jp/dp/B01MYGEK6N?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // キョーリン レオパゲル 徳用 150g。ブランド一致、150g、単品。2個・3個セットは別ASIN。
  { jan: "4971618206077", url: "https://www.amazon.co.jp/dp/B08XYHZR1S?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // キョーリン レオパドライ 60g。ブランド一致、60g、単品。
  { jan: "4971618206251", url: "https://www.amazon.co.jp/dp/B07SCRY8BN?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // キョーリン ひかりクレスト プレコ 300g。ブランド一致、300g、単品。
  { jan: "4971618282316", url: "https://www.amazon.co.jp/dp/B00KPASQ3S?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // キョーリン ひかりクレスト ビッグカーニバル 400g。ブランド一致、400g、単品。
  { jan: "4971618284372", url: "https://www.amazon.co.jp/dp/B00QPSJEN0?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // キョーリン ひかりクレスト ビッグキャット 570g。ブランド一致、570g、単品。
  { jan: "4971618285461", url: "https://www.amazon.co.jp/dp/B00KPARE90?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // キョーリン ネオプロス 50g。ブランド一致、50g、単品。
  { jan: "4971618294036", url: "https://www.amazon.co.jp/dp/B0095MQV9I?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // キョーリン ネオプロス 150g。ブランド一致、150g、単品。
  { jan: "4971618294104", url: "https://www.amazon.co.jp/dp/B00BESP40I?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // キョーリン ネオプロスグッピー 50g。ブランド一致、50g、単品。
  { jan: "4971618295033", url: "https://www.amazon.co.jp/dp/B00CBTC6WI?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // キョーリン ひかりウェーブ ブラックホール お徳用5個パック。モデル番号が JAN。5回分。
  { jan: "4971618932723", url: "https://www.amazon.co.jp/dp/B0048GCSW0?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // GEX うさぎの健康食 にんじんプラス 850g。メーカー型番が JAN。うさぎ用。
  { jan: "4972547017710", url: "https://www.amazon.co.jp/dp/B0043BHMF8?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // GEX ラビットプレミアムフード 小粒 2.2kg。メーカー型番が JAN。2200g。
  { jan: "4972547027795", url: "https://www.amazon.co.jp/dp/B00H7V92KO?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // GEX エキゾテラ イージーグローサーモ。商品モデル番号が JAN。
  { jan: "4972547031495", url: "https://www.amazon.co.jp/dp/B01BXWTKFY?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // GEX レオパブレンドフード 60g。メーカー型番が JAN。60g。
  { jan: "4972547035561", url: "https://www.amazon.co.jp/dp/B07CLMCPS1?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // GEX ラビレット ヒノキア消臭砂 6.5L。モデル番号が JAN。6.5L、パック数 1。
  { jan: "4972547036223", url: "https://www.amazon.co.jp/dp/B07PGZN9C3?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // GEX ヒーティングトップ S。商品モデル番号が JAN。サイズ S。
  { jan: "4972547039385", url: "https://www.amazon.co.jp/dp/B08KKGF1KK?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // スドー ウェットシェルター L。JAN検索の該当はこれ。サイズ L。
  { jan: "4974212600821", url: "https://www.amazon.co.jp/dp/B00E0GLCUM?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // スドー ウェットシェルター M。ブランド一致、サイズ M、ユニット 1。
  { jan: "4974212600838", url: "https://www.amazon.co.jp/dp/B00E0GLDCY?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // スドー バンブーピンセット。ブランド一致、ユニット 1。セット品は別ASIN。
  { jan: "4974212600951", url: "https://www.amazon.co.jp/dp/B003D3SSD2?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // ニチドウ メディフィッシュ 20g。ブランド一致、20g。
  { jan: "4975677039607", url: "https://www.amazon.co.jp/dp/B00J7EG0HM?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // 三晃商会 バードトイ スウィング S。メーカーが三晃商会、ユニット 1。
  { jan: "4976285087202", url: "https://www.amazon.co.jp/dp/B003Y8YBX2?tag=petokaku-22", confirmedOn: "2026-11-22" },
  // 三晃商会 小鳥のベジタブルポット。メーカー型番が JAN。
  { jan: "4976285116407", url: "https://www.amazon.co.jp/dp/B01LZFYGT7?tag=petokaku-22", confirmedOn: "2026-11-22" },
];
