/**
 * Dev-mode mock auth — only active when NEXT_PUBLIC_USE_MOCK_AUTH=true.
 * Simulates register/login with a fake token so the full UI is accessible
 * locally without needing the Spring Boot backend running.
 *
 * Remove / disable for production.
 */

import { type AuthResponse, type RegisterPayload, setAccessToken } from "./client";

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== "false";

function fakeSleep(ms = 600) {
  return new Promise(r => setTimeout(r, ms));
}

function mockToken(handle: string) {
  // A fake JWT-shaped string (not a real JWT — just for dev UI flow)
  const header  = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    sub: "00000000-0000-0000-0000-000000000001",
    email: `${handle}@dev.local`,
    role: "USER",
    exp: Math.floor(Date.now() / 1000) + 900,
  }));
  return `${header}.${payload}.mock`;
}

const DEFAULT_ACCOUNTS: Record<string, { name: string; email: string; type: string }> = {
  "freelancer@founderbridge.in": { name: "Ananya Sharma", email: "freelancer@founderbridge.in", type: "INDIVIDUAL" },
  "founder@founderbridge.in":    { name: "Aarav Reddy",   email: "founder@founderbridge.in",    type: "STARTUP_FOUNDER" },
  "company@founderbridge.in":    { name: "Vikram Malhotra", email: "company@founderbridge.in", type: "COMPANY_OWNER" },
  "investor@founderbridge.in":   { name: "Rohan Mehta",   email: "investor@founderbridge.in",   type: "INVESTOR" },
};

function getStoredUsers(): Record<string, { name: string; email: string; type: string }> {
  if (typeof window === "undefined") return { ...DEFAULT_ACCOUNTS };
  try {
    const raw = sessionStorage.getItem("founderbridge_registered_users");
    const stored = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_ACCOUNTS, ...stored };
  } catch {
    return { ...DEFAULT_ACCOUNTS };
  }
}

function storeUser(user: { name: string; email: string; type: string }) {
  if (typeof window === "undefined") return;
  try {
    const users = getStoredUsers();
    users[user.email.toLowerCase()] = user;
    users[user.name.toLowerCase().replace(/\s+/g, "")] = user;
    sessionStorage.setItem("founderbridge_registered_users", JSON.stringify(users));
  } catch {
    // Ignore storage errors in dev
  }
}

function resolveAccount(emailOrHandle: string): { name: string; email: string; type: string } {
  const lower = emailOrHandle.toLowerCase().trim();
  const users = getStoredUsers();

  if (users[lower]) return users[lower];

  // Match by username prefix (e.g. "freelancer", "founder", etc.)
  for (const [key, val] of Object.entries(users)) {
    if (key.startsWith(lower) || val.name.toLowerCase().replace(/\s+/g, "") === lower) {
      return val;
    }
  }

  // Keyword heuristic for testing
  let type = "STARTUP_FOUNDER";
  if (lower.includes("investor") || lower.includes("angel") || lower.includes("vc")) type = "INVESTOR";
  else if (lower.includes("company") || lower.includes("owner") || lower.includes("corp")) type = "COMPANY_OWNER";
  else if (lower.includes("freelance") || lower.includes("individual") || lower.includes("student")) type = "INDIVIDUAL";

  const displayName = emailOrHandle.includes("@") ? emailOrHandle.split("@")[0] : emailOrHandle;
  return {
    name: displayName,
    email: emailOrHandle.includes("@") ? emailOrHandle : `${emailOrHandle}@founderbridge.in`,
    type,
  };
}

function mockAuthResponse(name: string, email: string, type: string): AuthResponse {
  const handle = name.toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(Math.random() * 900 + 100);
  return {
    accessToken: mockToken(handle),
    expiresInSeconds: 900,
    user: {
      id: "usr-" + Math.random().toString(36).substring(2, 10),
      userHandle: handle,
      email,
      type: type as AuthResponse["user"]["type"],
    },
  };
}

export const mockAuthApi = {
  isEnabled: IS_MOCK,

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    await fakeSleep();
    storeUser({ name: payload.name, email: payload.email, type: payload.type });
    return mockAuthResponse(payload.name, payload.email, payload.type);
  },

  login: async (payload: { emailOrHandle: string; password: string }): Promise<AuthResponse> => {
    await fakeSleep();
    if (payload.password.length < 3) {
      throw { status: 401, title: "Unauthorized", detail: "Invalid credentials.", code: "INVALID_CREDENTIALS" };
    }
    const acct = resolveAccount(payload.emailOrHandle);
    return mockAuthResponse(acct.name, acct.email, acct.type);
  },

  logout: async () => {
    await fakeSleep(200);
    setAccessToken(null);
  },

  logoutAll: async () => {
    await fakeSleep(200);
    setAccessToken(null);
  },

  refresh: async (): Promise<AuthResponse> => {
    await fakeSleep(100);
    return mockAuthResponse("Aarav Reddy", "aarav@startup.in", "STARTUP_FOUNDER");
  },
};
