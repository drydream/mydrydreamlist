'use client'

import { useState, useEffect, useTransition } from 'react'
import { Pencil, Trash2, ExternalLink, Check, X } from 'lucide-react'
import { updateProgress, deleteItem } from '@/lib/actions/items'
import { EditItemModal } from './edit-item-modal'

export interface Item {
  id:         string
  title:      string
  image_url:  string | null
  url:        string | null
  type:       string
  status:     string
  progress:   number
  total:      number | null
  updated_at: string | null
}

function formatDate(iso: string | null): { absolute: string; relative: string | null } | null {
  if (!iso) return null
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  const absolute = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
  let relative: string | null = null
  if (diffDays <= 0)      relative = 'Today'
  else if (diffDays === 1) relative = 'Yesterday'
  else if (diffDays < 7)  relative = `${diffDays}d ago`
  return { absolute, relative }
}

const TYPE_COLOR: Record<string, string> = {
  anime: 'bg-violet-600',
  manga: 'bg-emerald-600',
  movie: 'bg-blue-600',
  other: 'bg-zinc-600',
}

const STATUS_LABEL: Record<string, string> = {
  watching:      'Watching',
  reading:       'Reading',
  completed:     'Completed',
  on_hold:       'On Hold',
  dropped:       'Dropped',
  plan_to_watch: 'Planning',
}

const STATUS_COLOR: Record<string, string> = {
  watching:      'text-violet-400',
  reading:       'text-emerald-400',
  completed:     'text-green-400',
  on_hold:       'text-yellow-400',
  dropped:       'text-red-400',
  plan_to_watch: 'text-zinc-500',
}

export function MediaCard({ item }: { item: Item }) {
  const [editing,    setEditing]    = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [, startTransition] = useTransition()
  const [displayProgress, setDisplayProgress] = useState(item.progress)

  useEffect(() => {
    setDisplayProgress(item.progress)
  }, [item.progress])

  const atMax = item.total !== null && displayProgress >= item.total
  const atMin = displayProgress <= 0
  const dotColor = TYPE_COLOR[item.type] ?? TYPE_COLOR.other

  function handleIncrement() {
    if (atMax) return
    const next = displayProgress + 1
    setDisplayProgress(next)
    updateProgress(item.id, next)
  }

  function handleDecrement() {
    if (atMin) return
    const next = displayProgress - 1
    setDisplayProgress(next)
    updateProgress(item.id, next)
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteItem(item.id)
    })
  }

  const date = formatDate(item.updated_at)

  return (
    <>
      <div className="group flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-xl hover:shadow-black/50">
        {/* Poster */}
        <div className="relative aspect-[2/3] bg-zinc-800 overflow-hidden">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-3">
              <span className="text-zinc-600 text-xs text-center leading-tight">{item.title}</span>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Type dot - top left */}
          <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${dotColor} ring-2 ring-zinc-900/80`} />

          {/* Action buttons - top right, appear on hover */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => setEditing(true)}
              className="h-6 w-6 rounded-md bg-black/70 hover:bg-black/90 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              title="Edit"
            >
              <Pencil className="h-3 w-3" />
            </button>

            {confirming ? (
              <>
                <button
                  onClick={handleDelete}
                  className="h-6 w-6 rounded-md bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
                  title="Confirm delete"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="h-6 w-6 rounded-md bg-black/70 hover:bg-black/90 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                  title="Cancel"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="h-6 w-6 rounded-md bg-black/70 hover:bg-red-600/80 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* External link - bottom right, hover */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 h-6 w-6 rounded-md bg-black/70 hover:bg-black/90 flex items-center justify-center text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
              title="Open link"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Info bar */}
        <div className="px-3 py-2.5 flex flex-col gap-2">
          <p className="text-xs font-semibold text-zinc-100 line-clamp-2 leading-snug">
            {item.title}
          </p>

          <div className="flex items-center justify-between gap-1">
            <span className={`text-[10px] font-medium ${STATUS_COLOR[item.status] ?? 'text-zinc-500'}`}>
              {STATUS_LABEL[item.status] ?? item.status}
            </span>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-400 tabular-nums font-medium">
                {displayProgress}{item.total ? `/${item.total}` : ''}
              </span>
              {!atMin && (
                <button
                  onClick={handleDecrement}
                  className="h-5 px-1.5 text-[10px] rounded-md border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  −1
                </button>
              )}
              {!atMax && (
                <button
                  onClick={handleIncrement}
                  className="h-5 px-1.5 text-[10px] rounded-md border border-zinc-700 hover:bg-violet-600 hover:border-violet-600 text-zinc-500 hover:text-white transition-colors"
                >
                  +1
                </button>
              )}
            </div>
          </div>

          {date && (
            <div className="pt-1.5 border-t border-zinc-800 flex flex-col gap-0.5">
              <span className="text-[11px] text-zinc-300 font-medium leading-none">{date.absolute}</span>
              {date.relative && (
                <span className="text-[9px] text-zinc-600 leading-none">{date.relative}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {editing && <EditItemModal item={item} onClose={() => setEditing(false)} />}
    </>
  )
}
