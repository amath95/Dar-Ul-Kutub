# Development Guide - Dar-Ul-Kutub

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Git

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd Dar-Ul-Kutub
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   - Database connection string
   - Stripe API keys (test mode)
   - Shippo API key
   - NextAuth secret: `openssl rand -base64 32`

3. **Database Setup**
   ```bash
   # Run migrations
   npm run db:migrate

   # Generate Prisma client
   npm run db:generate

   # (Optional) Seed with test data
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
Dar-Ul-Kutub/
├── app/                      # Next.js App Router
│   ├── (admin)/              # Admin dashboard pages (protected)
│   ├── (vendor)/             # Vendor portal pages (protected)
│   ├── (auth)/               # Authentication pages
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth endpoints
│   │   ├── catalog/          # Product API
│   │   ├── checkout/         # Guest checkout
│   │   ├── orders/           # Order management
│   │   ├── vendors/          # Vendor operations
│   │   ├── admin/            # Admin operations
│   │   ├── webhooks/         # Stripe, Shippo webhooks
│   │   ├── magic-link/       # Order access links
│   │   └── reviews/          # Review submission
│   ├── books/                # Product pages
│   ├── cart/                 # Shopping cart
│   ├── checkout/             # Checkout flow
│   └── order/[token]/        # Magic link order view
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── forms/                # Form components
│   ├── layouts/              # Layout components
│   ├── admin/                # Admin-specific components
│   ├── vendor/               # Vendor-specific components
│   └── catalog/              # Product catalog components
├── lib/                      # Utilities and libraries
│   ├── auth/                 # NextAuth config
│   ├── stripe/               # Stripe helpers
│   ├── shippo/               # Shippo helpers
│   ├── email/                # Email templates
│   ├── validators/           # Zod schemas
│   ├── utils.ts              # General utilities
│   ├── db.ts                 # Prisma client
│   └── api-response.ts       # API response helpers
├── prisma/                   # Database
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Migration files
│   └── seed.ts               # Seed script
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript types
└── public/                   # Static assets
```

---

## Development Workflow

### Database Changes

1. **Modify Schema**
   Edit `prisma/schema.prisma`

2. **Create Migration**
   ```bash
   npm run db:migrate
   ```

3. **Generate Client**
   ```bash
   npm run db:generate
   ```

4. **View Database**
   ```bash
   npm run db:studio
   ```

### Code Quality

**Type Check**
```bash
npm run type-check
```

**Lint**
```bash
npm run lint
```

**Format**
```bash
npm run format
```

**Pre-commit Hook** (via Husky)
- Automatically runs lint and type-check before commit

### Testing (Coming Soon)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

---

## Key Features Implementation Status

### MVP Phase 1 (In Progress)
- [x] Project structure and architecture
- [x] Database schema
- [ ] Authentication (NextAuth)
- [ ] Vendor onboarding flow
- [ ] Product catalog management
- [ ] Guest checkout
- [ ] Stripe integration
- [ ] Shippo integration
- [ ] Magic link order access
- [ ] Admin dashboard
- [ ] Email notifications

### MVP Phase 2 (Future)
- [ ] Reviews & ratings
- [ ] Vendor analytics
- [ ] Advanced search
- [ ] Order tracking
- [ ] Refund processing
- [ ] CMS for legal pages

---

## API Development

### Creating a New API Route

1. **Create route file**: `app/api/[resource]/route.ts`

2. **Example structure**:
```typescript
import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const data = await db.product.findMany()
    return successResponse(data)
  } catch (error) {
    return errorResponse('INTERNAL_ERROR', 'Something went wrong', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Validate with Zod schema
    // Create resource
    return successResponse(data, { created: true })
  } catch (error) {
    return errorResponse('INTERNAL_ERROR', 'Something went wrong', 500)
  }
}
```

3. **Add validation**: Use Zod schemas from `lib/validators/`

4. **Add authentication**: Use middleware or route-level checks

---

## Environment Variables

### Required for Development
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
SHIPPO_API_KEY="shippo_test_..."
```

### Optional for Development
```env
RESEND_API_KEY="..."           # Email (can disable in dev)
TWILIO_ACCOUNT_SID="..."       # SMS (optional)
AWS_ACCESS_KEY_ID="..."        # S3 storage (or use Vercel Blob)
```

---

## Common Tasks

### Add a New Product Manually (via Prisma Studio)
```bash
npm run db:studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Create Admin User
```bash
# Via seed script or Prisma Studio
# See prisma/seed.ts
```

### Test Stripe Webhooks Locally
```bash
# Install Stripe CLI
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Use webhook signing secret in .env.local
```

### Test Shippo Integration
- Use test API tokens from Shippo dashboard
- See [Shippo docs](https://goshippo.com/docs/)

---

## Debugging

### Database Issues
- Check connection string in `.env.local`
- Ensure PostgreSQL is running: `pg_isready`
- View logs: `npm run db:studio`

### Build Errors
- Clear Next.js cache: `rm -rf .next`
- Regenerate Prisma client: `npm run db:generate`
- Check TypeScript errors: `npm run type-check`

### API Issues
- Check browser DevTools Network tab
- Review API response format (should match `ApiResponse` type)
- Enable debug logging: `LOG_LEVEL=debug` in `.env.local`

---

## Git Workflow

### Branching
- `main` - production
- `develop` - staging
- `feature/*` - feature branches
- `fix/*` - bug fixes

### Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add vendor invite email template
fix: resolve stock decrement race condition
docs: update API documentation
refactor: simplify checkout validation
```

### Pull Requests
1. Create feature branch: `git checkout -b feature/vendor-onboarding`
2. Make changes and commit
3. Push: `git push origin feature/vendor-onboarding`
4. Open PR to `develop`
5. Wait for CI checks to pass
6. Request review
7. Merge when approved

---

## Performance Tips

### Database
- Use indexes (already defined in schema)
- Use connection pooling (Prisma handles this)
- Avoid N+1 queries (use `include` wisely)

### Next.js
- Use React Server Components by default
- Use `'use client'` only when needed
- Optimize images with `next/image`
- Use ISR for product pages: `revalidate: 60`

### Caching
- Product listings: ISR (revalidate every 60s)
- Static pages: SSG
- API: Redis cache for search results (future)

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Shippo Docs](https://goshippo.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [NextAuth.js](https://next-auth.js.org/)

---

## Getting Help

- Check `ARCHITECTURE.md` for system design
- Review feature specs in project README
- Search GitHub issues
- Ask in team chat

---

**Happy Coding!** 🚀
