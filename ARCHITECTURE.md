# Technical Architecture - Dar-Ul-Kutub MVP

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Structure](#api-structure)
5. [Authentication & Authorization](#authentication--authorization)
6. [Payment Flow](#payment-flow)
7. [Shipping Integration](#shipping-integration)
8. [Security & Compliance](#security--compliance)
9. [Deployment Strategy](#deployment-strategy)

---

## Tech Stack

### Frontend & Backend
- **Next.js 14+** (App Router)
  - Rationale: SSR/SSG for SEO, API routes for backend, TypeScript support, excellent DX
  - React Server Components for performance
  - API Routes for backend logic (monolithic for MVP)

### Database & ORM
- **PostgreSQL 15+**
  - Rationale: ACID compliance for orders/payments, excellent JSON support, robust
  - Strong consistency for financial transactions
  - Row-level locking for inventory management

- **Prisma ORM**
  - Rationale: Type-safe queries, migrations, excellent DX with TypeScript
  - Auto-generated types for database models

### Authentication
- **NextAuth.js v5** (Auth.js)
  - Rationale: Production-ready, supports credentials + magic links
  - Session management
  - Only for Admin/Vendor accounts (no buyer accounts)

### Payments
- **Stripe Connect** (Standard or Express accounts)
  - Rationale: Multi-vendor payouts, compliant with requirements
  - Stripe Tax for automatic sales tax calculation
  - No BNPL, no interest-bearing holds (halal-compliant)
  - Payment intents with idempotency

### Shipping
- **Shippo API**
  - Rationale: Multi-carrier support (USPS, UPS, FedEx)
  - Live rates and label generation
  - Address validation
  - Tracking updates via webhooks

### File Storage
- **AWS S3** (or Vercel Blob Storage)
  - Rationale: Scalable, CDN integration, image optimization
  - Book cover images and documents

### Email & SMS
- **Resend** for transactional emails
  - Rationale: Developer-friendly, reliable, good deliverability

- **Twilio** for SMS (optional)
  - Order notifications and magic links

### Styling & UI
- **Tailwind CSS v3+**
  - Rationale: Fast development, consistent design system

- **shadcn/ui** components
  - Rationale: Accessible, customizable, copy-paste components

### Development Tools
- **TypeScript 5+**
- **ESLint + Prettier**
- **Husky** for pre-commit hooks
- **Zod** for validation
- **React Hook Form** for forms

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Guest Buyer  │  │ Vendor App   │  │  Admin App   │      │
│  │   (Public)   │  │ (Protected)  │  │ (Protected)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              App Router (React Server Components)     │  │
│  │  • Pages: /, /books/[id], /cart, /checkout, /admin  │  │
│  │  • Layouts: Root, Admin, Vendor                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    API Routes                         │  │
│  │  /api/auth/*         - NextAuth endpoints            │  │
│  │  /api/catalog/*      - Product CRUD                   │  │
│  │  /api/orders/*       - Order management              │  │
│  │  /api/checkout/*     - Guest checkout flow           │  │
│  │  /api/vendors/*      - Vendor management             │  │
│  │  /api/admin/*        - Admin operations              │  │
│  │  /api/webhooks/*     - Stripe, Shippo webhooks       │  │
│  │  /api/magic-link/*   - Order access links            │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Middleware Layer                     │  │
│  │  • Authentication (Admin/Vendor routes)              │  │
│  │  • RBAC enforcement                                   │  │
│  │  • Rate limiting                                      │  │
│  │  • Audit logging                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │  AWS S3/Blob │  │  Redis Cache │      │
│  │   (Prisma)   │  │   (Images)   │  │  (Sessions)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Stripe     │  │    Shippo    │  │ Resend/Twilio│      │
│  │  (Payments)  │  │  (Shipping)  │  │ (Notifications)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles
1. **Monolithic for MVP**: Single Next.js application for faster development
2. **Server-Side Rendering**: Better SEO for book discovery
3. **API-First Design**: All business logic in API routes, reusable
4. **Type Safety**: End-to-end TypeScript with Prisma
5. **Atomic Transactions**: Use Prisma transactions for orders/payments
6. **Idempotency**: All payment operations use idempotency keys
7. **Audit Trail**: Log all critical admin/vendor actions

---

## Database Schema

### Core Principles
- **Normalization**: 3NF for most tables
- **Soft Deletes**: Use `deletedAt` for important records
- **Audit Trails**: Created/updated timestamps on all tables
- **UUIDs**: Use UUIDs for public-facing IDs (security)
- **Indexes**: Strategic indexing for search and filters

### Tables Overview

#### 1. **users**
Admin and Vendor accounts only (no buyer accounts)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phone         String?   @unique
  passwordHash  String
  role          UserRole  @default(VENDOR)
  status        UserStatus @default(ACTIVE)

  vendor        Vendor?   // One-to-one for vendors

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?

  @@index([email])
  @@index([role, status])
}

enum UserRole {
  ADMIN
  VENDOR
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DEACTIVATED
}
```

#### 2. **vendor_invites**
Unique, expiring, single-use invite tokens

```prisma
model VendorInvite {
  id            String    @id @default(uuid())
  email         String
  token         String    @unique @default(uuid())

  status        InviteStatus @default(PENDING)
  expiresAt     DateTime
  usedAt        DateTime?
  revokedAt     DateTime?

  invitedBy     String    // Admin user ID

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([token])
  @@index([email, status])
  @@index([expiresAt])
}

enum InviteStatus {
  PENDING
  USED
  EXPIRED
  REVOKED
}
```

#### 3. **vendors**
Vendor-specific business information

```prisma
model Vendor {
  id                String    @id @default(uuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id])

  businessName      String
  businessType      VendorType
  description       String?   @db.Text

  // Contact
  contactName       String
  contactEmail      String
  contactPhone      String

  // Address (ships from)
  addressLine1      String
  addressLine2      String?
  city              String
  state             String    // US state code
  zipCode           String
  country           String    @default("US")

  // Stripe Connect
  stripeAccountId   String?   @unique
  stripeOnboarded   Boolean   @default(false)

  // Settings
  commissionRate    Decimal   @default(0.15) @db.Decimal(5,4) // Platform fee
  autoApprove       Boolean   @default(false) // Auto-approve listings

  status            VendorStatus @default(PENDING_REVIEW)
  approvedAt        DateTime?
  approvedBy        String?   // Admin user ID

  // Relations
  products          Product[]
  orders            OrderItem[]
  payouts           Payout[]

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([status])
  @@index([stripeAccountId])
}

enum VendorType {
  BOOKSTORE
  MASJID
  PUBLISHER
  ORGANIZATION
  INDIVIDUAL
}

enum VendorStatus {
  PENDING_REVIEW
  APPROVED
  SUSPENDED
  REJECTED
}
```

#### 4. **products (listings)**
Book catalog with rich metadata

```prisma
model Product {
  id                String    @id @default(uuid())
  vendorId          String
  vendor            Vendor    @relation(fields: [vendorId], references: [id])

  // Book Info
  title             String
  subtitle          String?
  authors           String[]  // Array of author names
  publisher         String?
  publishYear       Int?
  edition           String?
  language          String    @default("en")
  isbn10            String?   @unique
  isbn13            String?   @unique

  // Physical Details
  binding           BindingType
  condition         BookCondition @default(NEW)
  pageCount         Int?

  // Shipping (required for rate calculation)
  weightOz          Decimal   @db.Decimal(8,2) // Weight in ounces
  lengthIn          Decimal   @db.Decimal(6,2) // Length in inches
  widthIn           Decimal   @db.Decimal(6,2)
  heightIn          Decimal   @db.Decimal(6,2)

  // Pricing & Inventory
  price             Decimal   @db.Decimal(10,2)
  compareAtPrice    Decimal?  @db.Decimal(10,2) // Original price if on sale
  cost              Decimal?  @db.Decimal(10,2) // Vendor's cost (private)
  stock             Int       @default(0)
  lowStockThreshold Int       @default(5)

  // Content
  description       String    @db.Text
  tableOfContents   String?   @db.Text
  images            String[]  // Array of image URLs

  // Categorization
  topics            String[]  // Array of topic tags
  subjects          String[]  // Islamic subjects (Fiqh, Aqeedah, etc.)
  targetAudience    String[]  // Kids, Scholars, General, etc.

  // Status & Approval
  status            ProductStatus @default(DRAFT)
  approvedAt        DateTime?
  approvedBy        String?   // Admin user ID
  rejectedReason    String?

  // SEO
  slug              String    @unique
  metaDescription   String?

  // Stats
  viewCount         Int       @default(0)
  orderCount        Int       @default(0)

  // Relations
  orderItems        OrderItem[]
  reviews           Review[]

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime? // Soft delete

  @@index([vendorId])
  @@index([status])
  @@index([slug])
  @@index([title]) // For search
  @@index([price])
  @@index([stock])
  @@fulltext([title, authors, description]) // Full-text search
}

enum BindingType {
  HARDCOVER
  PAPERBACK
  LEATHER
  SPIRAL
}

enum BookCondition {
  NEW
  LIKE_NEW
  VERY_GOOD
  GOOD
  ACCEPTABLE
}

enum ProductStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  ARCHIVED
}
```

#### 5. **orders**
Guest orders with contact info (no buyer account)

```prisma
model Order {
  id                String    @id @default(uuid())
  orderNumber       String    @unique // Human-readable: ORD-20250115-ABCD

  // Guest Info (no buyer account)
  guestEmail        String
  guestPhone        String?

  // Shipping Address
  shippingName      String
  shippingLine1     String
  shippingLine2     String?
  shippingCity      String
  shippingState     String
  shippingZip       String
  shippingCountry   String    @default("US")

  // Billing (same as shipping for MVP)
  billingName       String
  billingLine1      String
  billingLine2      String?
  billingCity       String
  billingState      String
  billingZip        String
  billingCountry    String    @default("US")

  // Pricing
  subtotal          Decimal   @db.Decimal(10,2)
  shippingCost      Decimal   @db.Decimal(10,2)
  taxAmount         Decimal   @db.Decimal(10,2)
  totalAmount       Decimal   @db.Decimal(10,2)

  // Status
  status            OrderStatus @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING)
  fulfillmentStatus FulfillmentStatus @default(UNFULFILLED)

  // Stripe
  stripePaymentIntentId String? @unique

  // Relations
  items             OrderItem[]
  payments          Payment[]
  shipments         Shipment[]
  magicLinks        MagicLink[]
  refunds           Refund[]

  // Notes
  customerNote      String?   @db.Text
  internalNote      String?   @db.Text

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([orderNumber])
  @@index([guestEmail])
  @@index([status])
  @@index([createdAt])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  PAID
  PARTIALLY_REFUNDED
  REFUNDED
  FAILED
}

enum FulfillmentStatus {
  UNFULFILLED
  PARTIALLY_FULFILLED
  FULFILLED
  RETURNED
}
```

#### 6. **order_items**
Line items grouped by vendor for split fulfillment

```prisma
model OrderItem {
  id                String    @id @default(uuid())
  orderId           String
  order             Order     @relation(fields: [orderId], references: [id])

  productId         String
  product           Product   @relation(fields: [productId], references: [id])

  vendorId          String
  vendor            Vendor    @relation(fields: [vendorId], references: [id])

  // Snapshot at time of order
  title             String
  price             Decimal   @db.Decimal(10,2)
  quantity          Int

  // Vendor revenue split
  vendorAmount      Decimal   @db.Decimal(10,2)
  platformFee       Decimal   @db.Decimal(10,2)
  platformFeeRate   Decimal   @db.Decimal(5,4)

  status            OrderItemStatus @default(PENDING)

  // Shipping
  shipmentId        String?
  shipment          Shipment? @relation(fields: [shipmentId], references: [id])

  // Review
  review            Review?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([orderId])
  @@index([vendorId])
  @@index([productId])
}

enum OrderItemStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  RETURNED
  REFUNDED
}
```

#### 7. **payments**
Payment records linked to Stripe

```prisma
model Payment {
  id                    String    @id @default(uuid())
  orderId               String
  order                 Order     @relation(fields: [orderId], references: [id])

  amount                Decimal   @db.Decimal(10,2)
  currency              String    @default("usd")

  stripePaymentIntentId String    @unique
  stripeChargeId        String?   @unique

  status                PaymentStatus @default(PENDING)

  // Idempotency
  idempotencyKey        String    @unique

  // Metadata
  paymentMethod         String?   // card, apple_pay, google_pay
  last4                 String?
  brand                 String?

  failureCode           String?
  failureMessage        String?

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([orderId])
  @@index([stripePaymentIntentId])
}
```

#### 8. **shipments**
Shipping labels and tracking per vendor

```prisma
model Shipment {
  id                String    @id @default(uuid())
  orderId           String
  order             Order     @relation(fields: [orderId], references: [id])

  vendorId          String    // Which vendor is shipping

  // Shippo
  shippoRateId      String?
  shippoTransactionId String? @unique

  carrier           String    // USPS, UPS, FedEx
  service           String    // Priority Mail, Ground, etc.
  trackingNumber    String?   @unique
  trackingUrl       String?

  labelUrl          String?   // PDF label

  // Costs
  shippingCost      Decimal   @db.Decimal(10,2)

  // Status
  status            ShipmentStatus @default(LABEL_CREATED)

  // Tracking events (JSON)
  trackingEvents    Json?

  // Dates
  shippedAt         DateTime?
  estimatedDelivery DateTime?
  deliveredAt       DateTime?

  // Relations
  items             OrderItem[]

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([orderId])
  @@index([trackingNumber])
  @@index([status])
}

enum ShipmentStatus {
  LABEL_CREATED
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  FAILED
  RETURNED
}
```

#### 9. **magic_links**
Secure, time-limited order access for guests

```prisma
model MagicLink {
  id            String    @id @default(uuid())
  token         String    @unique @default(uuid())

  orderId       String
  order         Order     @relation(fields: [orderId], references: [id])

  email         String    // Must match order email

  expiresAt     DateTime
  usedAt        DateTime?

  // Rotation: generate new token on each use for security
  rotated       Boolean   @default(false)

  createdAt     DateTime  @default(now())

  @@index([token])
  @@index([orderId])
  @@index([expiresAt])
}
```

#### 10. **reviews**
Verified purchase reviews with moderation

```prisma
model Review {
  id            String    @id @default(uuid())

  orderItemId   String    @unique // One review per line item
  orderItem     OrderItem @relation(fields: [orderItemId], references: [id])

  productId     String
  product       Product   @relation(fields: [productId], references: [id])

  rating        Int       // 1-5 stars
  title         String?
  comment       String?   @db.Text

  // Guest info (from order)
  reviewerName  String    // Can be "Anonymous" or real name
  reviewerEmail String    // For verification, not displayed

  verified      Boolean   @default(true) // Always true for MVP

  // Moderation
  status        ReviewStatus @default(PENDING)
  moderatedBy   String?   // Admin user ID
  moderatedAt   DateTime?
  rejectedReason String?

  // Helpful votes (future)
  helpfulCount  Int       @default(0)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([productId])
  @@index([status])
  @@index([createdAt])
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### 11. **refunds**
Refund tracking and reconciliation

```prisma
model Refund {
  id                String    @id @default(uuid())
  orderId           String
  order             Order     @relation(fields: [orderId], references: [id])

  amount            Decimal   @db.Decimal(10,2)
  reason            RefundReason
  reasonNote        String?   @db.Text

  // Stripe
  stripeRefundId    String    @unique

  status            RefundStatus @default(PENDING)

  // Who initiated
  initiatedBy       String    // Admin or Vendor user ID

  // Inventory
  restockItems      Boolean   @default(true)

  createdAt         DateTime  @default(now())
  processedAt       DateTime?

  @@index([orderId])
  @@index([status])
}

enum RefundReason {
  CUSTOMER_REQUEST
  OUT_OF_STOCK
  DAMAGED
  WRONG_ITEM
  DUPLICATE_ORDER
  FRAUDULENT
  OTHER
}

enum RefundStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

#### 12. **payouts**
Vendor payouts via Stripe Connect

```prisma
model Payout {
  id                String    @id @default(uuid())
  vendorId          String
  vendor            Vendor    @relation(fields: [vendorId], references: [id])

  amount            Decimal   @db.Decimal(10,2)
  currency          String    @default("usd")

  // Stripe Connect
  stripePayoutId    String?   @unique
  stripeAccountId   String

  status            PayoutStatus @default(PENDING)

  // Date range of orders included
  periodStart       DateTime
  periodEnd         DateTime

  // Details
  orderCount        Int
  platformFee       Decimal   @db.Decimal(10,2)
  grossAmount       Decimal   @db.Decimal(10,2) // Before platform fee

  failureCode       String?
  failureMessage    String?

  createdAt         DateTime  @default(now())
  paidAt            DateTime?

  @@index([vendorId])
  @@index([status])
  @@index([createdAt])
}

enum PayoutStatus {
  PENDING
  IN_TRANSIT
  PAID
  FAILED
  CANCELLED
}
```

#### 13. **audit_logs**
Complete audit trail for compliance

```prisma
model AuditLog {
  id            String    @id @default(uuid())

  userId        String    // Who performed the action
  userRole      UserRole

  action        String    // VENDOR_INVITED, LISTING_APPROVED, etc.
  entity        String    // vendors, products, orders, etc.
  entityId      String    // ID of affected record

  changes       Json?     // Before/after snapshot
  metadata      Json?     // Additional context

  ipAddress     String?
  userAgent     String?

  createdAt     DateTime  @default(now())

  @@index([userId])
  @@index([action])
  @@index([entity, entityId])
  @@index([createdAt])
}
```

#### 14. **cms_pages**
Simple CMS for legal pages

```prisma
model CmsPage {
  id            String    @id @default(uuid())
  slug          String    @unique
  title         String
  content       String    @db.Text

  published     Boolean   @default(false)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  updatedBy     String    // Admin user ID

  @@index([slug])
}
```

---

## API Structure

### RESTful Conventions
- Use Next.js App Router API routes: `/app/api/[resource]/route.ts`
- HTTP Methods: GET, POST, PATCH, DELETE
- Response format: JSON with consistent structure

### Standard Response Format
```typescript
{
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}
```

### API Routes

#### Public (No Auth)
```
GET    /api/catalog/products              - List products (with filters)
GET    /api/catalog/products/:id          - Get product details
GET    /api/catalog/search                - Search products
GET    /api/catalog/topics                - List topics/categories
POST   /api/checkout/cart                 - Validate cart
POST   /api/checkout/shipping-rates       - Get shipping rates
POST   /api/checkout/create-order         - Create order + payment intent
POST   /api/checkout/confirm-payment      - Confirm payment
GET    /api/magic-link/order/:token       - Access order via magic link
POST   /api/magic-link/resend             - Request new magic link
POST   /api/reviews                       - Submit review (via magic link)
```

#### Vendor (Auth Required)
```
GET    /api/vendor/dashboard              - Vendor stats
GET    /api/vendor/products               - List own products
POST   /api/vendor/products               - Create product
PATCH  /api/vendor/products/:id           - Update product
DELETE /api/vendor/products/:id           - Delete product
POST   /api/vendor/products/:id/images    - Upload images
GET    /api/vendor/orders                 - List orders
PATCH  /api/vendor/orders/:id/ship        - Mark as shipped + create label
GET    /api/vendor/payouts                - List payouts
POST   /api/vendor/payouts/request        - Request payout
PATCH  /api/vendor/profile                - Update vendor profile
POST   /api/vendor/stripe/onboard         - Start Stripe onboarding
```

#### Admin (Auth Required)
```
GET    /api/admin/dashboard               - Admin analytics
GET    /api/admin/vendors                 - List vendors
POST   /api/admin/vendors/invite          - Send vendor invite
PATCH  /api/admin/vendors/:id/approve     - Approve vendor
PATCH  /api/admin/vendors/:id/suspend     - Suspend vendor
POST   /api/admin/vendors/invite/resend   - Resend invite
DELETE /api/admin/vendors/invite/:id      - Revoke invite
GET    /api/admin/products                - List all products
PATCH  /api/admin/products/:id/approve    - Approve listing
PATCH  /api/admin/products/:id/reject     - Reject listing
GET    /api/admin/orders                  - List all orders
POST   /api/admin/orders/:id/refund       - Process refund
GET    /api/admin/reviews                 - List reviews (moderation queue)
PATCH  /api/admin/reviews/:id/approve     - Approve review
PATCH  /api/admin/reviews/:id/reject      - Reject review
GET    /api/admin/analytics               - Detailed analytics
POST   /api/admin/analytics/export        - Export CSV
GET    /api/admin/cms/pages               - List CMS pages
PATCH  /api/admin/cms/pages/:slug         - Update CMS page
GET    /api/admin/audit-logs              - View audit logs
```

#### Webhooks
```
POST   /api/webhooks/stripe               - Stripe events
POST   /api/webhooks/shippo               - Tracking updates
```

---

## Authentication & Authorization

### Strategy
- **NextAuth.js** for Admin/Vendor sessions
- **JWT tokens** stored in HTTP-only cookies
- **Magic links** for guest order access (separate from auth)

### RBAC Middleware
```typescript
// middleware.ts - Route protection
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    return requireRole(request, 'ADMIN')
  }

  if (pathname.startsWith('/vendor')) {
    return requireRole(request, ['ADMIN', 'VENDOR'])
  }

  return NextResponse.next()
}

// API route protection
export async function requireAuth(req: Request, roles?: UserRole[]) {
  const session = await getServerSession()

  if (!session) {
    throw new UnauthorizedError()
  }

  if (roles && !roles.includes(session.user.role)) {
    throw new ForbiddenError()
  }

  return session
}
```

### Audit Logging
Log all critical actions:
- Vendor invites (create, resend, revoke)
- Vendor approvals/suspensions
- Product approvals/rejections
- Refunds
- Payouts
- Admin CMS changes

---

## Payment Flow

### Checkout Flow (Stripe)
1. **Client**: Add items to cart
2. **Client → Server**: POST `/api/checkout/create-order`
   - Validate cart (stock, prices)
   - Calculate shipping + tax
   - Create Order (status: PENDING)
   - Create Stripe PaymentIntent with:
     - Amount
     - Idempotency key
     - Metadata (order ID)
     - Application fee (platform commission) via Stripe Connect
3. **Server → Client**: Return `clientSecret` for PaymentIntent
4. **Client**: Stripe.js payment form (Card, Apple Pay, Google Pay)
5. **Client → Stripe**: Confirm payment
6. **Stripe → Server**: Webhook `payment_intent.succeeded`
7. **Server**:
   - Verify payment
   - Update Order status → CONFIRMED
   - Decrement stock
   - Create Payment record
   - Send receipt email with magic link
8. **Stripe Connect**: Automatic payout to vendor accounts (schedule: daily/weekly)

### Stripe Connect Setup
- **Account type**: Express or Standard (vendor choice)
- **Platform fee**: Configurable per vendor (default 15%)
- **Payouts**: Automatic via Stripe (no manual payout processing needed)
- **Tax**: Stripe Tax for automatic sales tax calculation

### Refund Flow
1. **Admin/Vendor**: Initiate refund via dashboard
2. **Server**: Create Stripe refund
3. **Server**: Create Refund record
4. **Server**: Restore stock if `restockItems = true`
5. **Stripe → Server**: Webhook `charge.refunded`
6. **Server**: Update Order status → REFUNDED or PARTIALLY_REFUNDED
7. **Server**: Send refund confirmation email

---

## Shipping Integration

### Shippo API
- **Address validation**: On checkout
- **Live rates**: Show real-time carrier rates
- **Label generation**: Vendor creates label from dashboard
- **Tracking**: Webhooks update shipment status

### Flow
1. **Checkout**:
   - Validate address via Shippo
   - Get live rates for buyer's zip + product weight/dims
   - Buyer selects carrier/service
2. **Post-Purchase**:
   - Vendor generates label via `/api/vendor/orders/:id/ship`
   - Shippo creates label → store `labelUrl`, `trackingNumber`
   - Update Shipment status → IN_TRANSIT
3. **Tracking**:
   - Shippo webhooks update tracking events
   - Buyer can check status via magic link

---

## Security & Compliance

### Security Measures
1. **Input Validation**: Zod schemas for all API inputs
2. **SQL Injection**: Prisma ORM (parameterized queries)
3. **XSS**: React auto-escaping + CSP headers
4. **CSRF**: NextAuth CSRF tokens
5. **Rate Limiting**: Upstash Redis or Vercel Edge Config
6. **File Upload**: Validate file type/size, scan for malware
7. **Secrets**: Environment variables, never commit
8. **HTTPS**: Enforce in production
9. **PII**: Hash/encrypt sensitive data, minimize storage

### Islamic Compliance (Halal)
- **No Interest**: Stripe PaymentIntent with immediate capture (no delayed charges)
- **No BNPL**: Disable buy-now-pay-later options
- **Transparent Fees**: Show all costs upfront
- **Prohibited Content**: Admin approval gate for all listings
- **Privacy**: Minimal data collection, clear opt-ins for marketing

### Data Privacy
- **Guest Checkout**: Store email/phone only for order fulfillment
- **Marketing Opt-In**: Separate checkbox, not required
- **Right to Deletion**: Implement on request
- **Data Retention**: Auto-delete old magic links, audit logs after 2 years

---

## Deployment Strategy

### Environment Setup
- **Development**: Local PostgreSQL + local Stripe test mode
- **Staging**: Vercel preview + Supabase PostgreSQL + Stripe test mode
- **Production**: Vercel + Supabase/Railway PostgreSQL + Stripe live mode

### Infrastructure
- **Hosting**: Vercel (Next.js optimized)
- **Database**: Supabase PostgreSQL or Railway
- **Object Storage**: Vercel Blob or AWS S3
- **CDN**: Vercel Edge Network
- **DNS**: Cloudflare or Vercel
- **Monitoring**: Vercel Analytics + Sentry
- **Logs**: Vercel Logs + Logtail/Axiom

### CI/CD
- **Git Flow**: `main` (production), `develop` (staging), feature branches
- **GitHub Actions**:
  - Lint + Type check on PR
  - Run tests
  - Deploy to preview (on PR)
  - Deploy to production (on merge to main)
- **Database Migrations**: Prisma Migrate (run on deploy)

### Performance
- **React Server Components**: Reduce client JS
- **Image Optimization**: Next.js Image component + CDN
- **Caching**:
  - Product listings: ISR (revalidate every 60s)
  - Static pages: SSG
  - API: Redis cache for search results
- **Database**: Connection pooling (Prisma + PgBouncer)

### Monitoring
- **Uptime**: Vercel or UptimeRobot
- **Errors**: Sentry
- **Performance**: Vercel Analytics + Web Vitals
- **Business Metrics**: Custom dashboard (orders, revenue, conversion)

---

## Development Workflow

### Local Setup
```bash
# Clone repo
git clone <repo>
cd dar-ul-kutub

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Fill in: DATABASE_URL, STRIPE_SECRET_KEY, SHIPPO_API_KEY, etc.

# Database
npx prisma migrate dev
npx prisma generate
npx prisma db seed

# Run dev server
npm run dev
```

### Testing Strategy (MVP)
- **Unit Tests**: Critical business logic (cart, pricing, stock)
- **Integration Tests**: API routes
- **E2E Tests**: Checkout flow (Playwright)
- **Manual QA**: Vendor dashboard, admin operations

### Code Quality
- **TypeScript**: Strict mode
- **ESLint**: Enforce rules
- **Prettier**: Auto-format
- **Husky**: Pre-commit hooks (lint, type-check)
- **Conventional Commits**: For changelog generation

---

## Future Considerations (Post-MVP)

1. **Multi-Language**: i18n for Arabic, Urdu, etc.
2. **International Shipping**: Expand beyond US
3. **Advanced Search**: Elasticsearch/Algolia
4. **Wishlist**: Guest wishlist via localStorage
5. **Gift Cards**: Separate product type
6. **Subscriptions**: Monthly book boxes
7. **Mobile App**: React Native
8. **Vendor Analytics**: Detailed sales reports
9. **Marketing Tools**: Email campaigns, discounts
10. **Multi-Currency**: Accept GBP, EUR, etc.

---

## Appendix: Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | SSR, routing, API |
| Language | TypeScript 5 | Type safety |
| Styling | Tailwind CSS + shadcn/ui | UI components |
| Database | PostgreSQL 15 | Relational data |
| ORM | Prisma | Type-safe queries |
| Auth | NextAuth.js v5 | Session management |
| Payments | Stripe Connect | Multi-vendor payments |
| Shipping | Shippo API | Labels + tracking |
| Email | Resend | Transactional emails |
| SMS | Twilio | Order notifications |
| Storage | Vercel Blob / S3 | Image storage |
| Cache | Redis (Upstash) | Session + rate limiting |
| Hosting | Vercel | Serverless deployment |
| Monitoring | Sentry + Vercel Analytics | Error tracking |
| CI/CD | GitHub Actions | Automated deploy |

---

**Document Version**: 1.0
**Last Updated**: 2025-01-27
**Owner**: Engineering Team
