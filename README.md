# COIN Availability Service — Website (Next.js)

Trilingual (EN / FR / NL) public site and headless CMS for COIN AS, a BeNeLux provider of business continuity, disaster recovery, and cyber resilience services. The marketing pages are rendered by Next.js 16 (App Router) with Firestore as the content source; the `/admin` panel writes back to the same Firestore project and triggers on-demand ISR revalidation via a Firebase-ID-token-authenticated API route. Tailwind v4, Framer Motion, and a small amount of Three.js cover the UI; Netlify hosts production.

## Table of contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Project structure](#project-structure)
- [Routing](#routing)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Firebase setup](#firebase-setup)
- [Data model](#data-model)
- [Internationalization](#internationalization)
- [Admin panel](#admin-panel)
- [Deployment (Netlify)](#deployment-netlify)
- [Available scripts](#available-scripts)
- [Security considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1 (App Router, React Server Components, ISR) |
| Language | TypeScript 5.9, strict mode |
| UI runtime | React 19.2 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), `tw-animate-css`, `tailwind-merge`, `class-variance-authority` |
| Components | shadcn-generated primitives (`src/components/ui`), Base UI (`@base-ui/react`), Lucide icons |
| Animation / 3D | Framer Motion 12, Three.js 0.183 |
| Content store | Firestore (client-side Lite SDK for reads on marketing pages, full Web SDK on admin pages) |
| Auth | Firebase Auth with email/password and a custom `admin: true` claim |
| File storage | Firebase Storage (white-paper PDFs, thumbnails, uploaded images) |
| Server-only APIs | Next.js Route Handlers backed by `firebase-admin` for contact submissions and ID-token-authenticated revalidation |
| Markdown | `react-markdown` for rich-text article rendering |
| Lint | ESLint 9 with `eslint-config-next` |
| Hosting | Netlify via `@netlify/plugin-nextjs` |

## Features

- Marketing site covering services, challenges, partners, locations, news/events, a knowledge hub (articles, case studies, videos, FAQ, white papers), about, contact, and the legal pages (cookies / privacy / legal notice).
- Trilingual content everywhere: every editable string is stored in Firestore as a `{ en, fr, nl }` object and selected at render time via `getLocalizedField`.
- Admin CMS at `/admin` for pages, services, news, articles, white papers, partners, team, challenges, FAQ, and global site config — plus a dashboard with live Firestore counts.
- White-paper admin uploads PDFs and thumbnails directly to Firebase Storage with progress tracking and updates the `white_papers` collection.
- Contact form posts to `POST /api/contact` with per-IP in-memory rate limiting (5 req/hour) and persists submissions to `contact_submissions`.
- On-demand revalidation: admin save actions call `triggerRevalidate(path)`, which hits `POST /api/revalidate` with a Firebase ID token; the route verifies the token and the `admin` custom claim before calling `revalidatePath`.
- Marketing layout pre-fetches navigation and site config in parallel and revalidates every 300 seconds as a safety net.
- Cookie-gated analytics (Google Tag Manager + Microsoft Clarity) loaded client-side only after consent is granted.
- Default locale cookie is set by the proxy (`src/proxy.ts`) on first visit so SSR and client agree on the language.
- SEO basics: per-route metadata, a root-level `sitemap.ts` and `robots.ts`, `metadataBase` set to `https://coin-bc.com`.
- Seed and migration scripts (`npm run seed`, `seed-faq`, `seed-challenges`, `migrate-news`) to bootstrap or evolve the Firestore schema.

## Project structure

```
.
├── netlify.toml                     # Netlify build config + Next.js plugin
├── next.config.ts                   # Remote image patterns (Firebase Storage, coin-as.com)
├── tsconfig.json                    # "@/*" maps to src/*
├── scripts/
│   ├── seed-firestore.ts            # Seeds site_config, navigation, services, team, partners, pages
│   ├── seed-faq.ts                  # Seeds faq_items (uses firebase-admin)
│   ├── seed-challenges.ts           # Seeds challenges collection
│   ├── migrate-news.ts              # One-shot migration: adds `type`, normalizes nulls on news docs
│   └── upload-customer-logos.ts     # Batch-uploads partner logos into Firebase Storage
├── src/
│   ├── proxy.ts                     # Edge middleware: seeds the `locale` cookie
│   ├── app/
│   │   ├── layout.tsx               # Root layout, metadata, Sora font, Arial body
│   │   ├── globals.css              # Tailwind v4 entrypoint + design tokens
│   │   ├── error.tsx, not-found.tsx, loading.tsx
│   │   ├── robots.ts, sitemap.ts
│   │   ├── (marketing)/             # Public routes sharing a header/footer layout
│   │   │   ├── layout.tsx           # Fetches nav + siteConfig, mounts analytics, cookie banner
│   │   │   ├── page.tsx             # Home
│   │   │   ├── about/, contact/, locations/
│   │   │   ├── services/[slug]/
│   │   │   ├── challenges/[slug]/
│   │   │   ├── news/[slug]/
│   │   │   ├── partners/ + partners/become-partner/
│   │   │   ├── knowledge-hub/       # index + articles, case-studies, videos, faq, white-papers, [slug]
│   │   │   ├── cookies-policy/, privacy-policy/, legal-notice/
│   │   ├── admin/
│   │   │   ├── layout.tsx           # Client-side auth gate via useFirebaseAuth
│   │   │   ├── page.tsx             # Dashboard with collection counts
│   │   │   ├── login/
│   │   │   ├── pages/[pageSlug]/    # Edit home + legal pages by slug
│   │   │   ├── services/[slug]/
│   │   │   ├── news/, articles/, white-papers/
│   │   │   ├── partners/, team/, challenges/, faq/
│   │   │   └── settings/            # Global site_config
│   │   └── api/
│   │       ├── contact/route.ts     # POST, rate-limited, writes contact_submissions
│   │       └── revalidate/route.ts  # POST, Firebase ID-token + admin claim required
│   ├── components/
│   │   ├── admin/                   # AdminSidebar, AdminHeader, LocaleEditor, SectionsEditor, NewsForm
│   │   ├── layout/                  # Header, Footer, CookieBanner, ConsentScripts, EventBanner, ScrollToTop
│   │   ├── sections/, knowledge-hub/, reactbits/, ui/
│   ├── hooks/                       # useFirebaseAuth, useLocale, useScrollPosition
│   └── lib/
│       ├── firebase/
│       │   ├── config.ts            # Client SDK (Lite + Full), Auth, Storage, Analytics loader
│       │   ├── admin.ts             # firebase-admin lazy singleton
│       │   └── revalidate.ts        # triggerRevalidate(path) helper
│       ├── firestore/               # Per-collection read/write helpers (see Data model)
│       ├── types/                   # Domain types: article, challenge, faq, locale, navigation,
│       │                            # news, page, partner, service, site-config, team, testimonial
│       ├── utils/                   # date, metadata, slug
│       ├── locale.ts                # getLocalizedField, getLocaleFromCookie, setLocaleCookie
│       ├── utils.ts                 # cn()
│       └── youtube.ts
└── public/                          # Static assets, images, favicons
```

## Routing

### Public routes

| Path | Page |
|------|------|
| `/` | Home |
| `/about` | Company page |
| `/services` | Services index |
| `/services/[slug]` | Service detail (dynamic from Firestore) |
| `/challenges/[slug]` | Industry / regulatory challenge detail |
| `/news` | News + events index |
| `/news/[slug]` | News item detail |
| `/knowledge-hub` | Hub index |
| `/knowledge-hub/articles` | Articles list |
| `/knowledge-hub/case-studies` | Case studies list |
| `/knowledge-hub/videos` | Videos list |
| `/knowledge-hub/faq` | FAQ page |
| `/knowledge-hub/white-papers` | Downloadable PDFs |
| `/knowledge-hub/[slug]` | Generic article detail |
| `/partners` | Partners list |
| `/partners/become-partner` | Partner onboarding page |
| `/locations` | Locations / offices |
| `/contact` | Contact form |
| `/cookies-policy`, `/privacy-policy`, `/legal-notice` | Legal pages |

### Admin routes

| Path | Page |
|------|------|
| `/admin/login` | Email/password sign-in |
| `/admin` | Dashboard (Firestore counts + quick actions) |
| `/admin/pages` | Edit home and legal pages (content + SEO) |
| `/admin/pages/[pageSlug]` | Edit a single page by slug |
| `/admin/services` | List services |
| `/admin/services/[slug]` | Edit a single service |
| `/admin/news` | News / events CRUD |
| `/admin/articles` | Knowledge-hub articles CRUD |
| `/admin/white-papers` | Upload + manage PDF white papers |
| `/admin/partners` | Partners CRUD |
| `/admin/team` | Team members CRUD |
| `/admin/challenges` | Challenges CRUD |
| `/admin/faq` | FAQ items CRUD |
| `/admin/settings` | Global `site_config/global` document |

### API routes

| Path | Method | Auth |
|------|--------|------|
| `/api/contact` | POST | Public; IP-based rate limit (5/hour per lambda) |
| `/api/revalidate` | POST | `Bearer <firebase-id-token>` with `admin === true` custom claim |

## Prerequisites

- Node.js 20 LTS (Next 16 requires a modern Node; Netlify's default works).
- npm 10+ (repo uses `package-lock.json`).
- A Firebase project with Firestore, Authentication, and Storage enabled.
- A Firebase service account key if you want `/api/contact` to persist submissions, `/api/revalidate` to verify tokens, or the `seed-faq` script to run.

## Getting started

```bash
git clone <repo> coinwebsite-next
cd coinwebsite-next
npm install
cp .env.local.example .env.local   # or create it manually from the table below
npm run dev
```

The dev server runs on `http://localhost:3000`. The admin UI is at `http://localhost:3000/admin`. You must create at least one Firebase Auth user and grant it the `admin: true` custom claim before you can use the admin panel's revalidate calls.

## Environment variables

There is no committed `.env.local.example`. Create `.env.local` with the keys below. Public (`NEXT_PUBLIC_*`) values come from your Firebase web-app config; server-only values come from a Firebase service account JSON.

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | client | Firebase web app API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | client | `*.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | client + server | Project ID (also used by `firebase-admin`) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | client | `*.appspot.com` or `*.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | client | Cloud Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | client | Firebase web app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | client | Google Analytics measurement ID (optional) |
| `FIREBASE_CLIENT_EMAIL` | server | Service-account email, used by `firebase-admin` (contact + revalidate + seed-faq) |
| `FIREBASE_PRIVATE_KEY` | server | Service-account private key. Store with literal `\n` escapes; the admin bootstrap replaces `\\n` with real newlines |
| `NEXT_PUBLIC_GTM_ID` | client | Google Tag Manager container, loaded only after cookie consent (optional) |
| `NEXT_PUBLIC_CLARITY_ID` | client | Microsoft Clarity project ID, consent-gated (optional) |

Notes:
- There is no `REVALIDATION_SECRET` any more — `/api/revalidate` authenticates with a Firebase ID token and enforces the `admin` custom claim instead.
- `/api/contact` and `/api/revalidate` both rely on `firebase-admin`. Without a valid service account the contact route logs and returns success without persisting; revalidation always fails with `401`.

## Firebase setup

1. Create a new Firebase project (or use an existing one) in the Firebase console.
2. Enable Firestore in Native mode.
3. Enable Authentication and the Email/Password sign-in method.
4. Enable Storage and pick a bucket region.
5. Add a Web app to the project and copy the `firebaseConfig` values into `.env.local` as `NEXT_PUBLIC_FIREBASE_*`.
6. In Project Settings > Service accounts, generate a new private key. Copy `client_email` into `FIREBASE_CLIENT_EMAIL` and `private_key` into `FIREBASE_PRIVATE_KEY` (wrapping it in double quotes and keeping the `\n` sequences intact).
7. Create the admin user via the Firebase Auth console and grant it the custom claim:

```bash
# One-off, using the Firebase Admin SDK from any Node session or a gcloud shell:
node -e "
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });
admin.auth().getUserByEmail('you@example.com')
  .then(u => admin.auth().setCustomUserClaims(u.uid, { admin: true }))
  .then(() => console.log('done'));
"
```

The user must sign out and sign back in for the claim to appear in a fresh ID token.

8. Seed the database (see [Available scripts](#available-scripts)):

```bash
npm run seed              # site_config, navigation, services, team, partners, pages
npm run seed-faq          # faq_items (requires FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)
npm run seed-challenges   # challenges
npm run migrate-news      # idempotent: normalizes existing news docs to the current schema
```

9. Apply a starter Firestore ruleset. The following is a minimum safe baseline — **adapt to your needs**; it is a starter, not a production policy:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public can read only published documents on these collections.
    match /news/{doc}          { allow read: if resource.data.published == true; }
    match /articles/{doc}      { allow read: if resource.data.published == true; }
    match /services/{doc}      { allow read: if resource.data.published == true; }
    match /white_papers/{doc}  { allow read: if resource.data.published == true; }
    match /team_members/{doc}  { allow read: if resource.data.published == true; }
    match /partners/{doc}      { allow read: if resource.data.published == true; }
    match /challenges/{doc}    { allow read: if resource.data.published == true; }
    match /faq_items/{doc}     { allow read: if resource.data.published == true; }
    match /pages/{doc}         { allow read: if true; }
    match /site_config/{doc}   { allow read: if true; }
    match /navigation/{doc}    { allow read: if true; }

    // Writes are restricted to users holding the admin custom claim.
    match /{collection}/{doc} {
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Contact submissions are write-only for the server (admin SDK bypasses rules anyway).
    match /contact_submissions/{doc} {
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow write: if false;
    }
  }
}
```

Storage rules should mirror the same idea — allow public read on published artefacts, restrict writes to the `admin` claim.

## Data model

All editable text is stored as `LocaleString = { en: string; fr: string; nl: string }` (see `src/lib/types/locale.ts`).

| Collection | Purpose | Admin section | Marketing consumer | Type file |
|------------|---------|---------------|--------------------|-----------|
| `news` | News articles and events; has `type: 'news' \| 'event'` | `/admin/news` | `/news`, `/news/[slug]` | `src/lib/types/news.ts` |
| `articles` | Knowledge-hub long-form content | `/admin/articles` | `/knowledge-hub/articles`, `/knowledge-hub/[slug]` | `src/lib/types/article.ts` |
| `white_papers` | Downloadable PDFs stored in Firebase Storage | `/admin/white-papers` | `/knowledge-hub/white-papers` | `src/lib/types/article.ts` |
| `services` | Service pages with sections and SEO metadata | `/admin/services`, `/admin/services/[slug]` | `/services`, `/services/[slug]` | `src/lib/types/service.ts` |
| `challenges` | Sector / regulatory challenge landing pages | `/admin/challenges` | `/challenges/[slug]` | `src/lib/types/challenge.ts` |
| `partners` | Technology and business partners | `/admin/partners` | `/partners` | `src/lib/types/partner.ts` |
| `team_members` | Team roster (`TEAM_COLLECTION` constant) | `/admin/team` | About page team section | `src/lib/types/team.ts` |
| `testimonials` | Customer quotes | (no dedicated admin UI) | Home / marketing blocks | `src/lib/types/testimonial.ts` |
| `faq_items` | FAQ entries grouped by category | `/admin/faq` | `/knowledge-hub/faq` | `src/lib/types/faq.ts` |
| `pages` | Editable landing and legal page sections | `/admin/pages`, `/admin/pages/[pageSlug]` | Home + legal pages | `src/lib/types/page.ts` |
| `site_config` | Single doc `global`: site name, contacts, legal, footer | `/admin/settings` | Header + Footer | `src/lib/types/site-config.ts` |
| `navigation` | Two docs: `main` and `footer` | (edited via settings / seeder) | Header + Footer | `src/lib/types/navigation.ts` |
| `contact_submissions` | Inbound contact-form messages | (read via Firebase console / admin tooling) | Written by `/api/contact` | inlined in route |

Marketing reads go through `firebase/firestore/lite` for a smaller bundle; admin writes use the full Web SDK because they need real-time listeners, `getCountFromServer`, and resumable uploads.

## Internationalization

- Three locales: `en` (default), `fr`, `nl` (see `Locale` in `src/lib/types/locale.ts`).
- A user's preferred locale lives in a `locale` cookie. The middleware at `src/proxy.ts` sets `locale=en` with a one-year max-age if it is missing — this keeps SSR and hydration in sync.
- On the client, `useLocale` reads and writes the cookie; `getLocaleFromCookie()` / `setLocaleCookie()` in `src/lib/locale.ts` are the lower-level helpers.
- `getLocalizedField(field, locale)` picks the right variant and falls back to English if the requested locale is empty.
- To add a new locale:
  1. Extend the `Locale` union and the `LocaleString` shape in `src/lib/types/locale.ts`.
  2. Update `createEmptyLocaleString`, `ls`, and `lsAll` helpers.
  3. Update `getLocaleFromCookie` / `setLocaleCookie` to accept the new code.
  4. Add a UI switcher entry and backfill every Firestore document (or accept that empty values will fall back to English until editors fill them in).

## Admin panel

- Auth lives entirely on the Firebase side. `/admin/login` calls `signInWithEmailAndPassword`; every other admin page is gated by `useFirebaseAuth`, which subscribes to `onAuthStateChanged` and redirects unauthenticated users to the login screen.
- The `admin` custom claim is **required** for revalidation. It is not enforced on the client (the UI works without it), but every attempt to persist changes beyond Firestore will fail if the claim is missing — `/api/revalidate` returns `403`.
- Sections edit:
  - **Pages** — homepage plus the three legal pages; drag-and-drop section editor via `SectionsEditor`.
  - **Services** — per-service `sections`, `heroSubtitle`, hero image, SEO metadata, category (`consulting | centers | cyber`), publication flag and ordering.
  - **News** — title, excerpt, content (Markdown), hero image, tags, `type` (news/event) with optional `eventDate` and `eventLocation`.
  - **Articles** — knowledge-hub articles.
  - **White papers** — uploads the PDF and thumbnail to Firebase Storage with progress reporting, stores metadata (category, tags, pages, published flag) in `white_papers`.
  - **Partners** — logo, description, category.
  - **Team** — team members (`team_members`), with published flag and order.
  - **Challenges** — sector / regulatory landing pages.
  - **FAQ** — per-category Q/A items with ordering.
  - **Settings** — the single `site_config/global` document: brand, contact data, legal, footer copy.
- Revalidation: after a successful save the admin UI calls `triggerRevalidate(path)` which reads the current Firebase user, fetches a fresh ID token, and POSTs to `/api/revalidate`. The route verifies the token with `firebase-admin`, checks `decoded.admin === true`, then calls `revalidatePath` to invalidate the corresponding marketing route.

## Deployment (Netlify)

- Build command: `npm run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs` (pulled in automatically from `netlify.toml`)
- Node version: set `NODE_VERSION=20` (or newer) in the Netlify UI.
- Required environment variables in Netlify: every key in [Environment variables](#environment-variables). Do not commit secrets to the repo.
- Because `firebase-admin` is only initialized at runtime, you can deploy without `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` for a preview, but `/api/contact` will silently skip persistence and `/api/revalidate` will always 401.
- On-demand revalidation in production works via the same route; make sure your custom domain is listed as an authorised request origin in Firebase Auth if you use it for admin sign-in.

## Available scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the Next.js dev server on `localhost:3000` |
| `npm run build` | Production build (`.next/`) |
| `npm run start` | Serve a pre-built app |
| `npm run lint` | Run ESLint over `src/` |
| `npm run seed` | Seed `site_config`, `navigation`, `services`, `team_members`, `partners`, `pages` (`scripts/seed-firestore.ts`) |
| `npm run seed-faq` | Seed `faq_items` using `firebase-admin` (`scripts/seed-faq.ts`) |
| `npm run seed-challenges` | Seed `challenges` (`scripts/seed-challenges.ts`) |
| `npm run migrate-news` | Idempotent migration: adds missing `type`, normalizes null fields on legacy news docs (`scripts/migrate-news.ts`) |

`scripts/upload-customer-logos.ts` exists for batch-uploading partner logos to Firebase Storage but is not wired to a package script; run it with `npx tsx scripts/upload-customer-logos.ts` if needed.

## Security considerations

- **Firestore is fronted directly from the browser.** Admin writes use the Firebase client SDK with the signed-in user's session — there is no server-side API gateway in front of them. Your Firestore rules are therefore the only thing separating an anonymous visitor from writing to a collection. Deploy the baseline ruleset above (and tighten it) before going live.
- **Admin custom claim is mandatory for revalidation.** Without `admin: true` on the user, `/api/revalidate` returns `403` and content edits will not appear on published pages until the 300-second timed revalidation of the marketing layout fires.
- **Contact endpoint rate-limit is per-lambda and in-memory** (`RATE_LIMIT_MAX = 5`, `RATE_LIMIT_WINDOW_MS = 3600000`). On Netlify each lambda instance has its own map; aggregate throughput is higher than 5/hour. Consider fronting the route with a CDN-level rate limiter or moving the bucket into Firestore if abuse becomes a problem.
- **`REVALIDATION_SECRET` has been removed.** Earlier revisions of the codebase used a shared secret; current code authenticates with Firebase ID tokens. Do not re-introduce a shared secret — rotate it to the claim-based flow if you fork older code.
- **`firebase-admin` private key in env.** Keep `FIREBASE_PRIVATE_KEY` out of version control. On Netlify, paste the value as-is including `\n` escapes — the admin bootstrap converts them back.
- **Image remote hosts** are restricted in `next.config.ts` to `coin-as.com`, `firebasestorage.googleapis.com`, and the current Firebase bucket host. Add new hosts explicitly if you migrate storage.

## Troubleshooting

- **Admin login succeeds but "Revalidate failed: 403"** — the logged-in user does not have the `admin: true` custom claim. Set it via the snippet in [Firebase setup](#firebase-setup) and sign out/in to refresh the ID token.
- **`Revalidate failed: 401`** — `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` are missing or malformed. Verify the env vars are present and that `\n` sequences are preserved in the private key.
- **Contact form returns 429** — the in-memory bucket for the caller's IP has been exhausted (5 requests per hour). Wait for the `Retry-After` duration or test from a different network.
- **`npm run build` fails with "projectId is required"** — Firebase config env vars are missing. Verify `.env.local` (or the Netlify UI) contains all `NEXT_PUBLIC_FIREBASE_*` keys.
- **Sitemap is empty or missing entries** — dynamic routes (`/news/[slug]`, `/services/[slug]`, …) are pulled from Firestore at build time. Make sure `published: true` docs exist and that `NEXT_PUBLIC_FIREBASE_*` are set in the build environment; otherwise the Firestore reads fail silently and the generator returns an empty list.
- **Admin page "stuck" loading** — `useFirebaseAuth` never resolves if the Firebase client config is invalid. Open the browser console and check for `auth/invalid-api-key` or similar errors; the spinner will not time out on its own.
- **White-paper upload hangs at 0%** — Storage rules are blocking the write, or `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is incorrect. Check the Network tab for a `403` from `firebasestorage.googleapis.com`.

## License

Proprietary. All rights reserved by COIN International B.V. No redistribution, reuse, or derivative works without prior written permission.
