// lib/api.ts

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = "https://main.d1mnwey66nth5p.amplifyapp.com";

let cachedToken: string | null = null;

// ============================================
// TOKEN MANAGEMENT
// ============================================
export function setApiToken(token: string | null) {
  cachedToken = token;
}

export function getApiToken(): string | null {
  return cachedToken;
}

// ============================================
// ERROR CLASS
// ============================================
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ============================================
// REQUEST OPTIONS INTERFACE
// ============================================
interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  timeout?: number;
}

// ============================================
// API REQUEST FUNCTION WITH TIMEOUT
// ============================================
async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, timeout = 30000 } = options;

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

  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(` ${method} ${url}`);

    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(` Status: ${res.status}`);

    // Handle non-JSON responses
    const contentType = res.headers.get("content-type");
    let json: any;

    if (contentType && contentType.includes("application/json")) {
      json = await res.json();
    } else {
      const text = await res.text();
      console.error(" Non-JSON response:", text);
      json = { error: `Server returned non-JSON response: ${res.status}` };
    }

    if (res.status === 401 && auth) {
      cachedToken = null;
      console.warn(" Token expired, clearing cached token");
    }

    if (!res.ok) {
      throw new ApiError(
        json.error ||
          json.message ||
          `Request failed with status ${res.status}`,
        res.status,
        json,
      );
    }

    return json;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle timeout specifically
    if (error.name === "AbortError") {
      console.error(" Request timeout:", endpoint);
      throw new ApiError(
        "Request timed out. Please check your internet connection.",
        408,
        { timeout: true },
      );
    }

    // Handle network errors
    if (
      error instanceof TypeError &&
      error.message === "Network request failed"
    ) {
      console.error(" Network error:", endpoint);
      throw new ApiError(
        "Network error. Please check your internet connection.",
        0,
        { networkError: true },
      );
    }

    if (error instanceof ApiError) {
      throw error;
    }

    console.error(" API request failed:", error);
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed",
      0,
      { originalError: error },
    );
  }
}

// ============================================
// API CLIENT
// ============================================
export const api = {
  get: <T = unknown>(
    endpoint: string,
    auth: boolean = true,
    timeout?: number,
  ) => request<T>(endpoint, { method: "GET", auth, timeout }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    auth: boolean = true,
    timeout?: number,
  ) => request<T>(endpoint, { method: "POST", body, auth, timeout }),

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    auth: boolean = true,
    timeout?: number,
  ) => request<T>(endpoint, { method: "PUT", body, auth, timeout }),

  del: <T = unknown>(
    endpoint: string,
    auth: boolean = true,
    timeout?: number,
  ) => request<T>(endpoint, { method: "DELETE", auth, timeout }),
};

// ============================================
// HEALTH CHECK FUNCTION WITH TIMEOUT
// ============================================
export async function checkAPIHealth(): Promise<boolean> {
  try {
    console.log(" Checking API health...");

    // Add timeout for health check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log(" API is healthy:", data);
      return true;
    } else {
      console.error(" API health check failed:", response.status);
      return false;
    }
  } catch (error: any) {
    //  Don't treat offline as fatal - just return false
    if (error.name == "AbortError") {
      console.warn(" Health check timeout - API may be offline");
    } else {
      console.warn(" API is offline or unreachable:", error.message);
    }
    return false;
  }
}

// ============================================
// GET API BASE URL (For debugging)
// ============================================
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

// ============================================
// CHECK IF API IS CONFIGURED
// ============================================
// export function isApiConfigured(): boolean {
//   return API_BASE_URL !== "" && API_BASE_URL !== "https://your-api-url.com";
// }
