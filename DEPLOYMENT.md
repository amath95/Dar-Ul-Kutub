# Deployment Guide - Dar-Ul-Kutub

## Overview

This guide covers deploying Dar-Ul-Kutub to production using Vercel (recommended) or other platforms.

---

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform as it's optimized for Next.js applications.

#### Prerequisites
- Vercel account
- GitHub repository
- Production database (Supabase, Railway, or Neon)
- Stripe account (live mode)
- Shippo account

#### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select "Next.js" framework preset

3. **Configure Environment Variables**
   In Vercel dashboard, add all variables from `.env.example`:

   **Database**
   ```
   DATABASE_URL=postgresql://...
   ```

   **NextAuth**
   ```
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=<generate-new-secret>
   ```

   **Stripe (Live Mode)**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

   **Shippo**
   ```
   SHIPPO_API_KEY=<live-key>
   ```

   **Email**
   ```
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=noreply@your-domain.com
   ```

   **Storage**
   ```
   # Vercel Blob (easiest)
   BLOB_READ_WRITE_TOKEN=vercel_blob_...

   # Or AWS S3
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=dar-ul-kutub-prod
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Future pushes to `main` will auto-deploy

5. **Run Database Migrations**
   ```bash
   # From your local machine, pointing to production DB
   npx prisma migrate deploy
   ```

6. **Configure Custom Domain** (Optional)
   - Add domain in Vercel dashboard
   - Update DNS records as instructed
   - Update `NEXTAUTH_URL` to your custom domain

---

### Option 2: Self-Hosted (Docker)

#### Prerequisites
- Docker & Docker Compose
- Linux server (Ubuntu 22.04+)
- Domain with SSL certificate

#### Steps

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npx prisma generate
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: ${DATABASE_URL}
         NEXTAUTH_URL: ${NEXTAUTH_URL}
         # ... other env vars
       depends_on:
         - db

     db:
       image: postgres:15
       environment:
         POSTGRES_DB: dar_ul_kutub
         POSTGRES_USER: ${DB_USER}
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   docker-compose exec app npx prisma migrate deploy
   ```

4. **Set up Nginx reverse proxy** (for SSL)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

---

## Database Setup

### Recommended Providers

#### Supabase (Recommended)
- Free tier available
- PostgreSQL 15
- Built-in connection pooling
- Automatic backups

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings > Database
3. Use connection pooling URL for production

#### Railway
- Simple setup
- PostgreSQL 15
- $5/month starter

#### Neon
- Serverless PostgreSQL
- Auto-scaling
- Free tier available

---

## Stripe Setup

### Production Mode

1. **Activate Stripe Account**
   - Complete business verification
   - Add bank account for payouts

2. **Enable Stripe Connect**
   - Dashboard > Connect > Get Started
   - Choose "Platform or Marketplace"
   - Set up Express or Standard accounts

3. **Configure Webhooks**
   - Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `account.updated`
     - `payout.paid`
     - `payout.failed`

4. **Copy Webhook Secret**
   - Add to `STRIPE_WEBHOOK_SECRET` env var

5. **Enable Stripe Tax** (Optional but recommended)
   - Dashboard > Stripe Tax > Activate
   - Automatically calculates sales tax

---

## Shippo Setup

1. **Create Production API Key**
   - Dashboard > Settings > API
   - Generate live API key

2. **Configure Carrier Accounts**
   - Link USPS, UPS, FedEx accounts
   - Enable live rates

3. **Set up Webhooks** (Optional)
   - Endpoint: `https://your-domain.com/api/webhooks/shippo`
   - Events: Tracking updates

---

## Email Setup (Resend)

1. **Verify Domain**
   - Add domain in Resend dashboard
   - Add DNS records (SPF, DKIM, DMARC)

2. **Create API Key**
   - Add to `RESEND_API_KEY` env var

3. **Set From Email**
   - Update `RESEND_FROM_EMAIL` to verified domain

---

## File Storage

### Option 1: Vercel Blob (Easiest)
- Automatic on Vercel
- No extra config needed
- Pay per GB

