import { unknownQuantityLabel } from "./pricing/quantity-parse.ts";
import type { PriceHistorySufficiency } from "./pricing/price-history-summary.ts";
import type { CategoryId } from "./types.ts";

export const readingTopics = [
  "dog-food",
  "cat-food",
  "litter",
  "sheets",
  "cat-toilet",
  "tower",
  "treat",
  "toy",
  "other",
] as const;

export type ReadingTopic = (typeof readingTopics)[number];

export type ProductReadingLink = {
  href: string;
  label: string;
};

export type ProductReadingCopy = {
  topic: ReadingTopic;
  heading: string;
  paragraphs: string[];
  points: { heading: string; body: string }[];
  history: string;
  links: ProductReadingLink[];
};

const topicOrder: { topic: ReadingTopic; pattern: RegExp }[] = [
  { topic: "tower", pattern: /キャットタワー|猫タワー|キャットポール/ },
  { topic: "litter", pattern: /猫砂|ネコ砂|トイレ砂|ベントナイト|をとる砂|紙の猫砂/ },
  { topic: "cat-toilet", pattern: /システムトイレ|デオトイレ|猫トイレ/ },
  { topic: "sheets", pattern: /シーツ|シート/ },
  { topic: "treat", pattern: /おやつ|ジャーキー|ガム|ちゅ〜る|ちゅーる|チュール|トリーツ|ボーロ/ },
  { topic: "dog-food", pattern: /ドッグフード|犬用フード|ドライフード|ウェットフード|総合栄養食|成犬|子犬|シニア犬/ },
  { topic: "cat-food", pattern: /キャットフード|猫用フード|カリカリ|総合栄養食|子猫|成猫|キトン|パウチ/ },
  { topic: "toy", pattern: /おもちゃ|オモチャ|じゃらし|ぬいぐるみ|猫じゃらし/ },
];

export function readingTopicOf(input: { name: string; category: CategoryId; genreName?: string | null }): ReadingTopic {
  const text = `${input.name}\n${input.genreName ?? ""}`;
  for (const rule of topicOrder) {
    if (!rule.pattern.test(text)) {
      continue;
    }
    if (rule.topic === "dog-food" && input.category === "cat") {
      continue;
    }
    if (rule.topic === "cat-food" && input.category === "dog") {
      continue;
    }
    return rule.topic;
  }
  if (input.category === "dog" && /フード/.test(text)) {
    return "dog-food";
  }
  if (input.category === "cat" && /フード/.test(text)) {
    return "cat-food";
  }
  return "other";
}

