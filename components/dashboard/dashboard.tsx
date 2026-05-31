import { createServiceClient } from '@/lib/supabase/server'
import { MediaCard, type Item } from './media-card'

const GROUPS = [
  { type: 'anime', label: 'Anime', accent: 'bg-violet-500' },
  { type: 'manga', label: 'Manga', accent: 'bg-emerald-500' },
  { type: 'movie', label: 'Movie', accent: 'bg-blue-500' },
  { type: 'other', label: 'Other', accent: 'bg-zinc-500' },
]

export async function Dashboard() {
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

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-zinc-400 text-base">Your list is empty.</p>
        <p className="text-zinc-600 text-sm mt-1">Click <span className="text-zinc-400 font-medium">+ Add</span> to get started.</p>
      </div>
    )
  }

  const groups = GROUPS
    .map(g => ({ ...g, items: items.filter(i => i.type === g.type) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="space-y-10">
      {groups.map(group => (
        <section key={group.type}>
          {/* Section header */}
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
  )
}
