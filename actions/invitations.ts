/**
 * Invitation Server Actions
 * All invitation-related mutations and queries are handled here using Server Actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuth, getAuthUser } from "@/lib/utils/auth";
import { isMember } from "@/lib/utils/permissions";
import { OrganizationInvitation } from "@/lib/types/organization";
import { InvitationStatus } from "@/lib/types/auth";

/**
 * Get pending invitations for the current user
 * Returns invitations sent to the user's email
 */
export async function getPendingInvitations(): Promise<{
  invitations: OrganizationInvitation[];
  error: string | null;
}> {
  try {
    const user = await getAuthUser();
    if (!user || !user.email) {
      return {
        invitations: [],
        error: null,
      };
    }

    const supabase = await createServerSupabaseClient();

    // Get pending invitations for user's email
    const { data, error } = await supabase
      .from("invitations")
      .select(
        `
        id,
        organization_id,
        inviter_id,
        invitee_email,
        role,
        status,
        token,
        expires_at,
        created_at,
        organizations (
          id,
          name
        )
      `
      )
      .eq("invitee_email", user.email)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString()) // Not expired
      .order("created_at", { ascending: false });

    // Filter out invitations where:
    // 1. User is already a member of the organization
    // 2. User has previously accepted an invitation to this organization (even if removed later)
    // This prevents removed members from seeing old invitations that should have been accepted
    if (data && data.length > 0) {
      const organizationIds = data.map((inv) => inv.organization_id);
      
      // Check which organizations the user is already a member of
      const { data: memberships } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .in("organization_id", organizationIds);

      const memberOrgIds = new Set(
        (memberships || []).map((m) => m.organization_id)
      );

      // Check which organizations have accepted invitations for this user
      // This ensures that even if a user was removed, they won't see invitations they already accepted
      const { data: acceptedInvitations } = await supabase
        .from("invitations")
        .select("organization_id")
        .eq("invitee_email", user.email)
        .eq("status", "accepted")
        .in("organization_id", organizationIds);

      const acceptedOrgIds = new Set(
        (acceptedInvitations || []).map((inv) => inv.organization_id)
      );

      // Filter out invitations for organizations where:
      // - User is already a member, OR
      // - User has previously accepted an invitation (even if removed later)
      const filteredData = data.filter(
        (inv) => !memberOrgIds.has(inv.organization_id) && !acceptedOrgIds.has(inv.organization_id)
      );

      // Update the data variable for processing
      data.splice(0, data.length, ...filteredData);
    }

    if (error) {
      console.error("Error fetching pending invitations:", error);
      return {
        invitations: [],
        error: "Failed to fetch invitations. Please try again.",
      };
    }

    // Transform data
    const invitations = (data || []).map((item) => ({
      id: item.id,
      organization_id: item.organization_id,
      inviter_id: item.inviter_id,
      invitee_email: item.invitee_email,
      role: item.role,
      status: item.status as InvitationStatus,
      token: item.token,
      expires_at: item.expires_at,
      created_at: item.created_at,
      organization: item.organizations
        ? (Array.isArray(item.organizations)
            ? item.organizations[0]
              ? {
                  id: (item.organizations[0] as { id: string; name: string }).id,
                  name: (item.organizations[0] as { id: string; name: string }).name,
                }
              : undefined
            : {
                id: (item.organizations as { id: string; name: string }).id,
                name: (item.organizations as { id: string; name: string }).name,
              })
        : undefined,
    })) as OrganizationInvitation[];

    return {
      invitations,
      error: null,
    };
  } catch (error) {
    console.error("Get pending invitations error:", error);
    return {
      invitations: [],
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Accept an invitation by token
 * Creates a membership record for the user
 */
export async function acceptInvitation(
  invitationId: string
): Promise<{ error: string | null; organizationId?: string }> {
  try {
    const user = await requireAuth();

    if (!user.email) {
      return {
        error: "User email not found",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select("*")
      .eq("id", invitationId)
      .eq("invitee_email", user.email)
      .eq("status", "pending")
      .single();

    if (inviteError || !invitation) {
      return {
        error: "Invitation not found or has expired",
      };
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitationId);

      return {
        error: "This invitation has expired",
      };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", invitation.organization_id)
      .eq("user_id", user.id)
      .single();

    if (existingMember) {
      // Mark ALL pending invitations for this user+organization as accepted
      // This prevents issues if user is removed and re-invited later
      await supabase
        .from("invitations")
        .update({ status: "accepted" })
        .eq("organization_id", invitation.organization_id)
        .eq("invitee_email", user.email)
        .eq("status", "pending");

      return {
        error: "You are already a member of this organization",
        organizationId: invitation.organization_id,
      };
    }

    // Create membership record
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
      });

    if (memberError) {
      console.error("Error creating membership:", memberError);
      return {
        error: "Failed to accept invitation. Please try again.",
      };
    }

    // CRITICAL: First, mark the specific invitation that was just accepted by ID
    // This ensures the invitation is updated even if there are RLS or filter issues
    const { data: updateResult, error: updateSpecificError } = await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("id", invitationId)
      .select();

    if (updateSpecificError) {
      console.error("CRITICAL: Error updating specific invitation status:", updateSpecificError);
      console.error("Invitation ID:", invitationId);
      console.error("User email:", user.email);
      // This is critical - we need to return an error if we can't update the invitation
      return {
        error: `Failed to mark invitation as accepted: ${updateSpecificError.message || 'Unknown error'}. Please contact support.`,
      };
    }

    if (!updateResult || updateResult.length === 0) {
      console.error("CRITICAL: No rows updated for invitation:", invitationId);
      return {
        error: "Failed to mark invitation as accepted. No rows were updated. Please contact support.",
      };
    }

    // Then, mark ALL remaining pending invitations for this user+organization as accepted
    // This prevents removed members from seeing old pending invitations
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("organization_id", invitation.organization_id)
      .eq("invitee_email", user.email)
      .eq("status", "pending");

    if (updateError) {
      console.error("Error updating remaining pending invitations:", updateError);
      // This is less critical, we can continue
    }

    // Revalidate paths
    revalidatePath("/invitations");
    revalidatePath("/organizations");
    revalidatePath(`/organizations/${invitation.organization_id}`);

    return {
      error: null,
      organizationId: invitation.organization_id,
    };
  } catch (error) {
    console.error("Accept invitation error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Accept an invitation by token (for email links)
 * Token is the unique invitation token
 */
export async function acceptInvitationByToken(
  token: string
): Promise<{ error: string | null; organizationId?: string }> {
  try {
    const user = await requireAuth();

    if (!user.email) {
      return {
        error: "User email not found",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Get invitation by token
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (inviteError || !invitation) {
      return {
        error: "Invitation not found or has already been used",
      };
    }

    // Verify email matches (case-insensitive)
    if (invitation.invitee_email.toLowerCase() !== user.email.toLowerCase()) {
      return {
        error: "This invitation was sent to a different email address",
      };
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("token", token);

      return {
        error: "This invitation has expired",
      };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", invitation.organization_id)
      .eq("user_id", user.id)
      .single();

    if (existingMember) {
      // Mark ALL pending invitations for this user+organization as accepted
      // This prevents issues if user is removed and re-invited later
      await supabase
        .from("invitations")
        .update({ status: "accepted" })
        .eq("organization_id", invitation.organization_id)
        .eq("invitee_email", user.email)
        .eq("status", "pending");

      return {
        error: null,
        organizationId: invitation.organization_id,
      };
    }

    // Create membership record
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
      });

    if (memberError) {
      console.error("Error creating membership:", memberError);
      return {
        error: "Failed to accept invitation. Please try again.",
      };
    }

    // CRITICAL: First, mark the specific invitation that was just accepted by token
    // This ensures the invitation is updated even if there are RLS or filter issues
    const { data: updateResult, error: updateSpecificError } = await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("token", token)
      .select();

    if (updateSpecificError) {
      console.error("CRITICAL: Error updating specific invitation status:", updateSpecificError);
      console.error("Invitation token:", token);
      console.error("User email:", user.email);
      // This is critical - we need to return an error if we can't update the invitation
      return {
        error: `Failed to mark invitation as accepted: ${updateSpecificError.message || 'Unknown error'}. Please contact support.`,
      };
    }

    if (!updateResult || updateResult.length === 0) {
      console.error("CRITICAL: No rows updated for invitation token:", token);
      return {
        error: "Failed to mark invitation as accepted. No rows were updated. Please contact support.",
      };
    }

    // Then, mark ALL remaining pending invitations for this user+organization as accepted
    // This prevents removed members from seeing old pending invitations
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("organization_id", invitation.organization_id)
      .eq("invitee_email", user.email)
      .eq("status", "pending");

    if (updateError) {
      console.error("Error updating remaining pending invitations:", updateError);
      // This is less critical, we can continue
    }

    // Revalidate paths
    revalidatePath("/invitations");
    revalidatePath("/organizations");
    revalidatePath(`/organizations/${invitation.organization_id}`);

    return {
      error: null,
      organizationId: invitation.organization_id,
    };
  } catch (error) {
    console.error("Accept invitation by token error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Decline an invitation
 * Marks invitation as expired (we use expired status for declined)
 */
export async function declineInvitation(
  invitationId: string
): Promise<{ error: string | null }> {
  try {
    const user = await requireAuth();

    if (!user.email) {
      return {
        error: "User email not found",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Verify invitation belongs to user
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select("id, invitee_email")
      .eq("id", invitationId)
      .eq("invitee_email", user.email)
      .eq("status", "pending")
      .single();

    if (inviteError || !invitation) {
      return {
        error: "Invitation not found",
      };
    }

    // Mark invitation as expired (we use expired for declined)
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", invitationId);

    if (updateError) {
      console.error("Error declining invitation:", updateError);
      return {
        error: "Failed to decline invitation. Please try again.",
      };
    }

    // Revalidate paths
    revalidatePath("/invitations");

    return { error: null };
  } catch (error) {
    console.error("Decline invitation error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Cancel an invitation (for inviters/admins)
 * Marks invitation as expired
 */
export async function cancelInvitation(
  organizationId: string,
  invitationId: string
): Promise<{ error: string | null }> {
  try {
    const user = await requireAuth();

    // Check if user is a member with permission
    const isUserMember = await isMember(user.id, organizationId);
    if (!isUserMember) {
      return {
        error: "You don't have access to this organization",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Verify invitation belongs to organization
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select("id, inviter_id, status")
      .eq("id", invitationId)
      .eq("organization_id", organizationId)
      .eq("status", "pending")
      .single();

    if (inviteError || !invitation) {
      return {
        error: "Invitation not found",
      };
    }

    // Check if user is the inviter or has admin/owner permissions
    const { data: member } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    if (!member || (member.role !== "owner" && member.role !== "admin" && invitation.inviter_id !== user.id)) {
      return {
        error: "You don't have permission to cancel this invitation",
      };
    }

    // Mark invitation as expired
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", invitationId);

    if (updateError) {
      console.error("Error canceling invitation:", updateError);
      return {
        error: "Failed to cancel invitation. Please try again.",
      };
    }

    // Revalidate paths
    revalidatePath(`/organizations/${organizationId}/members`);
    revalidatePath(`/organizations/${organizationId}`);

    return { error: null };
  } catch (error) {
    console.error("Cancel invitation error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

