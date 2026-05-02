import fs from "fs/promises";
import {
  HarFile,
  HarEntry,
  DetailedRequest,
  ModifiedRequest,
  MissingRequest,
} from "../types/harTypes";

import {
  extractQueryParams,
  headersArrayToObject,
  buildRequestKey,
  areRequestsEqual,
  tryParseJson,
} from "../utils/requestUtils";

import { diffObjects } from "../utils/diffUtils";

// -------------------- PARSE + VALIDATE --------------------

const parseJson = (content: string): HarFile => {
  try {
    return JSON.parse(content);
  } catch {
    throw new Error("Invalid JSON format");
  }
};

const validateHar = (har: HarFile) => {
  if (!har.log?.entries || !Array.isArray(har.log.entries)) {
    throw new Error("Invalid HAR structure");
  }
};

// -------------------- TRANSFORM --------------------

const extractDetailedRequests = (
  entries: HarEntry[]
): DetailedRequest[] => {
  return entries
    .map((entry) => {
      const url = entry.request?.url;
      if (!url) return undefined;

      let baseUrl = url;

      try {
        const parsed = new URL(url);
        baseUrl = parsed.origin + parsed.pathname;
      } catch {
        // ignore invalid URLs
      }

      return {
        method: entry.request?.method || "GET",
        baseUrl,
        queryParams: extractQueryParams(url),
        headers: headersArrayToObject(entry.request?.headers),
        body: entry.request?.postData?.text,
        status: entry.response?.status ?? 0,
        time: entry.response?.startedDateTime || "",
      };
    })
    .filter((r): r is DetailedRequest => r !== undefined);
};

// -------------------- GROUPING --------------------

const buildRequestMap = (requests: DetailedRequest[]) => {
  const map = new Map<string, DetailedRequest[]>();

  for (const req of requests) {
    const key = buildRequestKey(req);

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(req);
  }

  return map;
};

// -------------------- MAIN --------------------

export const processHarFiles = async (
  filePath1: string,
  filePath2: string
) => {
  const file1Content = await fs.readFile(filePath1, "utf-8");
  const file2Content = await fs.readFile(filePath2, "utf-8");

  const har1 = parseJson(file1Content);
  const har2 = parseJson(file2Content);

  validateHar(har1);
  validateHar(har2);

  const reqs1 = extractDetailedRequests(har1.log!.entries!);
  const reqs2 = extractDetailedRequests(har2.log!.entries!);

  const map1 = buildRequestMap(reqs1);
  const map2 = buildRequestMap(reqs2);

  // -------------------- MISSING --------------------

  const missingRequests: MissingRequest[] = [];

  const allKeys = new Set([...map1.keys(), ...map2.keys()]);

  for (const key of allKeys) {
    const r1 = map1.get(key) || [];
    const r2 = map2.get(key) || [];

    if (r1.length !== r2.length) {
      missingRequests.push({
        key,
        file1Count: r1.length,
        file2Count: r2.length,
        difference: Math.abs(r1.length - r2.length),
      });
    }
  }

  // -------------------- MODIFIED --------------------

  const modifiedRequests: ModifiedRequest[] = [];

  for (const [key, r1] of map1.entries()) {
    const r2 = map2.get(key);
    if (!r2) continue;

    const unmatched1 = [...r1];
    const unmatched2 = [...r2];

    // Step 1: remove exact matches
    for (let i = unmatched1.length - 1; i >= 0; i--) {
      const matchIndex = unmatched2.findIndex((b) =>
        areRequestsEqual(unmatched1[i], b)
      );

      if (matchIndex !== -1) {
        unmatched1.splice(i, 1);
        unmatched2.splice(matchIndex, 1);
      }
    }

    // Step 2: build structured diffs
    const min = Math.min(unmatched1.length, unmatched2.length);

    for (let i = 0; i < min; i++) {
      const a = unmatched1[i];
      const b = unmatched2[i];

      modifiedRequests.push({
        key,
        file1: a,
        file2: b,
        diff: {
          key,
          request: {
            headers: diffObjects(a.headers, b.headers),
            body: diffObjects(
              tryParseJson(a.body) || { raw: a.body },
              tryParseJson(b.body) || { raw: b.body }
            ),
          },
          response: {
            headers: diffObjects({}, {}), // placeholder for future expansion
          },
        },
      });
    }
  }

  // -------------------- RESPONSE --------------------

  return {
    message: "HAR comparison complete",

    summary: {
      file1TotalRequests: reqs1.length,
      file2TotalRequests: reqs2.length,
      missingRequestGroups: missingRequests.length,
      modifiedRequestPairs: modifiedRequests.length,
    },

    insights: {
      missingRequests,
      modifiedRequests,
    },

    aiReadySummary: {
      totalDifferences:
        missingRequests.length + modifiedRequests.length,
      biggestChangeArea: "headers/body/cookies (future expansion)",
    },

    sample: {
      missingRequests: missingRequests.slice(0, 5),
      modifiedRequests: modifiedRequests.slice(0, 5),
    },
  };
};