const sizePattern = /\d+(?:\.\d+)?\s?(?:kg|g|ml|l|L|袋|個|本|箱|缶|パック)/i;

export function readableListingTitle(title: string): string {
  const compact = title
    .replace(/【[^】]{8,}】/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (compact.length <= 72) {
    return compact;
  }
  const size = compact.match(sizePattern)?.[0];
  const head = compact.slice(0, 64).trim();
  if (size && !head.includes(size)) {
    return `${head}… ${size}`;
  }
  return `${head}…`;
}
