export type CategoryListItem = {
  name: string;
  href: string;
};

export type CategoryFaq = {
  question: string;
  answer: string;
};

const productHrefPattern = /^\/products\/jan\/[0-9]{13}$/;
const categoryHrefPattern = /^\/categories\/[a-z0-9-]+$/;

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function categoryListHref(href: string): string | null {
  const path = href.trim();
  if (!productHrefPattern.test(path) && !categoryHrefPattern.test(path)) {
    return null;
  }
  if (/amazon/i.test(path)) {
    return null;
  }
  return path;
}

export function categoryItemListJsonLd(input: {
  pageUrl: string;
  items: readonly CategoryListItem[];
}): Record<string, unknown> | null {
  const items = input.items.flatMap((item) => {
    const name = cleanText(item.name);
    const href = categoryListHref(item.href);
    if (name === "" || !href || /amazon/i.test(name) || /[0-9][0-9,]*円/.test(name)) {
      return [];
    }
    return [{ name, href }];
  });
  if (items.length === 0) {
    return null;
  }

  let pageUrl: URL;
  try {
    pageUrl = new URL(input.pageUrl);
  } catch {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: pageUrl.toString(),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: new URL(item.href, pageUrl).toString(),
    })),
  };
}

export function categoryFaqJsonLd(faqs: readonly CategoryFaq[]): Record<string, unknown> | null {
  const items = faqs.flatMap((faq) => {
    const question = cleanText(faq.question);
    const answer = cleanText(faq.answer);
    if (question === "" || answer === "") {
      return [];
    }
    return [{ question, answer }];
  });
  if (items.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function jsonLdHtml(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
