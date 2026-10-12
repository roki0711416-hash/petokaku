export const petIds = ["dog", "cat", "small-animal", "bird", "fish", "reptile"] as const;

export type PetId = (typeof petIds)[number];

export type PetLink = {
  href: string;
  label: string;
};

export type PetCategory = {
  id: string;
  label: string;
  query: string;
  reject: string[];
  require: string[];
};

export type PetPage = {
  id: PetId;
  path: string;
  label: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  query: string;
  include: string[];
  exclude: string[];
  categories: PetCategory[];
  related: PetLink[];
  points: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
};

export function petPath(id: PetId): string {
  return `/pets/${id}`;
}

export function isPetId(value: string): value is PetId {
  return petIds.some((id) => id === value);
}

const pets: readonly PetPage[] = [
  {
    id: "dog",
    path: petPath("dog"),
    label: "犬",
    title: "犬用品の商品を探す",
    description: "犬のフード、おやつ、トイレ用品、おもちゃ、ケア用品、散歩用品を探せます。並びはレビュー件数の参考で、売上ランキングではありません。",
    h1: "犬用品を探す",
    lead: "犬のご飯や散歩、トイレ、ケアに使う用品を、商品名を思い出さなくても探せます。一覧の並びは売上順位ではありません。",
    query: "犬 用品",
    include: ["犬", "ドッグ", "わん"],
    exclude: ["猫砂", "ハムスター", "セキセイ", "金魚", "水槽", "フトアゴ", "爬虫", "犬印"],
    categories: [
      { id: "food", label: "ドッグフード", query: "ドッグフード", require: [], reject: ["おもちゃ", "おやつ", "ジャーキー", "トイレ", "シーツ", "リード", "ハーネス", "シャンプー", "サプリ"] },
      { id: "treat", label: "おやつ", query: "犬 おやつ", require: ["おやつ", "ジャーキー", "ガム", "ビスケット", "トリーツ", "ボーロ", "ささみ"], reject: ["トイレ", "シーツ", "おもちゃ", "リード", "ハーネス", "シャンプー"] },
      { id: "toilet", label: "トイレ用品", query: "犬 トイレ用品", require: [], reject: ["おもちゃ", "おやつ", "ジャーキー", "リード", "ハーネス", "シャンプー", "フード"] },
      { id: "toy", label: "おもちゃ", query: "犬 おもちゃ", require: ["おもちゃ", "オモチャ", "ボール", "ロープ", "ぬいぐるみ"], reject: ["フード", "おやつ", "ジャーキー", "トイレ", "シーツ", "シャンプー"] },
    ],
    related: [
      { href: petPath("cat"), label: "猫用品" },
      { href: "/categories/dog-food", label: "ドッグフード" },
      { href: "/categories/pet-sheets", label: "ペットシーツ" },
    ],
    points: [
      { heading: "フードはライフステージを分ける", body: "子犬、成犬、シニアで必要な栄養は違います。商品名の対象年齢と、今の年齢が合うかをショップのページで確認してください。" },
      { heading: "容量とセット数を分ける", body: "1袋とまとめ買いは、同じ商品でも支払額が違います。ペトカクの価格比較では、販売単位が違う掲載を同じ順位に混ぜません。" },
      { heading: "散歩用品はサイズを見る", body: "首輪、ハーネス、リードは首回りや体重の目安が商品ごとに違います。一覧の価格だけでサイズは決まりません。" },
    ],
    faqs: [
      { question: "この一覧は売上ランキングですか？", answer: "売上の順位ではありません。Yahoo!ショッピングと楽天市場を、それぞれレビュー件数が多い順に並べています。二つの件数は足していません。" },
      { question: "価格を比較できる商品はどれですか？", answer: "一覧に出ている商品は、同じ商品・同じ容量・同じ販売単位について、別々の2ショップ以上から価格を取得できたものです。商品詳細でショップごとの価格を比べられます。" },
      { question: "表示価格は最安値ですか？", answer: "一覧の価格は、その取得結果に含まれた掲載の価格です。全店舗の最安値ではありません。送料と在庫は、商品詳細と販売店のページで確認してください。" },
    ],
  },
  {
    id: "cat",
    path: petPath("cat"),
    label: "猫",
    title: "猫用品の商品を探す",
    description: "猫のフード、おやつ、猫砂、トイレ用品、おもちゃ、ケア用品を探せます。レビュー件数が多い商品の参考で、売上ランキングではありません。",
    h1: "猫用品を探す",
    lead: "猫のご飯、猫砂、トイレ、遊び、ケアの用品をまとめて探せます。並びは、各モールのレビュー件数を参考にしています。",
    query: "猫 用品",
    include: ["猫", "キャット", "ネコ"],
    exclude: ["ハムスター", "セキセイ", "金魚", "水槽", "フトアゴ", "爬虫", "ドッグフード"],
    categories: [
      { id: "food", label: "キャットフード", query: "キャットフード", require: [], reject: ["猫砂", "おもちゃ", "おやつ", "ジャーキー", "トイレ", "サプリ"] },
      { id: "litter", label: "猫砂", query: "猫砂", require: ["猫砂", "ネコ砂", "紙砂", "サンド"], reject: ["フード", "おもちゃ", "おやつ", "ジャーキー"] },
      { id: "treat", label: "おやつ", query: "猫 おやつ", require: ["おやつ", "ジャーキー", "ちゅーる", "チュール", "トリーツ"], reject: ["猫砂", "おもちゃ", "トイレ"] },
      { id: "toy", label: "おもちゃ", query: "猫 おもちゃ", require: ["おもちゃ", "じゃらし", "猫じゃらし", "トンネル"], reject: ["フード", "猫砂", "おやつ", "トイレ"] },
    ],
    related: [
      { href: petPath("dog"), label: "犬用品" },
      { href: "/categories/cat-food", label: "キャットフード" },
      { href: "/categories/cat-litter", label: "猫砂" },
      { href: "/categories/pet-sheets", label: "ペットシーツ" },
    ],
    points: [
      { heading: "ドライとウェットを分ける", body: "カリカリとパウチは水分も価格の単位も違います。商品名の種類を見てから、同じ形の商品どうしを比べてください。" },
      { heading: "猫砂はリットルと香料を見る", body: "鉱物、木、紙、豆腐など素材が違います。容量の単位が違う掲載を、同じ順位としては扱いません。" },
      { heading: "室内飼いのケアを分ける", body: "ブラシ、爪切り、トイレ用品はフードとは別の用途です。カテゴリのリンクから用途を絞ってください。" },
    ],
    faqs: [
      { question: "人気の根拠は何ですか？", answer: "各モールで、レビュー件数が多い順に並べています。売上の順位や、サイト独自の順位ではありません。" },
      { question: "猫砂とペットシーツは同じページですか？", answer: "猫砂は猫砂の品目ページ、ペットシーツはペットシーツの品目ページです。このページからはそれぞれのページへ移動できます。" },
      { question: "子猫用も同じ一覧に出ますか？", answer: "検索語は「猫 用品」です。子猫用だけに絞る項目は、この取得条件にはありません。商品名に対象年齢があるかを確認してください。" },
    ],
  },
  {
    id: "small-animal",
    path: petPath("small-animal"),
    label: "小動物",
    title: "小動物用品の商品を探す",
    description: "うさぎやハムスターなどのフード、牧草、床材、ケージ、給水器、おもちゃを探せます。レビュー件数の参考で、売上ランキングではありません。",
    h1: "小動物用品を探す",
    lead: "うさぎ、ハムスター、モルモットなどの用品を探せます。種類によって食べられるものと住環境が違うため、商品名の対象動物を確認してください。",
    query: "小動物 用品",
    include: ["うさぎ", "ウサギ", "ハムスター", "小動物", "モルモット", "チンチラ", "デグー"],
    exclude: ["ドッグフード", "キャットフード", "金魚", "水槽", "インコ", "フトアゴ"],
    categories: [
      { id: "food", label: "フード", query: "小動物 フード", require: [], reject: ["ケージ", "床材", "おもちゃ", "おやつ", "サプリ"] },
      { id: "cage", label: "ケージ", query: "小動物 ケージ", require: ["ケージ", "サークル"], reject: ["フード", "おやつ", "床材", "牧草"] },
      { id: "bedding", label: "床材", query: "小動物 床材", require: ["床材", "敷材", "チップ"], reject: ["フード", "ケージ", "おやつ", "おもちゃ"] },
      { id: "treat", label: "おやつ", query: "小動物 おやつ", require: ["おやつ", "ジャーキー", "ビスケット"], reject: ["ケージ", "床材"] },
    ],
    related: [
      { href: petPath("bird"), label: "鳥用品" },
      { href: petPath("dog"), label: "犬用品" },
    ],
    points: [
      { heading: "動物種を商品名で確認する", body: "うさぎ用の牧草と、ハムスター用のフードは別の商品です。一覧に並んでいても、対象動物が違うものは同じ商品としてまとめません。" },
      { heading: "牧草は内容量を見る", body: "グラム数が違う袋を、同じ価格順位にはしません。JANコードがある商品は商品詳細で容量違いを分けます。" },
      { heading: "ケージはサイズ表記を見る", body: "幅と高さは商品ごとに違います。価格が低くても、飼っている動物の体の大きさに合うとは限りません。" },
    ],
    faqs: [
      { question: "うさぎとハムスターは同じページですか？", answer: "このページは小動物用品の入口です。商品の対象動物は、商品名と販売店の説明で確認してください。別種を自動では同一商品にしません。" },
      { question: "並び順の根拠は何ですか？", answer: "Yahoo!ショッピングと楽天市場を、それぞれレビュー件数が多い順に並べています。二つの件数は足していません。" },
      { question: "商品を特定できないときはどうなりますか？", answer: "商品詳細で2ショップ以上の価格を比べられる商品だけを一覧に出します。JANコード、価格、販売単位が確認できたものに限っています。" },
    ],
  },
  {
    id: "bird",
    path: petPath("bird"),
    label: "鳥",
    title: "鳥用品の商品を探す",
    description: "鳥のフード、ケージ、止まり木、おもちゃ、ケア用品を探せます。並びはレビュー件数の参考で、売上順ではありません。",
    h1: "鳥用品を探す",
    lead: "インコや文鳥などのフード、ケージ、止まり木、ケア用品を探せます。鳥種によって殻つき種子とペレットの向き不向きが違います。",
    query: "鳥 用品",
    include: ["鳥", "インコ", "オウム", "文鳥", "ブンチョウ", "飼鳥"],
    exclude: ["ドッグフード", "キャットフード", "ハムスター", "金魚", "水槽", "フトアゴ"],
    categories: [
      { id: "food", label: "鳥用フード", query: "鳥 フード", require: [], reject: ["ケージ", "おもちゃ", "止まり木", "サプリ"] },
      { id: "cage", label: "ケージ", query: "鳥 ケージ", require: ["ケージ", "鳥かご", "鳥籠"], reject: ["フード", "ペレット", "おもちゃ"] },
      { id: "toy", label: "おもちゃ", query: "鳥 おもちゃ", require: ["おもちゃ", "トイ"], reject: ["フード", "ペレット", "ケージ"] },
      { id: "supplies", label: "飼育用品", query: "鳥 飼育用品", require: [], reject: ["おもちゃ"] },
    ],
    related: [
      { href: petPath("small-animal"), label: "小動物用品" },
    ],
    points: [
      { heading: "フードの形を見る", body: "シード、ペレット、副食は別の商品です。商品名の種類が違うものを、同じ比較にはしません。" },
      { heading: "ケージは鳥のサイズとセット内容を見る", body: "止まり木や食器が付くセットと、ケージ本体だけでは中身が違います。セット表記がある掲載は商品詳細で分けます。" },
      { heading: "ケア用品は用途を見る", body: "爪切り、バスサンド、ビタミン剤は用途が違います。価格の安さだけで選ばないでください。" },
    ],
    faqs: [
      { question: "このページの商品は売上順ですか？", answer: "売上の順位ではありません。各モールで、レビュー件数が多い順に並べています。" },
      { question: "インコ以外も出ますか？", answer: "検索語は「鳥 用品」です。文鳥やオウムの用品が混ざることがあります。商品名の対象を確認してください。" },
      { question: "価格比較はどこでしますか？", answer: "JANコードがある商品の「価格を比較する」から、既存の商品詳細へ進みます。" },
    ],
  },
  {
    id: "fish",
    path: petPath("fish"),
    label: "魚・アクアリウム",
    title: "魚・アクアリウム用品の商品を探す",
    description: "観賞魚のフード、水槽、フィルター、ヒーター、水質管理用品を探せます。並びはレビュー件数の参考です。生体そのものの販売一覧ではありません。",
    h1: "魚・アクアリウム用品を探す",
    lead: "水槽、ろ過、保温、えさ、水質の用品を探せます。生体の価格や在庫は、この一覧の対象にしていません。",
    query: "アクアリウム 用品",
    include: ["魚", "アクアリウム", "水槽", "金魚", "熱帯魚", "ろ過", "濾過"],
    exclude: ["ドッグフード", "キャットフード", "ハムスター", "インコ", "フトアゴ", "爬虫"],
    categories: [
      { id: "food", label: "魚用フード", query: "観賞魚 えさ", require: [], reject: ["水槽", "フィルター", "濾過", "ろ過", "ヒーター", "サプリ"] },
      { id: "tank", label: "水槽", query: "ガラス水槽", require: ["水槽"], reject: ["えさ", "エサ", "フード", "フィルター", "濾過", "ろ過", "照明", "ライト", "匹", "生体", "海水", "ボンベ", "メダカ", "掃除", "クリーナー", "スクレーパー", "コケ"] },
      { id: "filter", label: "フィルター", query: "水槽 フィルター", require: ["フィルター", "フィルタ", "ろ過", "濾過", "ろ材"], reject: ["えさ", "エサ", "フード"] },
      { id: "water", label: "水質管理用品", query: "水質調整", require: [], reject: ["えさ", "エサ", "フード"] },
    ],
    related: [
      { href: petPath("reptile"), label: "爬虫類・両生類用品" },
    ],
    points: [
      { heading: "水槽サイズとセットを分ける", body: "30cmと60cm、本体のみとフィルター付きでは別商品です。セット数や付属品が違う掲載は、同じ順位にしません。" },
      { heading: "ヒーターは対応水量を見る", body: "ワット数と対象の水量は商品ごとに違います。価格だけでは部屋の水温や水槽の大きさは分かりません。" },
      { heading: "えさは魚種を見る", body: "金魚、熱帯魚、肉食魚では粒の大きさが違います。商品名の対象魚を確認してください。" },
    ],
    faqs: [
      { question: "生体も並びますか？", answer: "検索語はアクアリウム用品です。生体の出品が混ざった場合も、ペトカクは生体の健康状態や到着条件を確認できません。用具として商品名を見てください。" },
      { question: "レビュー件数は合算ですか？", answer: "Yahoo!ショッピングと楽天市場のレビュー件数は、別々の欄で見ます。合計した人気度はありません。" },
      { question: "フィルターと水槽は同じ商品ですか？", answer: "名前が似ていても、別の商品として扱います。商品を特定できないものは、同じ商品とはみなしません。" },
    ],
  },
  {
    id: "reptile",
    path: petPath("reptile"),
    label: "爬虫類・両生類",
    title: "爬虫類・両生類用品の商品を探す",
    description: "爬虫類・両生類のフード、飼育ケース、保温器具、照明、床材、温湿度管理用品を探せます。並びはレビュー件数の参考で、売上順ではありません。",
    h1: "爬虫類・両生類用品を探す",
    lead: "トカゲ、ヘビ、カメ、カエルなどの飼育用品を探せます。適温と湿度は種で違うため、器具の対応範囲を販売店のページで確認してください。",
    query: "爬虫類 用品",
    include: ["爬虫", "両生", "トカゲ", "レオパ", "フトアゴ", "ヘビ", "カメ", "カエル", "蛙"],
    exclude: ["ドッグフード", "キャットフード", "ハムスター", "インコ", "金魚", "水槽", "ジェルネイル", "偽造防止"],
    categories: [
      { id: "food", label: "フード", query: "爬虫類 フード", require: [], reject: ["ケージ", "ライト", "ヒーター", "床材", "サプリ"] },
      { id: "cage", label: "ケージ", query: "爬虫類 ケージ", require: ["ケージ", "飼育ケース"], reject: ["フード", "ライト", "床材"] },
      { id: "light", label: "ライト", query: "爬虫類 ライト", require: ["ライト", "照明", "紫外線"], reject: ["フード", "床材"] },
      { id: "supplies", label: "飼育用品", query: "爬虫類 飼育用品", require: [], reject: ["フード"] },
    ],
    related: [
      { href: petPath("fish"), label: "魚・アクアリウム用品" },
    ],
    points: [
      { heading: "保温と照明を分ける", body: "パネルヒーター、保温球、紫外線灯は役割が違います。商品名の器具の種類を見てください。" },
      { heading: "床材は種と湿度で違う", body: "くるみ砂、ヤシガラ、ソイルは用途が違います。同じ床材という名前でも、容量と素材が違うものは別商品です。" },
      { heading: "フードは肉食と植物食を分ける", body: "人工飼料、昆虫、サプリは別の商品です。対象種が商品名にあるかを確認してください。" },
    ],
    faqs: [
      { question: "両生類の用品も入りますか？", answer: "爬虫類・両生類のジャンルから、レビュー件数が多い順に並べています。カエル向けの用品も入ります。種ごとの適温は、販売店のページで確認してください。" },
      { question: "人気順位はありますか？", answer: "売上の人気順位はありません。レビュー件数が多い順に並べています。レビュー件数が分からない商品に、順位は付けません。" },
      { question: "温度が合うかは分かりますか？", answer: "価格とレビュー件数から、適温は判断できません。対応ワット数と対象は販売店のページで確認してください。" },
    ],
  },
];

