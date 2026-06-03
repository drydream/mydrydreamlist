import { createServiceClient } from '@/lib/supabase/server'
import { type Item } from './media-card'
import { RealtimeDashboard } from './realtime-dashboard'
import type { Category } from '@/lib/actions/categories'

interface Filters {
  type?:   string
  status?: string
  year?:   string
}

export async function Dashboard({
  filters    = {},
  categories = [],
}: {
  filters?:    Filters
  categories?: Category[]
}) {
  const supabase = createServiceClient()

  const { data: items, error } = await supabase
    .from('items')
    .select('id, title, image_url, url, type, status, progress, total, updated_at')
    .order('updated_at', { ascending: false })
    .returns<Item[]>()

  if (error) {
    return (
      <div className="text-sm text-red-400 px-4 py-3 rounded-lg bg-red-900/20 border border-red-800">
        Failed to load list: {error.message}
      </div>
    )
  }

  const typeCategories   = categories.filter(c => c.kind === 'type')
  const statusCategories = categories.filter(c => c.kind === 'status')

  return (
    <RealtimeDashboard
      initialItems={items ?? []}
      filters={filters}
      typeCategories={typeCategories}
      statusCategories={statusCategories}
    />
  )
}
