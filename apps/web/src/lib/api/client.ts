const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new Error(
      body?.error?.message ?? `Request failed (${response.status})`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
