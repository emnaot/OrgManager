/**
 * Invitations Page - Redesigned
 * Shows pending invitations for the current user
 */

import { requireAuth } from "@/lib/utils/auth";
import { getPendingInvitations } from "@/actions/invitations";
import InvitationsClient from "@/components/invitations/InvitationsClient";
import Link from "next/link";
import { Mail, ArrowLeft, Inbox } from "lucide-react";
import Alert from "@/components/ui/Alert";

export default async function InvitationsPage() {
  const user = await requireAuth();
  const { invitations, error } = await getPendingInvitations();

  return (
    <div className="min-h-screen bg-linear-to-br from-dark-2 via-dark-3 to-dark-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(135,126,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(135,126,255,0.03)_1px,transparent_1px)] bg-size-[50px_50px] pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 animate-fadeIn">
          <Link
            href="/organizations"
            className="group inline-flex items-center gap-2 text-light-3 hover:text-primary-500 transition-all duration-300 mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Organizations</span>
          </Link>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Mail className="w-7 h-7 text-white" />
              </div>
              {invitations && invitations.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-500 rounded-full border-2 border-dark-2 flex items-center justify-center">
                  <span className="text-xs font-bold text-dark-1">{invitations.length}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-light-1 via-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
                Pending Invitations
              </h1>
              <p className="text-light-3 text-lg">
                Review and respond to your organization invitations
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 animate-fadeIn delay-200">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {!invitations || invitations.length === 0 ? (
          <div className="animate-fadeIn delay-200">
            <div className="glass rounded-3xl border border-white/5 p-12 text-center backdrop-blur-xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-dark-3 to-dark-4 flex items-center justify-center border border-white/5">
                <Inbox className="w-10 h-10 text-light-4" />
              </div>
              <h3 className="text-2xl font-semibold text-light-2 mb-3">No pending invitations</h3>
              <p className="text-light-3 mb-8 max-w-md mx-auto">
                You&apos;re all caught up! When someone invites you to join their organization, it will appear here.
              </p>
              <Link
                href="/organizations"
                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 hover:scale-105"
              >
                Explore Organizations
              </Link>
            </div>
          </div>
        ) : (
          <>
            <InvitationsClient invitations={invitations} />
            
            {/* Helper Text */}
            <div className="mt-8 text-center animate-fadeIn delay-500">
              <p className="text-light-4 text-sm">
                💡 Tip: Accepting an invitation will give you access to the organization based on your assigned role.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}