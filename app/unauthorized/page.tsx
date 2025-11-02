/**
 * Unauthorized Page - Redesigned
 * Shown when user tries to access a resource they don't have permission for
 */

import Link from "next/link";
import { ShieldX, Home, ArrowRight, Lock } from "lucide-react";
import Button from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-dark-2 via-dark-3 to-dark-4 flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-dark-4/50 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,90,90,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,90,90,0.03)_1px,transparent_1px)] bg-size-[50px_50px] pointer-events-none"></div>

      {/* Floating lock icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Lock className="absolute top-20 left-20 w-6 h-6 text-red/20 animate-float hidden sm:block" />
        <Lock className="absolute top-40 right-32 w-8 h-8 text-red/15 animate-float hidden sm:block" style={{ animationDelay: '0.5s' }} />
        <Lock className="absolute bottom-32 left-1/3 w-7 h-7 text-red/10 animate-float hidden sm:block" style={{ animationDelay: '1s' }} />
        <Lock className="absolute bottom-20 right-20 w-6 h-6 text-red/20 animate-float hidden sm:block" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Main Content Card */}
        <div className="glass rounded-3xl border border-red/20 p-8 sm:p-12 backdrop-blur-xl text-center animate-fadeIn shadow-2xl shadow-red/10">
          {/* Error Icon */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-linear-to-br from-red to-primary-600 rounded-full blur-2xl opacity-30 animate-glow"></div>
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full bg-linear-to-br from-dark-3 to-dark-4 flex items-center justify-center border-4 border-red/30 shadow-xl">
              <ShieldX className="w-12 h-12 sm:w-16 sm:h-16 text-red animate-float" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-4 animate-fadeIn delay-100">
            <span className="inline-block px-4 py-2 rounded-full bg-red/20 border border-red/30 text-red font-mono text-sm font-semibold">
              ERROR 403
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fadeIn delay-200">
            <span className="bg-linear-to-r from-light-1 via-red to-primary-500 bg-clip-text text-transparent">
              Access Denied
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-light-3 mb-3 max-w-md mx-auto animate-fadeIn delay-300">
            You don&apos;t have permission to access this resource.
          </p>
          <p className="text-sm text-light-4 mb-10 animate-fadeIn delay-400">
            This page is restricted. If you believe this is an error, please contact your organization administrator.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center animate-fadeIn delay-500">
            <Link href="/organizations">
              <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:scale-105">
                <Home className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>
            <Link href="/">
              <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-dark-3 border-2 border-white/10 text-light-2 rounded-xl font-semibold hover:bg-dark-4 hover:border-primary-500/50 transition-all duration-300">
                <span>Go to Home</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-10 pt-8 border-t border-white/5 animate-fadeIn delay-600">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-light-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red animate-pulse"></div>
                <span>Unauthorized Access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <span>Protected Resource</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center animate-fadeIn delay-700">
          <p className="text-light-4 text-sm">
            Need help? <Link href="/support" className="text-primary-500 hover:text-primary-600 font-medium transition-colors duration-300 underline underline-offset-4">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}