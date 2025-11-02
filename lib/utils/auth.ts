/**
 * Authentication utilities and helpers
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Require authentication for a server component/action
 * Redirects to sign-in if not authenticated
 */
export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/sign-in");
  }

  return user;
}

/**
 * Get authenticated user without redirecting
 * Returns null if not authenticated
 */
export async function getAuthUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Redirect authenticated users away from auth pages
 */
export async function redirectIfAuthenticated() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/organizations");
  }
}

