/**
 * Admin roles in ascending order of privilege.
 *
 * Stored as a Firebase Auth custom claim: `{ role: 'admin' | 'superadmin' }`.
 * For backwards-compat, the legacy `{ admin: true }` claim is read as `'admin'`.
 */
export type AdminRole = 'admin' | 'superadmin'

const ROLE_ORDER: Record<AdminRole, number> = {
  admin: 1,
  superadmin: 2,
}

export const ALL_ROLES: AdminRole[] = ['admin', 'superadmin']

export function isAdminRole(value: unknown): value is AdminRole {
  return value === 'admin' || value === 'superadmin'
}

/**
 * Read the role from a custom-claims object. Returns null if no admin
 * privilege is present. Accepts both the new `role` claim and the legacy
 * `admin: true` flag (treated as `'admin'`) so unmigrated tokens keep
 * working during the transition.
 */
export function roleFromClaims(claims: unknown): AdminRole | null {
  if (!claims || typeof claims !== 'object') return null
  const c = claims as Record<string, unknown>
  if (isAdminRole(c.role)) return c.role
  if (c.admin === true) return 'admin'
  return null
}

export function hasMinRole(role: AdminRole | null, min: AdminRole): boolean {
  if (!role) return false
  return ROLE_ORDER[role] >= ROLE_ORDER[min]
}