const petMap = new Map(pets.map((pet) => [pet.id, pet]));

export function petPages(): readonly PetPage[] {
  return pets;
}

export function petById(id: PetId): PetPage {
  const pet = petMap.get(id);
  if (!pet) {
    throw new Error(`不明なペットページです: ${id}`);
  }
  return pet;
}

export function petCategory(pet: PetPage, id: string | undefined | null): PetCategory | null {
  if (!id || id === "all") {
    return null;
  }
  return pet.categories.find((item) => item.id === id) ?? null;
}

// Yahoo!ショッピングのカテゴリ2509「ペット用品、生き物」の子カテゴリ。
// 公式カテゴリページのリンクと、itemSearchのparentGenreCategoriesに出たidと名称が一致したものだけ。
export const yahooPetGenreCategoryIds: Record<PetId, number> = {
  dog: 4772,
  cat: 4820,
  "small-animal": 32938,
  bird: 4816,
  fish: 4798,
  reptile: 33966,
};

// 楽天市場の公式カテゴリページのタイトルと一致したジャンルID。
// お手入れ用品や食器など、複数のペットに共通するジャンルは割り当てない。
export const rakutenPetGenreIds: Record<PetId, number> = {
  dog: 507513,
  cat: 507524,
  "small-animal": 565699,
  bird: 204183,
  fish: 203107,
  reptile: 560198,
};

