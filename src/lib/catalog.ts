import offersFile from "@/data/offers.json";
import pricesFile from "@/data/prices.json";
import productsFile from "@/data/products.json";
import variantsFile from "@/data/variants.json";
import { isCategoryId } from "@/lib/categories";
import { findIdentityIssue, identityIssueMessage } from "@/lib/match";
import { isKnownQuantityUnit, isKnownUnitPriceType, normalizedAmount, type QuantityUnit } from "@/lib/pricing/calculate";
import { salesUnitGroupHeading, salesUnitGroupNote, salesUnitSort } from "@/lib/pricing/pack-count";
import {
  stockStatuses,
  type Offer,
  type PriceSnapshot,
  type Product,
  type ProductCardModel,
  type ProductDetail,
  type ProductVariant,
  type ShopOffer,
  type StockStatus,
} from "@/lib/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string, label: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label}の「${key}」が空です`);
  }
  return value.trim();
}

function nullableString(record: Record<string, unknown>, key: string, label: string): string | null {
  const value = record[key];
  if (value === null) {
    return null;
  }
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label}の「${key}」は文字か null にしてください`);
  }
  return value.trim();
}

function requiredBoolean(record: Record<string, unknown>, key: string, label: string): boolean {
  const value = record[key];
  if (typeof value !== "boolean") {
    throw new Error(`${label}の「${key}」が正しくありません`);
  }
  return value;
}

function requiredDate(record: Record<string, unknown>, key: string, label: string): string {
  const value = requiredString(record, key, label);
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${label}の「${key}」の日時が正しくありません`);
  }
  return value;
}

function nullableYen(record: Record<string, unknown>, key: string, label: string): number | null {
  const value = record[key];
  if (value === null) {
    return null;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 10_000_000) {
    throw new Error(`${label}の「${key}」は0円以上の整数にしてください`);
  }
  return value;
}

function assertSampleNotice(file: unknown, label: string): Record<string, unknown> {
  if (!isRecord(file)) {
    throw new Error(`${label}の形式が正しくありません`);
  }
  const notice = file.notice;
  if (typeof notice !== "string" || !notice.includes("サンプル")) {
    throw new Error(`${label}に、サンプルである旨の注意書きがありません`);
  }
  return file;
}

function parseProduct(value: unknown): Product {
  if (!isRecord(value)) {
    throw new Error("商品データの1件が正しくありません");
  }
  const id = requiredString(value, "id", "商品");
  if (!/^line_[a-z0-9_]+$/.test(id)) {
    throw new Error(`商品IDの形式が正しくありません: ${id}`);
  }
  const category = requiredString(value, "category", id);
  if (!isCategoryId(category)) {
    throw new Error(`商品カテゴリーが正しくありません: ${id}`);
  }
  if (value.isSample !== true) {
    throw new Error(`サンプル商品には isSample: true が必要です: ${id}`);
  }
  const unitPriceType = requiredString(value, "unitPriceType", id);
  if (!isKnownUnitPriceType(unitPriceType)) {
    throw new Error(`単価の種類が正しくありません: ${id}`);
  }
  return {
    id,
    name: requiredString(value, "name", id),
    brand: requiredString(value, "brand", id),
    category,
    description: requiredString(value, "description", id),
    unitPriceType,
    createdAt: requiredDate(value, "createdAt", id),
    updatedAt: requiredDate(value, "updatedAt", id),
    isSample: true,
  };
}

