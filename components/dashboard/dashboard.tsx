import { getDb } from '@/lib/db'
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
  const items = getDb()
    .prepare('SELECT id, title, image_url, url, type, status, progress, total, updated_at FROM items ORDER BY updated_at DESC')
    .all()
    .map(row => ({ ...row })) as unknown as Item[]

  const typeCategories   = categories.filter(c => c.kind === 'type')
  const statusCategories = categories.filter(c => c.kind === 'status')

  return (
    <RealtimeDashboard
      initialItems={items}
      filters={filters}
      typeCategories={typeCategories}
      statusCategories={statusCategories}
    />
  )
}
