/**
 * Auth Callback Route Handler
 * Handles OAuth and email confirmation callbacks from Supabase
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/organizations";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful authentication, redirect to dashboard
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // If there's an error or no code, redirect to sign-in
  return NextResponse.redirect(new URL("/sign-in?error=auth_failed", requestUrl.origin));
}

