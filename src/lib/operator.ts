// SNSで使っている運営者の呼称。空のときは「運営者:」の行を出さない。
export const operatorName = "ごぼう";

// 掲載できる所在地。空のときは所在地の行を出さない。
export const operatorAddress = "";

export function operatorPerson(): { "@type": "Person"; name: string } | null {
  const name = operatorName.trim();
  if (name === "") {
    return null;
  }
  return { "@type": "Person", name };
}
