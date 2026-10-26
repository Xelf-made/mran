# Moran Pharmacy
## Features

### Storefront
- **Product catalog** with category filtering, real-time search suggestions, and product detail pages
- **Prescription upload** — customers upload Rx documents for pharmacist review, with locked product access until approval
- **Cart & checkout** with M-Pesa, card, and cash-on-delivery options, plus guest checkout
- **Order tracking** with live status updates
- **Customer account** — order history, saved addresses, payment methods, wishlist, and prescription history
- **Offers page** showcasing discounted products
- **Branch locator** for physical pharmacy locations
- **Ask a Pharmacist** modal for quick questions

### Admin Control Center
- **Orders** — live realtime subscription, status updates (pending, confirmed, packed, dispatched, delivered, cancelled) with optimistic UI and instant database sync
- **Products** — full CRUD with multi-image Supabase Storage uploads, category assignment, prescription flags, and instant cache invalidation
- **Stock** — dedicated inventory management with live stock adjustments, plus/minus controls, and in-stock/out-of-stock toggles
- **Discounts** — compare-at pricing and promotional tag management with real-time discount percentage display
- **Customers** — registered customer profiles with order counts, total spend, and primary delivery areas
- **Analytics** — real-time store metrics computed from live database tables: revenue (today/week/month), order volume, top-selling products, stock alerts, and growth tracking
- **Store Settings** — delivery thresholds, store hours, contact info, M-Pesa shortcode, payment method toggles, and operational controls, all persisted to the database
- **Collapsible sidebar** with mobile bottom tab navigation

### Pharmacist Portal
- Dashboard for reviewing customer prescription uploads
- Approve or reject prescriptions with notes
- Real-time updates via Supabase Realtime

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, React Router 7
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Data fetching:** TanStack React Query with cache invalidation and optimistic updates
- **Styling:** Custom CSS with a forest-green pharmaceutical aesthetic, fully responsive
- **Icons:** Lucide React

## Database

The app uses Supabase with the following core tables:
- `products` — catalog with pricing, stock, compare-at pricing, images, and prescription flags
- `orders` — customer orders with items, delivery info, and status tracking
- `profiles` — customer profiles
- `addresses` / `payment_methods` / `wishlist` — customer account data
- `prescriptions` — Rx uploads with review status
- `pharmacist_questions` — customer questions for the pharmacist
- `store_settings` — operational configuration (single-row)
- `storage.objects` — product images and prescription files buckets

Row Level Security is enabled on all tables with per-role policies for anon, authenticated, and service roles.

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs automatically. Supabase credentials are pre-configured in `.env`.

## Build

```bash
npm run build
npm run typecheck
```
