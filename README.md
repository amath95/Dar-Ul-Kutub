# Dar-Ul-Kutub (دار الكتب)
**Islamic Book Repository & Marketplace**

A U.S.-focused, multi-vendor Islamic book marketplace where buyers can purchase as guests without creating accounts. Only Admins and Vendors have accounts. The platform provides transparent shipping costs, halal-compliant payments, and a streamlined experience for all users.

---

## Project Overview

**Goal**: Launch an MVP marketplace that connects Islamic book buyers with trusted vendors (bookstores, masajid, publishers, organizations) across the United States.

**Key Features**:
- 🛒 **Guest Checkout**: No buyer accounts required
- 📚 **Multi-Vendor**: Support multiple book sellers
- 🔐 **Invite-Only Vendors**: Admin-approved vendor onboarding
- 📦 **Transparent Shipping**: Live carrier rates with clear ETAs
- 💳 **Halal-Compliant Payments**: Stripe with no interest-bearing holds
- 🔗 **Magic Link Access**: Secure order tracking without login
- ✅ **Admin Controls**: Vendor approval, listing moderation, analytics

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React, TypeScript |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js (Admin/Vendor only) |
| **Payments** | Stripe Connect |
| **Shipping** | Shippo API |
| **Email** | Resend |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Deployment** | Vercel |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Stripe account (test mode)
- Shippo account

### Setup

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd Dar-Ul-Kutub
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your credentials (see `.env.example` for details)

3. **Database**
   ```bash
   npm run db:migrate
   npm run db:generate
   npm run db:seed  # Optional test data
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

---

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture, database schema, API design
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow, common tasks, debugging
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

---

## User Roles

### Guest Buyer
- Browse catalog
- Search & filter books
- Add to cart
- Guest checkout with email/phone
- Track orders via magic link
- Leave verified reviews

### Vendor (Account Required)
- Manage book listings
- Set prices, stock, shipping details
- View and fulfill orders
- Print shipping labels
- Request payouts
- View sales analytics

### Admin (Account Required)
- Invite vendors via unique links
- Approve/reject vendor signups
- Moderate book listings
- Process refunds
- View platform analytics
- Manage CMS pages (terms, privacy, etc.)

---

## Key Features (MVP)

### ✅ Implemented
- [x] Project structure and architecture
- [x] Database schema with Prisma
- [x] Type-safe API utilities
- [x] UI components (shadcn/ui)
- [x] Validation schemas (Zod)
- [x] Development & deployment docs

### 🚧 In Progress
- [ ] NextAuth.js integration
- [ ] Vendor onboarding flow
- [ ] Product catalog (CRUD + search)
- [ ] Guest checkout
- [ ] Stripe Connect integration
- [ ] Shippo shipping integration
- [ ] Magic link order access
- [ ] Admin dashboard
- [ ] Email notifications

### 📋 Planned
- [ ] Review system
- [ ] Vendor analytics
- [ ] Refund processing
- [ ] CMS for legal pages
- [ ] Advanced search (filters, sorting)

---

## Project Structure

```
Dar-Ul-Kutub/
├── app/              # Next.js App Router (pages + API)
├── components/       # React components
├── lib/              # Utilities, API helpers, integrations
├── prisma/           # Database schema & migrations
├── types/            # TypeScript type definitions
├── hooks/            # Custom React hooks
└── public/           # Static assets
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed structure.

---

## Islamic Compliance (Halal)

✅ **No Interest**: Stripe PaymentIntent with immediate capture
✅ **No BNPL**: Buy-now-pay-later disabled
✅ **Transparent Fees**: All costs shown upfront
✅ **Content Moderation**: Admin approval for all listings
✅ **Privacy-First**: Minimal data collection, clear opt-ins

---

## Contributing

This is an MVP in active development. Contributions welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler |
| `npm run format` | Format code with Prettier |
| `npm run db:migrate` | Run database migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with test data |

---

## Roadmap

### Phase 1: Core MVP (Current)
- Vendor onboarding
- Product catalog
- Guest checkout
- Order fulfillment
- Basic admin tools

### Phase 2: Enhancements
- Reviews & ratings
- Advanced search (Algolia)
- Vendor analytics dashboard
- Email marketing tools
- Gift cards

### Phase 3: Expansion
- International shipping
- Multi-language (Arabic, Urdu)
- Mobile app (React Native)
- Subscription boxes
- Multi-currency support

---

## License

[MIT License](./LICENSE) - See LICENSE file for details

---

## Contact

For questions or support, please open an issue or contact the development team.

---

**بارك الله فيكم** - May Allah bless you

---

**Status**: 🚧 Active Development (MVP Phase 1)
