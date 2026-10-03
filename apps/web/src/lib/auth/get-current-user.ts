import { API_ENDPOINTS } from "@/config/api-endpoints";
import { serverApiClient } from "@/lib/api/server-client";

import type { AuthResponse, AuthUser } from "./service";

export async function getCurrentUser(): Promise<AuthUser> {
  const { user } = await serverApiClient<AuthResponse>(API_ENDPOINTS.auth.me);

  return user;
}