const pricePoints = {
  "dog-food": [
    {
      heading: "袋の大きさをそろえる",
      body: "3kgと6kgのように内容量が違う袋は、別の商品です。袋の販売価格だけを並べても、中身の量はそろいません。",
    },
    {
      heading: "送料が別のときがある",
      body: "本体が低く見えても、送料が乗ると支払額は変わります。送料が確認できた掲載だけ、商品価格と送料を足した合計を出しています。",
    },
    {
      heading: "ポイントは後から自分で引く",
      body: "ショップのポイント、クーポン、定期便の割引は、この合計に入っていません。還元率が分かっているときだけ、そのショップの合計から自分で差し引きます。",
    },
  ],
  "cat-food": [
    {
      heading: "ドライとウェットを混ぜない",
      body: "水分が多いパウチと、水分が少ないカリカリは、同じグラムでも食事の量が違います。形が違う商品のグラム単価は、同じ条件になりません。",
    },
    {
      heading: "年齢の表示を先に見る",
      body: "子猫用と成猫用は、対象の月齢が違います。価格が近くても、今の猫の月齢が範囲の外なら、同じ食事としては見ません。",
    },
    {
      heading: "定期便の初回価格だけで決めない",
      body: "初回だけ下がる価格と、2回目以降の価格は別です。掲載が通常の価格か、回数の条件付きかは、ショップのページで確認します。",
    },
  ],
  litter: [
    {
      heading: "単品とセットを分ける",
      body: "1袋と、4袋セットのように販売単位が違う掲載は、同じ順位に入れていません。セットは、セット全体の量と合計で見ます。",
    },
    {
      heading: "リットルとキログラムを割り算しない",
      body: "体積と重さは単位が違います。容量がリットルで確定している掲載だけ、1Lあたりの参考を出します。単位が読めないときは出しません。",
    },
    {
      heading: "送料と保管場所",
      body: "袋数が多いと送料の割合が下がって見えることがあります。置ける量と、使い切るまでの期間も、合計とは別に見ます。",
    },
  ],
  sheets: [
    {
      heading: "枚数は袋数まで掛ける",
      body: "1袋の枚数と、セットの袋数は別です。1枚あたりを見るときは、総額を（1袋の枚数 × 袋数）で割ります。",
    },
    {
      heading: "呼び方と寸法は別",
      body: "レギュラーやワイドは呼び方です。縦と横の長さは商品ごとに違います。このページの容量欄に寸法があるときだけ、その数字を使います。",
    },
    {
      heading: "厚みで吸収量は分からない",
      body: "薄型と厚型で、交換の回数まで決まるわけではありません。吸収量は、商品に書かれている数値だけをその商品の仕様として読みます。",
    },
  ],
  "cat-toilet": [
    {
      heading: "本体と専用シートを分ける",
      body: "トイレ本体のセットと、交換用シートは支払う中身が違います。同じシリーズ名でも、枚数や対応する型が違う掲載は別の商品です。",
    },
    {
      heading: "対応する砂やシートを確認する",
      body: "システムトイレは、使える猫砂やシートの種類が限られることがあります。対応の表記は、このページの商品名とショップの説明で見ます。",
    },
    {
      heading: "かさばる荷物の送料",
      body: "本体は箱が大きいことがあります。送料が確認できない掲載は、合計が安いとは扱いません。",
    },
  ],
  tower: [
    {
      heading: "高さと置き場所",
      body: "高さ、幅、奥行きは商品ごとに違います。このページの容量欄に寸法があるときだけ、その表記をこの商品の情報として読みます。天井や家具との隙間は、部屋側で測ります。",
    },
    {
      heading: "大型品の送料",
      body: "タワーは送料が本体に近くなることがあります。送料が確認できた掲載の合計と、確認できない掲載を、同じ支払額としては並べていません。",
    },
    {
      heading: "セット内容",
      body: "ハンモックや交換用ポールが付くセットと、本体だけは別です。商品名のセット表記と、容量欄を見てから合計を見ます。",
    },
  ],
  treat: [
    {
      heading: "主食の袋と混ぜない",
      body: "おやつは間食です。総合栄養食の大袋と、袋の価格やグラム単価だけでは比べません。1日に与える量の考え方が違います。",
    },
    {
      heading: "本数とグラム",
      body: "1本の量と、袋に入っている本数は別です。本数が容量欄で確定しているときだけ、1本あたりを計算できます。書いていなければ作りません。",
    },
    {
      heading: "小袋の送料",
      body: "本体が小さくても、送料が乗ると合計は変わります。まとめ買いの袋数と、開封後に使い切れるかも一緒に見ます。",
    },
  ],
  toy: [
    {
      heading: "単品とセット",
      body: "1個と、詰め合わせでは中身の数が違います。商品名の個数と、容量欄が一致しているかを見ます。",
    },
    {
      heading: "大きさは価格から分からない",
      body: "対象の体の大きさに合うかは、商品の寸法表記で確認します。寸法がこのページに無いときは、ショップの説明を見て、ここにある金額から推測しません。",
    },
    {
      heading: "送料の割合",
      body: "軽いおもちゃでも、送料が確認できない掲載は合計を出していません。確認できた掲載の合計で見ます。",
    },
  ],
  other: [
    {
      heading: "同じ条件の掲載だけを見る",
      body: "JANコードが同じでも、内容量やセット数が違う掲載は別欄です。商品名が似ているだけでは、一つの商品にしません。",
    },
    {
      heading: "送料込みは確認できたものだけ",
      body: "送料が不明な掲載を、無料や送料込みにはしていません。合計を比べるときは、送料が付いている掲載どうしを見ます。",
    },
    {
      heading: "ポイントは表示の外",
      body: "ポイント還元、クーポン、定期便の割引はショップと会員の条件で変わります。比較の合計には入っていません。",
    },
  ],
} as const satisfies Record<ReadingTopic, { heading: string; body: string }[]>;

