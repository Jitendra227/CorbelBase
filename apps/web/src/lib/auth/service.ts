import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export function login(credentials: LoginRequest) {
  return apiClient<AuthResponse>(API_ENDPOINTS.auth.login, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function register(payload: RegisterRequest) {
  return apiClient<AuthResponse>(API_ENDPOINTS.auth.register, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return apiClient<void>(API_ENDPOINTS.auth.logout, {
    method: "POST",
  });
}

export function getCurrentUser() {
  return apiClient<AuthResponse>(API_ENDPOINTS.auth.me);
}
