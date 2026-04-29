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
- [Cloudflare R2 setup](#cloudflare-r2-setup)
- [Uploads and orphan cleanup](#uploads-and-orphan-cleanup)
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
| File storage | Cloudflare R2 (S3-compatible) via `/api/upload` — admin-token-authenticated. PDFs, thumbnails, partner logos, team photos, etc. |
| Server-only APIs | Next.js Route Handlers backed by `firebase-admin`: contact, revalidation, upload (POST/DELETE) |
| Markdown | `react-markdown` for rich-text article rendering |
| Lint | ESLint 9 with `eslint-config-next` |
| Hosting | Netlify via `@netlify/plugin-nextjs` |

## Features

- Marketing site covering services, challenges, partners, locations, news/events, a knowledge hub (articles, case studies, videos, FAQ, white papers), about, contact, and the legal pages (cookies / privacy / legal notice).
- Trilingual content everywhere: every editable string is stored in Firestore as a `{ en, fr, nl }` object and selected at render time via `getLocalizedField`.
- Admin CMS at `/admin` for pages, services, news, articles, white papers, partners, team, challenges, FAQ, and global site config — plus a dashboard with live Firestore counts.
- Admin uploads (logos, photos, white-paper PDFs+thumbnails, etc.) go through `POST /api/upload` to Cloudflare R2 with progress tracking. The route accepts both `path` (server picks filename) and `key` (caller picks filename) contracts. `DELETE /api/upload` removes objects on document delete or file replacement so the bucket stays clean. A weekly GitHub Actions workflow (`cleanup-orphans.yml`) reconciles R2 against Firestore as a safety net.
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
├── next.config.ts                   # Remote image patterns (R2, legacy Firebase Storage, coin-as.com)
├── tsconfig.json                    # "@/*" maps to src/*
├── .firebase-target-sa.json         # Service account JSON, gitignored — read by admin SDK + scripts
├── .github/workflows/
│   └── cleanup-orphans.yml          # Weekly cron: deletes R2 objects no longer referenced in Firestore
├── scripts/
│   ├── seed-firestore.ts            # Seeds site_config, navigation, services, team, partners, pages
│   ├── seed-faq.ts                  # Seeds faq_items (uses firebase-admin)
│   ├── seed-challenges.ts           # Seeds challenges collection
│   ├── migrate-news.ts              # One-shot migration: adds `type`, normalizes nulls on news docs
│   ├── dump-firestore.ts            # Snapshot every collection to dumps/<timestamp>/
│   ├── dump-storage.ts              # Snapshot Storage objects (legacy)
│   ├── restore-firestore.ts         # Restore a dump into a target project (uses .firebase-target-sa.json)
│   ├── set-admin.ts                 # Grant/revoke the admin custom claim on a Firebase Auth user
│   ├── cleanup-orphans.ts           # List + delete R2 objects not referenced by any Firestore doc
│   └── upload-customer-logos.ts     # (legacy) batch-upload partner logos
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
│   │       ├── revalidate/route.ts  # POST, Firebase ID-token + admin claim required
│   │       └── upload/route.ts      # POST (multipart) + DELETE (json), R2 backend, admin-claim-gated
│   ├── components/
│   │   ├── admin/                   # AdminSidebar, AdminHeader, LocaleEditor, SectionsEditor, NewsForm
│   │   ├── layout/                  # Header, Footer, CookieBanner, ConsentScripts, EventBanner, ScrollToTop
│   │   ├── sections/, knowledge-hub/, reactbits/, ui/
│   ├── hooks/                       # useFirebaseAuth, useLocale, useScrollPosition
│   └── lib/
│       ├── firebase/
│       │   ├── config.ts            # Client SDK (Lite + Full), Auth, Analytics loader
│       │   ├── admin.ts             # firebase-admin singleton — reads .firebase-target-sa.json by default,
│       │   │                        # falls back to FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY env vars
│       │   ├── revalidate.ts        # triggerRevalidate(path) helper
│       │   └── upload.ts            # uploadFile / deleteFile clients hitting /api/upload (R2)
│       ├── firestore/               # Per-collection read/write helpers (see Data model)
│       ├── types/                   # Domain types: article, challenge, faq, locale, navigation,
│       │                            # news, page, partner, service, site-config, team, testimonial
│       ├── utils/                   # date, metadata, slug, extract-urls (used for orphan diffing)
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
| `/api/upload` | POST (multipart), DELETE (json) | `Bearer <firebase-id-token>` with `admin === true` custom claim. POST writes to R2 and returns the public URL; DELETE removes by `url` or `key` (URLs outside the bucket are silently ignored) |

## Prerequisites

- Node.js 20 LTS (Next 16 requires a modern Node; Netlify's default works).
- npm 10+ (repo uses `package-lock.json`).
- A Firebase project with Firestore and Authentication enabled. (Firebase Storage is no longer required — uploads go to Cloudflare R2.)
- A Firebase service account JSON. The codebase reads it from `.firebase-target-sa.json` at the project root (gitignored, see [Firebase setup](#firebase-setup)). On hosted environments where filesystem secrets aren't practical (Netlify, GitHub Actions) it falls back to `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` env vars.
- A Cloudflare R2 bucket with **Public Access** enabled — see [Cloudflare R2 setup](#cloudflare-r2-setup).

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
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | client | Cloud Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | client | Firebase web app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | client | Google Analytics measurement ID (optional) |
| `FIREBASE_CLIENT_EMAIL` | server (hosted only) | Service-account email. Read from `.firebase-target-sa.json` in dev; needed in env on Netlify/CI |
| `FIREBASE_PRIVATE_KEY` | server (hosted only) | Service-account private key. Store with literal `\n` escapes; the admin bootstrap replaces `\\n` with real newlines |
| `TARGET_SERVICE_ACCOUNT` | server (optional) | Override the path to the SA JSON (default `.firebase-target-sa.json`) |
| `R2_ACCOUNT_ID` | server | Cloudflare account ID (32-char hex, used to build the S3 endpoint) |
| `R2_ACCESS_KEY_ID` | server | R2 API token — Object Read & Write permission on the bucket |
| `R2_SECRET_ACCESS_KEY` | server | Secret pair for the API token |
| `R2_BUCKET` | server | Bucket name |
| `R2_PUBLIC_URL` | server | Public base URL for stored objects (`https://pub-<hash>.r2.dev` or your custom domain), no trailing slash |
| `NEXT_PUBLIC_GTM_ID` | client | Google Tag Manager container, loaded only after cookie consent (optional) |
| `NEXT_PUBLIC_CLARITY_ID` | client | Microsoft Clarity project ID, consent-gated (optional) |

Notes:
- There is no `REVALIDATION_SECRET` any more — `/api/revalidate` authenticates with a Firebase ID token and enforces the `admin` custom claim instead.
- `/api/contact`, `/api/revalidate` and `/api/upload` all rely on `firebase-admin`. Without a service account (env vars or `.firebase-target-sa.json`) the contact route logs and returns success without persisting; revalidation and upload always fail with `401`.
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is no longer used — file storage moved to Cloudflare R2.

## Firebase setup

1. Create a new Firebase project (or use an existing one) in the Firebase console.
2. Enable Firestore in Native mode.
3. Enable Authentication and the Email/Password sign-in method.
4. Add a Web app to the project and copy the `firebaseConfig` values into `.env.local` as `NEXT_PUBLIC_FIREBASE_*`.
5. In Project Settings > Service accounts, generate a new private key. **Save the downloaded JSON as `.firebase-target-sa.json` at the project root** (gitignored by `.firebase-*-sa.json` rule). The admin SDK reads it automatically; the same file is used by `set-admin.ts`, `restore-firestore.ts`, and `cleanup-orphans.ts`. On hosted environments (Netlify, GitHub Actions) the SDK falls back to `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` env vars instead.
6. Create the admin user via the Firebase Auth console and grant the `admin: true` custom claim:

```bash
npm run set-admin -- --email you@example.com
```

(uses `.firebase-target-sa.json`). The user must sign out and sign back in for the claim to appear in a fresh ID token.

7. Seed the database (see [Available scripts](#available-scripts)):

```bash
npm run seed              # site_config, navigation, services, team, partners, pages
npm run seed-faq          # faq_items (requires FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)
npm run seed-challenges   # challenges
npm run migrate-news      # idempotent: normalizes existing news docs to the current schema
```

8. Apply a starter Firestore ruleset. The following is a minimum safe baseline — **adapt to your needs**; it is a starter, not a production policy:

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

Firebase Storage is **not** used by this project — uploads go to Cloudflare R2 instead. The storage rules console can be left at default-deny.

## Cloudflare R2 setup

The site stores binary assets (logos, photos, white-paper PDFs and thumbnails, inline-CMS images) in a Cloudflare R2 bucket, accessed through the S3-compatible API.

1. **Create the bucket.** Cloudflare dashboard → R2 → Create bucket. Pick a name (e.g. `coin-as-uploads`) and a location hint near your audience.
2. **Enable Public access.** In the bucket's **Settings** → **Public access** → R2.dev subdomain → "Allow Access". Cloudflare gives you a `https://pub-<hash>.r2.dev` URL — copy it into `R2_PUBLIC_URL` (no trailing slash).
3. **Create an API token.** R2 → Manage R2 API Tokens → Create API token with **Object Read & Write** permission scoped to this bucket. Save the Access Key ID and Secret Access Key into `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`.
4. **Account ID.** Visible in the right column of any R2 page; copy into `R2_ACCOUNT_ID` (32-char hex).
5. **CORS.** R2 buckets ship with no CORS config and reject preflights from non-Cloudflare origins. Apply a CORS policy that lists every origin used to reach the admin (production + dev). Example file at `storage.cors.json`:

```bash
gcloud storage buckets update gs://<bucket> --cors-file=storage.cors.json
# or:
gsutil cors set storage.cors.json gs://<bucket>
```

The repo includes a starter `storage.cors.json` covering `https://coin-bc.com`, `localhost:3000/3100`, and the Tailscale dev origin — adapt it.

6. **Whitelist the domain in `next.config.ts`.** The default allow-list includes `*.r2.dev`. If you swap to a custom R2 domain (`assets.coin-bc.com`), add an entry there.

### Migrating to a custom R2 domain

R2 custom domains require the domain's DNS to be hosted at Cloudflare. Once that's done, in the bucket Settings → Custom Domains → Connect Domain. Cloudflare provisions the cert and sets up the routing. Switch by updating `R2_PUBLIC_URL` and adding the new host to `next.config.ts`. Existing image URLs already in Firestore continue to point at the old `pub-*.r2.dev` host until they are re-uploaded — write a migration script if you want them all on the new host.

## Uploads and orphan cleanup

Every uploaded asset (admin form-based pages, visual CMS, white-papers) goes through `POST /api/upload`:

1. The route verifies the caller's Firebase ID token and checks `decoded.admin === true`.
2. The file is validated (`image/*` or `application/pdf`, ≤ 25 MB), the path is sanitised, and the object is written to R2 with a one-year `Cache-Control` header.
3. The route returns `{ url: "<R2_PUBLIC_URL>/<key>" }`. The full URL is stored as-is in Firestore.

Two contracts:
- `path` (form field) — directory only; the server picks `${path}/${timestamp}-${name}${ext}`.
- `key` — full object key supplied by the caller (used by the inline-CMS so it can name files after the JSON path being edited).

`DELETE /api/upload` removes a single object. It accepts either `{ key }` or `{ url }`; URLs that don't start with `R2_PUBLIC_URL` are silently ignored (no-op for external/legacy hosts), so it's safe to call on any URL stored in Firestore.

### Where deletes happen

| Location | Trigger |
|----------|---------|
| `src/app/admin/{partners,articles,team,white-papers,customer-logos}/page.tsx` | Form save (replaced files) and document delete |
| `src/app/admin/pages/home/visual/page.tsx` | Visual CMS save (URLs that disappeared from `original` → `draft`) and Back-with-discard (URLs uploaded but not committed) |

Tab-close without clicking Back leaves orphans behind — browsers don't allow async work on `beforeunload`. The weekly cron handles those.

### Weekly orphan cleanup (GitHub Actions)

`.github/workflows/cleanup-orphans.yml` runs `scripts/cleanup-orphans.ts` every Sunday at 03:00 UTC. The script:

1. Walks every Firestore collection (the constants in the script match `dump-firestore.ts`).
2. Extracts every `http(s)` URL from those documents and keeps the ones starting with `R2_PUBLIC_URL`.
3. Lists every key in the R2 bucket via `ListObjectsV2`.
4. Deletes the keys that no document references (R2 `DeleteObjects` in batches of 1000).

Run it locally in dry-run mode any time:

```bash
npm run cleanup-orphans              # prints the diff, no writes
npm run cleanup-orphans -- --apply   # actually deletes
```

The local invocation reads `.firebase-target-sa.json` for Firebase auth and the `R2_*` vars from `.env.local`. The CI run reads `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` / `R2_*` from GitHub Secrets — set them in `Settings → Secrets and variables → Actions` on the repo. The workflow can also be triggered manually from the Actions tab (with a checkbox to switch between dry-run and apply).

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
  - **White papers** — uploads the PDF and thumbnail through `/api/upload` (R2) with progress reporting, stores metadata (category, tags, pages, published flag) in `white_papers`. Replacing a file or deleting a doc also removes the old object from R2.
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
- Required environment variables in Netlify: every key in [Environment variables](#environment-variables). The service account file `.firebase-target-sa.json` is **not deployed** — Netlify reads `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` env vars instead. Do not commit secrets to the repo.
- All `R2_*` env vars are required for `/api/upload` to function in production.
- Because `firebase-admin` is only initialized at runtime, you can deploy without the service-account env vars for a preview, but `/api/contact` will silently skip persistence and `/api/revalidate` + `/api/upload` will always return `401`.
- On-demand revalidation in production works via the same route; make sure your custom domain is listed as an authorised request origin in Firebase Auth if you use it for admin sign-in.

### GitHub repository secrets

The cleanup-orphans workflow needs the following secrets configured in the repo settings (Settings → Secrets and variables → Actions):

- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (paste with literal `\n` escapes)
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_URL`

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
| `npm run dump-firestore` | Snapshot every collection to `dumps/<timestamp>/` (uses Firebase web config — public read only) |
| `npm run dump-storage` | Snapshot Firebase Storage objects (legacy data) |
| `npm run dump-all` | Run both dumps in sequence |
| `npm run restore-firestore` | Restore a dump folder into the target project. Reads `.firebase-target-sa.json`; supports `--wipe`, `--dry-run`, `--yes`, `--dump <folder>`, `--sa <path>` |
| `npm run set-admin` | Grant or revoke the `admin: true` custom claim on a Firebase Auth user. Use `--email <addr>` and optionally `--revoke` |
| `npm run cleanup-orphans` | List R2 objects not referenced in Firestore (dry-run by default; pass `-- --apply` to delete) |

`scripts/upload-customer-logos.ts` is a one-off batch tool kept for reference; not wired to a package script.

## Security considerations

- **Firestore is fronted directly from the browser.** Admin writes use the Firebase client SDK with the signed-in user's session — there is no server-side API gateway in front of them. Your Firestore rules are therefore the only thing separating an anonymous visitor from writing to a collection. Deploy the baseline ruleset above (and tighten it) before going live.
- **Admin custom claim is mandatory for revalidation.** Without `admin: true` on the user, `/api/revalidate` returns `403` and content edits will not appear on published pages until the 300-second timed revalidation of the marketing layout fires.
- **Contact endpoint rate-limit is per-lambda and in-memory** (`RATE_LIMIT_MAX = 5`, `RATE_LIMIT_WINDOW_MS = 3600000`). On Netlify each lambda instance has its own map; aggregate throughput is higher than 5/hour. Consider fronting the route with a CDN-level rate limiter or moving the bucket into Firestore if abuse becomes a problem.
- **`REVALIDATION_SECRET` has been removed.** Earlier revisions of the codebase used a shared secret; current code authenticates with Firebase ID tokens. Do not re-introduce a shared secret — rotate it to the claim-based flow if you fork older code.
- **`firebase-admin` private key.** Keep `.firebase-target-sa.json` (and `FIREBASE_PRIVATE_KEY`) out of version control. The repo's `.gitignore` blocks `.firebase-*-sa.json` already. On Netlify/CI, paste the private key as-is including `\n` escapes — the admin bootstrap converts them back.
- **R2 API token scope.** The token configured in `R2_ACCESS_KEY_ID` should have **only the necessary bucket** in scope, not account-wide. Read & Write is enough; the cleanup-orphans cron also needs Object Delete (granted by the same R&W permission).
- **R2 public bucket.** With public access enabled, every key is publicly readable by anyone who knows the URL. The keys include a timestamp prefix and the original filename, which makes guessing unlikely but not impossible. If you store anything sensitive (drafts, internal docs), keep them out of R2 or use a private bucket with signed URLs instead.
- **Image remote hosts** are restricted in `next.config.ts` to `coin-as.com`, `*.r2.dev`, and the legacy Firebase Storage hosts. Add new hosts explicitly if you migrate to a custom R2 domain.

## Troubleshooting

- **Admin login succeeds but "Revalidate failed: 403"** — the logged-in user does not have the `admin: true` custom claim. Set it via `npm run set-admin -- --email …` and sign out/in to refresh the ID token.
- **`Revalidate failed: 401`** or **`Upload failed: Invalid token`** — the server has no valid service account. Check `.firebase-target-sa.json` exists locally, or that `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` are set on Netlify with `\n` sequences intact.
- **Upload returns CORS error or `404` from R2** — the bucket has no CORS policy or doesn't exist. Apply `storage.cors.json` (see [Cloudflare R2 setup](#cloudflare-r2-setup)) and verify `R2_BUCKET` matches an existing bucket with `gcloud storage buckets list`.
- **Upload returns `502 — Could not upload to storage`** — the `[api/upload] R2 putObject failed` log on the server has the exact AWS SDK error code. Common causes: wrong `R2_ACCOUNT_ID` (network error), wrong access keys (`InvalidAccessKeyId`), or token without Object Write permission (`403`).
- **Upload returns `502 — InvalidArgument: SignatureMismatch / x-amz-sdk-checksum-algorithm`** — newer AWS SDK versions (3.730+) send checksum headers R2 doesn't understand. The route disables them (`requestChecksumCalculation: 'WHEN_REQUIRED'`); confirm you didn't override the S3 client config.
- **Image returns `403` from `pub-*.r2.dev`** — the bucket's R2.dev subdomain isn't toggled to "Allowed". Enable it in Cloudflare → R2 → bucket → Settings → Public access.
- **Image renders blank with "Image hostname is not configured"** — add the host to `next.config.ts` `images.remotePatterns`.
- **Contact form returns 429** — the in-memory bucket for the caller's IP has been exhausted (5 requests per hour). Wait for the `Retry-After` duration or test from a different network.
- **`npm run build` fails with "projectId is required"** — Firebase config env vars are missing. Verify `.env.local` (or the Netlify UI) contains all `NEXT_PUBLIC_FIREBASE_*` keys.
- **Sitemap is empty or missing entries** — dynamic routes (`/news/[slug]`, `/services/[slug]`, …) are pulled from Firestore at build time. Make sure `published: true` docs exist and that `NEXT_PUBLIC_FIREBASE_*` are set in the build environment; otherwise the Firestore reads fail silently and the generator returns an empty list.
- **Articles or news detail page returns 404 even though the slug is correct** — Firestore security rules block queries that don't filter by `published`. The codebase fixes this by adding `where('published', '==', true)` to slug lookups; if you're hitting this on a new collection, mirror that pattern.
- **Admin page "stuck" loading** — `useFirebaseAuth` never resolves if the Firebase client config is invalid. Open the browser console and check for `auth/invalid-api-key` or similar errors; the spinner will not time out on its own.
- **`cleanup-orphans` deletes more than expected** — re-run with `npm run cleanup-orphans` (no `--apply`) and inspect the list. The script considers any URL not present in any Firestore doc to be an orphan, so files referenced from Firestore docs you forgot to seed (e.g. only on a feature branch) will be flagged. If the missing reference is in a collection not listed in `COLLECTIONS`, add it to the script.

## License

Proprietary. All rights reserved by COIN International B.V. No redistribution, reuse, or derivative works without prior written permission.