const headings: Record<ReadingTopic, string> = {
  "dog-food": "ドッグフードの比較の読み方",
  "cat-food": "キャットフードの比較の読み方",
  litter: "猫砂の比較の読み方",
  sheets: "ペットシーツの比較の読み方",
  "cat-toilet": "猫トイレ用品の比較の読み方",
  tower: "キャットタワーの比較の読み方",
  treat: "おやつの比較の読み方",
  toy: "おもちゃの比較の読み方",
  other: "この商品の比較の読み方",
};

const otherOpeners: Record<CategoryId, string> = {
  dog: "犬用品は、フード、トイレ、散歩、ケアで支払いの単位が違います。このページは、開いているJANコードの掲載だけを並べています。",
  cat: "猫用品は、フード、猫砂、トイレ、ケアで箱の大きさが違います。このページは、開いているJANコードの掲載だけを並べています。",
  "small-animal": "小動物用品は、対象の動物がうさぎかハムスターかで使えるものが違います。商品名の対象と、このJANコードが一致しているかを見ます。",
  bird: "鳥用品は、シードとペレット、ケージ本体と付属品で中身が違います。対象の鳥種は商品名とショップの説明で確認します。",
  fish: "魚と水槽の用品は、対象の水量や生体が違うと使い方が変わります。容量の単位がグラムとミリリットルで違う掲載は、同じ割り算にしません。",
  other: "このページは、同じJANコードの掲載をショップごとに並べたものです。商品の効果や使用感は、取得した価格からは分かりません。",
};

const topicOpeners: Record<Exclude<ReadingTopic, "other">, string> = {
  "dog-food": "ドッグフードは、年齢、体の大きさ、袋の内容量で支払いの中身が変わります。このページの金額は、ショップが掲載している商品価格と、確認できた送料です。",
  "cat-food": "キャットフードは、ドライかウェットか、対象の年齢かで、同じ金額でも条件が違います。このページは、開いているJANコードの掲載を並べています。",
  litter: "猫砂は消耗品なので、1袋の容量と、何袋セットかで支払う量が変わります。素材の名前だけでは、固まり方や粉の出方は決まりません。",
  sheets: "ペットシーツは、呼び方が同じでも縦横と枚数が商品ごとに違います。このページでは、同じJANコードの掲載をショップごとに見ます。",
  "cat-toilet": "猫のシステムトイレは、本体、交換用シート、対応する猫砂が別の商品になっていることがあります。シリーズ名が同じだけで、一つの支払いにしないでください。",
  tower: "キャットタワーは一度の買い物でも、送料と置き場所で負担が変わります。安定するか、猫が使える高さに届くかは、寸法と設置の説明で確認します。",
  treat: "おやつは主食ではありません。ペットフード公正取引協議会は、間食を、総合栄養食とは別に与えるものとして説明しています。与える量を増やす判断や、体調が気になるときは獣医師に相談してください。",
  toy: "おもちゃは、対象の動物と、単品かセットかで中身が違います。壊れにくさや遊び方は、このページの価格には出ていません。",
};

