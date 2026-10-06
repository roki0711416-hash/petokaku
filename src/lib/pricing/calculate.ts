export const quantityUnits = ["g", "kg", "ml", "l", "sheet", "piece"] as const;

export type QuantityUnit = (typeof quantityUnits)[number];

export const unitPriceTypes = ["per_100g", "per_kg", "per_l", "per_sheet", "per_piece", "none"] as const;

export type UnitPriceType = (typeof unitPriceTypes)[number];

export type MoneyQuote = {
  yen: number;
  exact: boolean;
};

export type UnitPriceResult = {
  itemUnit: MoneyQuote | null;
  effectiveUnit: MoneyQuote | null;
  total: number | null;
  unitLabel: string | null;
};

export type SaleMoney = {
  price: number | null;
  shipping: number | null;
};

export type SizeCandidate = {
  id: string;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
  offers: SaleMoney[];
};

export type SizeComparisonRow = {
  id: string;
  total: number | null;
  effectiveUnit: MoneyQuote | null;
  unitLabel: string | null;
  isBestUnitPrice: boolean;
};

const unitLabels: Record<Exclude<UnitPriceType, "none">, string> = {
  per_100g: "100g",
  per_kg: "kg",
  per_l: "L",
  per_sheet: "枚",
  per_piece: "本",
};

function isQuantityUnit(value: string): value is QuantityUnit {
  return quantityUnits.some((unit) => unit === value);
}

function isUnitPriceType(value: string): value is UnitPriceType {
  return unitPriceTypes.some((type) => type === value);
}

export function shippingInclusiveTotal(price: number | null, shipping: number | null): number | null {
  if (price == null || shipping == null) {
    return null;
  }
  if (!Number.isInteger(price) || !Number.isInteger(shipping) || price < 0 || shipping < 0) {
    return null;
  }
  return price + shipping;
}

