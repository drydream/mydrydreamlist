'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/db'

export type Category = {
  id:          string
  kind:        'type' | 'status'
  value:       string
  label:       string
  color:       string
  sort_order:  number
  type_filter: string[]  // types this status applies to (strict; required non-empty for kind='status')
  created_at:  string
}

type CategoryRow = Omit<Category, 'type_filter'> & { type_filter: string }

export async function getCategories(): Promise<{ categories: Category[]; migrationNeeded: boolean }> {
  const rows = getDb()
    .prepare('SELECT * FROM categories ORDER BY kind, sort_order, created_at')
    .all() as unknown as CategoryRow[]
  const categories = rows.map(row => ({ ...row, type_filter: JSON.parse(row.type_filter) as string[] }))
  return { categories, migrationNeeded: false }
}

export async function addCategory(data: {
  kind:        'type' | 'status'
  value:       string
  label:       string
  color:       string
  sort_order:  number
  type_filter: string[]
}) {
  getDb()
    .prepare(
      'INSERT INTO categories (id, kind, value, label, color, sort_order, type_filter, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(
      crypto.randomUUID(),
      data.kind,
      data.value,
      data.label,
      data.color,
      data.sort_order,
      JSON.stringify(data.type_filter),
      new Date().toISOString()
    )
  revalidatePath('/home')
  revalidatePath('/admin')
}

export async function updateCategory(id: string, data: {
  label?:       string
  color?:       string
  sort_order?:  number
  type_filter?: string[]
}) {
  const entries = Object.entries({
    ...data,
    type_filter: data.type_filter !== undefined ? JSON.stringify(data.type_filter) : undefined,
  }).filter(([, v]) => v !== undefined)
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ')
  const values = entries.map(([, v]) => v) as (string | number)[]

  getDb()
    .prepare(`UPDATE categories SET ${setClause} WHERE id = ?`)
    .run(...values, id)
  revalidatePath('/home')
  revalidatePath('/admin')
}

export async function deleteCategory(id: string) {
  getDb().prepare('DELETE FROM categories WHERE id = ?').run(id)
  revalidatePath('/home')
  revalidatePath('/admin')
}
