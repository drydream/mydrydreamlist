'use server'

const PASSWORD = 'Iydgtvot2'

export async function verifyPassword(password: string) {
  if (password !== PASSWORD) {
    return { error: 'Wrong password' }
  }
  return { success: true }
}
