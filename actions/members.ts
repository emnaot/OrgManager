/**
 * Member Management Server Actions
 * All member-related mutations are handled here using Server Actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/utils/auth";
import {
  canInviteMembers,
  canChangeRole,
  canRemoveMember,
  canTransferOwnership,
  isMember,
} from "@/lib/utils/permissions";
import { OrganizationRole } from "@/lib/types/auth";
import { z } from "zod";
import { sendInvitationEmail } from "@/lib/utils/email";

/**
 * Invite member schema
 */
const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "viewer"]),
});

/**
 * Change member role schema
 */
const changeRoleSchema = z.object({
  role: z.enum(["owner", "admin", "user", "viewer"]),
});

/**
 * Invite a member to an organization
 * Only owners and admins can invite
 */
export async function inviteMember(
  organizationId: string,
  formData: FormData
): Promise<{ error: string | null; invitationId?: string }> {
  try {
    const user = await requireAuth();

    // Check permissions
    const canInvite = await canInviteMembers(user.id, organizationId);
    if (!canInvite) {
      return {
        error: "Only owners and admins can invite members",
      };
    }

    // Check if user is a member
    const isUserMember = await isMember(user.id, organizationId);
    if (!isUserMember) {
      return {
        error: "You don't have access to this organization",
      };
    }

    // Parse and validate input
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    const validationResult = inviteMemberSchema.safeParse({
      email: email.toLowerCase().trim(),
      role,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { error: firstError.message };
    }

    const supabase = await createServerSupabaseClient();

    // Check if admin is trying to invite admin (not allowed)
    const { data: currentUserMember } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    const currentUserRole = currentUserMember?.role as OrganizationRole | undefined;

    if (currentUserRole === "admin" && validationResult.data.role === "admin") {
      return {
        error: "Admins cannot invite other admins. Only owners can invite admins.",
      };
    }

    // Check if user is already a member
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", validationResult.data.email)
      .single();

    if (existingUser) {
      const { data: existingMember } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("user_id", existingUser.id)
        .single();

      if (existingMember) {
        return {
          error: "User is already a member of this organization",
        };
      }
    }

    // Check if there's already a pending invitation for this email and organization
    const { data: existingInvitation } = await supabase
      .from("invitations")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("invitee_email", validationResult.data.email)
      .eq("status", "pending")
      .single();

    if (existingInvitation) {
      return {
        error: "There is already a pending invitation for this email",
      };
    }

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .insert({
        organization_id: organizationId,
        inviter_id: user.id,
        invitee_email: validationResult.data.email,
        role: validationResult.data.role,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError || !invitation) {
      console.error("Error creating invitation:", inviteError);
      return {
        error: "Failed to create invitation. Please try again.",
      };
    }

    // Send invitation email
    try {
      const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/invitations/accept?token=${invitation.token}`;
      
      // Get organization name and inviter email for the email
      const [orgResult, inviterResult] = await Promise.all([
        supabase
          .from("organizations")
          .select("name")
          .eq("id", organizationId)
          .single(),
        supabase
          .from("users")
          .select("email")
          .eq("id", user.id)
          .single(),
      ]);

      const organizationName = orgResult.data?.name || "an organization";
      const inviterEmail = inviterResult.data?.email;

      // Import and send email via Resend
      const emailResult = await sendInvitationEmail({
        to: validationResult.data.email,
        organizationName,
        invitationUrl,
        role: validationResult.data.role,
        inviterEmail: inviterEmail || undefined,
      });

      if (!emailResult.success) {
        // Log warning but don't fail - invitation is still created
        console.warn("Failed to send invitation email:", emailResult.error);
        // Fallback: log invitation link for development
        if (process.env.NODE_ENV === "development") {
          console.log(`[DEV] Invitation link for ${validationResult.data.email}: ${invitationUrl}`);
        }
      }
    } catch (emailError) {
      // Email sending is non-critical, invitation still created
      console.error("Error sending invitation email:", emailError);
      // Log invitation link for development/debugging
      const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/invitations/accept?token=${invitation.token}`;
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] Invitation link for ${validationResult.data.email}: ${invitationUrl}`);
      }
      // Continue - invitation is still valid
    }

    // Revalidate paths
    revalidatePath(`/organizations/${organizationId}/members`);
    revalidatePath(`/organizations/${organizationId}`);

    return {
      error: null,
      invitationId: invitation.id,
    };
  } catch (error) {
    console.error("Invite member error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Change a member's role
 * Owners can change any role (except can't have multiple owners)
 * Admins can change user and viewer roles
 */
export async function changeMemberRole(
  organizationId: string,
  memberId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const user = await requireAuth();

    // Check if user is a member
    const isUserMember = await isMember(user.id, organizationId);
    if (!isUserMember) {
      return {
        error: "You don't have access to this organization",
      };
    }

    // Get member details
    const supabase = await createServerSupabaseClient();
    const { data: member, error: memberError } = await supabase
      .from("organization_members")
      .select("user_id, role")
      .eq("id", memberId)
      .eq("organization_id", organizationId)
      .single();

    if (memberError || !member) {
      return {
        error: "Member not found",
      };
    }

    // Parse and validate input
    const newRole = formData.get("role") as string;

    const validationResult = changeRoleSchema.safeParse({
      role: newRole,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { error: firstError.message };
    }

    // Check permissions
    const permissionCheck = await canChangeRole(
      user.id,
      organizationId,
      member.user_id,
      validationResult.data.role
    );

    if (!permissionCheck.canChange) {
      return {
        error: permissionCheck.reason || "You don't have permission to change this role",
      };
    }

    // Special handling for ownership transfer
    if (validationResult.data.role === "owner") {
      // This is handled by transferOwnership action
      return {
        error: "Use transfer ownership to change a member to owner",
      };
    }

    // Update member role
    const { error: updateError } = await supabase
      .from("organization_members")
      .update({
        role: validationResult.data.role,
      })
      .eq("id", memberId)
      .eq("organization_id", organizationId);

    if (updateError) {
      console.error("Error updating member role:", updateError);
      return {
        error: "Failed to update member role. Please try again.",
      };
    }

    // Revalidate paths
    revalidatePath(`/organizations/${organizationId}/members`);
    revalidatePath(`/organizations/${organizationId}`);

    return { error: null };
  } catch (error) {
    console.error("Change member role error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Remove a member from an organization
 * Owners can remove anyone (except themselves)
 * Admins can remove users and viewers
 */
export async function removeMember(
  organizationId: string,
  memberId: string
): Promise<{ error: string | null }> {
  try {
    const user = await requireAuth();

    // Check if user is a member
    const isUserMember = await isMember(user.id, organizationId);
    if (!isUserMember) {
      return {
        error: "You don't have access to this organization",
      };
    }

    // Get member details
    const supabase = await createServerSupabaseClient();
    const { data: member, error: memberError } = await supabase
      .from("organization_members")
      .select("user_id, role")
      .eq("id", memberId)
      .eq("organization_id", organizationId)
      .single();

    if (memberError || !member) {
      return {
        error: "Member not found",
      };
    }

    // Check permissions
    const permissionCheck = await canRemoveMember(
      user.id,
      organizationId,
      member.user_id
    );

    if (!permissionCheck.canRemove) {
      return {
        error: permissionCheck.reason || "You don't have permission to remove this member",
      };
    }

    // IMPORTANT: Get user email before removing member to protect invitations
    const { data: memberUser } = await supabase
      .from("users")
      .select("email")
      .eq("id", member.user_id)
      .single();

    // Remove member
    const { error: deleteError } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId)
      .eq("organization_id", organizationId);

    if (deleteError) {
      console.error("Error removing member:", deleteError);
      return {
        error: "Failed to remove member. Please try again.",
      };
    }

    // CRITICAL: Ensure accepted invitations remain accepted after member removal
    // This prevents any database-level triggers or constraints from reverting status
    if (memberUser?.email) {
      const { data: acceptedInvitations } = await supabase
        .from("invitations")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("invitee_email", memberUser.email)
        .eq("status", "accepted");

      // If any accepted invitations were somehow changed, restore them
      // This is a safety measure in case something tries to revert them
      if (acceptedInvitations && acceptedInvitations.length > 0) {
        const { error: protectError } = await supabase
          .from("invitations")
          .update({ status: "accepted" })
          .eq("organization_id", organizationId)
          .eq("invitee_email", memberUser.email)
          .in("id", acceptedInvitations.map(inv => inv.id));

        if (protectError) {
          console.error("Warning: Failed to protect accepted invitations after member removal:", protectError);
        }
      }
    }

    // Revalidate paths
    revalidatePath(`/organizations/${organizationId}/members`);
    revalidatePath(`/organizations/${organizationId}`);
    revalidatePath("/organizations");

    return { error: null };
  } catch (error) {
    console.error("Remove member error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Transfer ownership of an organization
 * Only owners can transfer ownership
 * Old owner becomes admin after transfer
 */
export async function transferOwnership(
  organizationId: string,
  newOwnerMemberId: string
): Promise<{ error: string | null }> {
  try {
    const user = await requireAuth();

    // Check if user is a member
    const isUserMember = await isMember(user.id, organizationId);
    if (!isUserMember) {
      return {
        error: "You don't have access to this organization",
      };
    }

    // Get new owner member details
    const supabase = await createServerSupabaseClient();
    const { data: newOwnerMember, error: memberError } = await supabase
      .from("organization_members")
      .select("user_id, role")
      .eq("id", newOwnerMemberId)
      .eq("organization_id", organizationId)
      .single();

    if (memberError || !newOwnerMember) {
      return {
        error: "Member not found",
      };
    }

    // Check permissions
    const permissionCheck = await canTransferOwnership(
      user.id,
      organizationId,
      newOwnerMember.user_id
    );

    if (!permissionCheck.canTransfer) {
      return {
        error: permissionCheck.reason || "You don't have permission to transfer ownership",
      };
    }

    // IMPORTANT: Get old owner member BEFORE updating new owner
    // Otherwise, querying by role='owner' will find both the old and new owner
    const { data: oldOwnerMember } = await supabase
      .from("organization_members")
      .select("id, role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("role", "owner")
      .single();

    if (!oldOwnerMember) {
      return {
        error: "Owner member record not found",
      };
    }

    // Transfer ownership in a transaction-like manner
    // IMPORTANT: Update old owner FIRST to avoid unique constraint violation
    // The unique index idx_organization_members_unique_owner prevents multiple owners
    // 1. Update old owner to admin role first
    const { error: updateOldOwnerError } = await supabase
      .from("organization_members")
      .update({
        role: "admin",
      })
      .eq("id", oldOwnerMember.id)
      .eq("organization_id", organizationId);

    if (updateOldOwnerError) {
      console.error("Error updating old owner role:", updateOldOwnerError);
      return {
        error: "Failed to transfer ownership. Please try again.",
      };
    }

    // 2. Update new owner to owner role (now safe since old owner is no longer owner)
    const { error: updateNewOwnerError } = await supabase
      .from("organization_members")
      .update({
        role: "owner",
      })
      .eq("id", newOwnerMemberId)
      .eq("organization_id", organizationId);

    if (updateNewOwnerError) {
      console.error("Error updating new owner role:", updateNewOwnerError);
      // Rollback: revert old owner back to owner role
      await supabase
        .from("organization_members")
        .update({
          role: "owner",
        })
        .eq("id", oldOwnerMember.id)
        .eq("organization_id", organizationId);
      return {
        error: "Failed to transfer ownership. Please try again.",
      };
    }

    // Revalidate paths
    revalidatePath(`/organizations/${organizationId}/members`);
    revalidatePath(`/organizations/${organizationId}`);
    revalidatePath("/organizations");

    return { error: null };
  } catch (error) {
    console.error("Transfer ownership error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

