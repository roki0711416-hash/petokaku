export type AmazonAssociateEntry = {
  jan: string;
  url: string;
  confirmedOn: string;
};

const amazonHosts = new Set(["amazon.co.jp", "www.amazon.co.jp", "amzn.to", "amzn.asia", "www.amzn.asia", "link.amazon"]);

export function isAmazonAssociateUrl(value: string): boolean {
  if (value !== value.trim()) {
    return false;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return false;
    }
    if (url.username !== "" || url.password !== "") {
      return false;
    }
    if (url.port !== "") {
      return false;
    }
    return amazonHosts.has(url.hostname);
  } catch {
    return false;
  }
}

function confirmedDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if (year == null || month == null || day == null) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function validAmazonAssociateEntry(entry: AmazonAssociateEntry): boolean {
  return /^[0-9]{13}$/.test(entry.jan) && confirmedDate(entry.confirmedOn) && isAmazonAssociateUrl(entry.url);
}

export function amazonAssociateLink(jan: string, entries: readonly AmazonAssociateEntry[]): { url: string } | null {
  if (!/^[0-9]{13}$/.test(jan)) {
    return null;
  }
  const matches = entries.filter((entry) => entry.jan === jan && validAmazonAssociateEntry(entry));
  if (matches.length !== 1) {
    return null;
  }
  const match = matches[0];
  if (!match) {
    return null;
  }
  return { url: match.url };
}
