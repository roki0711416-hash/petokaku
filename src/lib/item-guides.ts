export const itemGuideSlugs = ["dog-food", "cat-food", "cat-litter", "pet-sheets", "treats", "cat-tower", "pet-toilet"] as const;

export type ItemGuideSlug = (typeof itemGuideSlugs)[number];

export type ItemGuideProductLink = {
  href: string;
  label: string;
  note?: string;
};

export type ItemGuide = {
  slug: ItemGuideSlug;
  path: string;
  query: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  intro: string;
  crumb: string;
  glyph: "dog" | "cat" | "toilet" | "sheet" | "treat" | "habitat";
  searchPlaceholder: string;
  searches: { label: string; query: string }[];
  points: { heading: string; body: string }[];
  caution: string;
  faqs: { question: string; answer: string }[];
  relatedGuides?: { href: string; label: string }[];
  // 品目から重点商品へ。件数は少なく保ち、記事の商品カードと役割を分ける。
  relatedProducts?: ItemGuideProductLink[];
};

const maxListingQueryLength = 80;

export const itemGuides: readonly ItemGuide[] = [
  {
    slug: "dog-food",
    path: "/categories/dog-food",
    query: "ドッグフード",
    title: "ドッグフードの価格を比べる",
    description:
      "ドッグフードの本体価格を、ドライとウェット、年齢、袋の容量が違う前提で見比べるページです。掲載は取得できた範囲で、送料込みの最安は保証しません。",
    h1: "ドッグフードの価格を比べる",
    lead: "ドライとウェット、子犬と成犬、袋の大きさは、同じ金額でも条件が違います。",
    intro:
      "ドッグフードは、対象の年齢と袋の内容量で見方が変わります。子犬用と成犬用、ドライとウェットを、一つの順番にはまとめません。このページに出すのは、名前とJANを確認できた商品だけです。金額は載せず、同じ袋の価格は商品ページで見比べます。",
    crumb: "ドッグフード",
    glyph: "dog",
    searchPlaceholder: "例：ロイヤルカナン、8kg",
    searches: [
      { label: "ロイヤルカナン", query: "ロイヤルカナン" },
      { label: "ヒルズ", query: "ヒルズ" },
      { label: "ニュートロ", query: "ニュートロ" },
      { label: "子犬用", query: "子犬" },
      { label: "シニア", query: "シニア" },
    ],
    points: [
      {
        heading: "年齢で必要なものが違う",
        body: "子犬用、成犬用、シニア用は粒の大きさやカロリーが違います。年齢の違う袋を、一つの順位にまとめません。",
      },
      {
        heading: "ドライとウェットは水分が違う",
        body: "ウェットは水分が多いので、ドライと袋の総額だけでは比べられません。同じ形状の掲載を見ます。",
      },
      {
        heading: "大袋は食べきれる量か",
        body: "kgあたりが安く見えても、開封後に食べきれるかが別です。4kgと8kgは、同じ条件として扱いません。",
      },
    ],
    caution:
      "療法食は、獣医師の指示がある前提の商品です。通常食と混ぜて最安にはしません。送料が確認できない掲載は0円や送料無料にせず、セットは単品と分けて見ます。",
    faqs: [
      {
        question: "子犬用と成犬用を同じ商品としてよいですか？",
        answer: "同じ商品としては扱いません。対象年齢が違うと、必要な栄養と袋の選び方が変わります。",
      },
      {
        question: "何kgで見ればよいですか？",
        answer: "掲載に書かれた容量どうしを見ます。容量が書かれていない掲載のkgあたりは出しません。",
      },
      {
        question: "ショップが少ないのはなぜですか？",
        answer: "並ぶのは、そのとき取得できた掲載だけです。すべての販売店や、在庫のある全商品を含むわけではありません。",
      },
    ],
    relatedGuides: [{ href: "/articles/how-to-choose-dog-food", label: "ドッグフードの選び方" }],
    relatedProducts: [
      {
        href: "/products/jan/4562358781780",
        label: "ニュートロ シュプレモ 小型犬 成犬用 3kg",
        note: "小型犬の成犬用 3kg。容量違いの袋は別ページです。",
      },
    ],
  },
  {
    slug: "cat-food",
    path: "/categories/cat-food",
    query: "キャットフード",
    title: "キャットフードの価格を比べる",
    description:
      "キャットフードを、総合栄養食と一般食、ドライとウェットの違いが分かるように並べます。金額は取得時点の掲載で、全店舗の最安ではありません。",
    h1: "キャットフードの価格を比べる",
    lead: "総合栄養食と一般食、カリカリとウェットでは、比べる単位が違います。",
    intro:
      "キャットフードは、主食の総合栄養食と、水分の多いウェットで役割が違います。おやつや猫砂は、この一覧には混ぜません。容量が違う袋は別の商品です。確認できた名前とJANだけを載せ、金額は商品ページで見てください。",
    crumb: "キャットフード",
    glyph: "cat",
    searchPlaceholder: "例：総合栄養食、パウチ",
    searches: [
      { label: "ロイヤルカナン", query: "ロイヤルカナン" },
      { label: "ヒルズ", query: "ヒルズ" },
      { label: "ニュートロ", query: "ニュートロ" },
      { label: "ウェット", query: "ウェット" },
      { label: "総合栄養食", query: "総合栄養食" },
    ],
    points: [
      {
        heading: "主食かどうか",
        body: "総合栄養食は主食として作られたフードです。一般食やおやつは、主食の代わりとして同じ順位に入れません。",
      },
      {
        heading: "ウェットは水分で重さが変わる",
        body: "パウチや缶は水分が多いです。ドライの袋と総額だけを比べると、食べられる量はそろいません。",
      },
      {
        heading: "年齢と毛玉ケアは別の条件",
        body: "子猫、成猫、高齢猫、毛玉対応は目的が違います。名前が似ていても、同じフードとしては見ません。",
      },
    ],
    caution:
      "猫砂やトイレ用品は、このページのフード一覧に混ぜません。グレインフリーは価格の安さとは別の条件です。送料未確認の掲載を、送料無料の商品と並べて合計しません。",
    faqs: [
      {
        question: "カリカリとパウチは一緒に並べますか？",
        answer: "検索結果には両方出ることがあります。水分量が違うので、同じ容量の同じ形状どうしで見てください。",
      },
      {
        question: "グレインフリーは安いフードより得ですか？",
        answer: "得かどうかは判断しません。穀物の有無は価格とは別で、掲載に書かれた条件として見ます。",
      },
      {
        question: "楽天市場の価格はこの一覧に出ますか？",
        answer:
          "この一覧はYahoo!ショッピングの掲載です。JANコードがある商品は、商品ページで楽天市場の参考価格を見られることがあります。その参考価格では、店舗ごとの送料と在庫は確認できません。",
      },
    ],
    relatedGuides: [{ href: "/articles/how-to-choose-cat-food", label: "キャットフードの選び方" }],
    relatedProducts: [
      {
        href: "/products/jan/3182550706933",
        label: "ロイヤルカナン インドア 成猫用 4kg",
        note: "室内で生活する成猫用 4kg。容量違いの袋は別ページです。",
      },
    ],
  },
  {
    slug: "cat-litter",
    path: "/categories/cat-litter",
    query: "猫砂",
    title: "猫砂の価格を比べる",
    description:
      "猫砂の袋価格を、砂の種類と容量の単位が違う前提で見ます。トイレ本体やペットシーツは混ぜません。送料が不明な掲載は無料にしません。",
    h1: "猫砂の価格を比べる",
    lead: "鉱物、木、紙、豆腐では、同じ袋数でも重さと交換の頻度が違います。",
    intro:
      "猫砂は、原料と容量の単位が違うと、同じ袋としては比べられません。鉱物、木、紙、豆腐を一つの砂にまとめず、リットルとキログラムも混ぜません。トイレ本体とペットシーツは、別のページに分けています。",
    crumb: "猫砂",
    glyph: "toilet",
    searchPlaceholder: "例：木の猫砂、7L",
    searches: [
      { label: "鉱物砂", query: "鉱物" },
      { label: "木の猫砂", query: "木" },
      { label: "豆腐", query: "豆腐" },
      { label: "固まる", query: "固まる" },
    ],
    points: [
      {
        heading: "原料で使い方が違う",
        body: "鉱物砂、木の砂、紙の砂、豆腐の砂、シリカは、固まり方と捨て方が違います。原料が違う袋を同じ砂として扱いません。",
      },
      {
        heading: "Lとkgを混ぜない",
        body: "容量がリットルの掲載と、重さがkgの掲載は単位が違います。同じ単位の掲載だけを見比べます。",
      },
      {
        heading: "固まる砂は交換の量が違う",
        body: "固まる砂は汚れた部分だけ替えることがあります。固まらない砂とは、1袋で何日持つかが同じになりません。",
      },
    ],
    caution:
      "香料の有無も別条件です。トイレ本体、猫トイレ、ペットシーツは砂の価格に含めません。枚数やリットルが掲載にないときは、1Lあたりを計算しません。",
    faqs: [
      {
        question: "何Lを基準にしますか？",
        answer: "掲載に書かれた容量を基準にします。書かれていないリットルを、こちらで推測して埋めません。",
      },
      {
        question: "香つきと無香は同じ商品ですか？",
        answer: "同じ商品としては扱いません。香りは価格とは別に、使う場所や猫の好みに関わります。",
      },
      {
        question: "袋が安い猫砂が得ですか？",
        answer: "袋の安さだけでは判断できません。1回に使う量と交換の頻度が違うと、同じ期間の金額はそろいません。",
      },
    ],
    relatedGuides: [
      { href: "/articles/cat-litter-types", label: "猫砂の種類と選び方" },
      { href: "/pets/cat?category=litter", label: "猫用品の猫砂カテゴリ" },
    ],
    // 記事 cat-litter-types と同じ2商品。記事カードは増やさず、カテゴリから商品へ直結する。
    relatedProducts: [
      {
        href: "/products/jan/4905009714353",
        label: "アイリスオーヤマ 紙の猫砂 7L",
        note: "7L単品。セットは別ページです。",
      },
      {
        href: "/products/jan/4903351011250",
        label: "LION ニオイをとる砂 5L×4個",
        note: "5L×4個。袋数違いも別ページです。",
      },
    ],
  },
  {
    slug: "pet-sheets",
    path: "/categories/pet-sheets",
    query: "ペットシーツ",
    title: "ペットシーツの価格を比べる",
    description:
      "ペットシーツを、サイズと枚数が違う袋として見比べます。1枚あたりは枚数が分かる掲載だけです。犬用と猫用を同じ条件としては扱いません。",
    h1: "ペットシーツの価格を比べる",
    lead: "レギュラー、ワイド、スーパーワイドは面積が違い、袋の枚数も商品ごとに違います。",
    intro:
      "ペットシーツは、1枚の大きさと袋の枚数で支払う量が変わります。レギュラーやワイドは呼び方なので、縦横の長さはパッケージの表示を見てください。猫砂やトイレ本体とは別の用品です。この一覧には金額を出していません。",
    crumb: "ペットシーツ",
    glyph: "sheet",
    searchPlaceholder: "例：ワイド、100枚",
    searches: [
      { label: "レギュラー", query: "レギュラー" },
      { label: "ワイド", query: "ワイド" },
      { label: "スーパーワイド", query: "スーパーワイド" },
      { label: "厚型", query: "厚型" },
    ],
    points: [
      {
        heading: "サイズで面積が違う",
        body: "レギュラー、ワイド、スーパーワイドは1枚の大きさが違います。サイズの違う袋を、同じシーツとして並べません。",
      },
      {
        heading: "枚数が違うと袋の値段は揃わない",
        body: "100枚と200枚は入数が違います。枚数が掲載から分かるときだけ、1枚あたりを見ます。不明な枚数は推測しません。",
      },
      {
        heading: "厚みは枚数と別",
        body: "うす型と厚型では、同じ枚数でも使える場面が違います。枚数だけを揃えても、同じ商品にはなりません。",
      },
    ],
    caution:
      "犬のトイレに敷くシーツと、猫砂は別の用品です。複数袋のセットは単品と分けます。送料が確認できない掲載を、送料0円として合計しません。",
    faqs: [
      {
        question: "1枚あたりはいつも出ますか？",
        answer: "袋の価格と枚数の両方が掲載から分かるときだけ出します。枚数が読めない掲載では、1枚あたりを作りません。",
      },
      {
        question: "ワイドとレギュラーを混ぜてよいですか？",
        answer: "混ぜません。1枚の面積が違うと、同じ枚数でも敷ける広さが違います。",
      },
      {
        question: "犬用と猫用は同じシーツですか？",
        answer: "サイズや使う場所が違う掲載は、同じ商品としてまとめません。猫砂のページとも分けています。",
      },
    ],
    relatedGuides: [{ href: "/articles/how-to-choose-pet-sheets", label: "ペットシーツの選び方" }],
    relatedProducts: [
      {
        href: "/products/jan/4520699667989",
        label: "デオシート レギュラー ジャンボパック 112枚入 4袋",
        note: "レギュラー 112枚入×4袋。枚数・サイズ違いも別ページです。",
      },
    ],
  },
  {
    slug: "treats",
    path: "/categories/treats",
    query: "おやつ",
    title: "おやつの価格を比べる",
    description:
      "犬用と猫用のおやつを、主食のフードとは分けて見ます。確認できた商品だけを載せ、金額はこの一覧には出していません。",
    h1: "おやつの価格を比べる",
    lead: "おやつは間食です。犬用と猫用、個数違いのセットは、同じ商品としては見ません。",
    intro:
      "おやつは、主食とは別に与える間食です。犬用と猫用は対象の動物が違うので、同じ商品としては見ません。このページには、名前とJANを確認できた商品だけを出します。まだ確認できていない商品の価格は作りません。",
    crumb: "おやつ",
    glyph: "treat",
    searchPlaceholder: "例：ジャーキー、ちゅーる",
    searches: [
      { label: "犬のおやつ", query: "犬" },
      { label: "猫のおやつ", query: "猫" },
      { label: "ジャーキー", query: "ジャーキー" },
    ],
    points: [
      {
        heading: "主食と間食を分ける",
        body: "おやつは間食です。総合栄養食の代わりとして、フードと同じ順番には入れません。",
      },
      {
        heading: "犬用と猫用は別",
        body: "対象の動物が違うおやつは、同じ商品として見ません。与え方も袋の表示も違います。",
      },
      {
        heading: "確認できた商品だけ",
        body: "名前とJANが確認できない商品は、この一覧に足しません。価格の空欄を、こちらで埋めません。",
      },
    ],
    caution:
      "個数違いのセットは単品と分けます。療法食やサプリはおやつではありません。送料が確認できない掲載を、送料無料としては扱いません。",
    faqs: [
      {
        question: "おやつとドッグフードは同じページですか？",
        answer: "分けています。おやつは間食、フードは主食として見ます。",
      },
      {
        question: "犬用と猫用のおやつを一緒に並べますか？",
        answer: "同じ商品としては並べません。対象の動物が違う掲載は、犬用品と猫用品でも分けています。",
      },
      {
        question: "この一覧に商品が少ないのはなぜですか？",
        answer: "名前とJANを確認できた商品だけを出しています。確認できていない商品の価格は作りません。",
      },
    ],
    relatedGuides: [
      { href: "/pets/dog?category=treat", label: "犬用品のおやつ" },
      { href: "/pets/cat?category=treat", label: "猫用品のおやつ" },
    ],
  },
  {
    slug: "cat-tower",
    path: "/categories/cat-tower",
    query: "キャットタワー",
    title: "キャットタワーの価格を比べる",
    description:
      "キャットタワーを、高さと設置のしかたが違う前提で見ます。商品名に無い高さは補いません。金額はこの一覧には出していません。",
    h1: "キャットタワーの価格を比べる",
    lead: "据え置き、突っ張り、壁付けでは、固定のしかたと必要な床の広さが違います。",
    intro:
      "キャットタワーは、高さ、幅、床への固定のしかたで置き場所が変わります。寸法は、商品名や仕様に書かれたものだけを使います。書かれていない高さは補いません。金額は、この一覧ではなく商品ページで見比べます。",
    crumb: "キャットタワー",
    glyph: "habitat",
    searchPlaceholder: "例：据え置き、スリム",
    searches: [
      { label: "据え置き", query: "据え置き" },
      { label: "突っ張り", query: "突っ張り" },
      { label: "スリム", query: "スリム" },
    ],
    points: [
      {
        heading: "高さは表記を見る",
        body: "商品名や仕様に書かれた高さを使います。書かれていない数値は、このページでは作りません。",
      },
      {
        heading: "設置方法を分ける",
        body: "据え置き、突っ張り、壁付けは固定のしかたが違います。同じタワーとしては扱いません。",
      },
      {
        heading: "置き場所を先に見る",
        body: "幅と高さが部屋に入るかは、価格の前に確認する条件です。商品名に無い幅は補いません。",
      },
    ],
    caution:
      "高さ、幅、設置方法が違うタワーは同じ商品にしません。商品名に無い寸法は推測しません。送料が確認できない掲載を、送料0円として合計しません。",
    faqs: [
      {
        question: "高さはどこで確認しますか？",
        answer: "商品名や販売ページに書かれた高さを見ます。書かれていない高さは、このページでは補いません。",
      },
      {
        question: "据え置きと突っ張りは同じ商品ですか？",
        answer: "設置方法が違うものは同じ商品としてまとめません。",
      },
      {
        question: "キャットタワーの価格はこの一覧に出ますか？",
        answer: "金額は商品ページで見比べます。この一覧には商品名とリンクだけを出しています。",
      },
    ],
    relatedGuides: [{ href: "/pets/cat", label: "猫用品の価格比較" }],
    relatedProducts: [
      {
        href: "/products/jan/4582701000467",
        label: "キャットタワー スリム 据え置き 高さ142cm",
        note: "据え置き、高さ142cm。商品名に書かれた寸法です。",
      },
    ],
  },
  {
    slug: "pet-toilet",
    path: "/categories/pet-toilet",
    query: "ペット トイレ",
    title: "トイレ用品の価格を比べる",
    description:
      "トイレ本体と専用シートを、猫砂やペットシーツとは分けて見ます。型番が違うセットは同じ商品にしません。金額は商品ページで確認します。",
    h1: "トイレ用品の価格を比べる",
    lead: "猫のトイレ本体、交換用シート、猫砂、犬のペットシーツは、中身が違う用品です。",
    intro:
      "トイレまわりは、猫のトイレ本体、交換用のシート、猫砂、犬のペットシーツで中身が違います。このページでは、確認できた商品を種類ごとに分けて載せます。猫砂とペットシーツの詳しい見方は、それぞれの品目ページにあります。金額は商品ページで確認します。",
    crumb: "トイレ用品",
    glyph: "toilet",
    searchPlaceholder: "例：猫トイレ、システムトイレ",
    searches: [
      { label: "猫トイレ", query: "猫トイレ" },
      { label: "システムトイレ", query: "システムトイレ" },
      { label: "犬のトイレ", query: "犬" },
    ],
    points: [
      {
        heading: "本体とシートを分ける",
        body: "トイレ本体のセットと、交換用シートは別の商品です。入数が違うシートも分けます。",
      },
      {
        heading: "猫砂とシーツは専用ページ",
        body: "砂の袋は猫砂のページ、犬の敷くシーツはペットシーツのページでも見られます。同じ用品としては扱いません。",
      },
      {
        heading: "型番が違うセットは分ける",
        body: "同じシリーズでも、カバーの形やセット内容が違うものは別ページです。色の違いは商品名に書かれた範囲で見ます。",
      },
    ],
    caution:
      "猫砂の袋とペットシーツは、それぞれの品目ページでも見ます。本体セットと交換用シートは分けます。送料が不明な掲載は無料にしません。",
    faqs: [
      {
        question: "猫砂はこのページに含まれますか？",
        answer: "確認できた猫砂も、このページでは猫砂の欄に分けて載せます。詳しい見方は猫砂のページです。",
      },
      {
        question: "デオトイレの本体とシートは同じ商品ですか？",
        answer: "本体セットと交換用シートは別の商品です。入数が違う掲載も分けます。",
      },
      {
        question: "犬のトイレと猫のトイレは一緒ですか？",
        answer: "使う動物と形が違うものは同じ商品にしません。犬のシーツはペットシーツのページでも見られます。",
      },
    ],
    relatedGuides: [
      { href: "/articles/cat-litter-types", label: "猫砂の種類と選び方" },
      { href: "/articles/how-to-choose-pet-sheets", label: "ペットシーツの選び方" },
    ],
    relatedProducts: [
      {
        href: "/products/jan/4520699282786",
        label: "デオトイレ 快適ワイドリラックス+ 本体セット",
        note: "本体セット。交換用シートとは別ページです。",
      },
      {
        href: "/products/jan/4520699618851",
        label: "デオトイレ ハーフカバー 本体セット",
        note: "ハーフカバーの本体セット。カバーの形が違うセットは別ページです。",
      },
    ],
  },
];

