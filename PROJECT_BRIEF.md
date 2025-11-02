# Next.js Organization Management Platform - Developer Test Project

## 📋 Project Overview

This is a practical coding assessment designed to evaluate your skills in building modern, full-stack Next.js applications. You'll create an organization management platform with role-based access control, authentication, and real-time database operations.

**Estimated Time:** 4-6 hours  
**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Supabase, Server Actions

---

## 🎯 What We're Testing

This project evaluates your ability to:

1. **Database Design & Integration** - Structure and query relational data effectively
2. **Authentication & Authorization** - Implement secure, role-based access control
3. **Server Actions** - Use Next.js server actions for data mutations
4. **React Best Practices** - Write clean, maintainable, and performant React code
5. **TypeScript** - Demonstrate strong typing and type safety
6. **AI-Assisted Development** - Effectively use Cursor AI to accelerate development

---

## 🚀 Core Features

### 1. Authentication System
- **Sign Up**: Users can create accounts with email/password
- **Sign In**: Existing users can authenticate
- **Sign Out**: Users can securely log out
- **Protected Routes**: Authenticated-only pages
- **Session Management**: Persistent authentication state

### 2. Organization Management

#### Creating Organizations
- Any authenticated user can create a new organization
- Creator automatically becomes the **Owner** (highest permission level)
- Organization requires: name, optional description

#### Joining Organizations
- Users can join organizations via:
  - Email invitation
  - Accept invitation link

#### Organization Roles
The platform supports **4 role levels** with hierarchical permissions:

| Role | Permissions |
|------|-------------|
| **Owner** | • Full control over organization<br>• Manage all members and roles<br>• Delete organization<br>• Only 1 per organization |
| **Admin** | • Invite new members<br>• Manage Users and Viewers<br>• Cannot modify Owner or other Admins |
| **User** | • View organization details<br>• View member list<br>• Standard member access |
| **Viewer** | • Read-only access<br>• View organization details only |

### 3. Member Management

#### Inviting Members
- **Who can invite**: Owners and Admins only
- **Invitation flow**:
  1. Enter invitee's email and select role
  2. System sends invitation email
  3. If invitee has an account: They see invitation in-app
  4. If invitee is new: They must sign up first, then accept invitation
- **Invitation states**: Pending, Accepted, Expired

#### Managing Members
- **View all members** with their roles
- **Change member roles** (respecting permission hierarchy)
- **Remove members** from organization
- **Transfer ownership** (Owner only, must designate new owner)

---

## 🗄️ Database Schema

Design your database with the following entities:

### Users Table
```sql
- id (uuid, primary key)
- email (unique)
- created_at
- updated_at
```

### Organizations Table
```sql
- id (uuid, primary key)
- name (text)
- description (text, nullable)
- created_at
- updated_at
```

### Organization Members Table
```sql
- id (uuid, primary key)
- organization_id (uuid, foreign key)
- user_id (uuid, foreign key)
- role (enum: owner, admin, user, viewer)
- joined_at
- Unique constraint on (organization_id, user_id)
```

### Invitations Table
```sql
- id (uuid, primary key)
- organization_id (uuid, foreign key)
- inviter_id (uuid, foreign key)
- invitee_email (text)
- role (enum: admin, user, viewer)
- status (enum: pending, accepted, expired)
- token (uuid, unique)
- expires_at
- created_at
```

### Additional Considerations
- Add appropriate indexes for performance
- Implement Row Level Security (RLS) policies
- Consider soft deletes for audit trails

---

## 💻 Technical Requirements

### Required Technologies
- ✅ **Next.js 15** with App Router
- ✅ **React 19** with Server Components
- ✅ **TypeScript** (strict mode)
- ✅ **Supabase** (PostgreSQL + Auth)
- ✅ **Server Actions** for mutations
- ✅ **Tailwind CSS** for styling

### Recommended Libraries
- **shadcn/ui** - Pre-built accessible components
- **Zod** - Runtime type validation
- **React Hook Form** - Form management
- **@supabase/ssr** - Supabase SSR helpers

### Project Structure Best Practices
```
app/
├── (auth)/
│   ├── sign-in/
│   ├── sign-up/
│   └── layout.tsx
├── (dashboard)/
│   ├── organizations/
│   │   ├── [id]/
│   │   │   ├── members/
│   │   │   └── settings/
│   │   └── new/
│   └── layout.tsx
├── actions/          # Server actions
├── components/       # Reusable components
└── lib/
    ├── supabase/    # Supabase clients
    └── utils/       # Utilities
```

---

## 🎨 UI/UX Requirements

### Must-Have Pages

1. **Landing Page** (`/`)
   - Brief description of platform
   - Sign In / Sign Up buttons

2. **Sign Up Page** (`/sign-up`)
   - Email and password fields
   - Validation errors
   - Link to sign in

3. **Sign In Page** (`/sign-in`)
   - Email and password fields
   - Error handling
   - Link to sign up

4. **Organizations Dashboard** (`/organizations`)
   - List all organizations user belongs to
   - Show user's role in each
   - "Create Organization" button

5. **Create Organization** (`/organizations/new`)
   - Form with name and description
   - Create and redirect to org page

6. **Organization Detail** (`/organizations/[id]`)
   - Organization information
   - Members list with roles
   - Invite member button (for Owners/Admins)
   - Role management (for Owners/Admins)

7. **Invitations Page** (`/invitations`)
   - List pending invitations
   - Accept/Decline actions

### Design Guidelines
- Clean, modern interface
- Responsive (mobile-friendly)
- Loading states for async operations
- Error states with helpful messages
- Success feedback for actions
- Accessible (WCAG 2.1 compliant)

