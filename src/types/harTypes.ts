export interface HarEntry {
  request?: {
    url?: string;
    method?: string;
    headers?: { name: string; value: string }[];
    postData?: {
      text?: string;
    };
  };
  response?: {
    status?: number;
    startedDateTime?: string;
    headers?: { name: string; value: string }[];
  };
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
  body: string | undefined;
  status: number;
  time: string;
}

export interface ModifiedRequest {
  key: string;
  file1: DetailedRequest;
  file2: DetailedRequest;
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
  };

  response: {
    headers: DiffResult;
  };
}

export interface ModifiedRequest {
  key: string;
  file1: DetailedRequest;
  file2: DetailedRequest;
  diff: DetailedDiff;
}