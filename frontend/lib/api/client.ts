/**
 * Provides the shared browser-to-backend HTTP boundary.
 * Feature modules use it for consistent base URLs, JSON bodies, and failed-response handling.
 */
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  /** Carry the HTTP status and the backend's error detail so forms can show a useful message. */
  constructor(
    readonly status: number,
    readonly detail: string,
  ) {
    super(`API request failed with status ${status}: ${detail}`);
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  /** Send one JSON request; return undefined for 204 responses and reject other failures. */
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { detail?: unknown };
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {
      // Keep the status text when the error body is not JSON.
    }
    throw new ApiError(response.status, detail);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
