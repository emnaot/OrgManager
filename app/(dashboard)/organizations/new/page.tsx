/**
 * Create New Organization Page
 * Allows authenticated users to create a new organization
 * File: app/(dashboard)/organizations/new/page.tsx
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/actions/organizations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import Link from "next/link";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    console.log("[NewOrganizationPage] Form submission started");
    setIsLoading(true);
    setError(null);

    try {
      const name = formData.get("name");
      const description = formData.get("description");
      console.log("[NewOrganizationPage] Form data:", { name, description });
      
      const result = await createOrganization(formData);
      console.log("[NewOrganizationPage] Result from createOrganization:", result);

      if (result.error) {
        console.error("[NewOrganizationPage] Error in result:", result.error);
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // Redirect to organization page on success
      if (result.organizationId) {
        console.log("[NewOrganizationPage] Redirecting to organization:", result.organizationId);
        router.push(`/organizations/${result.organizationId}`);
      } else {
        console.log("[NewOrganizationPage] No organizationId, redirecting to organizations list");
        router.push("/organizations");
      }
    } catch (err) {
      console.error("[NewOrganizationPage] Unexpected error:", err);
      console.error("[NewOrganizationPage] Error stack:", err instanceof Error ? err.stack : "No stack trace");
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex items-center justify-center px-6 overflow-hidden">
      <div className="w-full max-w-3xl">
        <div className="mb-6 animate-slideIn">
          <Link
            href="/organizations"
            className="text-light-3 hover:text-primary-500 transition-colors inline-flex items-center gap-2 mb-4 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Organizations</span>
          </Link>
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-primary-500 to-secondary-500 mb-3 animate-glow">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-light-1 mb-2">
              Create Organization
            </h1>
            <p className="text-base text-light-3">
              Start building your team and managing projects together
            </p>
          </div>
        </div>

        <form action={handleSubmit} className="animate-fadeIn delay-200">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Form Card */}
          <div className="rounded-2xl border border-dark-4/50 glass p-6 space-y-5">
            {/* Organization Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-light-1"
              >
                Organization Name
                <span className="text-red ml-1">*</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                fullWidth
                placeholder="Enter organization name"
                minLength={1}
                maxLength={255}
                className="px-4 py-2.5 rounded-xl border border-dark-4 bg-dark-4/50 text-light-1 placeholder-light-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-light-1"
              >
                Description
                <span className="text-light-3 text-xs font-normal ml-2">(Optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="block w-full px-4 py-2.5 rounded-xl border border-dark-4 bg-dark-4/50 text-light-1 placeholder-light-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none"
                placeholder="Describe your organization's mission and goals..."
                maxLength={1000}
              />
            </div>

            {/* Info Box */}
            <div className="rounded-xl bg-primary-500/10 border border-primary-500/20 p-3.5">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-light-1 mb-0.5">
                    You&apos;ll be the owner
                  </p>
                  <p className="text-xs text-light-3">
                    As the creator, you&apos;ll have full control over this organization, including member management and settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="bg-linear-to-r from-primary-500 to-primary-600 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Organization</span>
                  </>
                )}
              </Button>
              <Link href="/organizations" className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  fullWidth
                  className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}