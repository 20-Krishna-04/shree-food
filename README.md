# 🍲 श्री फूड (Shree Food) — Cloud Kitchen Web Application

A full-stack commercial Online Food Ordering and Cloud Kitchen Management System for **श्री फूड**, engineered with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase PostgreSQL & Realtime**, and **UPI QR & WhatsApp Direct Ordering**.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Dishes & Menu](#2-dishes--menu-आपले-पदार्थ)
3. [Technologies Used](#3-technologies-used)
4. [Installation Instructions](#4-installation-instructions)
5. [Supabase Setup](#5-supabase-setup)
6. [SQL Migration Instructions](#6-sql-migration-instructions)
7. [Authentication Configuration](#7-authentication-configuration)
8. [Environment Variables](#8-environment-variables)
9. [Admin Account Setup](#9-admin-account-setup)
10. [Local Development](#10-local-development)
11. [Testing and Validation](#11-testing-and-validation)
12. [Vercel Deployment](#12-vercel-deployment)
13. [Project Directory Structure](#13-project-directory-structure)

---

## 1. Project Overview

**श्री फूड** is a cloud kitchen platform designed for online ordering of authentic vegetarian delicacies. It features:
- **Our Dishes (आपले पदार्थ):** व्हेज बिर्याणी (Veg Biryani), पुलाव (Veg Pulao), पाव भाजी (Pav Bhaji), गुलाब जाम (Gulab Jamun), बटाटा वडा (Batata Vada), पुरण पोळी (Puran Poli).
- **Party & Birthday Bookings:** Custom order bookings and WhatsApp integration (`9284366544`).
- **Customer Registration & Auth:** Secure credential authentication for customers and single administrator.
- **Admin Kitchen Dashboard:** Real-time Kanban order pipeline (*Pending → In Process → Completed*), dish management, and customer directories.

---

## 2. Dishes & Menu (आपले पदार्थ)

1. **व्हेज बिर्याणी (Veg Biryani)** — ₹140
2. **पुलाव (Veg Pulao)** — ₹120
3. **पाव भाजी (Special Pav Bhaji)** — ₹110
4. **गुलाब जाम (Gulab Jamun - 2 Pcs)** — ₹50
5. **बटाटा वडा (Batata Vada - 2 Pcs)** — ₹50
6. **पुरण पोळी (Puran Poli - 2 Pcs)** — ₹80
- **Authoritative Price Recalculation:** Prices and subtotal calculations are verified strictly on the server against the database. Customer-submitted prices are never trusted.
- **Checkout & UPI QR Modal (`/checkout/[id]`):** Centered modal displaying UPI QR code from `/images/qr-code.png`, total payable amount, step-by-step payment instructions, and simulated verification with explicit developer labelling.
- **Live Order Tracking (`/order-tracking/[id]`):** Real-time 3-stage progress timeline (*Pending → In Process → Completed*) subscribed to Supabase Realtime (`postgres_changes`).
- **Account & Orders (`/login`, `/register`, `/my-orders`):** Secure customer credentials authentication, order history, and direct order tracking access.

### B. Admin & Kitchen Dashboard
- **Operations Dashboard (`/admin/dashboard`):** Real-time statistic cards (*Total Orders, Pending Orders, In Kitchen, Completed Orders, Total Revenue, Today's Sales*), live audio chime on incoming orders, best-selling dishes ranking, and live activity feed.
- **Order Management Board (`/admin/orders`):** Three-column Kanban pipeline:
  - **Column 1: PENDING** — Incoming verified orders with "Accept & Process" action.
  - **Column 2: IN PROCESS** — Active kitchen preparation with "Mark Completed" action.
  - **Column 3: COMPLETED** — Completed order cards with timestamp history.
  - Toggle switch between 3-Column Kanban Board and Log Table View.
- **Menu Management (`/admin/menu`):** Add dishes, edit descriptions, adjust prices, toggle in-stock availability, upload photographs via file picker or URL, and assign categories.
- **Customer Management (`/admin/customers`):** Directory of registered customers, lifetime ordering metrics, and gross customer spend.
- **Business Analytics (`/admin/analytics`):** Real database-driven metrics, daily/weekly/monthly revenue breakdown, interactive SVG velocity bar charts, order status distribution, and top-selling food items.
- **Settings (`/admin/settings`):** Store identity, physical address, business hours, delivery charges, and payment gateway status.

---

## 2. Technologies Used

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend:** Next.js Route Handlers (`/api/*`), Server Actions & Server Components
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Real-Time Engine:** Supabase Realtime (`postgres_changes` channel subscriptions)
- **Authentication:** Auth.js / Supabase Credentials Auth with role-based access control
- **Validation:** Zod schemas
- **Payments:** UPI QR Integration + Razorpay SDK with SHA-256 HMAC signature verification & development simulation mode
- **Deployment:** Vercel & GitHub

---

## 3. Installation Instructions

### Prerequisites
- Node.js 18.17+ or Node.js 20+
- npm or yarn or pnpm
- Supabase account (free tier works perfectly)

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/your-username/cloud-kitchen.git
cd cloud-kitchen

# 2. Install dependencies
npm install

# 3. Create local environment configuration
cp .env.example .env.local
```

---

## 4. Supabase Setup

1. Log in to [Supabase](https://supabase.com) and click **New Project**.
2. Name your project (e.g. `cloud-kitchen`) and set a secure database password.
3. Select your region (e.g., `ap-south-1` for Mumbai, India).
4. After creation, go to **Project Settings → API** and copy:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon / public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`) — *Store on server only!*

---

## 5. SQL Migration Instructions

1. Open your Supabase Dashboard and go to the **SQL Editor**.
2. Click **New Query**.
3. Copy and paste the entire contents of [`supabase/migrations/20260201000000_initial_schema.sql`](file:///c:/Users/HP/Desktop/Projects/Shree%20Food%20%28Cloud%20Kitchen%29/supabase/migrations/20260201000000_initial_schema.sql) into the editor.
4. Click **Run** (Ctrl + Enter). This creates:
   - Tables: `profiles`, `categories`, `products`, `orders`, `order_items`, `payments`.
   - Updated_at and user registration triggers.
   - Row Level Security (RLS) policies.
   - Realtime publication on the `orders` table.
5. Create another query, paste the contents of [`supabase/seed.sql`](file:///c:/Users/HP/Desktop/Projects/Shree%20Food%20%28Cloud%20Kitchen%29/supabase/seed.sql), and click **Run**.
6. This populates your initial menu catalog with authentic Indian meals, biryanis, sourdough pizzas, burgers, snacks, desserts, and beverages.

### Enabling Realtime on Orders
The migration script automatically runs:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
```
To verify, go to **Database → Publications → supabase_realtime** in the Supabase Dashboard and ensure `orders` is enabled.

---

## 6. Authentication Configuration

The application uses role-based authentication where:
- Customers can only read and manage their own orders and profile.
- Administrators can view all orders, manage dishes, adjust prices, view customer directories, and access financial analytics.
- Client browsers are never trusted with role determination; server endpoints re-verify permissions against the database.
- Route protection middleware secures:
  - `/admin/*` — Restricted to admin role.
  - `/checkout/*` — Authenticated customers only.
  - `/my-orders/*` — Authenticated customers only.
  - `/order-tracking/*` — Authenticated customers only.

---

## 7. Environment Variables

Configure `.env.local` using `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth.js / NextAuth Session Secret
AUTH_SECRET=cloud_kitchen_super_secret_session_token_min_32_chars
NEXTAUTH_SECRET=cloud_kitchen_super_secret_session_token_min_32_chars
AUTH_URL=http://localhost:3000

# Payment Gateway Configuration
# Set to 'demo' for simulated testing or 'production' for live Razorpay
PAYMENT_MODE=demo

# Razorpay Keys (Keep server secrets confidential)
RAZORPAY_KEY_ID=rzp_test_yourkeyid
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_yourkeyid
```

---

## 8. Admin Account Setup

To maintain security, no default public admin account exists. Follow these steps to promote your account:

1. Start the app and register a new user at `/register`.
2. Go to your **Supabase Dashboard → Table Editor → profiles**.
3. Locate your newly registered user row.
4. Change the `role` column value from `'customer'` to `'admin'`.
5. Alternatively, run this SQL in the **SQL Editor**:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```
6. Sign in at `/login` and access `/admin/dashboard`.

*Note: For out-of-the-box local testing without Supabase credentials, the app includes a convenient demo role switcher toggle in the navigation bar to preview both Customer and Admin experiences instantly.*

---

## 9. Local Development

```bash
# Run local development server
npm run dev

# Or specify custom port
npm run dev -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 10. Testing and Validation

Run the test suite and validation checks:

```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Next.js / ESLint code quality check
npm run lint

# 3. Production build verification
npm run build
```

### Complete End-to-End Workflow Verification:
1. Register a customer at `/register`.
2. Browse dishes at `/menu` and filter by category or dietary preference.
3. Open a dish detail page at `/menu/[id]`, select quantity, and add to cart.
4. Review order and enter delivery address at `/cart`.
5. Complete payment via the QR modal at `/checkout/[id]` using the "Done (I Have Paid)" demo simulation.
6. Observe instant transition to `/order-tracking/[id]`.
7. Switch to the Admin portal at `/admin/orders` on the 3-column Kanban board.
8. Click "Accept & Process" to advance the order to "In Process".
9. Verify the customer tracking screen reflects the change in real time without refreshing.
10. Click "Mark Completed" on the admin board to finish order fulfillment.

---

## 11. Vercel Deployment

1. Push your repository to **GitHub**:
```bash
git add .
git commit -m "feat: complete cloud kitchen full-stack web application"
git push origin main
```
2. Log in to [Vercel](https://vercel.com) and click **Add New → Project**.
3. Import your `cloud-kitchen` repository.
4. Under **Environment Variables**, add all keys from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_SECRET`
   - `AUTH_URL` (set to your Vercel deployment URL, e.g. `https://your-kitchen.vercel.app`)
   - `PAYMENT_MODE` (`demo` or `production`)
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
5. Click **Deploy**. Vercel will build and launch your application globally on its high-speed Edge Network.

---

## 12. Payment Gateway Configuration

### Development Simulation Mode (`PAYMENT_MODE=demo`)
- The checkout modal displays the UPI QR code from `/images/qr-code.png`.
- Clicking "Done (I Have Paid)" triggers `/api/payments/verify` with `{ is_simulation: true }`.
- Payment status transitions to `paid` and creates an audit record in the `payments` table without charging real money.

### Production Razorpay Mode (`PAYMENT_MODE=production`)
1. Create an account at [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Generate API Keys in **Settings → API Keys**.
3. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to your environment variables.
4. Configure Webhooks:
   - URL: `https://your-domain.com/api/webhooks/razorpay`
   - Active Events: `order.paid`, `payment.captured`
   - Secret: Set your `RAZORPAY_WEBHOOK_SECRET`
5. Every webhook request validates the `x-razorpay-signature` header using HMAC-SHA256 before marking orders as paid. Duplicate webhook calls are handled idempotently.

---

## 13. Project Directory Structure

```
├── public/
│   └── images/
│       └── qr-code.png                        # Official UPI scan & pay QR asset
├── supabase/
│   ├── migrations/
│   │   └── 20260201000000_initial_schema.sql  # Schema, RLS, functions & triggers
│   └── seed.sql                               # Culinary menu seed data
├── src/
│   ├── app/
│   │   ├── page.tsx                           # Storefront homepage
│   │   ├── menu/page.tsx                      # Food ordering menu
│   │   ├── menu/[id]/page.tsx                 # Product details & pairing
│   │   ├── cart/page.tsx                      # Cart & delivery details
│   │   ├── checkout/[id]/page.tsx             # Centered QR payment modal
│   │   ├── order-tracking/[id]/page.tsx       # Live realtime order tracker
│   │   ├── orders/[id]/page.tsx               # Order alias route
│   │   ├── my-orders/page.tsx                 # Customer order history
│   │   ├── login/page.tsx                     # Authentication login
│   │   ├── register/page.tsx                  # Registration
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx             # Operations dashboard
│   │   │   ├── orders/page.tsx                # 3-column Kanban order board
│   │   │   ├── menu/page.tsx                  # Food menu management
│   │   │   ├── customers/page.tsx             # Customer directory
│   │   │   ├── analytics/page.tsx             # Database-computed sales charts
│   │   │   └── settings/page.tsx              # Kitchen & payment configuration
│   │   └── api/
│   │       ├── orders/                        # Order creation & list
│   │       ├── orders/[id]/                   # Single order details
│   │       ├── orders/[id]/status/            # Admin order status update
│   │       ├── products/                      # Menu catalog API
│   │       ├── products/[id]/                 # Product details, PUT, DELETE
│   │       ├── admin/customers/               # Customer management API
│   │       ├── payments/create-order/         # Payment order generation
│   │       ├── payments/verify/               # Signature verification
│   │       └── webhooks/razorpay/             # Idempotent webhook handler
│   ├── components/
│   │   ├── layout/                            # Navbar, Footer
│   │   ├── customer/                          # FoodCard, CategoryFilter, SearchAndFilter, OrderTrackerTimeline
│   │   ├── admin/                             # AdminSidebar, AdminOrderCard, ProductModal
│   │   └── checkout/                          # QRPaymentModal
│   ├── contexts/
│   │   ├── auth-context.tsx                   # Auth & session provider
│   │   └── cart-context.tsx                   # Cart state & pricing provider
│   ├── lib/
│   │   ├── supabase/                          # Browser, server & admin Supabase clients
│   │   ├── payments/                          # Razorpay client & HMAC verification
│   │   ├── validations/                       # Zod validation schemas
│   │   ├── mock-data.ts                       # Fallback catalog data
│   │   └── utils.ts                           # INR currency & formatting utilities
│   └── types/                                 # TypeScript interfaces & types
├── middleware.ts                              # Route protection & session refresh
├── .env.example                               # Environment configuration template
└── README.md                                  # Complete documentation
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
