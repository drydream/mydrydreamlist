import Link from 'next/link'
import { SessionGuard } from '@/components/session-guard'
import { getCategories } from '@/lib/actions/categories'
import { CategoryManager } from '@/components/admin/category-manager'

export default async function AdminPage() {
  const { categories, migrationNeeded } = await getCategories()

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <SessionGuard />
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

        {migrationNeeded && (
          <div className="rounded-xl border border-yellow-800 bg-yellow-900/20 px-4 py-3 space-y-2">
            <p className="text-sm font-medium text-yellow-300">Migration required</p>
            <p className="text-xs text-yellow-500">
              Run this SQL in your Supabase project (SQL Editor) to enable category management:
            </p>
            <pre className="text-[11px] text-yellow-400 bg-black/40 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{`CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       TEXT    NOT NULL CHECK (kind IN ('type', 'status')),
  value      TEXT    NOT NULL,
  label      TEXT    NOT NULL,
  color      TEXT    NOT NULL DEFAULT 'zinc',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kind, value)
);

INSERT INTO public.categories (kind, value, label, color, sort_order) VALUES
  ('type',   'anime',         'Anime',     'violet',  0),
  ('type',   'manga',         'Manga',     'emerald', 1),
  ('type',   'movie',         'Movie',     'blue',    2),
  ('type',   'other',         'Other',     'zinc',    3),
  ('status', 'watching',      'Watching',  'violet',  0),
  ('status', 'reading',       'Reading',   'emerald', 1),
  ('status', 'completed',     'Completed', 'green',   2),
  ('status', 'on_hold',       'On Hold',   'yellow',  3),
  ('status', 'dropped',       'Dropped',   'red',     4),
  ('status', 'plan_to_watch', 'Planning',  'zinc',    5)
ON CONFLICT (kind, value) DO NOTHING;`}</pre>
          </div>
        )}

        <CategoryManager initialCategories={categories} migrationNeeded={migrationNeeded} />
      </div>
    </main>
  )
}
