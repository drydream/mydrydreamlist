'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

export type ItemType   = 'anime' | 'manga' | 'movie' | 'other'
export type ItemStatus = 'watching' | 'reading' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch'

export async function addItem(data: {
  title: string
  image_url?: string
  url?: string
  type: ItemType
  status: ItemStatus
  total?: number
}) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('items').insert({
    title:     data.title,
    image_url: data.image_url || null,
    url:       data.url       || null,
    type:      data.type,
    status:    data.status,
    total:     data.total     ?? null,
    progress:  0,
  })
  if (error) throw new Error(error.message)
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
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('items')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/home')
}

export async function updateProgress(id: string, progress: number) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('items')
    .update({ progress, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  // No revalidatePath: useOptimistic handles the UI update client-side.
  // Revalidating triggers an RSC re-fetch that iOS Safari ITP blocks (strips
  // the cross-site cookie) causing redirect to login inside the iframe.
}

export async function deleteItem(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/home')
}
