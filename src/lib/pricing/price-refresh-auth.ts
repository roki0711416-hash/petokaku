import { timingSafeEqual } from "node:crypto";

export function authorizePriceRefresh(authorization: string | null, secret: string | undefined): boolean {
  const expected = secret?.trim() ?? "";
  if (expected === "") {
    return false;
  }
  const provided = authorization?.match(/^Bearer\s+(\S+)\s*$/)?.[1] ?? "";
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  if (providedBytes.length === 0 || providedBytes.length !== expectedBytes.length) {
    return false;
  }
  return timingSafeEqual(providedBytes, expectedBytes);
}
