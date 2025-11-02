/**
 * Organization Detail Page - Redesigned
 * Shows organization information and members list with modern UI
 */

import { requireAuth } from "@/lib/utils/auth";
import { getOrganization, getOrganizationMembers } from "@/actions/organizations";
import { getUserRole, isAdminOrOwner } from "@/lib/utils/permissions";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { redirect } from "next/navigation";

interface OrganizationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: OrganizationPageProps) {
  const user = await requireAuth();
  const { id } = await params;

  // Get organization and members
  const [orgResult, membersResult] = await Promise.all([
    getOrganization(id),
    getOrganizationMembers(id),
  ]);

  if (orgResult.error || !orgResult.organization) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 grid-pattern">
        <div className="max-w-md w-full animate-fadeIn">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-red/20 to-red/5 flex items-center justify-center">
              <svg className="w-10 h-10 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <Alert variant="error" className="mb-6">
              {orgResult.error || "Organization not found"}
            </Alert>
            <Link href="/organizations">
              <Button variant="primary" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Organizations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const organization = orgResult.organization;
  const members = membersResult.members || [];
  const userRole = await getUserRole(user.id, id);
  const canManage = await isAdminOrOwner(user.id, id);

  // Role badge colors
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30';
      case 'admin':
        return 'bg-gradient-to-r from-secondary-500 to-yellow-500 text-dark-1 shadow-lg shadow-secondary-500/30';
      case 'user':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20';
      case 'viewer':
        return 'bg-gradient-to-r from-light-4 to-light-3 text-dark-1 shadow-lg shadow-light-4/20';
      default:
        return 'bg-dark-4 text-light-3';
    }
  };

  return (
    <div className="min-h-screen bg-dark-2 grid-pattern">
      {/* Header Section with Gradient Background */}
      <div className="relative overflow-hidden bg-linear-to-br from-dark-3 via-dark-2 to-dark-1 border-b border-dark-4">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float delay-300"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/organizations"
            className="group inline-flex items-center text-light-3 hover:text-primary-500 transition-all duration-300 mb-8"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Organizations</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 animate-fadeIn">
            <div className="flex-1">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/40 animate-glow">
                  <span className="text-2xl font-bold text-white">
                    {organization.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold gradient-text animate-gradient mb-2">
                    {organization.name}
                  </h1>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getRoleBadgeClass(userRole)} animate-slideIn`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-bold uppercase tracking-wide">{userRole}</span>
                  </div>
                </div>
              </div>
              
              {organization.description && (
                <p className="text-lg text-light-2 max-w-3xl leading-relaxed animate-fadeIn delay-200">
                  {organization.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-light-3 animate-fadeIn delay-300">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-medium text-light-1">{members.length}</span>
                  <span>Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Created {new Date(organization.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 animate-fadeIn delay-400">
              {canManage && (
                <Link href={`/organizations/${id}/members`}>
                  <Button variant="primary" className="group shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/50 transition-all duration-300">
                    Manage Members
                  </Button>
                </Link>
              )}
              {userRole === "owner" && (
                <Link href={`/organizations/${id}/settings`}>
                  <Button variant="outline" className="group border-2 hover:border-primary-500 hover:bg-primary-500/10 transition-all duration-300">
              
                    Settings
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Organization Info Card */}
          <div className="lg:col-span-1 animate-fadeIn delay-200">
            <div className="glass rounded-2xl p-8 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-500 group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-light-1">Details</h2>
              </div>
              
              <div className="space-y-6">
                <div className="group/item">
                  <dt className="text-sm font-semibold text-light-3 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary-500 rounded-full group-hover/item:h-6 transition-all duration-300"></div>
                    Organization Name
                  </dt>
                  <dd className="text-base font-medium text-light-1 pl-3">{organization.name}</dd>
                </div>
                
                <div className="group/item">
                  <dt className="text-sm font-semibold text-light-3 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-secondary-500 rounded-full group-hover/item:h-6 transition-all duration-300"></div>
                    Created On
                  </dt>
                  <dd className="text-base font-medium text-light-1 pl-3">
                    {new Date(organization.created_at).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </dd>
                </div>
                
                {organization.description && (
                  <div className="group/item">
                    <dt className="text-sm font-semibold text-light-3 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <div className="w-1 h-4 bg-blue-500 rounded-full group-hover/item:h-6 transition-all duration-300"></div>
                      Description
                    </dt>
                    <dd className="text-base text-light-2 pl-3 leading-relaxed">{organization.description}</dd>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Members Card */}
          {userRole !== "viewer" && (
            <div className="lg:col-span-2 animate-fadeIn delay-300">
              <div className="glass rounded-2xl p-8 border border-secondary-500/20 hover:border-secondary-500/40 transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-secondary-500 to-yellow-500 flex items-center justify-center animate-pulse">
                      <svg className="w-6 h-6 text-dark-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-light-1">Team Members</h2>
                      <p className="text-sm text-light-3 mt-1">{members.length} total members</p>
                    </div>
                  </div>
                  
                  {canManage && (
                    <Link href={`/organizations/${id}/members`}>
                      <Button variant="primary" size="sm" className="shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300">
                        Invite Member
                      </Button>
                    </Link>
                  )}
                </div>

                {members.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-light-4/20 to-light-3/10 flex items-center justify-center animate-float">
                      <svg className="w-12 h-12 text-light-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-xl text-light-2 font-medium mb-2">No team members yet</p>
                    <p className="text-light-3">
                      {canManage && "Start building your team by inviting members!"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((member, index) => (
                      <div
                        key={member.id}
                        className="group relative rounded-xl border border-dark-4 bg-linear-to-br from-dark-4 to-dark-3 p-5 hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <span className="text-lg font-bold text-white">
                              {member.user?.email?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-semibold text-light-1 truncate group-hover:text-primary-500 transition-colors duration-300">
                                {member.user?.email || "Unknown User"}
                              </p>
                              <span className={`shrink-0 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getRoleBadgeClass(member.role)}`}>
                                {member.role}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-light-3">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Joined {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}