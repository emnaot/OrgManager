/**
 * Dashboard Layout - Modern Redesign
 * Enhanced with glassmorphism, animations, and modern aesthetics
 */

import { requireAuth } from "@/lib/utils/auth";
import { signOut } from "@/actions/auth";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/protected/ProtectedRoute";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication on server side
  const user = await requireAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-dark-2 via-dark-3 to-dark-2 grid-pattern">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float delay-300"></div>
        </div>

        {/* Navigation with glassmorphism */}
        <nav className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/organizations"
                  className="group flex items-center gap-3 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 group-hover:scale-110">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold bg-linear-to-r from-light-1 via-primary-500 to-secondary-500 bg-clip-text text-transparent animate-gradient">
                    OrgManager
                  </span>
                </Link>
              </div>
              
              <div className="flex items-center gap-8">
                <nav className="hidden md:flex items-center gap-2">
                  <Link
                    href="/organizations"
                    className="relative px-4 py-2 text-sm font-medium text-light-3 hover:text-light-1 transition-all duration-300 group"
                  >
                    <span className="relative z-10">Organizations</span>
                    <span className="absolute inset-0 bg-primary-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  </Link>
                  <Link
                    href="/invitations"
                    className="relative px-4 py-2 text-sm font-medium text-light-3 hover:text-light-1 transition-all duration-300 group"
                  >
                    <span className="relative z-10">Invitations</span>
                    <span className="absolute inset-0 bg-primary-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  </Link>
                </nav>
                
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-light-2 font-medium">{user.email}</span>
                  </div>
                  
                  <form action={signOut}>
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-red/10 hover:text-red transition-all duration-300"
                    >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="relative z-10">{children}</main>


      </div>
    </ProtectedRoute>
  );
}