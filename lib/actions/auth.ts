'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const PASSWORD = 'Iydgtvot2'

export async function verifyPassword(password: string) {
  if (password !== PASSWORD) {
    return { error: 'Wrong password' }
  }
  const cookieStore = await cookies()
  cookieStore.set('session', '1', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  redirect('/home')
}
