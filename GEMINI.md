# Project Roadmap: St. Joseph's List

## Phase 1: Project Initialization & Setup
- [x] **1. Initialize Next.js Project**: Create a new Next.js app with TypeScript and Tailwind CSS. (Completed: 2026-01-23)
- [x] **2. Setup Supabase Project**: Initialize a new Supabase project (Auth, Database, Storage). (Completed: 2026-01-23)
- [x] **3. Configure Environment**: Connect the Next.js app to Supabase using environment variables. (Completed: 2026-01-23)
- [ ] **4. Deployment Pipeline**: Set up the initial deployment to Vercel to ensure CI/CD from the start.

## Phase 2: Database & Security (Supabase)
- [x] **5. Database Schema Design**: (Completed: 2026-01-23)
    *   `profiles`: Link to `auth.users`, store user details.
    *   `groups`: Store group info (name, admin_id).
    *   `group_members`: Link users to groups (user_id, group_id, role).
    *   `tools`: Store tool listings (name, description, image_url, owner_id, group_id).
- [x] **6. Row Level Security (RLS)**: (Completed: 2026-01-23)
    *   Implement policies so users can only see tools in groups they belong to.
    *   Implement policies for group admins to manage members.

## Phase 3: Core Features - Backend & Integration
- [x] **7. Authentication**: Implement Sign Up (with email verification flow), Sign In, and Sign Out. (Completed: 2026-01-23)
- [ ] **8. Image Storage**: Configure a Supabase Storage bucket for tool images with appropriate access rules.
- [x] **9. Group Management Logic**: (Completed: 2026-01-23)
    *   [x] Function to create a group. (Completed: 2026-01-23)
    *   [x] Logic for inviting users (via email). (Completed: 2026-01-23)
    *   [x] Logic for accepting invites/joining groups. (Completed: 2026-01-23)
- [x] **10. Tool Management Logic**: Functions to create, read, update, and delete tool listings. (Completed: 2026-01-23)

## Phase 4: Frontend Implementation (Mobile-First)
- [x] **11. Authentication UI**: Login and Registration pages. (Completed: 2026-01-23)
- [x] **12. User Dashboard**: A feed displaying tools from all groups the user is part of. (Completed: 2026-01-23)
- [x] **13. Create Listing UI**: A mobile-friendly form to upload a photo and add text for a tool. (Completed: 2026-01-23)
- [x] **14. Group Management UI**: (Completed: 2026-01-23)
    *   [x] Create Group page. (Completed: 2026-01-23)
    *   [x] Admin view to invite members. (Completed: 2026-01-23)
- [x] **15. Responsiveness Check**: Verify all pages look and work well on mobile viewports. (Completed: 2026-01-23)

## Phase 5: Final Polish
- [ ] **16. End-to-End Testing**: Verify the flow of creating a user -> creating a group -> inviting a user -> listing a tool -> second user seeing the tool.

---

# Work Log

### 2026-01-23
- Initialized `GEMINI.md` with the project roadmap and work items based on `Scope.txt`.
- Initialized Next.js project with TypeScript and Tailwind CSS.
- User initialized Supabase project; created `.env.example` and prepared for environment configuration.
- Installed `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs`.
- Configured environment variables and initialized Supabase client in `src/lib/supabase.ts`.
- Designed database schema and RLS policies; created migration file in `supabase/migrations/20260123_initial_schema.sql`.
- Implemented `AuthContext` provider and wrapped the app layout.
- Created Login/Sign Up page (`src/app/login/page.tsx`) and Auth Callback route (`src/app/auth/callback/route.ts`).
- Created `Dashboard` component (`src/components/Dashboard.tsx`) and updated `src/app/page.tsx`.
- Created backend service for Groups (`src/lib/services/groups.ts`) and "Create Group" page (`src/app/groups/create/page.tsx`).
- Created backend service for Tools (`src/lib/services/tools.ts`) and "Create Listing" page (`src/app/tools/create/page.tsx`).
- Updated `Dashboard` to display tool feed and link to create tools.
- Implemented Group Details page (`src/app/groups/[id]/page.tsx`) with invite functionality.
- Updated `Dashboard` to list user's groups for easy access and added Sign Out functionality.
- Migrated from deprecated `@supabase/auth-helpers-nextjs` to `@supabase/ssr` to fix build errors and ensure future compatibility.
- Fixed infinite recursion in RLS policies using Security Definer functions.
- Resolved RLS issues for tool insertion and verified group-based access control.
- Added Storage RLS policies to allow authenticated uploads.
