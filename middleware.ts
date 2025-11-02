/**
 * Next.js Middleware
 * Handles authentication checks and redirects for protected routes
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // Create Supabase client for middleware
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ["/organizations", "/dashboard", "/invitations"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Auth routes that should redirect if authenticated
  const authRoutes = ["/sign-in", "/sign-up"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Handle protected routes
  if (isProtectedRoute && !session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle auth routes - redirect if already authenticated
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/organizations", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

