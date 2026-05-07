export interface HarEntry {
  request: {
    url?: string;
    method?: string;
    headers?: { name: string; value: string }[];
    postData?: { text?: string };
    cookies?: { name: string; value: string }[]; // ✅ ADD
  };

  response: {
    status?: number;
    headers?: { name: string; value: string }[];
    cookies?: { name: string; value: string }[]; // (optional, HAR supports this)
    startedDateTime?: string;
  };

  timings?: {
    wait?: number;
    receive?: number;
    [key: string]: number | undefined;
  }; // ✅ ADD
}

export interface HarFile {
  log?: {
    entries?: HarEntry[];
  };
}

export interface DetailedRequest {
  method: string;
  baseUrl: string;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body?: string;

  status: number;
  time: string;

  // ✅ NEW FIELDS
  cookies: Record<string, string>;
  setCookies: Record<string, string>;

  timings: {
    wait?: number;
    receive?: number;
    total?: number;
  };
}

export interface ModifiedRequest {
  key: string;
  file1: DetailedRequest;
  file2: DetailedRequest;
  timing: {
    file1: number;
    file2: number;
    delta: number;
  };
  diff: DetailedDiff;
}

export interface MissingRequest {
  key: string;
  file1Count: number;
  file2Count: number;
  difference: number;
}

import { DiffResult } from "../utils/diffUtils";

export interface DetailedDiff {
  key: string;

  request: {
    headers: DiffResult;
    body: DiffResult | null;
    cookies: DiffResult;
  };

  response: {
    headers: DiffResult;
    cookies: DiffResult;
  };
}

export interface ModifiedRequest {
  key: string;
  file1: DetailedRequest;
  file2: DetailedRequest;
  diff: DetailedDiff;
}