import type { ReactNode } from "react";
import type { ArticleDiagramId } from "@/lib/articles/catalog";

function Frame({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <figure className="rounded-2xl border border-line bg-card p-4">
      <figcaption className="text-sm font-medium text-ink">{title}</figcaption>
      <div className="mt-3">{children}</div>
      {note ? <p className="mt-3 text-xs leading-5 text-muted">{note}</p> : null}
    </figure>
  );
}

function LitterMaterials() {
  const items = [
    { name: "鉱物系", point: "固まる商品が多い" },
    { name: "紙系", point: "軽い商品が多い" },
    { name: "木系", point: "木の素材を使う" },
    { name: "おから系", point: "おからを使う" },
  ];
  return (
    <Frame title="素材の見方" note="図は分類の案内です。固まり方や粉の出方は、同じ素材でも商品ごとに違います。">
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {items.map((item) => (
          <li key={item.name} className="rounded-xl bg-sand px-3 py-3">
            <span aria-hidden="true" className="mb-2 block h-2 rounded-full bg-forest" />
            <p className="text-sm font-medium text-ink">{item.name}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{item.point}</p>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

function DryWet() {
  const items = [
    { name: "ドライフード", points: ["水分が少なめ", "袋のまま保管しやすい商品が多い", "給与量はグラムで書かれることが多い"] },
    { name: "ウェットフード", points: ["水分が多め", "開封後は使い切りや冷蔵の指示がある", "同じグラムでもドライとは別物"] },
  ];
  return (
    <Frame title="ドライとウェットの特徴" note="水分量の数値は商品ごとに違います。カロリーや健康への効果は、この図では比べていません。">
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.name} className="rounded-xl bg-moss px-3 py-3">
            <p className="text-sm font-medium text-ink">{item.name}</p>
            <ul className="mt-2 grid gap-1 text-xs leading-5 text-muted">
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

function FoodChecklist() {
  const items = ["目的の表示", "成長段階", "原材料の並び", "給与量の表", "内容量と保存", "JANと内容量の一致"];
  return (
    <Frame title="購入前のチェック" note="パッケージと商品ページの両方で、同じ項目を確認します。">
      <ol className="grid gap-2 sm:grid-cols-2">
        {items.map((item, index) => (
          <li key={item} className="flex items-center gap-2 rounded-xl bg-honey px-3 py-2 text-sm text-ink">
            <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-card text-xs text-forest">
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function DogLife() {
  const items = [
    { name: "子犬", point: "成長期向けの表示と、月齢に近い給与量" },
    { name: "成犬", point: "成犬用の表示と、体重・活動量に近い行" },
    { name: "シニア", point: "高齢期の表示があるかをパッケージで確認" },
  ];
  return (
    <Frame title="ライフステージで見るところ" note="年齢の区切りは商品の表示に従います。図は確認項目で、必要な栄養量は示していません。">
      <ol className="grid gap-2 md:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.name} className="rounded-xl bg-sand px-3 py-3">
            <p className="text-xs text-forest">段階 {index + 1}</p>
            <p className="mt-1 text-sm font-medium text-ink">{item.name}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{item.point}</p>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function DogCost() {
  return (
    <Frame title="1日あたりの食費の計算例" note="下の数字は計算手順を示すための仮の値です。実際の価格、給与量、内容量ではありません。">
      <ol className="grid gap-2 text-sm leading-6 text-ink">
        <li className="rounded-xl bg-sand px-3 py-2">仮の総額 4,000円</li>
        <li className="rounded-xl bg-sand px-3 py-2">仮の内容量 2,000g</li>
        <li className="rounded-xl bg-sand px-3 py-2">仮の1日の給与量 80g</li>
        <li className="rounded-xl bg-honey px-3 py-2">4,000円 × 80g ÷ 2,000g = 1日160円</li>
      </ol>
    </Frame>
  );
}

function SheetSize() {
  const items = [
    { name: "レギュラー", width: "w-16" },
    { name: "ワイド", width: "w-24" },
    { name: "より大きいサイズ", width: "w-32" },
  ];
  return (
    <Frame title="サイズの大きさのイメージ" note="レギュラーやワイドの寸法は商品ごとに違います。図の幅は共通の規格ではありません。">
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-3">
            <span aria-hidden="true" className={`${item.width} h-8 rounded-md border border-forest bg-moss`} />
            <span className="text-sm text-ink">{item.name}</span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

function SheetUnitPrice() {
  return (
    <Frame title="1枚あたりの価格の計算" note="下の数字は手順を示す仮の値です。吸収量や交換頻度は商品と使い方で変わるため、入れていません。">
      <ol className="grid gap-2 text-sm leading-6 text-ink">
        <li className="rounded-xl bg-sand px-3 py-2">税込の総額を確認する</li>
        <li className="rounded-xl bg-sand px-3 py-2">袋数 × 1袋の枚数で総枚数を出す</li>
        <li className="rounded-xl bg-honey px-3 py-2">仮に総額1,000円、総枚数100枚なら、1枚10円</li>
      </ol>
    </Frame>
  );
}

const diagrams: Record<ArticleDiagramId, () => ReactNode> = {
  "litter-materials": LitterMaterials,
  "dry-wet": DryWet,
  "food-checklist": FoodChecklist,
  "dog-life": DogLife,
  "dog-cost": DogCost,
  "sheet-size": SheetSize,
  "sheet-unit-price": SheetUnitPrice,
};

export function ArticleDiagram({ id }: { id: ArticleDiagramId }) {
  const Diagram = diagrams[id];
  return <Diagram />;
}
