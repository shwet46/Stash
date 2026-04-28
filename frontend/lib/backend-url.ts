const DEFAULT_BACKEND_URL = "https://stash-backend-2qjk.onrender.com";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalhostUrl(url: string): boolean {
  return /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

function resolveBackendUrl(candidates: Array<string | undefined>): string {
  for (const candidate of candidates) {
    const value = stripTrailingSlash((candidate || "").trim());
    if (!value) {
      continue;
    }
    if (isLocalhostUrl(value)) {
      continue;
    }
    return value;
  }

  return DEFAULT_BACKEND_URL;
}

export function getServerBackendUrl(): string {
  return resolveBackendUrl([
    process.env.INTERNAL_API_URL,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
    DEFAULT_BACKEND_URL,
  ]);
}

export function getClientBackendUrl(): string {
  return resolveBackendUrl([
    process.env.NEXT_PUBLIC_API_URL,
    process.env.BACKEND_URL,
    DEFAULT_BACKEND_URL,
  ]);
}

export const SERVER_BACKEND_URL = getServerBackendUrl();
export const CLIENT_BACKEND_URL = getClientBackendUrl();