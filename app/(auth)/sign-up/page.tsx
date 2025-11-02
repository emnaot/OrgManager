/**
 * Sign Up Page
 * Allows users to create a new account with email and password
 * Includes validation, error handling, and password strength indicator
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signUp } from "@/actions/auth";
import { signUpSchema } from "@/lib/utils/validation";
import { checkPasswordStrength } from "@/lib/utils/validation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import PasswordStrengthIndicator from "@/components/ui/PasswordStrength";

type SignUpFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    errors: string[];
    strength: "weak" | "medium" | "strong";
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const password = watch("password");

  // Check password strength when password changes
  useEffect(() => {
    if (password) {
      const strength = checkPasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);

      const result = await signUp(formData);

      if (result.error) {
        setError(result.error.message);
      } else if (result.success) {
        setSuccess(true);
        // Don't auto-redirect, let user read the email verification message
        // They can manually navigate to sign-in after verifying
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-linear-to-br from-dark-2 via-dark-3 to-dark-1 px-4 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      
      {/* Floating gradient orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float delay-500"></div>
      
      <div className="relative z-10 w-full max-w-md max-h-screen overflow-y-auto py-8 px-2 scrollbar-hide animate-fadeIn">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        
        <div className="min-h-full flex flex-col">
          {/* Header Section */}
          <div className="text-center mb-4">
            <Link href="/" className="inline-block mb-4 group">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg group-hover:shadow-primary-500/50 transition-shadow">
                  <svg className="w-6 h-6 text-light-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="gradient-text">OrgManager</span>
              </div>
            </Link>
            
            <h1 className="text-3xl font-bold text-light-1 mb-2">
              Join Us Today
            </h1>
            <p className="text-light-3">
              Create your account and start managing teams
            </p>
          </div>

          {/* Form Card */}
          <div className="glass rounded-2xl p-6 shadow-2xl border border-light-4/10 animate-fadeIn delay-200">
            {error && (
              <div className="mb-4 animate-fadeIn">
                <Alert variant="error">
                  {error}
                </Alert>
              </div>
            )}

            {success && (
              <div className="mb-4 animate-fadeIn">
                <Alert variant="success">
                  <div className="space-y-2">
                    <p className="font-bold flex items-center gap-2">
                      <span>Welcome! 🎉</span>
                    </p>
                    <p className="text-sm">
                      Account created! Check your email for verification.
                    </p>
                    <div className="bg-primary-500/5 rounded-lg p-2 border border-primary-500/20">
                      <p className="text-xs font-medium mb-1">Next Steps:</p>
                      <ol className="text-xs space-y-0.5 list-decimal list-inside text-light-3">
                        <li>Check email inbox</li>
                        <li>Click verification link</li>
                        <li>Sign in to account</li>
                      </ol>
                    </div>
                  </div>
                </Alert>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="animate-fadeIn delay-300">
                  <Input
                    {...register("email")}
                    type="email"
                    label="Email address"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    fullWidth
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="animate-fadeIn delay-400">
                  <Input
                    {...register("password")}
                    type="password"
                    label="Password"
                    placeholder="Create a strong password"
                    error={errors.password?.message}
                    fullWidth
                    autoComplete="new-password"
                    required
                  />
                  {passwordStrength && (
                    <PasswordStrengthIndicator
                      strength={passwordStrength}
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="animate-fadeIn delay-500">
                  <Input
                    {...register("confirmPassword")}
                    type="password"
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    error={errors.confirmPassword?.message}
                    fullWidth
                    autoComplete="new-password"
                    required
                  />
                </div>

                {/* Terms Agreement */}
                <div className="animate-fadeIn delay-600">
                  <label className="flex items-start gap-2 text-xs text-light-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 w-4 h-4 rounded border-light-4 bg-dark-4 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-3 transition-all shrink-0"
                    />
                    <span className="group-hover:text-light-1 transition-colors">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary-500 hover:text-primary-400 font-medium">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary-500 hover:text-primary-400 font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                <div className="animate-fadeIn delay-600">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Create account
                  </Button>
                </div>
              </form>
            )}

            {success && (
              <div className="space-y-3 animate-fadeIn">
                <Link href="/sign-in" className="w-full block">
                  <Button variant="primary" size="lg" fullWidth>
                    Continue to Sign In
                  </Button>
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-xs text-light-3 hover:text-light-1 transition-colors w-full"
                >
                  Didn&apos;t receive email? Try again
                </button>
              </div>
            )}

            {/* Divider */}
            {!success && (
              <>
                <div className="relative my-4 animate-fadeIn delay-600">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-light-4/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-dark-4 px-4 text-light-3 text-xs">Already have an account?</span>
                  </div>
                </div>

                {/* Sign In Link */}
                <div className="text-center animate-fadeIn delay-600">
                  <Link href="/sign-in">
                    <Button variant="outline" size="md" fullWidth>
                      Sign in instead
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Security Badge */}
          {!success && (
            <div className="flex items-center justify-center gap-2 text-xs text-light-3 mt-3 animate-fadeIn delay-600">
              <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secured with 256-bit encryption</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}