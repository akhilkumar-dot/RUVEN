/**
 * Typed API client — wraps fetch with auth token injection,
 * RFC 7807 error handling, and automatic token refresh.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ── In-memory access token (never in localStorage) ───────────
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ── Types ─────────────────────────────────────────────────────
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: {
    id: string;
    userHandle: string;
    email: string;
    type: "INDIVIDUAL" | "INVESTOR" | "STARTUP_FOUNDER" | "COMPANY_OWNER";
  };
}

// ── Core fetch wrapper ────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // send HttpOnly refresh cookie
    ...options,
    headers,
  });

  // Try to refresh on 401 (once)
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch<T>(path, options, false); // retry once
    }
    // Refresh failed — clear and let app redirect to sign-in
    setAccessToken(null);
    throw { status: 401, code: "UNAUTHORIZED" } as ApiError;
  }

  if (!res.ok) {
    const problem = await res.json().catch(() => ({
      status: res.status,
      title: "Error",
      detail: res.statusText,
      code: "UNKNOWN",
    }));
    throw problem as ApiError;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const data = await apiFetch<AuthResponse>("/api/v1/auth/refresh", {
      method: "POST",
    }, false);
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// ── Auth endpoints ────────────────────────────────────────────
export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  type: "INDIVIDUAL" | "INVESTOR" | "STARTUP_FOUNDER" | "COMPANY_OWNER";
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { emailOrHandle: string; password: string }) =>
    apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refresh: () =>
    apiFetch<AuthResponse>("/api/v1/auth/refresh", { method: "POST" }, false),

  logout: () =>
    apiFetch<void>("/api/v1/auth/logout", { method: "POST" }),

  logoutAll: () =>
    apiFetch<void>("/api/v1/auth/logout-all", { method: "POST" }),

  forgotPassword: (email: string) =>
    apiFetch<void>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiFetch<void>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
};

// ── Generic helper ────────────────────────────────────────────
export const api = {
  get:    <T>(path: string)                  => apiFetch<T>(path),
  post:   <T>(path: string, body: unknown)   => apiFetch<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)   => apiFetch<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)   => apiFetch<T>(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: <T>(path: string)                  => apiFetch<T>(path, { method: "DELETE" }),
};
