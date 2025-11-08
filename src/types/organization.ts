/**
 * Organization-related type definitions
 */

export type OrganizationType = 'location' | 'corporate' | 'franchise';
export type OrganizationMemberRole = 'org_admin' | 'org_member' | 'location_admin';

export interface Address {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface Organization {
  _id: string;
  _creationTime: number;
  clerkOrganizationId: string;
  name: string;
  slug: string;
  address: Address;
  type: OrganizationType;
  is24Hours: boolean;
  features: string[];
  adminClerkId: string;
  memberClerkIds?: string[];
  totalMembers?: number;
  activeMemberships?: number;
  revenue?: number;
  isActive?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface OrganizationMember {
  _id: string;
  organizationId: string;
  userClerkId: string;
  role: OrganizationMemberRole;
  joinedAt: number;
}

export interface OrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalMembers: number;
  totalRevenue: number;
  averageMembersPerOrg: number;
  organizationsByType: Record<OrganizationType, number>;
}
