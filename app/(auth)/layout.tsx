/**
 * Auth Layout
 * Layout for authentication pages (sign-in, sign-up)
 * Redirects authenticated users to dashboard
 */

import { redirectIfAuthenticated } from "@/lib/utils/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect to dashboard if already authenticated
  await redirectIfAuthenticated();

  return (
    <div className="min-h-screen bg-dark-3">
      {children}
    </div>
  );
}

