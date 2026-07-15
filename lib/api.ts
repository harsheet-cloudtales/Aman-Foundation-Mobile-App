const API_BASE_URL = "https://main.d1mnwey66nth5p.amplifyapp.com";

let cachedToken: string | null = null;

export function setApiToken(token: string | null) {
  cachedToken = token;
}

export function getApiToken(): string | null {
  return cachedToken;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth && cachedToken) {
    headers["Authorization"] = `Bearer ${cachedToken}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, fetchOptions);

  if (res.status === 401 && auth) {
    cachedToken = null;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(
      json.error || `Request failed with status ${res.status}`,
      res.status,
    );
  }

  return json;
}

export const api = {
  get: <T = unknown>(endpoint: string) =>
    request<T>(endpoint, { method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, auth?: boolean) =>
    request<T>(endpoint, { method: "POST", body, auth }),

  put: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body }),

  del: <T = unknown>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
