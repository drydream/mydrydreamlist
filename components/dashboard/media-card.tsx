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
    year: 'numeric',
  })
  let relative: string | null = null
  if (diffDays <= 0)       relative = 'Today'
  else if (diffDays === 1) relative = 'Yesterday'
  else if (diffDays < 7)   relative = `${diffDays}d ago`
  return { absolute, relative }
}

export function MediaCard({
  item,
  dotColor = 'bg-zinc-600',
  statusLabel,
  statusText = 'text-zinc-400',
  types    = [],
  statuses = [],
}: {
  item:         Item
  dotColor?:    string
  statusLabel?: string
  statusText?:  string
  types?:       { value: string; label: string }[]
  statuses?:    { value: string; label: string; type_filter?: string[] }[]
}) {
  const [editing,    setEditing]    = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [, startTransition] = useTransition()
  const [displayProgress, setDisplayProgress] = useState(item.progress)

  useEffect(() => {
    setDisplayProgress(item.progress)
  }, [item.progress])

  const atMin = displayProgress <= 0

  function handleIncrement() {
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
      <div className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/60 hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5">
        {/* Poster */}
        <div className="relative aspect-[2/3] bg-zinc-800 overflow-hidden">
          {item.image_url ? (
            <>
              {/* Blurred fill */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50 transition-transform duration-500 group-hover:scale-125"
              />
              {/* Main image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-end p-3">
              <span className="text-zinc-400 text-xs font-medium leading-snug line-clamp-3">{item.title}</span>
            </div>
          )}

          {/* Deep bottom gradient for text overlay */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

          {/* Type dot — top left */}
          <div className={`absolute top-2.5 left-2.5 w-2 h-2 rounded-full ${dotColor} ring-2 ring-black/50 shadow-lg`} />

          {/* Action buttons — top right on hover (always visible on touch) */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setEditing(true)}
              className="h-6 w-6 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-sm flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              title="Edit"
            >
              <Pencil className="h-3 w-3" />
            </button>
            {confirming ? (
              <>
                <button
                  onClick={handleDelete}
                  className="h-6 w-6 rounded-lg bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
                  title="Confirm delete"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="h-6 w-6 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-sm flex items-center justify-center text-zinc-300 transition-colors"
                  title="Cancel"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="h-6 w-6 rounded-lg bg-black/70 hover:bg-red-600/90 backdrop-blur-sm flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Title + status — always visible overlay */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 pointer-events-none">
            <p className="text-[11px] font-semibold text-white leading-snug line-clamp-2 drop-shadow-lg mb-1">
              {item.title}
            </p>
            <span className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm ${statusText}`}>
              {statusLabel ?? item.status}
            </span>
          </div>

          {/* External link — bottom right on hover (always visible on touch) */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 h-6 w-6 rounded-lg bg-black/60 hover:bg-black/90 backdrop-blur-sm flex items-center justify-center text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all"
              title="Open link"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Bottom bar — progress + date */}
        <div className="px-2.5 py-2 flex items-center justify-between gap-2 bg-zinc-900">
          <div className="flex items-center gap-1">
            <button
              onClick={handleDecrement}
              disabled={atMin}
              className={`h-7 w-7 text-xs rounded-md border transition-colors flex items-center justify-center ${
                atMin
                  ? 'border-zinc-700/30 text-zinc-700 cursor-not-allowed'
                  : 'border-zinc-700/60 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-500 hover:text-zinc-200'
              }`}
            >
              −
            </button>
            <span className="text-[11px] text-zinc-300 tabular-nums font-semibold min-w-[1ch] text-center">
              {displayProgress}
            </span>
            <button
              onClick={handleIncrement}
              className="h-7 w-7 text-xs rounded-md border border-zinc-700/60 hover:bg-violet-600 hover:border-violet-600 text-zinc-500 hover:text-white transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>

          {date && (
            <div className="text-right shrink-0">
              <p className="text-[10px] text-zinc-400 leading-none">{date.absolute}</p>
              {date.relative && (
                <p className="text-[9px] text-zinc-600 leading-none mt-0.5">{date.relative}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <EditItemModal
          item={item}
          types={types}
          statuses={statuses}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
