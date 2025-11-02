/**
 * Organization Settings Client Component - Redesigned
 * Handles form interactions for updating organization with modern UI
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateOrganization, deleteOrganization } from "@/actions/organizations";
import { Organization } from "@/lib/types/organization";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import Link from "next/link";

interface OrganizationSettingsClientProps {
  organization: Organization;
  organizationId: string;
  isOwner: boolean;
}

export default function OrganizationSettingsClient({
  organization,
  organizationId,
  isOwner,
}: OrganizationSettingsClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [name, setName] = useState(organization.name);
  const [description, setDescription] = useState(organization.description || "");

  // Update form when organization data changes
  useEffect(() => {
    setName(organization.name);
    setDescription(organization.description || "");
  }, [organization]);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateOrganization(organizationId, formData);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Organization updated successfully!");
        setTimeout(() => {
          router.refresh();
          router.push(`/organizations/${organizationId}`);
        }, 1000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirmText !== organization.name) {
      setError("Organization name does not match. Please type the exact name to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteOrganization(organizationId);

      if (result.error) {
        setError(result.error);
        setIsDeleting(false);
      } else {
        setSuccess("Organization deleted successfully!");
        // Redirect to organizations list after deletion
        setTimeout(() => {
          router.push("/organizations");
        }, 1000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href={`/organizations/${organizationId}`}
        className="group inline-flex items-center text-light-3 hover:text-primary-500 transition-all duration-300 mb-8 animate-fadeIn"
      >
        <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Back to Organization</span>
      </Link>

      {/* Main Settings Form */}
      <div className="space-y-8">
        {/* General Settings Card */}
        <div className="glass rounded-2xl border border-primary-500/20 overflow-hidden animate-fadeIn delay-100">
          {/* Card Header */}
          <div className="bg-linear-to-r from-primary-500/10 via-primary-600/5 to-transparent px-8 py-6 border-b border-primary-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-light-1">General Settings</h2>
                <p className="text-sm text-light-3 mt-1">Update your organization&apos;s core information</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <form action={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 animate-slideIn">
                <Alert variant="error">
                  {error}
                </Alert>
              </div>
            )}

            {success && (
              <div className="mb-6 animate-slideIn">
                <Alert variant="success">
                  {success}
                </Alert>
              </div>
            )}

            <div className="space-y-6">
              {/* Organization Name */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-light-1 uppercase tracking-wider mb-3">
                  <div className="w-1 h-4 bg-primary-500 rounded-full group-hover:h-6 transition-all duration-300"></div>
                  Organization Name
                  <span className="text-red text-xs">*</span>
                </label>
                <Input
                  name="name"
                  type="text"
                  required
                  fullWidth
                  placeholder="Enter a memorable name for your organization"
                  minLength={1}
                  maxLength={255}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg"
                />
                <p className="mt-2 text-xs text-light-3 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  This name will be visible to all members
                </p>
              </div>

              {/* Description */}
              <div className="group">
                <label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-semibold text-light-1 uppercase tracking-wider mb-3"
                >
                  <div className="w-1 h-4 bg-secondary-500 rounded-full group-hover:h-6 transition-all duration-300"></div>
                  Description
                  <span className="text-light-3 text-xs normal-case font-normal ml-1">(Optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    className="block w-full rounded-xl border-2 border-dark-4 bg-dark-3 px-5 py-4 text-light-1 placeholder-light-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-2 focus:ring-primary-500 focus:border-primary-500 hover:border-light-4 resize-none"
                    placeholder="Describe your organization's mission, goals, or purpose..."
                    maxLength={1000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-light-4">
                    {description.length}/1000
                  </div>
                </div>
                <p className="mt-2 text-xs text-light-3 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Help members understand what your organization is about
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-dark-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  className="group shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/50 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                
                      Save Changes
                    </>
                  )}
                </Button>
                <Link href={`/organizations/${organizationId}`} className="flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    fullWidth
                    className="border-2 hover:border-light-3 hover:bg-light-3/5 transition-all duration-300"
                  >
              
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Danger Zone - Only visible to owners */}
        {isOwner && (
          <div className="glass rounded-2xl border-2 border-red/30 overflow-hidden animate-fadeIn delay-300 hover:border-red/50 transition-all duration-500">
            {/* Danger Zone Header */}
            <div className="bg-linear-to-r from-red/20 via-red/10 to-transparent px-8 py-6 border-b border-red/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-red to-red/80 flex items-center justify-center shadow-lg shadow-red/30 animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-light-1 flex items-center gap-2">
                    Danger Zone
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red/20 text-red rounded-full border border-red/30">
                      Irreversible
                    </span>
                  </h2>
                  <p className="text-sm text-light-3 mt-1">Proceed with extreme caution</p>
                </div>
              </div>
            </div>

            {/* Danger Zone Body */}
            <div className="p-8">
              <div className="bg-red/5 border border-red/20 rounded-xl p-6 mb-6">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <svg className="w-6 h-6 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-light-1 mb-2">Permanent Deletion Warning</h3>
                    <p className="text-sm text-light-2 leading-relaxed mb-3">
                      Once you delete this organization, there is <strong className="text-red">no going back</strong>. This action will immediately and permanently:
                    </p>
                    <ul className="space-y-2 text-sm text-light-3">
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Delete all organization data and settings
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove all members and their associations
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel all pending invitations
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading || isDeleting}
                  className="w-full sm:w-auto shadow-xl shadow-red/20 hover:shadow-2xl hover:shadow-red/40 transition-all duration-300"
                >
            
                  Delete Organization
                </Button>
              ) : (
                <div className="space-y-6 animate-slideIn">
                  {error && (
                    <Alert variant="error">
                      {error}
                    </Alert>
                  )}

                  <div className="bg-linear-to-br from-red/20 via-red/10 to-transparent border-2 border-red/40 rounded-xl p-6">
                    <div className="flex gap-4 mb-4">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-red flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-light-1 text-lg mb-2">Final Confirmation Required</p>
                        <p className="text-sm text-light-2">
                          To confirm deletion, type the exact organization name <span className="px-2 py-1 bg-dark-2 rounded font-mono text-primary-500">&quot;{organization.name}&quot;</span> in the field below.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-light-1 uppercase tracking-wider mb-3">
                      <div className="w-1 h-4 bg-red rounded-full"></div>
                      Confirmation Text
                    </label>
                    <Input
                      name="deleteConfirm"
                      type="text"
                      fullWidth
                      placeholder={`Type "${organization.name}" to confirm`}
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="border-red/30 focus:ring-red focus:border-red"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="danger"
                      onClick={handleDelete}
                      isLoading={isDeleting}
                      disabled={deleteConfirmText !== organization.name}
                      className="shadow-xl shadow-red/30 hover:shadow-2xl hover:shadow-red/50 transition-all duration-300"
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting Organization...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Permanently Delete
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                        setError(null);
                      }}
                      disabled={isDeleting}
                      className="border-2 hover:border-light-3 hover:bg-light-3/5 transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Deletion
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}