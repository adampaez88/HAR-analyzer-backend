import { DetailedRequest } from "../types/harTypes";

// Extract query params
export const extractQueryParams = (url: string): Record<string, string> => {
  try {
    const parsed = new URL(url);
    const params: Record<string, string> = {};

    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch {
    return {};
  }
};

// Normalize query params (ORDER INDEPENDENT)
export const normalizeQueryParams = (params: Record<string, string>) => {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
};

// Headers array → object
export const headersArrayToObject = (
  headers: { name: string; value: string }[] = []
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const h of headers) {
    result[h.name.toLowerCase()] = h.value;
  }

  return result;
};

// Request identity key
export const buildRequestKey = (req: DetailedRequest): string => {
  const normalizedQuery = normalizeQueryParams(req.queryParams);

  return `${req.method}::${req.baseUrl}::${normalizedQuery}`;
};

// Deep equality for modification detection
export const areRequestsEqual = (
  a: DetailedRequest,
  b: DetailedRequest
): boolean => {
  return (
    JSON.stringify(a.headers) === JSON.stringify(b.headers) &&
    (a.body || "") === (b.body || "")
  );
};

export const tryParseJson = (text?: string): any | null => {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const cookiesArrayToObject = (cookies: any[] = []) => {
  const result: Record<string, string> = {};

  cookies.forEach((c) => {
    if (c.name) {
      result[c.name.toLowerCase()] = c.value;
    }
  });

  return result;
};

export const extractSetCookiesFromHeaders = (
  headers: Record<string, string>
) => {
  const result: Record<string, string> = {};

  const setCookieHeader = headers["set-cookie"];

  if (!setCookieHeader) return result;

  // handle single or multiple cookies
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  cookies.forEach((cookieStr) => {
    const [pair] = cookieStr.split(";");
    const [name, value] = pair.split("=");

    if (name && value) {
      result[name.trim().toLowerCase()] = value.trim();
    }
  });

  return result;
};