const guides: Record<ReadingTopic, ProductReadingLink[]> = {
  "dog-food": [
    { href: "/articles/how-to-choose-dog-food", label: "ドッグフードの選び方" },
    { href: "/articles/how-to-compare-pet-prices", label: "価格比較の見方" },
  ],
  "cat-food": [
    { href: "/articles/how-to-choose-cat-food", label: "キャットフードの選び方" },
    { href: "/articles/how-to-compare-pet-prices", label: "価格比較の見方" },
  ],
  litter: [
    { href: "/articles/cat-litter-types", label: "猫砂の種類と選び方" },
    { href: "/categories/cat-litter", label: "猫砂の価格比較" },
  ],
  sheets: [
    { href: "/articles/how-to-choose-pet-sheets", label: "ペットシーツの選び方" },
    { href: "/categories/pet-sheets", label: "ペットシーツの価格比較" },
  ],
  "cat-toilet": [
    { href: "/articles/how-to-choose-cat-toilet", label: "猫のシステムトイレの選び方" },
    { href: "/articles/cat-litter-types", label: "猫砂の種類と選び方" },
  ],
  tower: [
    { href: "/articles/how-to-choose-cat-tower", label: "キャットタワーの選び方" },
    { href: "/pets/cat", label: "猫用品の価格比較" },
  ],
  treat: [
    { href: "/articles/how-to-choose-treats", label: "おやつの与え方と選び方" },
    { href: "/articles/how-to-compare-pet-prices", label: "価格比較の見方" },
  ],
  toy: [
    { href: "/articles/how-to-compare-pet-prices", label: "価格比較の見方" },
    { href: "/articles/how-to-buy-pet-supplies", label: "ペット用品を安く買うときの見方" },
  ],
  other: [
    { href: "/articles/how-to-compare-pet-prices", label: "価格比較の見方" },
    { href: "/price-data", label: "価格データの説明" },
  ],
};

function capacitySentence(sizeLabel: string | null | undefined): string | null {
  const label = sizeLabel?.trim() ?? "";
  if (label === "" || label === unknownQuantityLabel) {
    return null;
  }
  return `このページの容量欄は「${label}」です。これと違う内容量やセット数は、別の商品です。`;
}

export function historyReading(input: { recordedDays: number | null; sufficiency: PriceHistorySufficiency | null }): string {
  if (input.recordedDays == null || input.sufficiency == null) {
    return "グラフは、送料込みの金額を2日分以上記録できたときだけ出します。記録が無いページの金額は、今回取得した掲載であり、いつもの値段より高いかどうかは分かりません。線が無い日を、ただで買えた日とは読みません。";
  }
  if (input.sufficiency === "accumulating") {
    return `この商品の価格の記録は${input.recordedDays}日分です。1日分だけでは、前回より上がったかは判断できません。グラフは2日分以上になってから表示します。`;
  }
  if (input.sufficiency === "reference") {
    return `この商品の価格の記録は${input.recordedDays}日分です。この期間に取得できた送料込みの金額の参考であり、7日分になるまでは30日の幅とは比べません。記録が飛んだ日は未取得で、ただで買えた日ではありません。`;
  }
  return `この商品の価格の記録は${input.recordedDays}日分です。7日分以上あるので、直近に取得できた送料込みの金額を見る材料になります。線が切れている日は未取得です。その日を、ただで買えた日とは読みません。将来の値段は分かりません。`;
}

export function productReadingCopy(input: {
  name: string;
  category: CategoryId;
  genreName?: string | null;
  sizeLabel?: string | null;
  recordedDays?: number | null;
  sufficiency?: PriceHistorySufficiency | null;
}): ProductReadingCopy {
  const topic = readingTopicOf(input);
  const opener = topic === "other" ? otherOpeners[input.category] : topicOpeners[topic];
  const capacity = capacitySentence(input.sizeLabel);
  const shared =
    "並んでいる金額は、取得した時点の掲載です。その後にショップ側で変わることがあります。ポイントやクーポンを引いた支払額は、ショップのページで条件を見てから計算します。";
  const care =
    topic === "dog-food" || topic === "cat-food" || topic === "treat"
      ? "食事の内容を変えることや、食欲、体重、便の様子が気になるときの判断は、獣医師に相談してください。このページは診断や治療の案内ではありません。"
      : null;
  return {
    topic,
    heading: headings[topic],
    paragraphs: [opener, shared, ...(capacity ? [capacity] : []), ...(care ? [care] : [])],
    points: [...pricePoints[topic]],
    history: historyReading({
      recordedDays: input.recordedDays ?? null,
      sufficiency: input.sufficiency ?? null,
    }),
    links: guides[topic],
  };
}
