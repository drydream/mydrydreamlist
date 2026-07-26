'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/db'

export type ItemType   = string
export type ItemStatus = string

export async function addItem(data: {
  title: string
  image_url?: string
  url?: string
  type: ItemType
  status: ItemStatus
  total?: number
}) {
  getDb()
    .prepare(
      'INSERT INTO items (id, title, image_url, url, type, status, total, progress, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)'
    )
    .run(
      crypto.randomUUID(),
      data.title,
      data.image_url || null,
      data.url || null,
      data.type,
      data.status,
      data.total ?? null,
      new Date().toISOString()
    )
  revalidatePath('/home')
}

export async function updateItem(id: string, data: {
  title?:     string
  image_url?: string | null
  url?:       string | null
  type?:      ItemType
  status?:    ItemStatus
  total?:     number | null
  progress?:  number
}) {
  const entries = Object.entries({ ...data, updated_at: new Date().toISOString() })
    .filter(([, v]) => v !== undefined)
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ')
  const values = entries.map(([, v]) => v)

  getDb()
    .prepare(`UPDATE items SET ${setClause} WHERE id = ?`)
    .run(...values, id)
  revalidatePath('/home')
}

export async function updateProgress(id: string, progress: number) {
  getDb()
    .prepare('UPDATE items SET progress = ?, updated_at = ? WHERE id = ?')
    .run(progress, new Date().toISOString(), id)
  // No revalidatePath: rapid +/- taps would otherwise trigger a burst of RSC
  // refetches whose out-of-order responses can snap the optimistic counter
  // backward mid-tap. The 30s poll in realtime-dashboard.tsx covers cross-device sync.
}

export async function deleteItem(id: string) {
  getDb().prepare('DELETE FROM items WHERE id = ?').run(id)
  revalidatePath('/home')
}