function parseVariant(value: unknown): ProductVariant {
  if (!isRecord(value)) {
    throw new Error("容量データの1件が正しくありません");
  }
  const id = requiredString(value, "id", "容量");
  if (!/^prd_[a-z0-9_]+$/.test(id)) {
    throw new Error(`容量IDの形式が正しくありません: ${id}`);
  }
  const slug = requiredString(value, "slug", id);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`商品URLの形式が正しくありません: ${id}`);
  }
  const artVariant = value.artVariant;
  if (typeof artVariant !== "number" || !Number.isInteger(artVariant) || artVariant < 1 || artVariant > 6) {
    throw new Error(`商品画像の種類が正しくありません: ${id}`);
  }
  if (value.isSample !== true) {
    throw new Error(`サンプルの容量には isSample: true が必要です: ${id}`);
  }
  const janCode = nullableString(value, "janCode", id);
  if (janCode && !/^[0-9]{13}$/.test(janCode)) {
    throw new Error(`JANコードは13桁の数字にしてください: ${id}`);
  }
  let quantity: number | null = null;
  if (value.quantity != null) {
    if (typeof value.quantity !== "number" || !Number.isFinite(value.quantity) || value.quantity <= 0 || value.quantity > 1_000_000) {
      throw new Error(`容量の数値が正しくありません: ${id}`);
    }
    quantity = value.quantity;
  }
  let quantityUnit: QuantityUnit | null = null;
  if (value.quantityUnit != null) {
    if (typeof value.quantityUnit !== "string" || !isKnownQuantityUnit(value.quantityUnit)) {
      throw new Error(`容量の単位が正しくありません: ${id}`);
    }
    quantityUnit = value.quantityUnit;
  }
  return {
    id,
    productId: requiredString(value, "productId", id),
    slug,
    sizeLabel: requiredString(value, "sizeLabel", id),
    quantity,
    quantityUnit,
    statedQuantity: null,
    statedUnit: null,
    quantityConfidence: quantity != null ? "high" : "unknown",
    quantitySource: quantity != null ? "sample" : null,
    janCode,
    modelNumber: nullableString(value, "modelNumber", id),
    artVariant,
    description: requiredString(value, "description", id),
    popular: requiredBoolean(value, "popular", id),
    recommended: requiredBoolean(value, "recommended", id),
    createdAt: requiredDate(value, "createdAt", id),
    updatedAt: requiredDate(value, "updatedAt", id),
    isSample: true,
  };
}

function parseShopOffer(value: unknown): ShopOffer {
  if (!isRecord(value)) {
    throw new Error("販売情報の1件が正しくありません");
  }
  const id = requiredString(value, "id", "販売情報");
  if (!/^off_[a-z0-9_]+$/.test(id)) {
    throw new Error(`販売情報IDの形式が正しくありません: ${id}`);
  }
  if (value.isSample !== true || value.source !== "sample") {
    throw new Error(`サンプルの販売情報だけを読み込めます: ${id}`);
  }
  if (value.productUrl !== null || value.affiliateUrl !== null) {
    throw new Error(`サンプルの販売情報にリンク先は入れられません: ${id}`);
  }
  return {
    id,
    variantId: requiredString(value, "variantId", id),
    shopName: requiredString(value, "shopName", id),
    productUrl: null,
    affiliateUrl: null,
    source: "sample",
    provider: "sample",
    sellerId: null,
    itemCode: null,
    isSample: true,
  };
}

function parsePriceSnapshot(value: unknown): PriceSnapshot {
  if (!isRecord(value)) {
    throw new Error("価格記録の1件が正しくありません");
  }
  const id = requiredString(value, "id", "価格記録");
  if (!/^prc_[a-z0-9_]+$/.test(id)) {
    throw new Error(`価格記録IDの形式が正しくありません: ${id}`);
  }
  const stockStatus = requiredString(value, "stockStatus", id);
  if (!stockStatuses.includes(stockStatus as StockStatus)) {
    throw new Error(`在庫情報の値が正しくありません: ${id}`);
  }
  const shippingFee = nullableYen(value, "shippingFee", id);
  return {
    id,
    offerId: requiredString(value, "offerId", id),
    price: nullableYen(value, "price", id),
    shippingFee,
    shippingStatus: shippingFee === 0 ? "free" : shippingFee == null ? "unknown" : "amount",
    stockStatus: stockStatus as StockStatus,
    observedAt: requiredDate(value, "observedAt", id),
  };
}

function latestSnapshot(snapshots: PriceSnapshot[]): PriceSnapshot | null {
  if (snapshots.length === 0) {
    return null;
  }
  return [...snapshots].sort((left, right) => left.observedAt.localeCompare(right.observedAt) || left.id.localeCompare(right.id)).at(-1) ?? null;
}

