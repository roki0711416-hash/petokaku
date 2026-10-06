import { hasUnresolvedPackNotation } from "../../pricing/pack-count.ts";
import {
  agreeShopQuantities,
  canUseForUnitPrice,
  selectPreferredQuantity,
  totalQuantityOf,
  unknownQuantityLabel,
  parseTitleQuantity,
} from "../../pricing/quantity-parse.ts";
import type { CategoryId, PriceSnapshot, Product, ProductDetail, ProductVariant, ShippingStatus, ShopOffer, StockStatus } from "@/lib/types";

export type YahooShipping = {
  code: number | null;
  name: string | null;
};

export type YahooItem = {
  name: string;
  url: string | null;
  inStock: boolean | null;
  code: string | null;
  price: number | null;
  imageUrl: string | null;
  brandName: string | null;
  genreName: string | null;
  parentGenreNames: string[];
  janCode: string | null;
  shipping: YahooShipping | null;
  sellerId: string | null;
  sellerName: string | null;
};

export type AdaptedYahooProduct = {
  product: Product & { imageUrl: string | null; genreName: string | null };
  variant: ProductVariant;
  offers: ShopOffer[];
  prices: PriceSnapshot[];
  detail: ProductDetail;
};

function token(value: string): string {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned.slice(0, 40) || "item";
}

export function validJanCode(value: string | null): string | null {
  if (value && /^[0-9]{13}$/.test(value)) {
    return value;
  }
  return null;
}

export function duplicateOfferKey(item: YahooItem): string {
  if (item.sellerId && item.code) {
    return `yahoo:${item.sellerId}:${item.code}`;
  }
  return `yahoo:single:${item.sellerId ?? ""}:${item.url ?? ""}:${item.name}`;
}

