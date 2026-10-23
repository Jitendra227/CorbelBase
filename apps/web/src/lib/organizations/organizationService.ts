import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "../api/client";
import type { Organization, OrganizationMember } from "./service";

export function createOrganization(name: string) {
  return apiClient<{ organization: Organization }>(
    API_ENDPOINTS.organizations.list,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    }
  );
}

export function addOrganizationMember(
  organizationId: string,
  email: string,
  role: Organization["role"]
) {
  return apiClient<{
    message: string;
    member: OrganizationMember;
  }>(API_ENDPOINTS.organizations.members(organizationId), {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  role: Organization["role"]
) {
  return apiClient<{ message: string; membership: unknown }>(
    `${API_ENDPOINTS.organizations.members(organizationId)}/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }
  );
}

export function removeOrganizationMember(
  organizationId: string,
  userId: string
) {
  return apiClient<{ message: string }>(
    `${API_ENDPOINTS.organizations.members(organizationId)}/${userId}`,
    {
      method: "DELETE",
    }
  );
}