export function categoryGuidePaths(): string[] {
  return itemGuides.map((guide) => guide.path);
}

export function itemGuideBySlug(slug: string): ItemGuide | null {
  return itemGuides.find((guide) => guide.slug === slug) ?? null;
}

export function guideListingQuery(guide: ItemGuide, raw: string): string {
  const extra = raw.trim().replace(/\s+/g, " ").slice(0, 40);
  if (extra === "") {
    return guide.query;
  }
  if (extra.includes(guide.query)) {
    return extra.slice(0, maxListingQueryLength);
  }
  return `${guide.query} ${extra}`.slice(0, maxListingQueryLength);
}

function listingText(name: string, genres: readonly string[]): string {
  return [name, ...genres].join(" ").replace(/\s+/g, "");
}

export function listingMatchesGuide(slug: ItemGuideSlug, name: string, genres: readonly string[]): boolean {
  const text = listingText(name, genres);
  if (slug === "dog-food") {
    if (/猫|キャット|ネコ|シーツ|猫砂|トイレ砂|おやつ|ジャーキー|ガム|サプリ|おもちゃ|首輪|タワー/.test(text)) {
      return false;
    }
    return /ドッグフード/.test(text) || (/犬/.test(text) && /フード|ドライ|ウェット|総合栄養食|成犬|子犬|シニア/.test(text));
  }
  if (slug === "cat-food") {
    if (/犬|ドッグ|シーツ|猫砂|ネコ砂|トイレ砂|おやつ|ジャーキー|ガム|サプリ|おもちゃ|トイレ|タワー/.test(text)) {
      return false;
    }
    return /キャットフード|猫缶/.test(text) || (/猫/.test(text) && /フード|ドライ|ウェット|総合栄養食|パウチ/.test(text));
  }
  if (slug === "cat-litter") {
    if (!/猫砂|ネコ砂|トイレ砂/.test(text)) {
      return false;
    }
    return !/フード|シーツ|ペットシート|トイレ本体/.test(text);
  }
  if (slug === "treats") {
    if (/猫砂|ネコ砂|トイレ砂|シーツ|ペットシート|キャットタワー|猫タワー|トイレ本体/.test(text)) {
      return false;
    }
    return /おやつ|ジャーキー|ちゅーる|チュール|トリーツ/.test(text) || (/ガム|ボーロ/.test(text) && /犬|猫|ペット/.test(text));
  }
  if (slug === "cat-tower") {
    if (/フード|猫砂|おやつ|シーツ|ジャーキー/.test(text)) {
      return false;
    }
    return /キャットタワー|猫タワー/.test(text);
  }
  if (slug === "pet-toilet") {
    if (/猫砂|ネコ砂|トイレ砂|ペットシーツ|ペットシート|トイレシーツ|キャットタワー|猫タワー|おやつ|ジャーキー|ドッグフード|キャットフード/.test(text)) {
      return false;
    }
    return /トイレ/.test(text);
  }
  if (slug === "pet-sheets") {
    if (/猫砂|ネコ砂|トイレ砂|フード|おもちゃ|キャットタワー/.test(text)) {
      return false;
    }
    return /ペットシーツ|ペットシート|デオシート|トイレシーツ/.test(text);
  }
  return false;
}
