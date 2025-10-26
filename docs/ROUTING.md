# Routing Structure

This document explains the routing structure of the application, showing which routes require authentication and which are publicly accessible.

## Route Overview

```
src/app/
├── page.tsx                         → Redirects to /feed (public)
│
├── (auth)/                          🔒 AUTHENTICATED ROUTES
│   ├── layout.tsx                   → Checks auth, redirects to /login if not logged in
│   │
│   ├── journey/                     🔒 Onboarding flow
│   │   └── page.tsx
│   │
│   └── (with_navigation)/           🔒 Main app with navigation
│       ├── layout.tsx               → Includes Navigation + Footer
│       ├── feed/                    🔒 Personalized feed (your posts + following)
│       ├── discover/                🔒 Discover creators
│       ├── collaborations/          🔒 Collaboration requests
│       └── messages/                🔒 Private messages
│
├── (public)/                        🌐 PUBLIC ROUTES (No auth required)
│   ├── layout.tsx                   → Includes PublicNavigation + Footer
│   ├── feed/                        🌐 Global feed (all posts)
│   │   └── page.tsx
│   └── user/
│       └── [userId]/                🌐 Public user profiles
│           └── page.tsx
│
└── (login_signup_common)/           🌐 Auth pages (No auth required)
    ├── layout.tsx                   → Minimal layout
    ├── login/
    ├── signup/
    ├── forgot-password/
    ├── reset-password/
    ├── verify-email/
    ├── terms/
    └── privacy-policy/
```

## Layout Hierarchy

### 1. Root Layout (`app/layout.tsx`)
- Applied to ALL routes
- Contains global providers (React Query, etc.)
- Global styles and metadata
- No navigation

### 2. Shared Page Layout (`components/layouts/page-layout.tsx`)
- **Smart layout component** used by both public and authenticated layouts
- Automatically detects authentication state and renders appropriate navigation
- Conditionally shows extras (referral button, PWA) for authenticated users
- Consistent structure: Navigation + Main Content + Footer
- White background with gray-50 wrapper
- Max-width container (7xl) with responsive padding

### 3. Public Layout (`app/(public)/layout.tsx`)
- Applied to public routes
- Simply wraps children in `PageLayout` component
- PageLayout automatically shows **PublicNavigation** for non-authenticated users
- Accessible to everyone

### 4. Authenticated Layout (`app/(auth)/(with_navigation)/layout.tsx`)
- Applied to authenticated routes
- Simply wraps children in `PageLayout` component  
- PageLayout automatically shows **Navigation** for authenticated users
- Automatically includes FloatingReferralButton, PWAInstallPrompt
- Requires authentication (checked in parent layout)

### 5. Login/Signup Layout (`app/(login_signup_common)/layout.tsx`)
- Minimal centered layout
- Only logo and form

## Adding New Routes

### Adding a Public Route (No auth required)

1. Create the page inside `app/(public)/`:
```typescript
// src/app/(public)/explore/page.tsx
export default function ExplorePage() {
  return <div>Public explore page</div>;
}
```

2. It automatically inherits `PublicLayout` with public navigation

### Adding an Authenticated Route (Auth required)

1. Create the page inside `app/(auth)/(with_navigation)/`:
```typescript
// src/app/(auth)/(with_navigation)/settings/page.tsx
export default function SettingsPage() {
  return <div>Settings page</div>;
}
```

2. It automatically inherits authenticated layout with full navigation
3. Auth check happens in parent `(auth)/layout.tsx`

### Adding a Standalone Authenticated Route (Without navigation)

1. Create directly inside `app/(auth)/`:
```typescript
// src/app/(auth)/special-flow/page.tsx
export default function SpecialFlowPage() {
  return <div>Special flow without nav</div>;
}
```

2. Has auth check but no navigation

## Route Access Patterns

### Public Profile with Conditional Features

The user profile at `/user/[userId]` is public but shows different features based on auth:

```typescript
const currentUser = await getCurrentUser(); // Can be null

if (currentUser) {
  // Show: Message, Collaborate buttons
} else {
  // Show: "Sign in to connect" button
}

if (currentUser?.userId === profileUserId) {
  // Show: "Edit Profile" button
}
```

### Feed Routes

- `/feed` (public) → Shows all posts, read-only, prominent signup CTA
- `/(auth)/(with_navigation)/feed` → Shows personalized feed with posts from people you follow

## Navigation Components

### PublicNavigation
- Located: `src/components/public-navigation.tsx`
- Shows: Logo + Login + Signup buttons
- Used in: Public layout

### Navigation
- Located: `src/components/navigation.tsx`
- Shows: Logo + Nav links + Create Post + User dropdown
- Used in: Authenticated layout

## Middleware

The middleware (`src/middleware.ts`) protects API routes but does NOT block page routes. Page-level auth is handled by layouts:

- **Protected API routes**: `/api/user/`, `/api/profile/`, `/api/posts/`, etc.
- **Page auth**: Handled by `(auth)/layout.tsx`

## Best Practices

1. **Public content** → Place in `(public)/` folder
2. **Auth-required with nav** → Place in `(auth)/(with_navigation)/` folder
3. **Auth-required without nav** → Place in `(auth)/` folder
4. **Conditional features** → Use `getCurrentUser()` (returns null if not logged in)
5. **API protection** → Add to `protectedApiRoutes` in middleware

## Examples

### Making an existing page public
Move from `app/(auth)/(with_navigation)/discover/` to `app/(public)/discover/`

### Making a public page require auth
Move from `app/(public)/something/` to `app/(auth)/(with_navigation)/something/`

### Creating a mixed-access page
Keep it public but use `getCurrentUser()` to show different content:

```typescript
const currentUser = await getCurrentUser();

return (
  <div>
    {currentUser ? (
      <AuthenticatedContent user={currentUser} />
    ) : (
      <PublicContentWithCTA />
    )}
  </div>
);
```

