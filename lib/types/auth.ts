/**
 * Authentication and user-related types
 */

import { User } from "@supabase/supabase-js";

/**
 * Organization role types
 * Owner: Highest permission level, can manage everything
 * Admin: Can invite members and manage Users/Viewers
 * User: Standard member with view and basic access
 * Viewer: Read-only access
 */
export type OrganizationRole = "owner" | "admin" | "user" | "viewer";

/**
 * Invitation status types
 */
export type InvitationStatus = "pending" | "accepted" | "expired";

/**
 * User profile type (extends Supabase User)
 */
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Authenticated user with profile information
 */
export interface AuthenticatedUser extends User {
  profile?: UserProfile;
}

/**
 * Authentication error response
 */
export interface AuthError {
  message: string;
  status?: number;
}

/**
 * Form validation error
 */
export interface FormError {
  field: string;
  message: string;
}

/**
 * Session information
 */
export interface SessionInfo {
  user: User | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  } | null;
}

/**
 * Password strength validation result
 */
export interface PasswordStrength {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

