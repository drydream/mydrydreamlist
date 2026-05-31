import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AddItemForm } from '@/components/add-form/add-item-form'
import { Dashboard } from '@/components/dashboard/dashboard'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const cookieStore = await cookies()
  if (!cookieStore.get('session')) redirect('/')
  const filters = await searchParams

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-100">myDryDrEaMlist</h1>
          <AddItemForm />
        </div>
        <Dashboard filters={filters} />
      </div>
    </main>
  )
}
