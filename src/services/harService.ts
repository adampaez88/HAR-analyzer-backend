// harService.ts
import fs from "fs/promises";
import { HarFile, HarEntry } from "../types/harTypes";

// 🧠 Safe JSON parsing
const parseJson = (content: string): HarFile => {
  try {
    return JSON.parse(content);
  } catch {
    throw new Error("Invalid JSON format");
  }
};

// 🧠 Validate HAR structure
const validateHar = (har: HarFile) => {
  if (!har.log?.entries || !Array.isArray(har.log.entries)) {
    throw new Error("Invalid HAR structure");
  }
};

// 🧠 Normalize URL (remove query params)
const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname;
  } catch {
    return url;
  }
};

// 🧠 Extract + clean requests (BLOCKED requests included as status = 0)
const extractRequests = (
  entries: HarEntry[]
): { url: string; status: number, time: string }[] => {
  return entries
    .map((entry) => ({
      url: entry.request?.url ? normalizeUrl(entry.request.url) : undefined,
      status: entry.response?.status ?? 0, // 🚀 Treat undefined/missing status as 0
      time: entry.response?.startedDateTime,
    }))
    .filter((req): req is { url: string; status: number, time: string } => !!req.url); // include all requests with a URL
};

// 🧠 Build URL → status[] map (handles duplicates)
const buildStatusMap = (
  requests: { url: string; status: number; time: string }[]
) => {
  const map = new Map<string, { status: number; time: string }[]>();

  for (const req of requests) {
    if (!map.has(req.url)) map.set(req.url, []);
    map.get(req.url)!.push({ status: req.status, time: req.time });
  }

  return map;
};

// 🧠 Compare status arrays
const arraysEqual = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => val === sortedB[i]);
};

// 🧠 Compute metrics (success/failure rates) including blocked requests
const computeMetrics = (statuses: number[]) => {
  const total = statuses.length;
  const failures = statuses.filter((s) => s >= 400 || s === 0).length; // 🚀 status=0 counts as failure
  const success = statuses.filter((s) => s < 400).length;
  return {
    total,
    success,
    failures,
    failureRate: total === 0 ? 0 : failures / total,
  };
};

// 🚀 Main processing function
export const processHarFiles = async (
  filePath1: string,
  filePath2: string
) => {
  // Read files
  const file1Content = await fs.readFile(filePath1, "utf-8");
  const file2Content = await fs.readFile(filePath2, "utf-8");

  // Parse JSON
  const har1 = parseJson(file1Content);
  const har2 = parseJson(file2Content);

  // Validate HAR structure
  validateHar(har1);
  validateHar(har2);

  // Extract requests (includes blocked requests)
  const requests1 = extractRequests(har1.log!.entries!);
  const requests2 = extractRequests(har2.log!.entries!);

  // Build maps (URL → status[])
  const map1 = buildStatusMap(requests1);
  const map2 = buildStatusMap(requests2);

  // Find unique URLs
  const onlyInFile1 = [...map1.keys()].filter((url) => !map2.has(url));
  const onlyInFile2 = [...map2.keys()].filter((url) => !map1.has(url));

  // Find status mismatches
  const statusMismatches: {
    url: string;
    // file1Statuses: number[];
    // file2Statuses: number[];
    file1Requests: { status: number; time: string }[];
    file2Requests: { status: number; time: string }[];  
    file1Metrics: ReturnType<typeof computeMetrics>;
    file2Metrics: ReturnType<typeof computeMetrics>;
  }[] = [];

  for (const [url, statuses1] of map1.entries()) {
    if (!map2.has(url)) continue;

    const statuses2 = map2.get(url)!;

    const statusArray1 = statuses1.map((s) => s.status);
    const statusArray2 = statuses2.map((s) => s.status);

    if (!arraysEqual(statusArray1, statusArray2)) {
      statusMismatches.push({
        url,
        file1Requests: statuses1,
        file2Requests: statuses2,
        file1Metrics: computeMetrics(statusArray1),
        file2Metrics: computeMetrics(statusArray2),
      });
    }
  }

  // Build endpoint insights
  const endpointInsights = [];

  for (const [url, statuses1] of map1.entries()) {
    const statusArray1 = statuses1.map((s) => s.status);
    const metrics1 = computeMetrics(statusArray1);

    const statuses2 = map2.get(url);

    let metrics2 = null;

    if (statuses2) {
      const statusArray2 = statuses2.map((s) => s.status);
      metrics2 = computeMetrics(statusArray2);
    }

    endpointInsights.push({
      url,
      file1: metrics1,
      file2: metrics2,
    });
  }

  // Find worst endpoints (consider blocked requests)
  const worstEndpoints = endpointInsights
    .filter((e) => e.file1.failures > 0 || (e.file2?.failures ?? 0) > 0)
    .sort((a, b) => {
      const rateA = Math.max(a.file1.failureRate, a.file2?.failureRate ?? 0);
      const rateB = Math.max(b.file1.failureRate, b.file2?.failureRate ?? 0);
      return rateB - rateA;
    })
    .slice(0, 5);

  // Return result
  return {
    message: "HAR comparison complete",

    summary: {
      file1TotalRequests: requests1.length,
      file2TotalRequests: requests2.length,
      uniqueUrlsFile1: map1.size,
      uniqueUrlsFile2: map2.size,
      onlyInFile1: onlyInFile1.length,
      onlyInFile2: onlyInFile2.length,
      statusMismatches: statusMismatches.length,
    },

    insights: {
      worstEndpoints,
    },

    sample: {
      onlyInFile1: onlyInFile1.slice(0, 5),
      onlyInFile2: onlyInFile2.slice(0, 5),
      statusMismatches: statusMismatches.slice(0, 5),
    },
  };
};