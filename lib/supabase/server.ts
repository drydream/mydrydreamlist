import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Next.js 15+ / 16: cookies() returns a Promise — must be awaited.
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components are read-only — ignore cookie writes here.
            // Cookies are set properly in Server Actions and Route Handlers.
          }
        },
      },
    }
  )
}

// Bypasses RLS — only for trusted server-side writes (e.g. media_cache upserts).
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
