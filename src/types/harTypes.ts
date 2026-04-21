export interface HarEntry {
  request?: {
    url?: string;
  };
  response?: {
    status?: number;
    startedDateTime?: string; // may need to recheck this
  };
}

export interface HarFile {
  log?: {
    entries?: HarEntry[];
  };
}

export interface ProcessedRequest {
  url: string | undefined;
  status: number | undefined;
}