export function sameJanItems(items: YahooItem[], janCode: string): YahooItem[] {
  const seen = new Set<string>();
  const unique: YahooItem[] = [];
  for (const item of items) {
    if (validJanCode(item.janCode) !== janCode) {
      continue;
    }
    const key = duplicateOfferKey(item);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

function categoryFromGenres(names: string[]): CategoryId {
  const text = names.join(" ");
  if (text.includes("犬") || text.includes("ドッグ")) {
    return "dog";
  }
  if (text.includes("猫") || text.includes("キャット")) {
    return "cat";
  }
  if (text.includes("小動物") || text.includes("うさぎ") || text.includes("ハムスター")) {
    return "small-animal";
  }
  if (text.includes("鳥")) {
    return "bird";
  }
  if (text.includes("魚") || text.includes("水槽") || text.includes("アクアリウム")) {
    return "fish";
  }
  return "other";
}

export function mapYahooShipping(shipping: YahooShipping | null): { shippingFee: number | null; shippingStatus: ShippingStatus } {
  if (shipping?.name === "条件付き送料無料" || shipping?.code === 3) {
    return { shippingFee: null, shippingStatus: "conditional_free" };
  }
  if (shipping?.name === "送料無料" || shipping?.code === 2) {
    return { shippingFee: 0, shippingStatus: "free" };
  }
  return { shippingFee: null, shippingStatus: "unknown" };
}

function mapStock(inStock: boolean | null): StockStatus {
  if (inStock === true) {
    return "in_stock";
  }
  if (inStock === false) {
    return "out_of_stock";
  }
  return "unknown";
}

export function adaptYahooGroup(items: YahooItem[], observedAt: string): AdaptedYahooProduct | null {
  const first = items.find((item) => validJanCode(item.janCode) && item.name.trim());
  const janCode = validJanCode(first?.janCode ?? null);
  if (!first || !janCode) {
    return null;
  }

  const grouped = sameJanItems(items, janCode);
  if (grouped.length === 0) {
    return null;
  }

  const genreNames = [...first.parentGenreNames, first.genreName ?? ""].filter((value) => value.trim() !== "");
  const category = categoryFromGenres(genreNames);
  const brand = first.brandName?.trim() || "";
  const productId = `line_yh_${janCode}`;
  const variantId = `prd_yh_${janCode}`;
  const readings = grouped.map((item) => parseTitleQuantity(item.name));
  const agreed = selectPreferredQuantity([agreeShopQuantities(readings)]);
  const confirmed = canUseForUnitPrice(agreed.confidence);
  const description = confirmed
    ? "同じJANコードの販売情報を、ショップごとに比較しています。内容量は、複数ショップの商品名が同じ容量を示した場合だけ表示しています。"
    : "同じJANコードの販売情報を、ショップごとに比較しています。容量・重量は、この取得データには含まれていません。";

  const product = {
    id: productId,
    name: first.name.trim(),
    brand,
    category,
    description,
    unitPriceType: confirmed ? agreed.unitPriceType : ("none" as const),
    createdAt: observedAt,
    updatedAt: observedAt,
    isSample: false as const,
    imageUrl: first.imageUrl,
    genreName: first.genreName,
  };

  const variant: ProductVariant = {
    id: variantId,
    productId,
    slug: "yahoo-preview",
    sizeLabel: confirmed ? agreed.sizeLabel : unknownQuantityLabel,
    quantity: confirmed ? agreed.quantity : null,
    quantityUnit: confirmed ? agreed.quantityUnit : null,
    statedQuantity: agreed.statedQuantity,
    statedUnit: agreed.statedUnit,
    quantityConfidence: agreed.confidence,
    quantitySource: agreed.source,
    janCode,
    modelNumber: null,
    artVariant: 1,
    description,
    popular: false,
    recommended: false,
    createdAt: observedAt,
    updatedAt: observedAt,
    isSample: false,
  };

  const offers: ShopOffer[] = [];
  const prices: PriceSnapshot[] = [];
  for (const item of grouped) {
    const shopToken = token(item.sellerId ?? "shop");
    const codeToken = token(item.code ?? item.url ?? item.name);
    const offerId = `off_yh_${shopToken}_${codeToken}`;
    const shipping = mapYahooShipping(item.shipping);
    offers.push({
      id: offerId,
      variantId,
      shopName: item.sellerName?.trim() || "ショップ名未設定",
      productUrl: item.url,
      affiliateUrl: null,
      source: "yahoo",
      provider: "yahoo",
      sellerId: item.sellerId,
      itemCode: item.code,
      isSample: false,
    });
    prices.push({
      id: `prc_${offerId}`,
      offerId,
      price: item.price,
      shippingFee: shipping.shippingFee,
      shippingStatus: shipping.shippingStatus,
      stockStatus: mapStock(item.inStock),
      observedAt,
    });
  }

  const viewOffers = offers.map((offer, index) => {
    const price = prices[index];
    const reading = readings[index];
    const packCount = reading?.packConfidence === "high" ? reading.packCount : null;
    const packUnit = reading?.packConfidence === "high" ? reading.packUnit : null;
    const listingTitle = grouped[index]?.name ?? "";
    const sameUnit =
      confirmed &&
      reading?.sizeConfidence === "high" &&
      reading.quantity === agreed.quantity &&
      reading.quantityUnit === agreed.quantityUnit &&
      !hasUnresolvedPackNotation(listingTitle);
    return {
      id: offer.id,
      variantId: offer.variantId,
      shopName: offer.shopName,
      listingTitle: grouped[index]?.name.trim() || null,
      price: price?.price ?? null,
      shippingFee: price?.shippingFee ?? null,
      productUrl: offer.productUrl,
      affiliateUrl: null,
      priceCheckedAt: price?.observedAt ?? null,
      priceSnapshotId: price?.id ?? null,
      shippingStatus: price?.shippingStatus ?? "unknown",
      stockStatus: price?.stockStatus ?? "unknown",
      source: "yahoo" as const,
      provider: "yahoo" as const,
      sellerId: offer.sellerId,
      itemCode: offer.itemCode,
      packCount,
      packUnit,
      totalQuantity: sameUnit ? totalQuantityOf(agreed.quantity, packCount) : null,
      unitPriceReady: sameUnit,
      isSample: false,
    };
  });
  const knownPrices = viewOffers.map((offer) => offer.price).filter((price): price is number => price != null);

  const detail: ProductDetail = {
    id: variant.id,
    productId: product.id,
    slug: variant.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    variant: variant.artVariant,
    janCode: variant.janCode,
    modelNumber: variant.modelNumber,
    sizeLabel: variant.sizeLabel,
    description: variant.description,
    quantity: variant.quantity,
    quantityUnit: variant.quantityUnit,
    statedQuantity: variant.statedQuantity,
    statedUnit: variant.statedUnit,
    quantityConfidence: variant.quantityConfidence,
    quantitySource: variant.quantitySource,
    unitPriceType: product.unitPriceType,
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
    isSample: false,
    imageUrl: product.imageUrl,
    sourceCategoryName: product.genreName,
    popular: false,
    recommended: false,
    offers: viewOffers,
    lowestPrice: knownPrices.length > 0 ? Math.min(...knownPrices) : null,
    highestPrice: knownPrices.length > 0 ? Math.max(...knownPrices) : null,
    latestCheckedAt: observedAt,
  };

  return { product, variant, offers, prices, detail };
}