const officialGenreLabels: Record<PetId, readonly string[]> = {
  dog: ["犬用品"],
  cat: ["猫用品"],
  "small-animal": ["小動物用品"],
  bird: ["鳥用品"],
  fish: ["熱帯魚、アクアリウム用品", "熱帯魚・アクアリウム"],
  reptile: ["爬虫類、両生類用品", "爬虫類・両生類"],
};

function hasOfficialGenre(genres: string[], pet: PetPage): boolean {
  return genres.some((genre) => officialGenreLabels[pet.id].some((label) => genre.includes(label)));
}

function nameHasPetSignal(name: string, pet: PetPage): boolean {
  if (pet.id === "dog") {
    return /ドッグ|わん|犬\s*用|犬の|犬服|子犬|成犬|老犬|愛犬|小型犬|中型犬|大型犬|超小型犬/.test(name);
  }
  if (pet.id === "bird") {
    return /インコ|オウム|文鳥|ブンチョウ|飼鳥|鳥用|鳥かご|鳥籠|小鳥|セキセイ|バード/.test(name);
  }
  if (pet.id === "fish") {
    return /アクアリウム|水槽|金魚|熱帯魚|観賞魚|ろ過|濾過|めだか|メダカ|水草/.test(name);
  }
  if (pet.id === "reptile") {
    return /爬虫|両生|トカゲ|レオパ|フトアゴ|ヘビ|カエル|蛙|リクガメ|カメ(?!ラ)/.test(name);
  }
  return pet.include.some((word) => name.includes(word));
}

export function listingFitsPet(name: string, genres: string[], pet: PetPage, inOfficialGenre = false): boolean {
  const text = `${name}\n${genres.join("\n")}`;
  if (pet.exclude.some((word) => text.includes(word))) {
    return false;
  }
  if (inOfficialGenre || hasOfficialGenre(genres, pet)) {
    return true;
  }
  return nameHasPetSignal(name, pet);
}

// 検索語と公式ジャンルで集めた結果を確認する。
// 別カテゴリの語があれば外し、必要な語を指定したカテゴリは名前かジャンル名にその語があるものだけ残す。
export function listingFitsCategory(name: string, genres: string[], category: PetCategory): boolean {
  const text = `${name}\n${genres.join("\n")}`;
  if (category.reject.some((word) => text.includes(word))) {
    return false;
  }
  if (category.require.length === 0) {
    return true;
  }
  return category.require.some((word) => text.includes(word));
}
