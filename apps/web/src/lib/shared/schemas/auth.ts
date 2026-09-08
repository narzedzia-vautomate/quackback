import { z } from 'zod'

export const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['member', 'admin']),
  /**
   * Custom-role grant carried by the invite. Only meaningful with
   * role='member' (customs ride the member legacy role); the server
   * validates existence and rejects the Owner preset.
   */
  roleId: z.string().optional(),
})

export type InviteInput = z.infer<typeof inviteSchema>

/**
 * HTTPS-only URL refinement. `z.string().url()` accepts http://, but
 * SSO discovery URLs and OAuth-related endpoints reject plaintext.
 * Used by the in-app identity-provider validators (e.g. the server fns
 * in `sso.ts`) so they reject misconfigurations at parse time instead
 * of at sign-in time.
 */
export const httpsUrl = z
  .string()
  .url()
  .refine(
    (v) => {
      try {
        return new URL(v).protocol === 'https:'
      } catch {
        return false
      }
    },
    { message: 'must be an https:// URL' }
  )

/** Loopback hosts allowed over http:// for local IdP / Quackback ↔ Ofertator SSO. */
const LOOPBACK_OIDC_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '[::1]',
  '::1',
  'host.docker.internal',
])

function isHttpsOrLoopbackHttp(v: string): boolean {
  try {
    const u = new URL(v)
    if (u.protocol === 'https:') return true
    if (u.protocol === 'http:' && LOOPBACK_OIDC_HOSTS.has(u.hostname)) return true
    return false
  } catch {
    return false
  }
}

/**
 * OIDC endpoint URL: https everywhere, plus http:// on loopback for local
 * IdP setups (e.g. Ofertator on localhost:8002). Webhooks keep `httpsUrl`.
 */
export const oidcEndpointUrl = z.string().url().refine(isHttpsOrLoopbackHttp, {
  message: 'must be an https:// URL (http:// allowed for localhost only)',
})
