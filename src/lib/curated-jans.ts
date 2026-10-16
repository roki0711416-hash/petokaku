import { curatedJanProducts, type CuratedJanProduct } from "../data/curated-jans.ts";
import { isPetId, type PetId } from "./pets.ts";
import { validJanCode } from "./sources/yahoo/adapter.ts";

const janPattern = /^[0-9]{13}$/;

function janCheckDigitOk(jan: string): boolean {
  if (!janPattern.test(jan)) {
    return false;
  }
  let sum = 0;
  for (let index = 0; index < 12; index += 1) {
    sum += Number(jan[index]) * (index % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10 === Number(jan[12]);
}

export function selectCuratedJans(items: readonly CuratedJanProduct[] = curatedJanProducts): CuratedJanProduct[] {
  const seen = new Set<string>();
  const selected: CuratedJanProduct[] = [];
  for (const item of items) {
    const jan = validJanCode(item.janCode);
    if (!jan || !janCheckDigitOk(jan) || seen.has(jan) || !isPetId(item.petId)) {
      continue;
    }
    const label = item.label.trim();
    if (label === "") {
      continue;
    }
    seen.add(jan);
    selected.push({ janCode: jan, label, petId: item.petId });
  }
  return selected;
}

export function curatedJansForPet(petId: PetId, items: readonly CuratedJanProduct[] = curatedJanProducts): CuratedJanProduct[] {
  return selectCuratedJans(items).filter((item) => item.petId === petId);
}

export function curatedJanPaths(items: readonly CuratedJanProduct[] = curatedJanProducts): string[] {
  return selectCuratedJans(items).map((item) => `/products/jan/${item.janCode}`);
}
