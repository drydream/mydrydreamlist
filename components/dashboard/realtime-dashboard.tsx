'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MediaCard, type Item } from './media-card'
import { FilterBar } from './filter-bar'
import { COLOR_MAP } from '@/lib/colors'
import type { Category } from '@/lib/actions/categories'

interface Filters {
  type?:   string
  status?: string
  year?:   string
}

export function RealtimeDashboard({
  initialItems,
  filters = {},
  typeCategories   = [],
  statusCategories = [],
}: {
  initialItems:      Item[]
  filters?:          Filters
  typeCategories?:   Category[]
  statusCategories?: Category[]
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

  // Build color lookup maps from categories
  const typeColorMap: Record<string, string> = Object.fromEntries(
    typeCategories.map(c => [c.value, COLOR_MAP[c.color]?.dot ?? 'bg-zinc-600'])
  )
  const statusMap: Record<string, { label: string; text: string }> = Object.fromEntries(
    statusCategories.map(c => [c.value, {
      label: c.label,
      text:  COLOR_MAP[c.color]?.text ?? 'text-zinc-400',
    }])
  )

  // Derive available filter options (only values present in items)
  const availableTypes    = [...new Set(items.map(i => i.type))]
  const availableStatuses = [...new Set(items.map(i => i.status))]
  const availableYears    = [...new Set(
    items.filter(i => i.updated_at).map(i => new Date(i.updated_at!).getFullYear())
  )].sort((a, b) => b - a)

  const typeOptions   = typeCategories
    .filter(c => availableTypes.includes(c.value))
    .map(c => ({ value: c.value, label: c.label }))
  const statusOptions = statusCategories
    .filter(c => availableStatuses.includes(c.value))
    .map(c => ({ value: c.value, label: c.label }))

  // Apply URL filters
  let filtered = items
  if (filters.type)   filtered = filtered.filter(i => i.type === filters.type)
  if (filters.status) filtered = filtered.filter(i => i.status === filters.status)
  if (filters.year)   filtered = filtered.filter(i =>
    i.updated_at && new Date(i.updated_at).getFullYear() === Number(filters.year)
  )

  // Build groups from categories (dynamic), then catch uncategorized items
  const knownTypes = new Set(typeCategories.map(c => c.value))
  const groups = [
    ...typeCategories
      .map(c => ({
        type:   c.value,
        label:  c.label,
        accent: COLOR_MAP[c.color]?.accent ?? 'bg-zinc-500',
        items:  filtered.filter(i => i.type === c.value),
      }))
      .filter(g => g.items.length > 0),
    // Items whose type category was deleted still appear here
    ...((() => {
      const orphans = filtered.filter(i => !knownTypes.has(i.type))
      return orphans.length > 0
        ? [{ type: '__orphan__', label: 'Other', accent: 'bg-zinc-500', items: orphans }]
        : []
    })()),
  ]

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
          typeOptions={typeOptions}
          statusOptions={statusOptions}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {group.items.map(item => (
                <MediaCard
                  key={item.id}
                  item={item}
                  dotColor={typeColorMap[item.type] ?? 'bg-zinc-600'}
                  statusLabel={statusMap[item.status]?.label}
                  statusText={statusMap[item.status]?.text}
                  types={typeCategories.map(c => ({ value: c.value, label: c.label }))}
                  statuses={statusCategories.map(c => ({ value: c.value, label: c.label, type_filter: c.type_filter }))}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
