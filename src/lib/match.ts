type IdentityRecord = {
  id: string;
  name: string;
  brand: string;
  janCode: string | null;
  sizeLabel: string;
};

export function normalizeLabel(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, "");
}

export type IdentityIssue =
  | { type: "duplicate-id"; id: string }
  | { type: "same-jan-different-size"; janCode: string; leftId: string; rightId: string }
  | { type: "same-product-twice"; leftId: string; rightId: string };

export function findIdentityIssue(products: IdentityRecord[]): IdentityIssue | null {
  const seenIds = new Set<string>();

  for (const product of products) {
    if (seenIds.has(product.id)) {
      return { type: "duplicate-id", id: product.id };
    }
    seenIds.add(product.id);
  }

  for (let leftIndex = 0; leftIndex < products.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < products.length; rightIndex += 1) {
      const left = products[leftIndex];
      const right = products[rightIndex];
      const sameSize = normalizeLabel(left.sizeLabel) === normalizeLabel(right.sizeLabel);

      if (left.janCode && left.janCode === right.janCode) {
        if (!sameSize) {
          return {
            type: "same-jan-different-size",
            janCode: left.janCode,
            leftId: left.id,
            rightId: right.id,
          };
        }
        return { type: "same-product-twice", leftId: left.id, rightId: right.id };
      }

      const sameName = normalizeLabel(left.name) === normalizeLabel(right.name);
      const sameBrand = normalizeLabel(left.brand) === normalizeLabel(right.brand);
      if (sameName && sameBrand && sameSize) {
        return { type: "same-product-twice", leftId: left.id, rightId: right.id };
      }
    }
  }

  return null;
}

export function identityIssueMessage(issue: IdentityIssue): string {
  switch (issue.type) {
    case "duplicate-id":
      return `商品IDが重複しています: ${issue.id}`;
    case "same-jan-different-size":
      return `同じJANコードなのに内容量が違います: ${issue.janCode}（${issue.leftId} / ${issue.rightId}）`;
    case "same-product-twice":
      return `同じ商品が二重に登録されています: ${issue.leftId} / ${issue.rightId}`;
  }
}
