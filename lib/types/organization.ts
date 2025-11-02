/**
 * Organization and member-related types
 */

import { OrganizationRole } from "./auth";

/**
 * Organization entity
 */
export interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  
}

/**
 * Organization member with role
 */
export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  joined_at: string;
  user?: {
    id: string;
    email: string;
  };
  
}

/**
 * Organization invitation
 */
export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  inviter_id: string;
  invitee_email: string;
  role: Exclude<OrganizationRole, "owner">; // Owner cannot be invited
  status: "pending" | "accepted" | "expired";
  token: string;
  expires_at: string;
  created_at: string;
  organization?: {
    id: string;
    name: string;
  };
}