### Option 2: AWS S3
1. Create S3 bucket
2. Configure CORS:
   ```json
   [
     {
       "AllowedOrigins": ["https://your-domain.com"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```
3. Create IAM user with S3 permissions
4. Add credentials to env vars

---

## Environment Variables Checklist

### Critical (Required)
- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `SHIPPO_API_KEY`
- ✅ `RESEND_API_KEY`
- ✅ `RESEND_FROM_EMAIL`

### Optional
- `TWILIO_ACCOUNT_SID` (if using SMS)
- `TWILIO_AUTH_TOKEN`
- `AWS_ACCESS_KEY_ID` (if using S3)
- `AWS_SECRET_ACCESS_KEY`
- `SENTRY_DSN` (error tracking)

---

## Post-Deployment

### 1. Run Migrations
```bash
npx prisma migrate deploy
```

### 2. Create Admin User
Via Prisma Studio or seed script:
```bash
npx prisma studio
```

### 3. Test Checkout Flow
- Add test product
- Complete checkout
- Verify Stripe payment
- Check email delivery

### 4. Test Webhooks
- Use Stripe CLI: `stripe trigger payment_intent.succeeded`
- Check logs in Vercel dashboard

### 5. Configure Domain
- Update `NEXTAUTH_URL`
- Update Stripe webhook URL
- Update Shippo webhook URL

---

## Monitoring & Logging

### Vercel Analytics
- Enabled by default
- View in Vercel dashboard

### Error Tracking (Sentry)
1. Create Sentry project
2. Add DSN to env vars:
   ```
   SENTRY_DSN=https://...
   ```
3. Errors auto-reported

### Database Monitoring
- Supabase: Built-in metrics
- Railway: Dashboard metrics
- Set up alerts for high CPU/memory

---

## Backup & Recovery

### Database Backups
- **Supabase**: Automatic daily backups
- **Railway**: Automatic backups
- **Manual**:
  ```bash
  pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
  ```

### Restore
```bash
psql $DATABASE_URL < backup-20250127.sql
```

---

## Security Checklist

- ✅ HTTPS enabled (SSL certificate)
- ✅ Environment variables secured (not committed)
- ✅ Database password rotated
- ✅ Stripe webhook secret configured
- ✅ CORS configured for file uploads
- ✅ Rate limiting enabled (via middleware)
- ✅ NextAuth secret is strong (32+ chars)
- ✅ Admin accounts use strong passwords
- ✅ Database connection pooling enabled

---

## Performance Optimization

### Database
- ✅ Indexes on frequently queried fields (already in schema)
- ✅ Connection pooling (Supabase/Prisma)
- ✅ Read replicas (for high traffic, future)

### Next.js
- ✅ Static generation where possible
- ✅ ISR for product pages (`revalidate: 60`)
- ✅ Image optimization (next/image)
- ✅ CDN via Vercel Edge Network

### Caching
- ✅ Redis for session storage (future)
- ✅ Edge caching for static pages
- ✅ API response caching

---

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run type-check`
- Check env vars are set in Vercel
- Review build logs

### Database Connection Issues
- Verify connection string format
- Check database is accessible from Vercel IPs
- Enable connection pooling

### Stripe Webhooks Not Working
- Verify webhook URL is correct
- Check webhook secret matches
- Review Stripe dashboard logs

### Email Not Sending
- Verify domain DNS records
- Check Resend API key
- Review email logs in Resend dashboard

---

## Rollback Procedure

If deployment fails:

1. **Vercel**: Click "Rollback" on previous deployment
2. **Self-hosted**:
   ```bash
   git revert HEAD
   git push origin main
   docker-compose down
   docker-compose up -d --build
   ```

3. **Database**: Restore from backup if needed

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Support

For deployment issues:
- Check Vercel docs: https://vercel.com/docs
- Review Next.js deployment guide: https://nextjs.org/docs/deployment
- Open GitHub issue

---

**Production Checklist**: Before going live, ensure all items above are completed and tested.
