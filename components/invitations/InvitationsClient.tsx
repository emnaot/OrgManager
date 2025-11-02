/**
 * Invitations Client Component - Redesigned
 * Handles client-side interactions for invitations with modern horizontal layout
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  acceptInvitation,
  declineInvitation,
} from "@/actions/invitations";
import { OrganizationInvitation } from "@/lib/types/organization";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

interface InvitationsClientProps {
  invitations: OrganizationInvitation[];
}

export default function InvitationsClient({
  invitations,
}: InvitationsClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  async function handleAccept(invitationId: string) {
    setIsLoading(invitationId);
    setError(null);
    setSuccess(null);

    try {
      const result = await acceptInvitation(invitationId);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Invitation accepted! Redirecting...");
        if (result.organizationId) {
          setTimeout(() => {
            router.push(`/organizations/${result.organizationId}`);
          }, 1000);
        } else {
          router.refresh();
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(null);
    }
  }

  async function handleDecline(invitationId: string) {
    if (!confirm("Are you sure you want to decline this invitation?")) {
      return;
    }

    setIsLoading(invitationId);
    setError(null);
    setSuccess(null);

    try {
      const result = await declineInvitation(invitationId);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Invitation declined.");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(null);
    }
  }

  // Role badge colors
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
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

  if (invitations.length === 0) {
    return (
      <div className="glass rounded-2xl border border-primary-500/20 overflow-hidden animate-fadeIn">
        <div className="text-center py-20 px-6">
          {/* Empty State Icon */}
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-linear-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center animate-float">
            <svg className="w-16 h-16 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Empty State Text */}
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-light-1 mb-3">
              No Pending Invitations
            </h2>
            <p className="text-light-3 leading-relaxed mb-2">
              You&apos;re all caught up! You don&apos;t have any pending organization invitations at the moment.
            </p>
            <p className="text-sm text-light-4">
              When someone invites you to join their organization, you&apos;ll see it here and receive a notification.
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="flex items-center justify-center gap-2 mt-8 text-light-4">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse delay-200"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="animate-slideIn">
          <Alert variant="error">
            {error}
          </Alert>
        </div>
      )}
      {success && (
        <div className="animate-slideIn">
          <Alert variant="success">
            {success}
          </Alert>
        </div>
      )}

      {/* Invitations List - Horizontal Layout */}
      <div className="space-y-4">
        {invitations.map((invitation, index) => {
          const expiresAt = new Date(invitation.expires_at);
          const isExpired = expiresAt < new Date();
          const daysUntilExpiry = Math.ceil(
            (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={invitation.id}
              className="group relative glass rounded-2xl border border-primary-500/20 overflow-hidden hover:border-primary-500/40 hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Background Effect */}
              <div className="absolute inset-0 bg-linear-to-r from-primary-500/5 via-transparent to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Main Content - Horizontal Layout */}
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6 p-6">
                {/* Left Section - Organization Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Organization Icon */}
                  <div className="shrink-0 w-16 h-16 rounded-2xl bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <span className="text-2xl font-bold text-white">
                      {invitation.organization?.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>

                  {/* Organization Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-light-1 group-hover:text-primary-500 transition-colors duration-300 truncate">
                        {invitation.organization?.name || "Unknown Organization"}
                      </h3>
                      {!isExpired && daysUntilExpiry <= 3 && (
                        <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-secondary-500/20 text-secondary-500 rounded-full border border-secondary-500/30 animate-pulse">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getRoleBadgeClass(invitation.role)}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {invitation.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle Section - Date Info */}
                <div className="flex items-center gap-6 text-sm shrink-0">
                  {/* Invited Date */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-light-4 uppercase tracking-wider font-semibold">Invited</p>
                      <p className="text-light-1 font-medium whitespace-nowrap">
                        {new Date(invitation.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${isExpired ? 'bg-red/10 group-hover:bg-red/20' : 'bg-secondary-500/10 group-hover:bg-secondary-500/20'} transition-colors duration-300`}>
                      <svg className={`w-5 h-5 ${isExpired ? 'text-red' : 'text-secondary-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-light-4 uppercase tracking-wider font-semibold">
                        {isExpired ? 'Expired' : 'Expires'}
                      </p>
                      <p className={`font-medium whitespace-nowrap ${isExpired ? 'text-red' : 'text-light-1'}`}>
                        {expiresAt.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        {!isExpired && (
                          <span className={`ml-1.5 text-xs ${daysUntilExpiry <= 3 ? 'text-secondary-500' : 'text-light-3'}`}>
                            ({daysUntilExpiry}d)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto">
                  <Button
                    variant="primary"
                    onClick={() => handleAccept(invitation.id)}
                    disabled={isLoading !== null || isExpired}
                    isLoading={isLoading === invitation.id}
                    className="flex-1 lg:flex-none group/btn shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300"
                  >
                    {isLoading === invitation.id ? (
                      <>
                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Accepting...
                      </>
                    ) : (
                      <>
                    
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDecline(invitation.id)}
                    disabled={isLoading !== null}
                    isLoading={isLoading === invitation.id}
                    className="flex-1 lg:flex-none border-2 hover:border-red hover:text-red hover:bg-red/5 transition-all duration-300"
                  >
                    {isLoading === invitation.id ? (
                      <>
                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Declining...
                      </>
                    ) : (
                      <>
                
                        Decline
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Expired Warning Banner */}
              {isExpired && (
                <div className="border-t border-red/20 bg-red/5 px-6 py-3 animate-slideIn">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-light-2 font-medium">
                      This invitation has expired and can no longer be accepted.
                    </p>
                  </div>
                </div>
              )}

              {/* Decorative Border on Hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-primary-500/10 via-transparent to-secondary-500/10"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}