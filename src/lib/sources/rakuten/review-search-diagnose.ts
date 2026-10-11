import https from "node:https";
import { rakutenReviewSearchRequest } from "./item-search.ts";

const timeoutMs = 12_000;

export type RakutenReviewDiagnosis = {
  keyword: string;
  httpStatus: number | null;
  reason: "not-configured" | "timeout" | "request-failed" | "rate-limited" | "unauthorized" | "parameter" | "not-found" | "unavailable" | "ok";
  items: number | null;
  errorCode: string | null;
  retryAfter: string | null;
  elapsedMs: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function redact(value: string, secrets: string[]): string {
  let text = value.replace(/\s+/g, " ").trim();
  for (const secret of secrets) {
    if (secret !== "") {
      text = text.split(secret).join("[redacted]");
    }
  }
  return text.replace(/applicationId|accessKey|affiliateId|pk_[A-Za-z0-9_-]+/gi, "[redacted]").slice(0, 120);
}

function errorCode(payload: unknown, secrets: string[]): string | null {
  const body = asRecord(payload);
  const nested = asRecord(body?.errors);
  const parts = [body?.error, body?.error_description, nested?.errorCode, nested?.errorMessage].filter(
    (part) => typeof part === "string" || typeof part === "number",
  );
  if (parts.length === 0) {
    return null;
  }
  return redact(parts.join(": "), secrets);
}

function classify(status: number): RakutenReviewDiagnosis["reason"] {
  if (status === 200) return "ok";
  if (status === 429) return "rate-limited";
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 400) return "parameter";
  if (status === 404) return "not-found";
  if (status === 408 || status === 504 || status >= 500) return "unavailable";
  return "request-failed";
}

function requestOnce(url: URL, headers: Record<string, string>): Promise<{ status: number; text: string; retryAfter: string | null }> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: "GET", headers, timeout: timeoutMs }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 0,
          text: Buffer.concat(chunks).toString("utf8"),
          retryAfter: res.headers["retry-after"]?.toString() ?? null,
        });
      });
    });
    req.on("timeout", () => {
      req.destroy(Object.assign(new Error("timeout"), { code: "TIMEOUT" }));
    });
    req.on("error", reject);
    req.end();
  });
}

export async function diagnoseRakutenReviewSearch(keyword: string): Promise<RakutenReviewDiagnosis> {
  const started = Date.now();
  const applicationId = process.env.RAKUTEN_APPLICATION_ID?.trim() ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim() ?? "";
  if (applicationId === "" || accessKey === "") {
    return {
      keyword,
      httpStatus: null,
      reason: "not-configured",
      items: null,
      errorCode: null,
      retryAfter: null,
      elapsedMs: Date.now() - started,
    };
  }
  const { url, headers } = rakutenReviewSearchRequest(applicationId, accessKey, keyword);
  const secrets = [applicationId, accessKey];
  try {
    const response = await requestOnce(url, headers);
    let payload: unknown = null;
    try {
      payload = JSON.parse(response.text);
    } catch {
      payload = null;
    }
    const body = asRecord(payload);
    const rawItems = body?.items ?? body?.Items;
    return {
      keyword,
      httpStatus: response.status,
      reason: classify(response.status),
      items: Array.isArray(rawItems) ? rawItems.length : null,
      errorCode: response.status === 200 ? null : errorCode(payload, secrets),
      retryAfter: response.retryAfter,
      elapsedMs: Date.now() - started,
    };
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    return {
      keyword,
      httpStatus: null,
      reason: code === "TIMEOUT" ? "timeout" : "request-failed",
      items: null,
      errorCode: code === "" ? null : redact(code, secrets),
      retryAfter: null,
      elapsedMs: Date.now() - started,
    };
  }
}
