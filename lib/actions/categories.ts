'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

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

// Returned when the categories table doesn't exist yet (migration not run)
const ALL_TYPES = ['anime', 'manga', 'movie', 'other']
const DEFAULTS: Category[] = [
  { id: '', kind: 'type',   value: 'anime',         label: 'Anime',     color: 'violet',  sort_order: 0, type_filter: [], created_at: '' },
  { id: '', kind: 'type',   value: 'manga',         label: 'Manga',     color: 'emerald', sort_order: 1, type_filter: [], created_at: '' },
  { id: '', kind: 'type',   value: 'movie',         label: 'Movie',     color: 'blue',    sort_order: 2, type_filter: [], created_at: '' },
  { id: '', kind: 'type',   value: 'other',         label: 'Other',     color: 'zinc',    sort_order: 3, type_filter: [], created_at: '' },
  { id: '', kind: 'status', value: 'watching',      label: 'Watching',  color: 'violet',  sort_order: 0, type_filter: ['anime', 'movie'], created_at: '' },
  { id: '', kind: 'status', value: 'reading',       label: 'Reading',   color: 'emerald', sort_order: 1, type_filter: ['manga'], created_at: '' },
  { id: '', kind: 'status', value: 'completed',     label: 'Completed', color: 'green',   sort_order: 2, type_filter: ALL_TYPES, created_at: '' },
  { id: '', kind: 'status', value: 'on_hold',       label: 'On Hold',   color: 'yellow',  sort_order: 3, type_filter: ALL_TYPES, created_at: '' },
  { id: '', kind: 'status', value: 'dropped',       label: 'Dropped',   color: 'red',     sort_order: 4, type_filter: ALL_TYPES, created_at: '' },
  { id: '', kind: 'status', value: 'plan_to_watch', label: 'Planning',  color: 'zinc',    sort_order: 5, type_filter: ALL_TYPES, created_at: '' },
]

export async function getCategories(): Promise<{ categories: Category[]; migrationNeeded: boolean }> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('kind')
    .order('sort_order')
    .order('created_at')
  if (error) return { categories: DEFAULTS, migrationNeeded: true }
  return { categories: (data ?? []) as Category[], migrationNeeded: false }
}

export async function addCategory(data: {
  kind:        'type' | 'status'
  value:       string
  label:       string
  color:       string
  sort_order:  number
  type_filter: string[]
}) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('categories').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/home')
  revalidatePath('/admin')
}

export async function updateCategory(id: string, data: {
  label?:       string
  color?:       string
  sort_order?:  number
  type_filter?: string[]
}) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/home')
  revalidatePath('/admin')
}

export async function deleteCategory(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/home')
  revalidatePath('/admin')
}
