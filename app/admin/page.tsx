import Link from 'next/link'
import { getCategories } from '@/lib/actions/categories'
import { CategoryManager } from '@/components/admin/category-manager'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { categories } = await getCategories()

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100">Admin</h1>
        </div>

        <CategoryManager initialCategories={categories} />
      </div>
    </main>
  )
}
