/**
 * Organization Server Actions
 * All organization-related mutations and queries are handled here using Server Actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/utils/auth";
import {
  canUpdateOrganization,
  canDeleteOrganization,
  isMember,
} from "@/lib/utils/permissions";
import { Organization, OrganizationMember } from "@/lib/types/organization";
import { z } from "zod";

/**
 * Create organization schema
 */
const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(1000, "Description is too long").nullable().optional(),
});

/**
 * Update organization schema
 */
const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(1000, "Description is too long").nullable().optional(),
});

/**
 * Create a new organization
 * Creator automatically becomes the owner
 */
export async function createOrganization(
  formData: FormData
): Promise<{ error: string | null; organizationId?: string }> {
  try {
    console.log("[createOrganization] ========== START ==========");
    console.log("[createOrganization] Starting organization creation...");
    
    // Require authentication
    console.log("[createOrganization] Calling requireAuth()...");
    let user;
    try {
      user = await requireAuth();
      console.log("[createOrganization] ✅ User authenticated:", { id: user.id, email: user.email });
    } catch (authError) {
      console.error("[createOrganization] ❌ Auth error:", authError);
      return {
        error: "Authentication failed. Please sign in again.",
      };
    }

    // Parse and validate input
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    console.log("[createOrganization] Parsed form data:", { name, description });

    const validationResult = createOrganizationSchema.safeParse({
      name,
      description: description || null,
    });

    if (!validationResult.success) {
      console.error("[createOrganization] Validation failed:", validationResult.error);
      const firstError = validationResult.error.issues[0];
      return { error: firstError.message };
    }

    console.log("[createOrganization] Validation passed");

    const supabase = await createServerSupabaseClient();

    // Verify authentication context is available for RLS
    console.log("[createOrganization] Verifying authentication context...");
    
    // Use getUser() which refreshes the session automatically
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !authUser) {
      console.error("[createOrganization] No authenticated user found:", userError);
      return {
        error: "Authentication session not found. Please sign in again.",
      };
    }
    console.log("[createOrganization] User verified:", { 
      userId: authUser.id, 
      email: authUser.email 
    });

    // Verify auth context is available for RLS by testing a simple query
    // This ensures the session is properly passed to Supabase
    const { data: testData, error: testError } = await supabase
      .from("users")
      .select("id")
      .eq("id", authUser.id)
      .single();
    
    if (testError) {
      console.error("[createOrganization] RLS test query failed - auth context may not be available:", testError);
      console.error("[createOrganization] This means auth.uid() will be NULL in RLS policies");
      return {
        error: "Authentication context not available. Please try signing out and back in.",
      };
    }
    console.log("[createOrganization] RLS context verified - auth.uid() is available");

    // Ensure user profile exists in public.users table
    console.log("[createOrganization] Checking if user profile exists...");
    const { data: userProfile, error: userProfileError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (userProfileError || !userProfile) {
      console.log("[createOrganization] User profile not found, creating it...");
      const { error: createUserError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (createUserError) {
        console.error("[createOrganization] Error creating user profile:", createUserError);
        console.error("[createOrganization] Error details:", JSON.stringify(createUserError, null, 2));
        return {
          error: `Failed to create user profile: ${createUserError.message || "Unknown error"}`,
        };
      }
      console.log("[createOrganization] User profile created successfully");
    } else {
      console.log("[createOrganization] User profile exists");
    }

    // Try using RPC function first (more reliable for RLS)
    console.log("[createOrganization] Attempting to create organization via RPC function...");
    const { data: orgId, error: rpcError } = await supabase.rpc('create_organization_with_owner', {
      org_name: validationResult.data.name,
      org_description: validationResult.data.description || null,
      owner_user_id: user.id,
    });

    if (!rpcError && orgId) {
      console.log("[createOrganization] ✅ Organization created via RPC:", orgId);
      
      // Revalidate paths
      console.log("[createOrganization] Revalidating paths...");
      revalidatePath("/organizations");
      revalidatePath(`/organizations/${orgId}`);

      console.log("[createOrganization] Organization creation completed successfully");
      return {
        error: null,
        organizationId: orgId,
      };
    }

    // Fallback to direct insert if RPC function doesn't exist
    console.log("[createOrganization] RPC function not available or failed, using direct insert...");
    if (rpcError) {
      console.log("[createOrganization] RPC error (will try direct insert):", rpcError.message);
    }

    // Ensure session is fresh before insert
    console.log("[createOrganization] Refreshing session before insert...");
    const { data: { session: freshSession }, error: sessionRefreshError } = await supabase.auth.getSession();
    if (sessionRefreshError || !freshSession) {
      console.error("[createOrganization] ❌ Session lost before insert:", sessionRefreshError);
      return {
        error: "Session expired. Please try again.",
      };
    }
    console.log("[createOrganization] ✅ Fresh session confirmed for insert");

    // Create organization in a transaction-like manner
    // 1. Insert organization
    console.log("[createOrganization] Creating organization in database...");
    console.log("[createOrganization] Inserting with data:", {
      name: validationResult.data.name,
      description: validationResult.data.description || null,
    });
    
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: validationResult.data.name,
        description: validationResult.data.description || null,
      })
      .select()
      .single();

    if (orgError || !organization) {
      console.error("[createOrganization] Error creating organization:", orgError);
      console.error("[createOrganization] Error details:", JSON.stringify(orgError, null, 2));
      console.error("[createOrganization] Error code:", orgError?.code);
      console.error("[createOrganization] Error message:", orgError?.message);
      console.error("[createOrganization] Error hint:", orgError?.hint);
      
      // If RLS error, provide helpful message
      if (orgError?.code === '42501') {
        return { 
          error: `RLS Error: auth.uid() is not available in INSERT context. Please run migration 007_create_organization_helper.sql in Supabase SQL Editor.` 
        };
      }
      
      return { error: `Failed to create organization: ${orgError?.message || "Unknown error"}` };
    }

    console.log("[createOrganization] Organization created successfully:", { id: organization.id, name: organization.name });

    // 2. Add creator as owner
    console.log("[createOrganization] Adding creator as owner...");
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) {
      console.error("[createOrganization] Error adding creator as owner:", memberError);
      console.error("[createOrganization] Member error details:", JSON.stringify(memberError, null, 2));
      console.error("[createOrganization] Member error code:", memberError.code);
      console.error("[createOrganization] Member error message:", memberError.message);
      console.error("[createOrganization] Member error hint:", memberError.hint);
      console.log("[createOrganization] Attempting to rollback - deleting organization...");
      
      // Rollback: Delete the organization
      const { error: deleteError } = await supabase.from("organizations").delete().eq("id", organization.id);
      if (deleteError) {
        console.error("[createOrganization] Error during rollback:", deleteError);
      } else {
        console.log("[createOrganization] Rollback successful");
      }
      
      return {
        error: `Failed to add creator as owner: ${memberError.message || "Unknown error"}`,
      };
    }

    console.log("[createOrganization] Creator added as owner successfully");

    // Revalidate paths
    console.log("[createOrganization] Revalidating paths...");
    revalidatePath("/organizations");
    revalidatePath(`/organizations/${organization.id}`);

    console.log("[createOrganization] Organization creation completed successfully");
    return {
      error: null,
      organizationId: organization.id,
    };
  } catch (error) {
    console.error("[createOrganization] ========== ERROR ==========");
    console.error("[createOrganization] Unexpected error:", error);
    console.error("[createOrganization] Error type:", error?.constructor?.name);
    console.error("[createOrganization] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[createOrganization] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Log full error object for debugging
    if (error && typeof error === 'object') {
      console.error("[createOrganization] Full error object:", JSON.stringify(error, null, 2));
    }
    
    return {
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Get organization by ID
 * Returns null if user doesn't have access
 */
export async function getOrganization(
  organizationId: string
): Promise<{ organization: Organization | null; error: string | null }> {
  try {
    const user = await requireAuth();

    // Check if user is a member
    const isUserMember = await isMember(user.id, organizationId);
    if (!isUserMember) {
      return {
        organization: null,
        error: "You don't have access to this organization",
      };
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (error || !data) {
      return {
        organization: null,
        error: "Organization not found",
      };
    }

    return {
      organization: data as Organization,
      error: null,
    };
  } catch (error) {
    console.error("Get organization error:", error);
    return {
      organization: null,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Update organization details
 * Only owners and admins can update
 */
export async function updateOrganization(
  organizationId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const user = await requireAuth();

    // Check permissions
    const canUpdate = await canUpdateOrganization(user.id, organizationId);
    if (!canUpdate) {
      return {
        error: "You don't have permission to update this organization",
      };
    }

    // Parse and validate input
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;

    const validationResult = updateOrganizationSchema.safeParse({
      name,
      description: description || null,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { error: firstError.message };
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from("organizations")
      .update({
        name: validationResult.data.name,
        description: validationResult.data.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId);

    if (error) {
      console.error("Error updating organization:", error);
      return { error: "Failed to update organization. Please try again." };
    }

    // Revalidate paths
    revalidatePath("/organizations");
    revalidatePath(`/organizations/${organizationId}`);

    return { error: null };
  } catch (error) {
    console.error("Update organization error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Delete organization
 * Only owners can delete
 */
export async function deleteOrganization(
  organizationId: string
): Promise<{ error: string | null }> {
  try {
    const user = await requireAuth();

    // Check permissions
    const canDelete = await canDeleteOrganization(user.id, organizationId);
    if (!canDelete) {
      return {
        error: "Only owners can delete organizations",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Delete organization (cascade will handle members and invitations)
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", organizationId);

    if (error) {
      console.error("Error deleting organization:", error);
      return { error: "Failed to delete organization. Please try again." };
    }

    // Revalidate paths
    revalidatePath("/organizations");

    return { error: null };
  } catch (error) {
    console.error("Delete organization error:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Get all organizations for the current user
 * Returns organizations with user's role in each
 */
export async function getUserOrganizations(): Promise<{
  organizations: Array<Organization & { user_role: string }>;
  error: string | null;
}> {
  try {
    const user = await requireAuth();

    const supabase = await createServerSupabaseClient();

    // First, ensure user profile exists in public.users table
    // The trigger should create it, but check just in case
    const { data: userProfile } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    // If user profile doesn't exist, create it
    if (!userProfile && user.email) {
      await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Get organizations where user is a member
    // Try with join first, if it fails, fall back to separate queries
    let organizations: Array<Organization & { user_role: string }> = [];
    let error: any = null;

    const { data: membersData, error: membersError } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false });

    if (membersError) {
      console.error("Error fetching organization members:", membersError);
      console.error("Error details:", JSON.stringify(membersError, null, 2));
      console.error("Error message:", membersError.message);
      console.error("Error code:", membersError.code);
      console.error("Error hints:", membersError.hint);
      
      // If it's a relation/table not found error, suggest running migration
      if (
        membersError.message?.includes("relation") ||
        membersError.message?.includes("does not exist") ||
        membersError.code === "42P01"
      ) {
        return {
          organizations: [],
          error: "Database tables not found. Please run the migration file: supabase/migrations/001_initial_schema.sql",
        };
      }
      
      return {
        organizations: [],
        error: membersError.message || "Failed to fetch organizations. Please make sure the database schema is set up correctly.",
      };
    }

    // If we have members, fetch organization details
    if (membersData && membersData.length > 0) {
      const organizationIds = membersData.map((m) => m.organization_id);
      const { data: orgsData, error: orgsError } = await supabase
        .from("organizations")
        .select("*")
        .in("id", organizationIds);

      if (orgsError) {
        console.error("Error fetching organizations:", orgsError);
        return {
          organizations: [],
          error: orgsError.message || "Failed to fetch organization details.",
        };
      }

      // Combine the data
      organizations = (orgsData || []).map((org) => {
        const member = membersData.find((m) => m.organization_id === org.id);
        return {
          ...org,
          user_role: member?.role || "viewer",
        } as Organization & { user_role: string };
      });
    }

    return {
      organizations,
      error: null,
    };
  } catch (error) {
    console.error("Get user organizations error:", error);
    return {
      organizations: [],
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Get all members of an organization
 * Only members of the organization can view members
 */
export async function getOrganizationMembers(
  organizationId: string
): Promise<{
  members: OrganizationMember[];
  error: string | null;
}> {
  try {
    const user = await requireAuth();

    // Check if user is a member
    const isUserMember = await isMember(user.id, organizationId);
    if (!isUserMember) {
      return {
        members: [],
        error: "You don't have access to this organization",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Get all members with user details
    const { data, error } = await supabase
      .from("organization_members")
      .select(
        `
        id,
        organization_id,
        user_id,
        role,
        joined_at,
        users (
          id,
          email
        )
      `
      )
      .eq("organization_id", organizationId)
      .order("role", { ascending: false }) // Owner first, then admin, user, viewer
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Error fetching organization members:", error);
      return {
        members: [],
        error: "Failed to fetch members. Please try again.",
      };
    }

    // Transform data
    const members = (data || []).map((item: any) => ({
      id: item.id,
      organization_id: item.organization_id,
      user_id: item.user_id,
      role: item.role,
      joined_at: item.joined_at,
      user: item.users
        ? {
            id: item.users.id,
            email: item.users.email,
          }
        : undefined,
    })) as OrganizationMember[];

    return {
      members,
      error: null,
    };
  } catch (error) {
    console.error("Get organization members error:", error);
    return {
      members: [],
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

