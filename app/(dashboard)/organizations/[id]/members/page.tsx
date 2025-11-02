/**
 * Members Management Page - Redesigned
 * Allows owners and admins to manage organization members with modern UI
 */

import { requireAuth } from "@/lib/utils/auth";
import {
  getOrganization,
  getOrganizationMembers,
} from "@/actions/organizations";
import { getUserRole, isAdminOrOwner, isOwner } from "@/lib/utils/permissions";
import MembersManagementClient from "@/components/organizations/MembersManagementClient";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { redirect } from "next/navigation";
import { Users, ArrowLeft, Shield, UserPlus, Crown } from "lucide-react";

interface MembersPageProps {
  params: Promise<{ id: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const user = await requireAuth();
  const { id } = await params;

  // Get organization and members
  const [orgResult, membersResult] = await Promise.all([
    getOrganization(id),
    getOrganizationMembers(id),
  ]);

  if (orgResult.error || !orgResult.organization) {
    return (
      <div className="min-h-screen bg-linear-to-br from-dark-2 via-dark-3 to-dark-4 flex items-center justify-center px-4">
        <div className="max-w-md w-full glass rounded-3xl border border-red/20 p-8 backdrop-blur-xl text-center">
          <Alert variant="error">
            {orgResult.error || "Organization not found"}
          </Alert>
          <Link href="/organizations" className="mt-6 inline-block">
            <Button variant="primary">Back to Organizations</Button>
          </Link>
        </div>
      </div>
    );
  }

  const organization = orgResult.organization;
  const members = membersResult.members || [];
  const userRole = await getUserRole(user.id, id);
  const canManage = await isAdminOrOwner(user.id, id);
  const isUserOwner = await isOwner(user.id, id);

  if (!canManage) {
    redirect(`/organizations/${id}`);
  }

  // Calculate role statistics
  const roleStats = {
    owner: members.filter(m => m.role === 'owner').length,
    admin: members.filter(m => m.role === 'admin').length,
    user: members.filter(m => m.role === 'user').length,
    viewer: members.filter(m => m.role === 'viewer').length,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-dark-2 via-dark-3 to-dark-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(135,126,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(135,126,255,0.03)_1px,transparent_1px)] bg-size-[50px_50px] pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 animate-fadeIn">
          <Link
            href={`/organizations/${id}`}
            className="group inline-flex items-center gap-2 text-light-3 hover:text-primary-500 transition-all duration-300 mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Organization</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-linear-to-br from-dark-3 to-dark-4 rounded-lg border-2 border-primary-500/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-500">{members.length}</span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-light-1 mb-2">
                  Team Members
                </h1>
                <p className="text-light-3 text-lg">
                  {organization.name} • Manage roles and permissions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fadeIn delay-100">
          {[
            { label: 'Owner', count: roleStats.owner, color: 'from-amber-500 to-amber-600', icon: Crown },
            { label: 'Admins', count: roleStats.admin, color: 'from-purple-500 to-purple-600', icon: Shield },
            { label: 'Members', count: roleStats.user, color: 'from-blue-500 to-blue-600', icon: Users },
            { label: 'Viewers', count: roleStats.viewer, color: 'from-gray-500 to-gray-600', icon: Users },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className="glass rounded-2xl border border-white/5 p-5 backdrop-blur-xl hover:border-primary-500/30 transition-all duration-300 group animate-fadeIn"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${stat.color} bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-5 h-5 text-light-1" />
                  </div>
                  <div className="text-3xl font-bold text-light-1">{stat.count}</div>
                </div>
                <p className="text-light-3 text-sm font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Members Management Component */}
        <MembersManagementClient
          organizationId={id}
          members={members}
          userRole={userRole || "viewer"}
          isOwner={isUserOwner}
        />


      </div>
    </div>
  );
}