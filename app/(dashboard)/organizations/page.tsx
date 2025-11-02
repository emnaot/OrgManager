/**
 * Organizations Dashboard - Modern Redesign
 * Enhanced with cards, animations, and premium aesthetics
 */

import { requireAuth } from "@/lib/utils/auth";
import { getUserOrganizations } from "@/actions/organizations";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default async function OrganizationsPage() {
  const user = await requireAuth();

  // Fetch user's organizations from database
  const { organizations, error } = await getUserOrganizations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Header Section */}
      <div className="mb-12 animate-fadeIn">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-linear-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-glow">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold gradient-text">
                Your Organizations
              </h1>
            </div>
            <p className="text-lg text-light-3 max-w-2xl">
              Manage your workspace, collaborate with teams, and access organization settings all in one place
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/invitations" className="animate-slideIn delay-100">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto glass border-primary-500/30 hover:border-primary-500 hover:bg-primary-500/10 transition-all duration-300"
              >
            
                View Invitations
              </Button>
            </Link>
            <Link href="/organizations/new" className="animate-slideIn delay-200">
              <Button 
                variant="primary" 
                className="w-full sm:w-auto bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
              >
          
                Create Organization
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {organizations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fadeIn delay-300">
          <div className="glass rounded-2xl p-6 border border-white/10 hover:border-primary-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-3 mb-1">Total Organizations</p>
                <p className="text-3xl font-bold text-light-1">{organizations.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6 border border-white/10 hover:border-secondary-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-3 mb-1">Owned by You</p>
                <p className="text-3xl font-bold text-light-1">
                  {organizations.filter(org => org.user_role === 'owner').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-3 mb-1">Active Memberships</p>
                <p className="text-3xl font-bold text-light-1">
                  {organizations.filter(org => org.user_role !== 'owner').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="error" className="mb-6 animate-fadeIn">
          {error}
        </Alert>
      )}

      {organizations.length === 0 ? (
        <div className="rounded-3xl glass border border-white/10 p-16 text-center animate-fadeIn delay-400">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-linear-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-light-1 mb-3">Start Your Journey</h3>
            <p className="text-light-3 mb-8 text-lg">
              You haven&apos;t joined any organizations yet. Create your first one to get started!
            </p>
            <Link href="/organizations/new">
              <Button 
                variant="primary"
                className="bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 px-8 py-3 text-lg"
              >
            
                Create your first organization
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org, index) => (
            <Link
              key={org.id}
              href={`/organizations/${org.id}`}
              className="group block animate-fadeIn"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <div className="h-full rounded-2xl glass border border-white/10 p-6 transition-all duration-300 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/20 hover:-translate-y-1">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 group-hover:rotate-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                    org.user_role === 'owner' 
                      ? 'bg-secondary-500/20 text-secondary-500 border border-secondary-500/30' 
                      : org.user_role === 'admin'
                      ? 'bg-primary-500/20 text-primary-500 border border-primary-500/30'
                      : 'bg-light-3/20 text-light-3 border border-light-3/30'
                  }`}>
                    {org.user_role}
                  </span>
                </div>

                {/* Card Content */}
                <h2 className="mb-2 text-xl font-bold text-light-1 group-hover:text-primary-500 transition-colors line-clamp-1">
                  {org.name}
                </h2>
                
                {org.description ? (
                  <p className="text-sm text-light-3 line-clamp-2 mb-4 min-h-[40px]">
                    {org.description}
                  </p>
                ) : (
                  <p className="text-sm text-light-4 italic mb-4 min-h-[40px]">
                    No description provided
                  </p>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-light-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Members</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary-500 group-hover:gap-3 transition-all">
                    <span className="text-sm font-medium">View Details</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}