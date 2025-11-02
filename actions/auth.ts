/**
 * Authentication Server Actions
 * All authentication mutations are handled here using Server Actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signUpSchema, signInSchema } from "@/lib/utils/validation";
import { AuthError } from "@/lib/types/auth";

/**
 * Sign up a new user with email and password
 * Validates input, creates user account, and returns result
 */
export async function signUp(
  formData: FormData
): Promise<{ error: AuthError | null; success: boolean }> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate input using Zod schema
    const validationResult = signUpSchema.safeParse({
      email,
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        error: {
          message: firstError.message,
        },
        success: false,
      };
    }

    const supabase = await createServerSupabaseClient();

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validationResult.data.email,
      password: validationResult.data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (error) {
      // Handle specific Supabase errors
      let errorMessage = "Failed to create account. Please try again.";

      if (error.message.includes("already registered")) {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (error.message.includes("password")) {
        errorMessage = "Password does not meet requirements.";
      } else if (error.message.includes("email")) {
        errorMessage = "Invalid email address.";
      } else {
        errorMessage = error.message;
      }

      return {
        error: {
          message: errorMessage,
          status: error.status || 400,
        },
        success: false,
      };
    }

    if (!data.user) {
      return {
        error: {
          message: "Failed to create account. Please try again.",
        },
        success: false,
      };
    }

    // Revalidate paths and redirect to sign in page
    revalidatePath("/sign-in");
    revalidatePath("/sign-up");

    return {
      error: null,
      success: true,
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      error: {
        message:
          "An unexpected error occurred. Please try again later.",
        status: 500,
      },
      success: false,
    };
  }
}

/**
 * Sign in an existing user with email and password
 * Validates credentials and creates a session
 */
export async function signIn(
  formData: FormData
): Promise<{ error: AuthError | null; success: boolean }> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate input using Zod schema
    const validationResult = signInSchema.safeParse({
      email,
      password,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        error: {
          message: firstError.message,
        },
        success: false,
      };
    }

    const supabase = await createServerSupabaseClient();

    // Sign in user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validationResult.data.email,
      password: validationResult.data.password,
    });

    if (error) {
      // Handle specific Supabase errors with clear, specific messages
      let errorMessage: string;
      let status = error.status || 401;

      // Check for unverified email error
      if (
        error.message.includes("Email not confirmed") ||
        error.message.includes("email not confirmed") ||
        error.message.includes("Email Not Confirmed") ||
        error.message.includes("email_not_confirmed") ||
        error.status === 403
      ) {
        errorMessage =
          "Please verify your email address before signing in. Check your inbox for the verification email and click the link to confirm your account. If you didn't receive the email, please check your spam folder or request a new verification email.";
        status = 403;
      }
      // Check for invalid credentials
      else if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("invalid login credentials") ||
        error.message.includes("Invalid credentials") ||
        error.status === 400
      ) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      }
      // Check for email-related errors
      else if (error.message.includes("email")) {
        errorMessage = "Invalid email address format. Please check your email and try again.";
      }
      // Check for password-related errors
      else if (error.message.includes("password")) {
        errorMessage = "Invalid password. Please check your password and try again.";
      }
      // Check for user not found
      else if (error.message.includes("User not found") || error.message.includes("user not found")) {
        errorMessage = "No account found with this email address. Please sign up first or check your email address.";
      }
      // Check for too many requests
      else if (error.message.includes("too many requests") || error.status === 429) {
        errorMessage =
          "Too many login attempts. Please wait a few minutes before trying again.";
        status = 429;
      }
      // Generic error - show the actual error message
      else {
        errorMessage = error.message || "An error occurred while signing in. Please try again.";
      }

      return {
        error: {
          message: errorMessage,
          status,
        },
        success: false,
      };
    }

    if (!data.session || !data.user) {
      return {
        error: {
          message: "Failed to create session. Please try again.",
        },
        success: false,
      };
    }

    // Revalidate paths and redirect to dashboard
    revalidatePath("/");
    revalidatePath("/organizations");

    return {
      error: null,
      success: true,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      error: {
        message:
          "An unexpected error occurred. Please try again later.",
        status: 500,
      },
      success: false,
    };
  }
}

/**
 * Sign out the current user
 * Clears session on both client and server sides
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      throw error;
    }

    // Revalidate all paths
    revalidatePath("/");
    revalidatePath("/sign-in");
    revalidatePath("/sign-up");
    revalidatePath("/organizations");

    // Redirect to home page
    redirect("/");
  } catch (error) {
    console.error("Sign out error:", error);
    // Still redirect even if there's an error
    redirect("/");
  }
}

/**
 * Get the current authenticated user
 * Returns user object if authenticated, null otherwise
 */
export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Get current user error:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * Returns true if user has valid session, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

