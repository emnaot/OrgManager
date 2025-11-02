/**
 * Accept Invitation Route Handler
 * Handles invitation acceptance via token (from email links)
 */

import { acceptInvitationByToken } from "@/actions/invitations";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    redirect("/invitations?error=missing_token");
  }

  const result = await acceptInvitationByToken(token);

  if (result.error) {
    redirect(`/invitations?error=${encodeURIComponent(result.error)}`);
  }

  if (result.organizationId) {
    redirect(`/organizations/${result.organizationId}?joined=true`);
  }

  redirect("/invitations?success=invitation_accepted");
}