function loadCatalog(): ProductDetail[] {
  const productFile = assertSampleNotice(productsFile, "商品データ");
  const variantFile = assertSampleNotice(variantsFile, "容量データ");
  const offerFile = assertSampleNotice(offersFile, "販売情報");
  const priceFile = assertSampleNotice(pricesFile, "価格記録");
  if (!Array.isArray(productFile.products) || !Array.isArray(variantFile.variants) || !Array.isArray(offerFile.offers) || !Array.isArray(priceFile.prices)) {
    throw new Error("商品、容量、販売情報、価格記録の一覧がありません");
  }

  const products = productFile.products.map(parseProduct);
  const variants = variantFile.variants.map(parseVariant);
  const shopOffers = offerFile.offers.map(parseShopOffer);
  const snapshots = priceFile.prices.map(parsePriceSnapshot);
  const productById = new Map(products.map((product) => [product.id, product]));

  for (const variant of variants) {
    if (!productById.has(variant.productId)) {
      throw new Error(`容量の商品が見つかりません: ${variant.id}`);
    }
  }

  const identity = variants.map((variant) => {
    const product = productById.get(variant.productId);
    return {
      id: variant.id,
      name: product?.name ?? "",
      brand: product?.brand ?? "",
      janCode: variant.janCode,
      sizeLabel: variant.sizeLabel,
    };
  });
  const issue = findIdentityIssue(identity);
  if (issue) {
    throw new Error(identityIssueMessage(issue));
  }

  const slugs = new Set<string>();
  for (const variant of variants) {
    if (slugs.has(variant.slug)) {
      throw new Error(`商品URLが重複しています: ${variant.slug}`);
    }
    slugs.add(variant.slug);
  }

  const offerIds = new Set<string>();
  const variantIds = new Set(variants.map((variant) => variant.id));
  for (const offer of shopOffers) {
    if (offerIds.has(offer.id)) {
      throw new Error(`販売情報IDが重複しています: ${offer.id}`);
    }
    offerIds.add(offer.id);
    if (!variantIds.has(offer.variantId)) {
      throw new Error(`販売情報の容量が見つかりません: ${offer.id}`);
    }
  }

  const snapshotIds = new Set<string>();
  for (const snapshot of snapshots) {
    if (snapshotIds.has(snapshot.id)) {
      throw new Error(`価格記録IDが重複しています: ${snapshot.id}`);
    }
    snapshotIds.add(snapshot.id);
    if (!offerIds.has(snapshot.offerId)) {
      throw new Error(`価格記録の販売情報が見つかりません: ${snapshot.id}`);
    }
  }

  return variants.map((variant) => {
    const product = productById.get(variant.productId);
    if (!product) {
      throw new Error(`容量の商品が見つかりません: ${variant.id}`);
    }
    const offers = shopOffers
      .filter((offer) => offer.variantId === variant.id)
      .map((offer) => {
        const current = latestSnapshot(snapshots.filter((snapshot) => snapshot.offerId === offer.id));
        return {
          id: offer.id,
          variantId: offer.variantId,
          shopName: offer.shopName,
          listingTitle: null,
          price: current?.price ?? null,
          shippingFee: current?.shippingFee ?? null,
          productUrl: offer.productUrl,
          affiliateUrl: offer.affiliateUrl,
          priceCheckedAt: current?.observedAt ?? null,
          priceSnapshotId: current?.id ?? null,
          shippingStatus: current?.shippingStatus ?? "unknown",
          stockStatus: current?.stockStatus ?? "unknown",
          source: offer.source,
          provider: offer.provider,
          sellerId: offer.sellerId,
          itemCode: offer.itemCode,
          packCount: null,
          packUnit: null,
          totalQuantity: null,
          unitPriceReady: true,
          isSample: offer.isSample,
        };
      });
    const prices = offers.map((offer) => offer.price).filter((price): price is number => price != null);
    const checked = offers.map((offer) => offer.priceCheckedAt).filter((value): value is string => value != null).sort();

    return {
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
      isSample: true,
      imageUrl: null,
      sourceCategoryName: null,
      popular: variant.popular,
      recommended: variant.recommended,
      offers,
      lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
      highestPrice: prices.length > 0 ? Math.max(...prices) : null,
      latestCheckedAt: checked.at(-1) ?? null,
    };
  });
}

const catalog = loadCatalog();

export function getAllProducts(): ProductDetail[] {
  return catalog;
}

export function getProduct(idOrSlug: string): ProductDetail | undefined {
  return catalog.find((product) => product.slug === idOrSlug || product.id === idOrSlug);
}

