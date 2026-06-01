// Cookie: long-lived, written once at login
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// Idle timeout enforced client-side via localStorage (works in HA iframe)
export const IDLE_TIMEOUT_MS = 40 * 60 * 1000 // 40 minutes

export const SESSION_COOKIE = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
  path: '/',
  maxAge: SESSION_MAX_AGE,
}
