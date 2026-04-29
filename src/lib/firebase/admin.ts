import { readFileSync } from 'node:fs'
import path from 'node:path'
import { initializeApp, getApps, cert, App, ServiceAccount } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

function loadServiceAccount(): ServiceAccount {
  // Prefer the JSON file at .firebase-target-sa.json (same convention as
  // scripts/set-admin.ts and scripts/restore-firestore.ts), override with
  // TARGET_SERVICE_ACCOUNT. Fall back to inline env vars.
  const saPath = process.env.TARGET_SERVICE_ACCOUNT ?? '.firebase-target-sa.json'
  const absolutePath = path.isAbsolute(saPath)
    ? saPath
    : path.join(process.cwd(), saPath)
  try {
    const raw = readFileSync(absolutePath, 'utf-8')
    const json = JSON.parse(raw) as {
      project_id?: string
      client_email?: string
      private_key?: string
    }
    if (json.project_id && json.client_email && json.private_key) {
      return {
        projectId: json.project_id,
        clientEmail: json.client_email,
        privateKey: json.private_key,
      }
    }
  } catch {
    // fall through to env-based credentials
  }

  return {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
