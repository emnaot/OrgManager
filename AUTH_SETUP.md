# Authentication System Setup

## Overview

This document describes the authentication system implementation for the Next.js Organization Manager application. The system provides secure email/password authentication using Supabase Auth with comprehensive validation, error handling, and session management.

## Features Implemented

### ✅ Sign Up
- Email and password registration
- Real-time password strength validation
- Email format validation
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Clear error messages
- Success feedback with auto-redirect

### ✅ Sign In
- Email and password authentication
- Credential validation
- Clear error messages for failed login attempts
- Automatic session creation
- Redirect to dashboard on success

### ✅ Sign Out
- Secure logout functionality
- Session clearing on both client and server
- Automatic redirect to home page

### ✅ Protected Routes
- Server-side authentication checks
- Client-side authentication checks
- Middleware-based route protection
- Automatic redirects for unauthenticated users
- Loading states during authentication checks

### ✅ Session Management
- Persistent login state across page refreshes
- Automatic session refresh
- Session expiration handling
- Graceful error handling for session failures

### ✅ Security
- Server-side validation using Zod
- Client-side validation using React Hook Form + Zod
- Secure cookie-based session management
- Row Level Security (RLS) ready for database
- CSRF protection via Supabase

## Project Structure

```
app/
├── (auth)/                    # Authentication pages
│   ├── sign-in/
│   │   └── page.tsx           # Sign in page
│   ├── sign-up/
│   │   └── page.tsx           # Sign up page
│   └── layout.tsx              # Auth layout (redirects if authenticated)
├── (dashboard)/               # Protected dashboard pages
│   ├── organizations/
│   │   └── page.tsx           # Organizations dashboard
│   └── layout.tsx             # Dashboard layout (requires auth)
├── auth/
│   └── callback/
│       └── route.ts           # OAuth/email confirmation callback handler
├── unauthorized/
│   └── page.tsx               # Unauthorized access page
└── page.tsx                   # Landing page

actions/
└── auth.ts                    # Authentication server actions (signUp, signIn, signOut)

components/
├── auth/                      # Authentication components (empty for now)
├── protected/
│   └── ProtectedRoute.tsx     # Client-side route protection component
└── ui/                        # Reusable UI components
    ├── Alert.tsx              # Alert/message component
    ├── Button.tsx             # Button component with variants
    ├── Input.tsx              # Input component with validation
    └── PasswordStrength.tsx   # Password strength indicator

lib/
├── hooks/
│   └── useAuth.ts             # Authentication hooks for client components
├── supabase/
│   ├── client.ts             # Client-side Supabase client
│   └── server.ts              # Server-side Supabase client
├── types/
│   ├── auth.ts               # Authentication types
│   └── organization.ts       # Organization types
└── utils/
    ├── auth.ts               # Authentication utility functions
    └── validation.ts         # Form validation schemas and utilities

middleware.ts                  # Next.js middleware for route protection
```

## Key Files

### Server Actions (`actions/auth.ts`)
- `signUp()`: Creates new user account
- `signIn()`: Authenticates existing user
- `signOut()`: Logs out user and clears session
- `getCurrentUser()`: Gets current authenticated user
- `isAuthenticated()`: Checks if user is authenticated

### Authentication Utilities (`lib/utils/auth.ts`)
- `requireAuth()`: Server-side auth check with redirect
- `getAuthUser()`: Get user without redirecting
- `redirectIfAuthenticated()`: Redirect auth pages if already logged in

### Client Hooks (`lib/hooks/useAuth.ts`)
- `useAuth()`: React hook for authentication state in client components
- `useSupabase()`: React hook for Supabase client in client components

### Middleware (`middleware.ts`)
- Protects routes starting with `/organizations` and `/dashboard`
- Redirects authenticated users from auth pages
- Handles session refresh automatically

## Environment Variables Required

Create a `.env` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Color Scheme

The application uses a custom color palette defined in `tailwind.config.ts`:

- Primary: `#877EFF` (500), `#5D5FEF` (600)
- Secondary: `#FFB620` (500)
- Red: `#FF5A5A`
- Dark backgrounds: `#000000`, `#09090A`, `#101012`, `#1F1F22`
- Light text: `#FFFFFF`, `#EFEFEF`, `#7878A3`, `#5C5C7B`
- Off-white: `#D0DFFF`

## Usage Examples

### Server Component - Require Authentication

```typescript
import { requireAuth } from "@/lib/utils/auth";

export default async function ProtectedPage() {
  const user = await requireAuth(); // Redirects if not authenticated
  
  return <div>Protected content for {user.email}</div>;
}
```

### Client Component - Check Authentication

```typescript
"use client";

import { useAuth } from "@/lib/hooks/useAuth";

export default function ClientComponent() {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;
  
  return <div>Welcome {user?.email}</div>;
}
```

### Server Action - Sign In

```typescript
import { signIn } from "@/actions/auth";

const formData = new FormData();
formData.append("email", "user@example.com");
formData.append("password", "password123");

const result = await signIn(formData);
if (result.success) {
  // Redirect to dashboard
} else {
  // Show error: result.error.message
}
```

## Security Features

1. **Input Validation**: All inputs validated using Zod schemas
2. **Password Strength**: Enforced strong password requirements
3. **Session Management**: Secure cookie-based sessions via Supabase
4. **Server-Side Protection**: All protected routes checked on server
5. **Client-Side Protection**: Additional client-side checks for UX
6. **Error Handling**: Comprehensive error handling without exposing sensitive info
7. **Type Safety**: Full TypeScript coverage for type safety

## Next Steps

1. Set up Supabase project and configure environment variables
2. Configure Supabase Auth settings (email templates, redirect URLs)
3. Implement database schema and Row Level Security (RLS) policies
4. Add email verification if needed
5. Implement password reset functionality
6. Add organization and member management features
7. Implement role-based access control for organizations

## Testing Checklist

- [ ] Sign up with valid credentials
- [ ] Sign up with invalid email format
- [ ] Sign up with weak password
- [ ] Sign up with existing email
- [ ] Sign in with valid credentials
- [ ] Sign in with invalid credentials
- [ ] Sign out functionality
- [ ] Protected route access without authentication
- [ ] Protected route access with authentication
- [ ] Auth page access when already authenticated
- [ ] Session persistence across page refreshes
- [ ] Session expiration handling

