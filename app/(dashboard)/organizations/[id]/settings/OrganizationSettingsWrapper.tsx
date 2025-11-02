/**
 * Server Component Wrapper for Organization Settings
 * Fetches organization data and passes it to the client component
 */

import { requireAuth } from "@/lib/utils/auth";
import { getOrganization } from "@/actions/organizations";
import { canUpdateOrganization, isOwner } from "@/lib/utils/permissions";
import { redirect } from "next/navigation";
import OrganizationSettingsClient from "./OrganizationSettingsClient";

interface OrganizationSettingsWrapperProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationSettingsWrapper({
  params,
}: OrganizationSettingsWrapperProps) {
  const user = await requireAuth();
  const { id } = await params;

  // Get organization
  const { organization, error } = await getOrganization(id);

  if (error || !organization) {
    redirect("/organizations");
  }

  // Check permissions - owners and admins can access settings
  const canUpdate = await canUpdateOrganization(user.id, id);
  if (!canUpdate) {
    redirect(`/organizations/${id}`);
  }

  // Check if user is owner (for delete functionality)
  const isUserOwner = await isOwner(user.id, id);

  return (
    <OrganizationSettingsClient
      organization={organization}
      organizationId={id}
      isOwner={isUserOwner}
    />
  );
}

