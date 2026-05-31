'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateItem, type ItemType, type ItemStatus } from '@/lib/actions/items'
import type { Item } from './media-card'

const TYPE_OPTIONS: { value: ItemType; label: string }[] = [
  { value: 'anime', label: 'Anime' },
  { value: 'manga', label: 'Manga' },
  { value: 'movie', label: 'Movie' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: 'watching',      label: 'Watching' },
  { value: 'reading',       label: 'Reading' },
  { value: 'completed',     label: 'Completed' },
  { value: 'plan_to_watch', label: 'Plan to watch' },
  { value: 'on_hold',       label: 'On hold' },
  { value: 'dropped',       label: 'Dropped' },
]

const SELECT_CLASS = 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'

export function EditItemModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    title:     item.title,
    image_url: item.image_url ?? '',
    url:       item.url       ?? '',
    type:      item.type      as ItemType,
    status:    item.status    as ItemStatus,
    total:     item.total?.toString()    ?? '',
    progress:  item.progress.toString(),
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    startTransition(async () => {
      await updateItem(item.id, {
        title:     form.title.trim(),
        image_url: form.image_url.trim() || null,
        url:       form.url.trim()       || null,
        type:      form.type,
        status:    form.status,
        total:     form.total    ? parseInt(form.total)    : null,
        progress:  form.progress ? parseInt(form.progress) : 0,
      })
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-3 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-200">Edit entry</span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Input
          placeholder="Title *"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          required
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
        <Input
          placeholder="Image URL"
          value={form.image_url}
          onChange={e => set('image_url', e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
        <Input
          placeholder="URL (link)"
          value={form.url}
          onChange={e => set('url', e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />

        <div className="flex gap-2 flex-wrap">
          <select
            value={form.type}
            onChange={e => set('type', e.target.value)}
            className={`flex-1 min-w-[100px] ${SELECT_CLASS}`}
          >
            {TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className={`flex-1 min-w-[120px] ${SELECT_CLASS}`}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Progress"
            value={form.progress}
            onChange={e => set('progress', e.target.value)}
            min={0}
            className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
          />
          <Input
            type="number"
            placeholder="Total"
            value={form.total}
            onChange={e => set('total', e.target.value)}
            min={0}
            className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending || !form.title.trim()}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  )
}
