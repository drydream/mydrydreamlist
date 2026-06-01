'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MediaCard, type Item } from './media-card'
import { FilterBar } from './filter-bar'

const GROUPS = [
  { type: 'anime', label: 'Anime', accent: 'bg-violet-500' },
  { type: 'manga', label: 'Manga', accent: 'bg-emerald-500' },
  { type: 'movie', label: 'Movie', accent: 'bg-blue-500' },
  { type: 'other', label: 'Other', accent: 'bg-zinc-500' },
]

interface Filters {
  type?:   string
  status?: string
  year?:   string
}

export function RealtimeDashboard({
  initialItems,
  filters = {},
}: {
  initialItems: Item[]
  filters?: Filters
}) {
  const [items, setItems] = useState(initialItems)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('items-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'items' },
        (payload: { new: Record<string, unknown> }) => {
          setItems(prev =>
            prev.map(item =>
              item.id === payload.new.id
                ? { ...item, ...(payload.new as Partial<Item>) }
                : item
            )
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const availableTypes    = [...new Set(items.map(i => i.type))]
  const availableStatuses = [...new Set(items.map(i => i.status))]
  const availableYears    = [...new Set(
    items.filter(i => i.updated_at).map(i => new Date(i.updated_at!).getFullYear())
  )].sort((a, b) => b - a)

  let filtered = items
  if (filters.type)   filtered = filtered.filter(i => i.type === filters.type)
  if (filters.status) filtered = filtered.filter(i => i.status === filters.status)
  if (filters.year)   filtered = filtered.filter(i =>
    i.updated_at && new Date(i.updated_at).getFullYear() === Number(filters.year)
  )

  const groups = GROUPS
    .map(g => ({ ...g, items: filtered.filter(i => i.type === g.type) }))
    .filter(g => g.items.length > 0)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-zinc-400 text-base">Your list is empty.</p>
        <p className="text-zinc-600 text-sm mt-1">Click <span className="text-zinc-400 font-medium">+ Add</span> to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Suspense>
        <FilterBar
          availableTypes={availableTypes}
          availableStatuses={availableStatuses}
          availableYears={availableYears}
        />
      </Suspense>

      {groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-zinc-400 text-base">No items match this filter.</p>
        </div>
      )}

      <div className="space-y-10">
        {groups.map(group => (
          <section key={group.type}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-1 h-5 rounded-full ${group.accent} shrink-0`} />
              <h2 className="text-base font-semibold text-zinc-200">{group.label}</h2>
              <span className="text-sm text-zinc-600">{group.items.length}</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {group.items.map(item => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
