'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE } from '@/lib/session'

const PASSWORD = 'Iydgtvot2'

export async function verifyPassword(password: string) {
  if (password !== PASSWORD) {
    return { error: 'Wrong password' }
  }
  const cookieStore = await cookies()
  cookieStore.set('session', '1', SESSION_COOKIE)
  redirect('/home')
}
