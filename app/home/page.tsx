import Link from 'next/link'
import { AddItemForm } from '@/components/add-form/add-item-form'
import { Dashboard } from '@/components/dashboard/dashboard'
import { SessionGuard } from '@/components/session-guard'
import { getCategories } from '@/lib/actions/categories'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const [filters, { categories }] = await Promise.all([
    searchParams,
    getCategories(),
  ])

  const types    = categories.filter(c => c.kind === 'type')
  const statuses = categories.filter(c => c.kind === 'status')

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <SessionGuard />
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-100">myDryDrEaMlist</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Admin
            </Link>
            <AddItemForm
              types={types.map(c => ({ value: c.value, label: c.label }))}
              statuses={statuses.map(c => ({ value: c.value, label: c.label, type_filter: c.type_filter }))}
            />
          </div>
        </div>
        <Dashboard filters={filters} categories={categories} />
      </div>
    </main>
  )
}
