import { API_ENDPOINTS } from "@/config/api-endpoints";
import { serverApiClient } from "@/lib/api/server-client";

export interface Organization {
  id: string;
  name: string;
  role: "owner" | "admin" | "developer" | "viewer";
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  userId: string;
  name: string;
  email: string;
  role: Organization["role"];
  joinedAt: string;
}

interface OrganizationsResponse {
  organizations: Organization[];
}

interface OrganizationResponse {
  organization: Organization;
}

interface MembersResponse {
  organization: string;
  members: OrganizationMember[];
}

export function getOrganizations() {
  return serverApiClient<OrganizationsResponse>(API_ENDPOINTS.organizations.list);
}

export function getOrganization(organizationId: string) {
  return serverApiClient<OrganizationResponse>(
    API_ENDPOINTS.organizations.one(organizationId)
  );
}

export function getOrganizationMembers(organizationId: string) {
  return serverApiClient<MembersResponse>(
    API_ENDPOINTS.organizations.members(organizationId)
  );
}