---

## ⚡ Key Implementation Details

### Authentication Flow
```typescript
// Use Supabase Auth with Server-Side rendering
// Create route handlers for:
// - POST /auth/sign-up
// - POST /auth/sign-in
// - POST /auth/sign-out
// - GET /auth/callback (for OAuth if implemented)
```

### Server Actions Example
```typescript
'use server'

export async function inviteMember(
  organizationId: string,
  email: string,
  role: 'admin' | 'user' | 'viewer'
) {
  // 1. Verify current user is Owner or Admin
  // 2. Validate email format
  // 3. Check if user already exists
  // 4. Create invitation record
  // 5. Send invitation email
  // 6. Return success/error
}
```

### Authorization Checks
```typescript
// Implement permission checking utilities
async function canInviteMembers(userId: string, orgId: string): Promise<boolean>
async function canChangeRole(userId: string, orgId: string, targetRole: string): Promise<boolean>
async function isOwner(userId: string, orgId: string): Promise<boolean>
```

### Email Invitations
- Generate unique invitation tokens
- Create invitation URLs: `https://yourapp.com/invitations/accept?token=xxx`
- Set expiration (e.g., 7 days)
- Handle expired invitations gracefully

---

## 🧪 Testing Scenarios

Your application should handle:

### Happy Paths
1. ✅ User signs up → creates organization → becomes owner
2. ✅ Owner invites user → user signs up → accepts invitation
3. ✅ Admin invites user → existing user accepts → joins organization
4. ✅ Owner changes admin to user → permissions update correctly

### Edge Cases
1. ⚠️ User tries to invite someone already in organization
2. ⚠️ User tries to perform action without permission
3. ⚠️ Invitation token expires before acceptance
4. ⚠️ Owner tries to leave organization (must transfer ownership first)
5. ⚠️ User tries to access organization they don't belong to
6. ⚠️ Multiple owners attempted (should be prevented)

### Error Handling
- Database connection failures
- Invalid form inputs
- Authentication failures
- Authorization violations
- Network errors

---

## 📦 Deliverables

### 1. Source Code
- Complete Next.js application
- Well-organized file structure
- Clean, commented code
- TypeScript types throughout

### 2. Database
- SQL migration files or Supabase schema
- RLS policies configured
- Sample seed data (optional but appreciated)


---

## 📚 Helpful Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Video References
- [Plan Mode in Cursor](https://cursor.com/blog/plan-mode)
- [Cursor AI Tutorial](https://www.youtube.com/watch?v=YtTWNzOtkxU)

### Learning Resources
- [Thinking in React](https://react.dev/learn/thinking-in-react)
- [Next.js Learn Course](https://nextjs.org/learn)

---

## ⏱️ Time Management Tips

**Recommended Breakdown:**

- **Hours 1-2**: Project setup, Supabase configuration, database schema
- **Hours 3-4**: Authentication (sign up, sign in, protected routes)
- **Hours 5-6**: Organization CRUD operations
- **Hours 7-8**: Member management and role-based permissions
- **Hours 9-10**: Invitation system
- **Hours 11-12**: UI polish, error handling, documentation

**Prioritization:**
1. Get authentication working first
2. Implement core organization features
3. Add role-based access control
4. Build invitation system
5. Polish UI and handle edge cases

---

## 🤝 Submission Guidelines

### What to Submit
1. GitHub repository (public or private with access granted)
2. Live demo URL (deploy to Vercel for free)
3. `IMPLEMENTATION.md` with setup and notes
4. `.env.example` file with required variables

### Submission Checklist
- [ ] Code is pushed to GitHub
- [ ] README.md has setup instructions
- [ ] IMPLEMENTATION.md explains architecture and AI usage
- [ ] .env.example is included
- [ ] Demo credentials are provided
- [ ] Application is deployed and accessible
- [ ] Database schema is documented or included
- [ ] All core features are functional

---

## ❓ FAQs

**Q: Can I use additional libraries?**  
A: Yes, but prefer standard solutions. Document why you chose them.

**Q: What if I don't finish everything?**  
A: Submit what you have. Prioritize core features over polish. Document what's missing.

**Q: Can I use AI for all the code?**  
A: Yes! We want to see how effectively you collaborate with AI. Understanding and refining AI-generated code is a key skill.

**Q: How much should I use Cursor AI?**  
A: Use it as much as you'd use it in real work. We want to see your natural workflow with AI assistance.

**Q: Should the UI be pixel-perfect?**  
A: No, but it should be clean, functional, and responsive. We value UX over pixel-perfection.

**Q: Can I ask questions during the test?**  
A: [Add your contact method here] - We're happy to clarify requirements, but not provide implementation help.

---

## 🎓 What We're Looking For

The ideal candidate will:

1. **Build working software quickly** - Use AI to accelerate, not as a crutch
2. **Make smart trade-offs** - Know what to optimize and what to keep simple
3. **Write maintainable code** - Others should easily understand and extend it
4. **Think about users** - Build intuitive, error-resistant interfaces
5. **Handle the full stack** - Comfortable with database, server, and client
6. **Communicate clearly** - Document decisions and explain reasoning

---

## 🎉 Good Luck!

We're excited to see what you build! This project mirrors real-world scenarios you'll encounter in this role. Take your time, write quality code, and show us your best work.

Remember: **We value working software, clean code, and clear thinking over perfection.**

If you have questions about requirements, please reach out. For implementation questions, that's where your problem-solving skills (and Cursor AI) come in!

---

**Last Updated:** November 2025  
**Version:** 1.0