function normalizedBase(quantity: number | null, unit: QuantityUnit | null): { kind: "mass" | "volume" | "count"; amount: number } | null {
  if (quantity == null || unit == null || !Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  let amount = quantity;
  let kind: "mass" | "volume" | "count";
  if (unit === "g") {
    kind = "mass";
  } else if (unit === "kg") {
    kind = "mass";
    amount = quantity * 1000;
  } else if (unit === "ml") {
    kind = "volume";
  } else if (unit === "l") {
    kind = "volume";
    amount = quantity * 1000;
  } else {
    kind = "count";
  }

  const rounded = Math.round(amount);
  if (!Number.isSafeInteger(rounded) || rounded <= 0 || Math.abs(amount - rounded) > 0.000_001) {
    return null;
  }
  return { kind, amount: rounded };
}

function scaleFor(type: Exclude<UnitPriceType, "none">, kind: "mass" | "volume" | "count"): number | null {
  if (type === "per_100g" && kind === "mass") {
    return 100;
  }
  if (type === "per_kg" && kind === "mass") {
    return 1000;
  }
  if (type === "per_l" && kind === "volume") {
    return 1000;
  }
  if ((type === "per_sheet" || type === "per_piece") && kind === "count") {
    return 1;
  }
  return null;
}

function quoteFrom(amountYen: number, scale: number, base: number): MoneyQuote | null {
  if (!Number.isInteger(amountYen) || amountYen < 0 || !Number.isInteger(scale) || !Number.isInteger(base) || base <= 0) {
    return null;
  }
  const numerator = amountYen * scale;
  if (!Number.isSafeInteger(numerator)) {
    return null;
  }
  return {
    yen: Math.round(numerator / base),
    exact: numerator % base === 0,
  };
}

export function calculateUnitPrices(input: {
  price: number | null;
  shipping: number | null;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  unitPriceType: UnitPriceType;
}): UnitPriceResult {
  const empty: UnitPriceResult = { itemUnit: null, effectiveUnit: null, total: null, unitLabel: null };
  if (input.unitPriceType === "none") {
    return empty;
  }

  const base = normalizedBase(input.quantity, input.quantityUnit);
  if (!base) {
    return empty;
  }

  const scale = scaleFor(input.unitPriceType, base.kind);
  if (scale == null || input.price == null) {
    return empty;
  }

  const itemUnit = quoteFrom(input.price, scale, base.amount);
  const total = shippingInclusiveTotal(input.price, input.shipping);
  const effectiveUnit = total == null ? null : quoteFrom(total, scale, base.amount);

  return {
    itemUnit,
    effectiveUnit,
    total,
    unitLabel: unitLabels[input.unitPriceType],
  };
}

export function lowestShippingTotal(offers: SaleMoney[]): { total: number; price: number; shipping: number } | null {
  let best: { total: number; price: number; shipping: number } | null = null;
  for (const offer of offers) {
    const total = shippingInclusiveTotal(offer.price, offer.shipping);
    if (total == null || offer.price == null || offer.shipping == null) {
      continue;
    }
    if (!best || total < best.total) {
      best = { total, price: offer.price, shipping: offer.shipping };
    }
  }
  return best;
}

export function compareSizes(items: SizeCandidate[]): SizeComparisonRow[] {
  const rows = items.map((item) => {
    const best = lowestShippingTotal(item.offers);
    if (!best) {
      const probe = calculateUnitPrices({
        price: item.offers.find((offer) => offer.price != null)?.price ?? null,
        shipping: null,
        quantity: item.quantity,
        quantityUnit: item.quantityUnit,
        unitPriceType: item.unitPriceType,
      });
      return {
        id: item.id,
        total: null,
        effectiveUnit: null,
        unitLabel: probe.unitLabel,
        isBestUnitPrice: false,
      };
    }
    const priced = calculateUnitPrices({
      price: best.price,
      shipping: best.shipping,
      quantity: item.quantity,
      quantityUnit: item.quantityUnit,
      unitPriceType: item.unitPriceType,
    });
    return {
      id: item.id,
      total: best.total,
      effectiveUnit: priced.effectiveUnit,
      unitLabel: priced.unitLabel,
      isBestUnitPrice: false,
    };
  });

  const comparable = rows.filter((row) => row.effectiveUnit != null);
  const lowest = comparable.reduce<number | null>((min, row) => {
    const yen = row.effectiveUnit?.yen;
    if (yen == null) {
      return min;
    }
    return min == null || yen < min ? yen : min;
  }, null);

  if (lowest == null) {
    return rows;
  }

  return rows.map((row) => ({
    ...row,
    isBestUnitPrice: row.effectiveUnit?.yen === lowest,
  }));
}

export function normalizedAmount(quantity: number | null, unit: QuantityUnit | null): number | null {
  return normalizedBase(quantity, unit)?.amount ?? null;
}

function nullableInteger(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 10_000_000) {
    return null;
  }
  return value;
}

function nullableQuantity(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 1_000_000) {
    return null;
  }
  return value;
}

export type MappedExternalSale = {
  price: number | null;
  shipping: number | null;
  quantity: number | null;
  quantityUnit: QuantityUnit | null;
  janCode: string | null;
  productUrl: string | null;
  stockStatus: "in_stock" | "out_of_stock" | "unknown";
};

export function mapExternalSale(record: Record<string, unknown> | null | undefined): MappedExternalSale {
  const source = record ?? {};
  const unitRaw = source.quantityUnit;
  const stockRaw = source.stockStatus;
  const janRaw = source.janCode;
  const urlRaw = source.productUrl ?? source.url;
  return {
    price: nullableInteger(source.price),
    shipping: nullableInteger(source.shipping ?? source.shippingFee),
    quantity: nullableQuantity(source.quantity),
    quantityUnit: typeof unitRaw === "string" && isQuantityUnit(unitRaw) ? unitRaw : null,
    janCode: typeof janRaw === "string" && /^[0-9]{13}$/.test(janRaw) ? janRaw : null,
    productUrl: typeof urlRaw === "string" && /^https?:\/\//.test(urlRaw) ? urlRaw : null,
    stockStatus: stockRaw === "in_stock" || stockRaw === "out_of_stock" ? stockRaw : "unknown",
  };
}

export function isKnownQuantityUnit(value: string): value is QuantityUnit {
  return isQuantityUnit(value);
}

export function isKnownUnitPriceType(value: string): value is UnitPriceType {
  return isUnitPriceType(value);
}