export function productPath(product: { slug: string }): string {
  return `/products/${product.slug}`;
}

export function getPopularProducts(limit = 4): ProductDetail[] {
  return catalog.filter((product) => product.popular).slice(0, limit);
}

export function getRecommendedProducts(limit = 4): ProductDetail[] {
  return catalog.filter((product) => product.recommended).slice(0, limit);
}

export function getOtherSizes(product: { id: string; brand: string; name: string }): ProductDetail[] {
  return catalog.filter(
    (item) => item.id !== product.id && item.brand === product.brand && item.name === product.name,
  );
}

export function getSizeGroup(product: ProductDetail): ProductDetail[] {
  const members = catalog.filter((item) => item.productId === product.productId);
  if (members.length < 2) {
    return [];
  }
  return members.sort((left, right) => {
    const leftAmount = normalizedAmount(left.quantity, left.quantityUnit) ?? Number.POSITIVE_INFINITY;
    const rightAmount = normalizedAmount(right.quantity, right.quantityUnit) ?? Number.POSITIVE_INFINITY;
    return leftAmount - rightAmount;
  });
}

export function toProductCard(product: ProductDetail): ProductCardModel {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    sizeLabel: product.sizeLabel,
    variant: product.variant,
    lowestPrice: product.lowestPrice,
    highestPrice: product.highestPrice,
    shopCount: product.offers.length,
  };
}

export function offerTotal(offer: Offer): number | null {
  if (offer.price == null || offer.shippingFee == null) {
    return null;
  }
  return offer.price + offer.shippingFee;
}

export function lowestComparableTotal(offers: Offer[]): number | null {
  let lowest: number | null = null;
  for (const offer of offers) {
    const total = offerTotal(offer);
    if (total == null) {
      continue;
    }
    if (lowest == null || total < lowest) {
      lowest = total;
    }
  }
  return lowest;
}

export type RankedOffer = {
  offer: Offer;
  total: number | null;
  isLowestPrice: boolean;
  isLowestTotal: boolean;
};

export function rankOffersByTotal(offers: Offer[]): RankedOffer[] {
  const comparable = offers
    .map((offer) => ({ offer, total: offerTotal(offer) }))
    .filter((item): item is { offer: Offer; total: number } => item.total != null)
    .sort((left, right) => left.total - right.total);
  const unknownShipping = offers
    .filter((offer) => offerTotal(offer) == null)
    .sort((left, right) => (left.price ?? Number.POSITIVE_INFINITY) - (right.price ?? Number.POSITIVE_INFINITY));
  const lowestTotal = comparable[0]?.total;
  const lowestPrice = offers.reduce<number | null>((lowest, offer) => {
    if (offer.price == null) {
      return lowest;
    }
    return lowest == null || offer.price < lowest ? offer.price : lowest;
  }, null);

  return [...comparable, ...unknownShipping.map((offer) => ({ offer, total: null }))].map((item) => ({
    offer: item.offer,
    total: item.total,
    isLowestPrice: item.offer.price != null && item.offer.price === lowestPrice,
    isLowestTotal: item.total != null && item.total === lowestTotal,
  }));
}

export type SalesUnitGroup = {
  packCount: number | null;
  offers: Offer[];
  heading: string;
  note: string;
  lowestTotal: number | null;
};

export function groupOffersBySalesUnit(offers: Offer[]): SalesUnitGroup[] {
  const buckets = new Map<string, Offer[]>();
  for (const offer of offers) {
    const key = offer.packCount == null ? "unknown" : String(offer.packCount);
    const grouped = buckets.get(key) ?? [];
    grouped.push(offer);
    buckets.set(key, grouped);
  }

  return [...buckets.entries()]
    .map(([key, grouped]) => {
      const packCount = key === "unknown" ? null : Number(key);
      return {
        packCount,
        offers: grouped,
        heading: salesUnitGroupHeading(packCount, grouped.map((offer) => offer.packUnit)),
        note: salesUnitGroupNote(packCount),
        lowestTotal: lowestComparableTotal(grouped.filter((offer) => offer.stockStatus === "in_stock")),
      };
    })
    .sort((left, right) => salesUnitSort(left.packCount) - salesUnitSort(right.packCount));
}
