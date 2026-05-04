/**
 * Inspect or assign admin roles on a Firebase Auth user.
 *
 *   npm run set-admin -- --list                                 # show all users + their role
 *   npm run set-admin -- --check  user@example.com              # check a single user
 *   npm run set-admin -- --grant  user@example.com admin        # set role: 'admin'
 *   npm run set-admin -- --grant  user@example.com superadmin   # set role: 'superadmin'
 *   npm run set-admin -- --revoke user@example.com              # remove all admin claims
 *
 * Acts as a recovery tool when the in-app /admin/users page is unavailable
 * (e.g. you locked yourself out, or no superadmin exists yet). Day-to-day
 * role management should happen in the UI.
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
import { isAdminRole, roleFromClaims } from '../src/lib/firebase/roles'

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

function getFlagWithValue(name: string): { target: string; value: string | undefined } | null {
  const i = process.argv.indexOf(name)
  if (i === -1) return null
  return { target: process.argv[i + 1], value: process.argv[i + 2] }
}

function printUsage() {
  console.error('Usage:')
  console.error('  npm run set-admin -- --list')
  console.error('  npm run set-admin -- --check  <email>')
  console.error('  npm run set-admin -- --grant  <email> <admin|superadmin>')
  console.error('  npm run set-admin -- --revoke <email>')
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
      const role = roleFromClaims(u.customClaims)
      const tag = role === 'superadmin' ? '👑 SUPER' : role === 'admin' ? '🛡  ADMIN' : '       '
      const claims = u.customClaims ?? {}
      console.log(
        `${tag}  ${u.email ?? '(no email)'}  ${u.uid}`,
        Object.keys(claims).length ? `  claims=${JSON.stringify(claims)}` : '',
      )
    }
    return
  }

  const checkEmail = getFlag('--check')
  const grant = getFlagWithValue('--grant')
  const revokeEmail = getFlag('--revoke')
  const target = checkEmail ?? grant?.target ?? revokeEmail

  if (!target) {
    printUsage()
    process.exit(1)
  }

  if (grant) {
    if (!isAdminRole(grant.value)) {
      console.error(`Invalid role: "${grant.value ?? ''}" — must be "admin" or "superadmin".\n`)
      printUsage()
      process.exit(1)
    }
  }

  const user = await auth.getUserByEmail(target)
  console.log(`User : ${user.email}  (uid: ${user.uid})`)
  const before = user.customClaims ?? {}
  console.log(`Current claims: ${JSON.stringify(before)}`)

  if (checkEmail) return

  const next = { ...before } as Record<string, unknown>
  // Always strip the legacy `admin: true` claim so we don't carry both.
  delete next.admin

  if (grant) {
    next.role = grant.value
  } else if (revokeEmail) {
    delete next.role
  }

  await auth.setCustomUserClaims(user.uid, next)
  console.log(`\n✓ Updated claims to: ${JSON.stringify(next)}`)
  console.log('\nNote: the user must sign out and sign back in for the new claim to take effect.')
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
