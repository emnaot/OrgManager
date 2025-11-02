/**
 * Role-based permission utilities
 * Provides functions to check user permissions within organizations
 */

import { OrganizationRole } from "@/lib/types/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Role hierarchy: owner > admin > user > viewer
 * Higher roles have all permissions of lower roles
 */
const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  owner: 4,
  admin: 3,
  user: 2,
  viewer: 1,
};

/**
 * Check if a role is higher than or equal to another role
 */
export function hasRoleOrHigher(userRole: OrganizationRole, requiredRole: OrganizationRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user is owner of an organization
 */
export async function isOwner(userId: string, organizationId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .eq("role", "owner")
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === "owner";
  } catch (error) {
    console.error("Error checking owner status:", error);
    return false;
  }
}

/**
 * Check if user is admin or owner of an organization
 */
export async function isAdminOrOwner(userId: string, organizationId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .in("role", ["owner", "admin"])
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === "owner" || data.role === "admin";
  } catch (error) {
    console.error("Error checking admin/owner status:", error);
    return false;
  }
}

/**
 * Check if user can invite members to an organization
 * Only owners and admins can invite
 */
export async function canInviteMembers(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return isAdminOrOwner(userId, organizationId);
}

/**
 * Check if user can change a member's role
 * Owners can change any role except other owners
 * Admins can change user and viewer roles
 */
export async function canChangeRole(
  userId: string,
  organizationId: string,
  targetUserId: string,
  newRole: OrganizationRole
): Promise<{ canChange: boolean; reason?: string }> {
  try {
    // Get current user's role
    const supabase = await createServerSupabaseClient();
    const { data: currentUserMember, error: currentError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .single();

    if (currentError || !currentUserMember) {
      return { canChange: false, reason: "You are not a member of this organization" };
    }

    const currentUserRole = currentUserMember.role as OrganizationRole;

    // Get target user's role
    const { data: targetMember, error: targetError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", targetUserId)
      .single();

    if (targetError || !targetMember) {
      return { canChange: false, reason: "Target user is not a member of this organization" };
    }

    const targetUserRole = targetMember.role as OrganizationRole;

    // Owners can change any role (except can't have multiple owners, handled elsewhere)
    if (currentUserRole === "owner") {
      if (targetUserRole === "owner" && newRole !== "owner") {
        // Transferring ownership - allowed
        return { canChange: true };
      }
      if (targetUserRole === "owner" && newRole === "owner") {
        return { canChange: false, reason: "Organization already has an owner" };
      }
      return { canChange: true };
    }

    // Admins can only change user and viewer roles
    if (currentUserRole === "admin") {
      if (targetUserRole === "owner" || targetUserRole === "admin") {
        return {
          canChange: false,
          reason: "Admins cannot modify owners or other admins",
        };
      }
      if (newRole === "owner" || newRole === "admin") {
        return {
          canChange: false,
          reason: "Admins cannot assign owner or admin roles",
        };
      }
      return { canChange: true };
    }

    // Users and viewers cannot change roles
    return {
      canChange: false,
      reason: "You don't have permission to change member roles",
    };
  } catch (error) {
    console.error("Error checking can change role:", error);
    return { canChange: false, reason: "An error occurred while checking permissions" };
  }
}

/**
 * Check if user can remove a member from an organization
 * Owners can remove anyone except themselves (must transfer ownership first)
 * Admins can remove users and viewers
 */
export async function canRemoveMember(
  userId: string,
  organizationId: string,
  targetUserId: string
): Promise<{ canRemove: boolean; reason?: string }> {
  try {
    // Cannot remove yourself as owner (must transfer ownership first)
    if (userId === targetUserId) {
      const isUserOwner = await isOwner(userId, organizationId);
      if (isUserOwner) {
        return {
          canRemove: false,
          reason: "Owners must transfer ownership before leaving the organization",
        };
      }
      // Non-owners can remove themselves
      return { canRemove: true };
    }

    // Get current user's role
    const supabase = await createServerSupabaseClient();
    const { data: currentUserMember, error: currentError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .single();

    if (currentError || !currentUserMember) {
      return { canRemove: false, reason: "You are not a member of this organization" };
    }

    const currentUserRole = currentUserMember.role as OrganizationRole;

    // Get target user's role
    const { data: targetMember, error: targetError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", targetUserId)
      .single();

    if (targetError || !targetMember) {
      return { canRemove: false, reason: "Target user is not a member of this organization" };
    }

    const targetUserRole = targetMember.role as OrganizationRole;

    // Owners can remove anyone (except themselves, handled above)
    if (currentUserRole === "owner") {
      if (targetUserRole === "owner") {
        return {
          canRemove: false,
          reason: "Cannot remove the owner. Transfer ownership first.",
        };
      }
      return { canRemove: true };
    }

    // Admins can only remove users and viewers
    if (currentUserRole === "admin") {
      if (targetUserRole === "owner" || targetUserRole === "admin") {
        return {
          canRemove: false,
          reason: "Admins cannot remove owners or other admins",
        };
      }
      return { canRemove: true };
    }

    // Users and viewers cannot remove members
    return {
      canRemove: false,
      reason: "You don't have permission to remove members",
    };
  } catch (error) {
    console.error("Error checking can remove member:", error);
    return { canRemove: false, reason: "An error occurred while checking permissions" };
  }
}

/**
 * Check if user can update organization details
 * Only owners and admins can update
 */
export async function canUpdateOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return isAdminOrOwner(userId, organizationId);
}

/**
 * Check if user can delete an organization
 * Only owners can delete
 */
export async function canDeleteOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return isOwner(userId, organizationId);
}

/**
 * Check if user can transfer ownership
 * Only owners can transfer ownership
 */
export async function canTransferOwnership(
  userId: string,
  organizationId: string,
  targetUserId: string
): Promise<{ canTransfer: boolean; reason?: string }> {
  try {
    // Must be owner
    const isUserOwner = await isOwner(userId, organizationId);
    if (!isUserOwner) {
      return {
        canTransfer: false,
        reason: "Only owners can transfer ownership",
      };
    }

    // Cannot transfer to yourself
    if (userId === targetUserId) {
      return {
        canTransfer: false,
        reason: "Cannot transfer ownership to yourself",
      };
    }

    // Check if target user is a member
    const supabase = await createServerSupabaseClient();
    const { data: targetMember, error } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", organizationId)
      .eq("user_id", targetUserId)
      .single();

    if (error || !targetMember) {
      return {
        canTransfer: false,
        reason: "Target user is not a member of this organization",
      };
    }

    return { canTransfer: true };
  } catch (error) {
    console.error("Error checking can transfer ownership:", error);
    return {
      canTransfer: false,
      reason: "An error occurred while checking permissions",
    };
  }
}

/**
 * Get user's role in an organization
 */
export async function getUserRole(
  userId: string,
  organizationId: string
): Promise<OrganizationRole | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role as OrganizationRole;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Check if user is a member of an organization
 */
export async function isMember(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .single();

    return !error && data !== null;
  } catch (error) {
    console.error("Error checking membership:", error);
    return false;
  }
}

