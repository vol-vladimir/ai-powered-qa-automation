import type { APIRequestContext, Page } from "@playwright/test";

export type DidaxisProgram = {
  id: string;
  name: string;
  description: string;
};

export type DidaxisConfig = {
  baseUrl: string;
  apiToken: string;
  email: string;
  password: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set (for example via .env).`);
  }
  return value;
}

export function getDidaxisConfig(): DidaxisConfig {
  return {
    baseUrl: requireEnv("DIDAXIS_URL").replace(/\/$/, ""),
    apiToken: requireEnv("DIDAXIS_API_TOKEN"),
    email: requireEnv("DIDAXIS_EMAIL"),
    password: requireEnv("DIDAXIS_PASSWORD"),
  };
}

export function authHeaders(apiToken = getDidaxisConfig().apiToken): HeadersInit {
  return {
    Authorization: `Bearer ${apiToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const { baseUrl, apiToken } = getDidaxisConfig();
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${apiToken}`);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  return response;
}

export async function verifyApiToken(): Promise<void> {
  const response = await apiFetch("/api/auth/me");
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `DIDAXIS_API_TOKEN is invalid (${response.status}): ${body}`,
    );
  }
}

export async function createProgramViaApi(
  name: string,
  description: string,
): Promise<DidaxisProgram> {
  const response = await apiFetch("/api/programs", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });

  const body = (await response.json()) as {
    data?: DidaxisProgram;
    message?: string;
  };

  if (!response.ok || !body.data?.id) {
    throw new Error(
      `Failed to create program via API (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  return body.data;
}

export async function loginViaApiRequest(
  request: APIRequestContext,
): Promise<void> {
  const { apiToken, email, password } = getDidaxisConfig();
  const response = await request.post("/api/auth/login", {
    data: { email, password },
    headers: { Authorization: `Bearer ${apiToken}` },
  });

  if (!response.ok()) {
    throw new Error(
      `API login failed (${response.status()}): ${await response.text()}`,
    );
  }
}

export async function loginViaApiPage(page: Page): Promise<void> {
  await loginViaApiRequest(page.request);
}
