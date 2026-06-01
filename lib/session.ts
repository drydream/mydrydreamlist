export const SESSION_MAX_AGE = 60 * 40 // 40-minute idle timeout

export const SESSION_COOKIE = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
  path: '/',
  maxAge: SESSION_MAX_AGE,
}
