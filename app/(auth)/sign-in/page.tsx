/**
 * Sign In Page
 * Allows existing users to log in with email and password
 * Includes validation and error handling
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "@/actions/auth";
import { signInSchema } from "@/lib/utils/validation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

type SignInFormData = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await signIn(formData);

      if (result.error) {
        setError(result.error.message);
      } else if (result.success) {
        // Redirect to dashboard after successful sign in
        router.push("/organizations");
        router.refresh();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      
      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        {/* Header Section */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-6 group">
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
            Welcome Back
          </h1>
          <p className="text-light-3">
            Sign in to continue to your dashboard
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
                placeholder="Enter your password"
                error={errors.password?.message}
                fullWidth
                autoComplete="current-password"
                required
              />
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between text-sm animate-fadeIn delay-500">
              <label className="flex items-center gap-2 text-light-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-light-4 bg-dark-4 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-3 transition-all"
                />
                <span className="group-hover:text-light-1 transition-colors">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
              >
                Forgot password?
              </Link>
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
                Sign in
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6 animate-fadeIn delay-600">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-light-4/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-dark-4 px-4 text-light-3">New to OrgManager?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center animate-fadeIn delay-600">
            <Link href="/sign-up">
              <Button variant="outline" size="md" fullWidth>
                Create an account
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-light-3 mt-4 animate-fadeIn delay-600">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-primary-500 hover:text-primary-400 transition-colors">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary-500 hover:text-primary-400 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}