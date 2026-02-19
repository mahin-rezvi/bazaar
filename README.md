# Hudai (Next.js + Firebase Marketplace)

Production-grade, responsive marketplace-style web app built with:
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui-style components (Radix UI)
- Firebase Auth (email/password + Google) + Firestore + optional Storage
- React Query for caching/fetching

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure env

Copy the example env file:

```bash
cp .env.local.example .env.local
```

### 3) Firebase Console steps

1. Create / select the Firebase project.
2. **Authentication**
   - Enable **Email/Password**
   - Enable **Google**
3. **Firestore Database**
   - Create the database (production or test mode, but apply rules below)
4. **Storage** (recommended for product images)
   - Enable Storage

### 4) Firestore Security Rules (required)

Apply the rules in `firestore.rules`.

Rules summary:
- `products`: public read, **admin-only** writes
- `carts/{uid}`: owner read/write
- `orders`: owner create/read; **admin can read/update status**
- `users/{uid}`: owner read/write profile; admin can read all

### 5) Firestore Indexes (required for search/sort)

Create the indexes in `firestore.indexes.json` (Firebase Console → Firestore → Indexes), or use Firebase CLI:

```bash
firebase deploy --only firestore:indexes
```

### 6) Firebase Storage rules (recommended)

For profile photos (avatars), deploy `storage.rules`:

```bash
firebase deploy --only storage
```

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Admin role setup

Roles are stored in `users/{uid}.role`.
- Default is `user`.
- To grant admin access, manually set your user doc’s `role` to `admin` in Firestore Console:
  - Collection: `users`
  - Document: `<your uid>`
  - Field: `role` = `"admin"`

Admin UI lives at `/admin/*` and is guarded in the UI **and** enforced in Firestore rules.

## Seeding products

Fastest path:
1. Promote yourself to admin (above)
2. Go to `/admin/products`
3. Create products via the admin dialog (upload image via Storage or paste a URL)

Required product fields are enforced via zod schema in `lib/validators.ts`.

### Seed 100 products automatically (recommended)

This uses Firebase Admin SDK (server credentials) to write to Firestore.

1) Create a service account key:
- Firebase Console → Project settings → Service accounts → Generate new private key

2) Set env var and run:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/serviceAccountKey.json"
npm run seed:products
```

This creates/updates `products/seed-0001` … `products/seed-0100` with placeholder images from `picsum.photos`.

## Auth + guards (how it’s safe)

- The app uses **client-side Firebase Auth** for UI state and routing.
- **Role checks are never trusted alone**: Firestore Rules enforce all privileged actions.
- Admin privileges are determined by reading `users/{request.auth.uid}.role` inside rules.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — build
- `npm run start` — start prod server
- `npm run typecheck` — TypeScript check

## Profile settings features

Open `/account` to manage:
- Email change (with re-auth)
- Password reset email
