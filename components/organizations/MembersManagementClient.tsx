/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Members Management Client Component - Redesigned
 * Handles client-side interactions for member management with modern UI
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  inviteMember,
  changeMemberRole,
  removeMember,
  transferOwnership,
} from "@/actions/members";
import { OrganizationMember } from "@/lib/types/organization";
import { OrganizationRole } from "@/lib/types/auth";
import { 
  Users, UserPlus, Crown, Shield, Trash2, Mail, 
  X, AlertCircle, CheckCircle2, Edit3, RefreshCw, ChevronDown 
} from "lucide-react";

interface MembersManagementClientProps {
  organizationId: string;
  members: OrganizationMember[];
  userRole: OrganizationRole;
  isOwner: boolean;
}

export default function MembersManagementClient({
  organizationId,
  members: initialMembers,
  userRole,
  isOwner,
}: MembersManagementClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [showRoleChange, setShowRoleChange] = useState(false);
  const [showTransferOwnership, setShowTransferOwnership] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "user" | "viewer">("user");
  const [newRole, setNewRole] = useState<OrganizationRole>("user");

  const getRoleBadgeStyles = (role: string) => {
    const styles = {
      owner: 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border-amber-500/30',
      admin: 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30',
      user: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30',
      viewer: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/30'
    };
    return styles[role as keyof typeof styles] || styles.user;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (email: string, name?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  async function handleInvite() {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("email", inviteEmail);
      formData.append("role", inviteRole);

      const result = await inviteMember(organizationId, formData);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Invitation sent successfully!");
        setShowInviteForm(false);
        setInviteEmail("");
        setInviteRole("user");
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleChangeRole() {
    if (!selectedMember) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("role", newRole);

      const result = await changeMemberRole(
        organizationId,
        selectedMember.id,
        formData
      );

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Member role updated successfully!");
        setShowRoleChange(false);
        setSelectedMember(null);
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await removeMember(organizationId, memberId);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Member removed successfully!");
        setMembers(members.filter(m => m.id !== memberId));
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTransferOwnership(newOwnerMemberId: string) {
    if (
      !confirm(
        "Are you sure you want to transfer ownership? You will become an admin."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await transferOwnership(organizationId, newOwnerMemberId);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Ownership transferred successfully!");
        setShowTransferOwnership(false);
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      }
     
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const canChangeRole = (member: OrganizationMember): boolean => {
    if (userRole === "owner") {
      return member.role !== "owner" || showTransferOwnership;
    }
    if (userRole === "admin") {
      return member.role === "user" || member.role === "viewer";
    }
    return false;
  };

  const canRemove = (member: OrganizationMember): boolean => {
    if (userRole === "owner") {
      return member.role !== "owner";
    }
    if (userRole === "admin") {
      return member.role === "user" || member.role === "viewer";
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="glass rounded-2xl border border-red/30 p-4 backdrop-blur-xl animate-fadeIn flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red mb-1">Error</h4>
            <p className="text-sm text-light-3">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-light-4 hover:text-light-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="glass rounded-2xl border border-primary-500/30 p-4 backdrop-blur-xl animate-fadeIn flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-primary-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-primary-500 mb-1">Success</h4>
            <p className="text-sm text-light-3">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-light-4 hover:text-light-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Invite Section */}
      <div className="glass rounded-3xl border border-white/5 backdrop-blur-xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-5 border-b border-white/5 bg-dark-4/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-light-1">Invite Member</h2>
          </div>
          {!showInviteForm && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary-500/40 transition-all duration-300 hover:scale-105"
            >
              <Mail className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span>Send Invite</span>
            </button>
          )}
        </div>

        {showInviteForm ? (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-light-2 mb-2">
                Email Address <span className="text-red">*</span>
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-3 bg-dark-3 border border-white/10 rounded-xl text-light-1 placeholder-light-4 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                placeholder="colleague@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light-2 mb-2">
                Role <span className="text-red">*</span>
              </label>
              <div className="relative">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-4 py-3 bg-dark-3 border border-white/10 rounded-xl text-light-1 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer"
                >
                  {userRole === "owner" && <option value="admin">Admin</option>}
                  <option value="user">User</option>
                  <option value="viewer">Viewer</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-light-4 pointer-events-none" />
              </div>
              <p className="text-xs text-light-4 mt-2">Select the role for this member</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteEmail("");
                  setInviteRole("user");
                  setError(null);
                }}
                className="flex-1 px-6 py-3 bg-dark-3 border border-white/10 text-light-2 rounded-xl font-medium hover:bg-dark-4 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={isLoading || !inviteEmail}
                className="flex-1 px-6 py-3 bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4">
            <p className="text-light-3 text-sm">
              Invite new members to join your organization. They&apos;ll receive an email with instructions to accept the invitation.
            </p>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="glass rounded-3xl border border-white/5 backdrop-blur-xl overflow-hidden animate-fadeIn delay-100">
        <div className="px-6 py-5 border-b border-white/5 bg-dark-4/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-light-1">Team Members</h2>
              <p className="text-sm text-light-4">{members.length} active members</p>
            </div>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-3 flex items-center justify-center">
              <Users className="w-8 h-8 text-light-4" />
            </div>
            <h3 className="text-lg font-semibold text-light-2 mb-2">No members yet</h3>
            <p className="text-light-3 mb-6">Start building your team by inviting members!</p>
            <button
              onClick={() => setShowInviteForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/40 transition-all duration-300 hover:scale-105"
            >
              <UserPlus className="w-5 h-5" />
              <span>Invite First Member</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="px-6 py-5 hover:bg-dark-4/30 transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar and Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-500 to-purple-600 flex items-center justify-center font-semibold text-white shadow-lg">
                        {getInitials(member.user?.email || "Unknown")}
                      </div>
                      {member.role === 'owner' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-dark-2">
                          <Crown className="w-3 h-3 text-dark-1" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
              
                      <p className="text-sm text-light-3 truncate">{member.user?.email || "Unknown User"}</p>
                      <p className="text-xs text-light-4 mt-1">Joined {formatDate(member.joined_at)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:justify-end">
                    {isOwner && member.role === 'owner' && (
                      <button
                        onClick={() => setShowTransferOwnership(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-dark-3 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium hover:bg-dark-4 hover:border-amber-500/50 transition-all duration-300"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">Transfer</span>
                      </button>
                    )}
                    
                    {canChangeRole(member) && (
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setNewRole(member.role);
                          setShowRoleChange(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-dark-3 border border-white/10 text-light-2 rounded-lg text-sm font-medium hover:bg-dark-4 hover:border-primary-500/50 hover:text-primary-500 transition-all duration-300"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Change Role</span>
                      </button>
                    )}
                    
                    {canRemove(member) && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center w-10 h-10 bg-dark-3 border border-white/10 text-light-3 rounded-lg hover:bg-red/20 hover:border-red/50 hover:text-red transition-all duration-300 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {showRoleChange && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="glass rounded-3xl border border-purple-500/30 p-8 max-w-md w-full backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-light-1">Change Role</h2>
              </div>
              <button
                onClick={() => {
                  setShowRoleChange(false);
                  setSelectedMember(null);
                  setError(null);
                }}
                className="w-8 h-8 rounded-lg bg-dark-3 border border-white/10 text-light-3 hover:bg-dark-4 hover:text-light-1 transition-all duration-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-dark-3 border border-white/5">
              <p className="text-sm text-light-3 mb-1">Member</p>
              <p className="font-medium text-light-1">{selectedMember.user?.email}</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-light-2 mb-2">
                  New Role <span className="text-red">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as OrganizationRole)}
                    className="w-full px-4 py-3 bg-dark-3 border border-white/10 rounded-xl text-light-1 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {userRole === "owner" && (
                      <>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="viewer">Viewer</option>
                      </>
                    )}
                    {userRole === "admin" && (
                      <>
                        <option value="user">User</option>
                        <option value="viewer">Viewer</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-light-4 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRoleChange(false);
                    setSelectedMember(null);
                    setError(null);
                  }}
                  className="flex-1 px-6 py-3 bg-dark-3 border border-white/10 text-light-2 rounded-xl font-medium hover:bg-dark-4 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeRole}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferOwnership && isOwner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="glass rounded-3xl border border-amber-500/30 p-8 max-w-md w-full backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-light-1">Transfer Ownership</h2>
              </div>
              <button
                onClick={() => {
                  setShowTransferOwnership(false);
                  setError(null);
                }}
                className="w-8 h-8 rounded-lg bg-dark-3 border border-white/10 text-light-3 hover:bg-dark-4 hover:text-light-1 transition-all duration-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-400">
                ⚠️ You will become an admin after transferring ownership. This action requires confirmation.
              </p>
            </div>

            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              <p className="text-sm font-medium text-light-2 mb-3">Select new owner:</p>
              {members
                .filter((m) => m.role !== "owner")
                .map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleTransferOwnership(member.id)}
                    disabled={isLoading}
                    className="w-full text-left rounded-xl border border-white/10 bg-dark-3 p-4 hover:bg-dark-4 hover:border-amber-500/30 transition-all duration-300 group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary-500 to-purple-600 flex items-center justify-center font-semibold text-white text-sm">
                        {getInitials(member.user?.email || "Unknown")}
                      </div>
                      <div className="flex-1 min-w-0">
                    
                        <p className="text-sm text-light-4 capitalize">
                          Current: {member.role}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            <button
              onClick={() => {
                setShowTransferOwnership(false);
                setError(null);
              }}
              className="w-full px-6 py-3 bg-dark-3 border border-white/10 text-light-2 rounded-xl font-medium hover:bg-dark-4 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}