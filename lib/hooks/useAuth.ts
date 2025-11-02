/**
 * Client-side authentication hooks
 * Provides reactive auth state for Client Components
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

/**
 * Custom hook to get current authenticated user in Client Components
 * Automatically updates when auth state changes
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error("Error getting user:", error);
        setUser(null);
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Refresh router on auth state change
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}

/**
 * Hook to get Supabase client for Client Components
 */
export function useSupabase() {
  return createBrowserSupabaseClient();
}

