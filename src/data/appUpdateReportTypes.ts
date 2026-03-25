export type AppUpdateCodeChange = {
  filePath: string;
  language: string;
  summary: string;
  snippet: string;
};

export type AppUpdateReport = {
  id: string;
  version: string;
  title: string;
  releasedAt: string;
  summary: string;
  highlights: string[];
  codeChanges: AppUpdateCodeChange[];
};
