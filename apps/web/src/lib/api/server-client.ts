import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PATHS } from "@/config/paths";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function serverApiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    redirect(PATHS.login);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Cookie: `sessionId=${sessionId}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect(PATHS.login);
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
