/**
 * Landing Page
 * Home page with sign in and sign up options
 */

import Link from "next/link";
import Button from "@/components/ui/Button";
import { getAuthUser } from "@/lib/utils/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getAuthUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/organizations");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-dark-2 via-dark-3 to-dark-1 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 grid-pattern opacity-30"></div>
      
      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float delay-500"></div>
      
      <main className="relative z-10 w-full max-w-6xl text-center">
        {/* Hero Section */}
        <div className="mb-16 animate-fadeIn">
          <div className="mb-6 inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-sm font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Next-Gen Organization Management
            </span>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold text-light-1 sm:text-7xl md:text-8xl leading-tight animate-fadeIn delay-100">
            Manage Teams
            <br />
            <span className="gradient-text animate-gradient">Like Never Before</span>
          </h1>
          
          <p className="mb-12 text-xl sm:text-2xl text-light-3 max-w-3xl mx-auto leading-relaxed animate-fadeIn delay-200">
            Streamline collaboration with powerful role-based access control, 
            seamless team management, and enterprise-grade security.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fadeIn delay-300">
            <Link href="/sign-in">
              <Button variant="primary" size="lg" className="min-w-[160px]">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" size="lg" className="min-w-[160px]">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="group glass rounded-2xl p-8 hover:bg-dark-4/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/10 animate-fadeIn delay-400">
            <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br from-primary-600 to-primary-500 text-light-1 shadow-lg group-hover:shadow-primary-500/50 transition-shadow">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mb-3 text-xl font-bold text-light-1 group-hover:text-primary-500 transition-colors">
              Military-Grade Security
            </h2>
            <p className="text-light-3 leading-relaxed">
              Enterprise authentication powered by Supabase with end-to-end encryption and SOC 2 compliance
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group glass rounded-2xl p-8 hover:bg-dark-4/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-secondary-500/10 animate-fadeIn delay-500">
            <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br from-secondary-500 to-yellow-500 text-dark-1 shadow-lg group-hover:shadow-secondary-500/50 transition-shadow">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="mb-3 text-xl font-bold text-light-1 group-hover:text-secondary-500 transition-colors">
              Granular Permissions
            </h2>
            <p className="text-light-3 leading-relaxed">
              Fine-tuned role hierarchy with Owner, Admin, User, and Viewer levels for complete control
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group glass rounded-2xl p-8 hover:bg-dark-4/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/10 animate-fadeIn delay-600 sm:col-span-2 lg:col-span-1">
            <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br from-primary-600 to-purple-600 text-light-1 shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="mb-3 text-xl font-bold text-light-1 group-hover:text-primary-500 transition-colors">
              Effortless Collaboration
            </h2>
            <p className="text-light-3 leading-relaxed">
              Invite unlimited members, manage teams seamlessly, and scale your organization effortlessly
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 glass rounded-2xl p-8 sm:p-12 animate-fadeIn delay-600">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">99.9%</div>
              <div className="text-light-3 text-sm sm:text-base">Uptime SLA</div>
            </div>
            <div className="text-center border-t sm:border-t-0 sm:border-l sm:border-r border-light-4/20 pt-8 sm:pt-0">
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">256-bit</div>
              <div className="text-light-3 text-sm sm:text-base">Encryption</div>
            </div>
            <div className="text-center border-t sm:border-t-0 border-light-4/20 pt-8 sm:pt-0">
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">&lt; 100ms</div>
              <div className="text-light-3 text-sm sm:text-base">Response Time</div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 animate-fadeIn delay-600">
          <p className="text-light-3 text-sm">
            Trusted by innovative teams worldwide
          </p>
        </div>
      </main>
    </div>
  );
}