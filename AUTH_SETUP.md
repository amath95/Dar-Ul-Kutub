# Authentication Setup Guide

## Overview

Dar-Ul-Kutub uses **NextAuth.js v5** for authentication. Only Admin and Vendor users have accounts - buyers checkout as guests.

---

## Quick Start

### 1. Set Up Database

First, ensure your PostgreSQL database is running and the connection string is in `.env.local`:

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/dar_ul_kutub"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Run Migrations

```bash
npm run db:migrate
npm run db:generate
```

### 3. Seed Initial Users

This creates an admin user and a test vendor:

```bash
npm run db:seed
```

**Default Credentials:**

**Admin:**
- Email: `admin@dar-ul-kutub.com`
- Password: `Admin123!`

**Test Vendor:**
- Email: `vendor@example.com`
- Password: `Vendor123!`

⚠️ **Important:** Change these passwords in production!

### 4. Start Development Server

```bash
npm run dev
```

---

## Testing Authentication

### Admin Login
1. Navigate to: `http://localhost:3000/auth/login`
2. Log in with admin credentials
3. You'll be redirected to: `http://localhost:3000/admin`

### Vendor Login
1. Navigate to: `http://localhost:3000/auth/login`
2. Log in with vendor credentials
3. You'll be redirected to: `http://localhost:3000/vendor`

### Test Protected Routes
Try accessing these URLs without being logged in:
- `/admin` - Should redirect to login
- `/vendor` - Should redirect to login
- `/admin/vendors` - Should redirect to login (admin only)

---

## Authentication Flow

### User Roles
- **ADMIN** - Full platform access, can invite vendors, approve listings
- **VENDOR** - Manage own products, orders, and payouts
- **Guest** - No account, checkout with email only (not part of auth system)

### Session Management
- **Strategy**: JWT (stored in HTTP-only cookies)
- **Duration**: 30 days (default)
- **Storage**: PostgreSQL via Prisma

### Password Requirements
- Minimum 8 characters
- At least 1 lowercase letter
- At least 1 uppercase letter
- At least 1 number

---

## Key Files

### Configuration
- `lib/auth.ts` - NextAuth configuration
- `lib/auth/session.ts` - Session helpers (requireAuth, requireRole)
- `lib/auth/password.ts` - Password hashing and validation

### API Routes
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API handlers

### Pages
- `app/(auth)/auth/login/page.tsx` - Login form
- `app/(auth)/auth/error/page.tsx` - Auth error page
- `app/(auth)/auth/unauthorized/page.tsx` - Access denied page

### Layouts
- `app/(admin)/layout.tsx` - Protected admin layout
- `app/(vendor)/layout.tsx` - Protected vendor layout

### Middleware
- `middleware.ts` - Route protection and redirects

---

## Usage in Components

### Server Components (Recommended)

```typescript
import { requireAuth, requireAdmin, requireVendor } from '@/lib/auth/session'

export default async function ProtectedPage() {
  // Require any authenticated user
  const user = await requireAuth()

  // OR require admin
  const admin = await requireAdmin()

  // OR require vendor (or admin)
  const vendor = await requireVendor()

  return <div>Welcome {user.name}</div>
}
```

### Client Components

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not logged in</div>

  return (
    <div>
      <p>Welcome {session.user.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### API Routes

```typescript
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth()

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 })
  }

  // Handle request
}
```

---

## Creating New Users

### Admin User (Database)

```typescript
import { hashPassword } from '@/lib/auth/password'
import { db } from '@/lib/db'

const user = await db.user.create({
  data: {
    email: 'newadmin@example.com',
    passwordHash: await hashPassword('SecurePassword123!'),
    role: 'ADMIN',
    status: 'ACTIVE',
  },
})
```

### Vendor User (via Invite Flow)

Vendors are created through the invite system:
1. Admin sends invite via `/admin/vendors`
2. Vendor receives email with unique token
3. Vendor completes signup at `/vendor/signup?token=...`
4. Account created with VENDOR role

(This will be implemented in the next feature)

---

## Security Features

### Password Security
- ✅ Bcrypt hashing (10 rounds)
- ✅ Strength validation (uppercase, lowercase, numbers)
- ✅ Minimum 8 characters

### Session Security
- ✅ HTTP-only cookies (no JavaScript access)
- ✅ JWT tokens with short expiry
- ✅ CSRF protection (built into NextAuth)
- ✅ Secure cookies in production (HTTPS only)

### Route Protection
- ✅ Middleware-level protection
- ✅ Role-based access control (RBAC)
- ✅ Automatic redirects for unauthorized access
- ✅ API route protection

### Account Status
- ✅ ACTIVE, SUSPENDED, DEACTIVATED states
- ✅ Suspended users cannot log in
- ✅ Last login tracking

---

## Common Issues

### "Database connection error"
- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Run migrations: `npm run db:migrate`

### "Invalid credentials"
- Verify email and password are correct
- Check user exists: `npm run db:studio`
- Ensure user status is ACTIVE

### "Unauthorized" on protected routes
- Clear cookies and log in again
- Check `NEXTAUTH_SECRET` is set
- Verify user has correct role

### Session not persisting
- Check `NEXTAUTH_URL` matches your domain
- Ensure cookies are enabled in browser
- Verify HTTPS in production

---

## Environment Variables

Required for authentication:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"  # Your app URL
NEXTAUTH_SECRET="..."                  # Generate with: openssl rand -base64 32
```

---

## Next Steps

After authentication is working:

1. ✅ **Vendor Invite System** - Admin can invite vendors
2. ✅ **Vendor Signup Flow** - Complete vendor onboarding
3. ✅ **Product Management** - Vendors can create listings
4. ✅ **Admin Dashboard** - Full admin controls

---

## Troubleshooting Tips

### Reset Database
```bash
npx prisma migrate reset
npm run db:seed
```

### View Users
```bash
npm run db:studio
# Navigate to Users table
```

### Test Login Manually
```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dar-ul-kutub.com","password":"Admin123!"}'
```

---

**Authentication is now ready!** 🎉

You can log in as admin or vendor and access protected dashboards.
