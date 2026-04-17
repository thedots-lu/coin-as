# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint over src/
npm run seed         # Seed core Firestore collections (requires service account)
```

## Architecture

**Next.js 16 App Router** site for COIN International B.V. — a BeNeLux business continuity provider. All public content is stored in Firestore and rendered server-side with ISR (300s revalidation safety-net).

### Route groups

- `src/app/(marketing)/` — Public pages with shared header/footer layout. The layout fetches `site_config` and `navigation` from Firestore, mounts analytics.
- `src/app/admin/` — Client-side auth-gated CMS using `useFirebaseAuth`. Requires a Firebase user with `admin: true` custom claim.
- `src/app/api/` — Two route handlers: `POST /api/contact` (rate-limited, writes to `contact_submissions`) and `POST /api/revalidate` (Firebase ID-token verified, calls `revalidatePath()`).

### Content / Firestore

All content is trilingual — text fields are stored as `{ en, fr, nl }` objects and resolved at render time via `getLocalizedField(field, locale)`. The locale is set by edge middleware (`src/proxy.ts`) on first visit via cookie.

Per-collection helpers live in `src/lib/firestore/` (one file per collection). The marketing pages use the Firestore Lite SDK; the admin panel uses the full Web SDK.

**Key collections:** `news`, `articles`, `white_papers`, `services`, `challenges`, `partners`, `team_members`, `faq_items`, `pages`, `site_config`, `navigation`.

### On-demand revalidation

After admin saves, call `triggerRevalidate(path)` from `src/lib/firebase/revalidate.ts`. This hits `/api/revalidate` with a Firebase ID token; the handler verifies the `admin: true` claim before calling Next.js `revalidatePath()`.

### shadcn components

The project uses shadcn/ui. The MCP server is configured in `.mcp.json` — use `mcp__shadcn__*` tools to add or inspect components.

## Environment variables

Copy `.env.local.example` to `.env.local`. Required vars:

```
NEXT_PUBLIC_FIREBASE_API_KEY / AUTH_DOMAIN / PROJECT_ID / STORAGE_BUCKET / MESSAGING_SENDER_ID / APP_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY   # preserve literal \n escapes
```

`FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are the service account credentials needed for `firebase-admin` (used by API routes and seed scripts).

## Key conventions

- `src/lib/types/` holds all domain models — check here before inventing new shapes.
- Admin pages are all client components; marketing pages are server components by default.
- Firestore security rules (not in this repo) are the auth boundary for browser SDK calls.
- In-memory rate limiting in `/api/contact` resets per lambda instance — it is not distributed.
