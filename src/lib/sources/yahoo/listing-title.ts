const noisePatterns = [
  /\[\s*正規品\s*\]/g,
  /[（(]\s*正規品\s*[）)]/g,
  /正規品/g,
  /ジッパー有り/g,
  /ジッパー付き/g,
  /ジッパーなし/g,
  /ジップ付/g,
  /ジップ無し/g,
  /送料無料/g,
  /オリジナル輸送箱/g,
  /[（(]\s*イチオシ\s*[）)]/g,
  /お一人様\s*\d+\s*(?:個|袋|本|パック|点)\s*(?:まで|限り)?/g,
  /[（(]\s*成犬時体重\s*\d+(?:\.\d+)?\s*kg\s*まで\s*[）)]/gi,
  /成犬時体重\s*\d+(?:\.\d+)?\s*kg\s*まで/gi,
  /(?<!\d)\d{13}(?!\d)/g,
];

export function readableListingTitle(title: string): string {
  let text = title.normalize("NFKC");
  for (const pattern of noisePatterns) {
    text = text.replace(pattern, " ");
  }
  text = text
    .replace(/[（(]\s*[）)]/g, " ")
    .replace(/[【】]/g, " ")
    .replace(/\s*[/|｜]\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([のとをがはも])/g, "$1")
    .trim();
  return text || title.normalize("NFKC").trim();
}
