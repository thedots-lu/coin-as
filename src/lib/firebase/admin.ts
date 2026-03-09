import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  // Use GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT env var
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined

  return initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

const adminApp = getAdminApp()
export const adminDb = getFirestore(adminApp)
export default adminApp
