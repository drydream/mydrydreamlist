'use client'

import { useState, useTransition, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateItem } from '@/lib/actions/items'
import type { Item } from './media-card'

const SELECT_CLASS = 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'

export function EditItemModal({
  item,
  types    = [],
  statuses = [],
  onClose,
}: {
  item:      Item
  types?:    { value: string; label: string }[]
  statuses?: { value: string; label: string; type_filter?: string[] }[]
  onClose:   () => void
}) {
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const [form, setForm] = useState({
    title:     item.title,
    image_url: item.image_url ?? '',
    url:       item.url       ?? '',
    type:      item.type,
    status:    item.status,
    total:     item.total?.toString()    ?? '',
    progress:  item.progress.toString(),
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleTypeChange(newType: string) {
    const applicable = statuses.filter(s => s.type_filter?.includes(newType))
    setForm(f => ({
      ...f,
      type:   newType,
      status: applicable.find(s => s.value === f.status) ? f.status : (applicable[0]?.value ?? f.status),
    }))
  }

  const applicableStatuses = statuses.filter(s => s.type_filter?.includes(form.type))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    if (!applicableStatuses.some(s => s.value === form.status)) return
    startTransition(async () => {
      await updateItem(item.id, {
        title:     form.title.trim(),
        image_url: form.image_url.trim() || null,
        url:       form.url.trim()       || null,
        type:      form.type,
        status:    form.status,
        progress: form.progress ? parseFloat(form.progress) : 0,
      })
      onClose()
    })
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-3 shadow-2xl"
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
            onChange={e => handleTypeChange(e.target.value)}
            className={`flex-1 min-w-[100px] ${SELECT_CLASS}`}
          >
            {types.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
            {!types.find(o => o.value === form.type) && (
              <option value={form.type}>{form.type}</option>
            )}
          </select>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className={`flex-1 min-w-[120px] ${SELECT_CLASS}`}
          >
            {applicableStatuses.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
            {!applicableStatuses.find(o => o.value === form.status) && (
              <option value={form.status}>{form.status}</option>
            )}
          </select>
        </div>

        <Input
          type="number"
          placeholder="Progress"
          value={form.progress}
          onChange={e => set('progress', e.target.value)}
          min={0}
          step="any"
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />

        <Button
          type="submit"
          disabled={isPending || !form.title.trim() || !applicableStatuses.some(s => s.value === form.status)}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </motion.form>
    </motion.div>
  )
}
