import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert, App, ServiceAccount } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

function loadServiceAccount(): ServiceAccount {
  // Prefer inline env vars (Netlify, Vercel, …). On any deploy the env
  // vars are set, so the file-based fallback below is unreachable in
  // production — but Turbopack's NFT still sees the readFileSync, hence
  // the turbopackIgnore comment, otherwise it pulls the whole repo into
  // the serverless function bundle.
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }

  // Local dev fallback: read .firebase-target-sa.json from the project
  // root (same convention as scripts/).
  const saPath = process.env.TARGET_SERVICE_ACCOUNT ?? '.firebase-target-sa.json'
  const absolutePath = path.isAbsolute(saPath) ? saPath : path.join(process.cwd(), saPath)
  const raw = readFileSync(/* turbopackIgnore: true */ absolutePath, 'utf-8')
  const json = JSON.parse(raw) as {
    project_id?: string
    client_email?: string
    private_key?: string
  }
  if (!json.project_id || !json.client_email || !json.private_key) {
    throw new Error(
      `Service account file ${absolutePath} is missing project_id / client_email / private_key`,
    )
  }
  return {
    projectId: json.project_id,
    clientEmail: json.client_email,
    privateKey: json.private_key,
  }
}

function getAdminApp(): App {
  if (getApps().length === 0) {
    return initializeApp({ credential: cert(loadServiceAccount()) })
  }
  return getApps()[0]
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp())
}
