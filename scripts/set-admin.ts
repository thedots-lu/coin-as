/**
 * Inspect or assign the `admin: true` custom claim on a Firebase Auth user.
 *
 *   npm run set-admin -- --list                       # show all users + their claims
 *   npm run set-admin -- --check user@example.com     # check a single user
 *   npm run set-admin -- --grant user@example.com     # set admin: true
 *   npm run set-admin -- --revoke user@example.com    # remove admin claim
 *
 * Uses the service account at .firebase-target-sa.json by default
 * (overridable via --sa <path> or TARGET_SERVICE_ACCOUNT env var).
 *
 * After granting/revoking, the user must sign out and sign back in for the
 * new claim to appear in their ID token.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })

import { readFileSync, existsSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function getServiceAccountPath(): string {
  const flagIndex = process.argv.indexOf('--sa')
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) return process.argv[flagIndex + 1]
  return process.env.TARGET_SERVICE_ACCOUNT ?? '.firebase-target-sa.json'
}

function init() {
  const saPath = getServiceAccountPath()
  if (!existsSync(saPath)) {
    throw new Error(`Service account file not found: ${saPath}`)
  }
  const sa = JSON.parse(readFileSync(saPath, 'utf8'))
  initializeApp({
    credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }),
    projectId: sa.project_id,
  })
  return { auth: getAuth(), projectId: sa.project_id as string }
}

function getFlag(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i !== -1 ? process.argv[i + 1] : undefined
}

async function main() {
  const { auth, projectId } = init()
  console.log(`Project: ${projectId}\n`)

  if (process.argv.includes('--list')) {
    const result = await auth.listUsers(1000)
    if (result.users.length === 0) {
      console.log('No users in this project.')
      return
    }
    for (const u of result.users) {
      const claims = u.customClaims ?? {}
      const isAdmin = claims.admin === true
      console.log(
        `${isAdmin ? '👑 ADMIN' : '       '}  ${u.email ?? '(no email)'}  ${u.uid}`,
        Object.keys(claims).length ? `  claims=${JSON.stringify(claims)}` : '',
      )
    }
    return
  }

  const checkEmail = getFlag('--check')
  const grantEmail = getFlag('--grant')
  const revokeEmail = getFlag('--revoke')
  const target = checkEmail ?? grantEmail ?? revokeEmail

  if (!target) {
    console.error('Usage:')
    console.error('  npm run set-admin -- --list')
    console.error('  npm run set-admin -- --check  <email>')
    console.error('  npm run set-admin -- --grant  <email>')
    console.error('  npm run set-admin -- --revoke <email>')
    process.exit(1)
  }

  const user = await auth.getUserByEmail(target)
  console.log(`User : ${user.email}  (uid: ${user.uid})`)
  console.log(`Current claims: ${JSON.stringify(user.customClaims ?? {})}`)

  if (checkEmail) return

  const newClaims = grantEmail ? { ...user.customClaims, admin: true } : { ...user.customClaims }
  if (revokeEmail) delete newClaims.admin

  await auth.setCustomUserClaims(user.uid, newClaims)
  console.log(`\n✓ Updated claims to: ${JSON.stringify(newClaims)}`)
  console.log('\nNote: the user must sign out and sign back in for the new claim to take effect.')
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
