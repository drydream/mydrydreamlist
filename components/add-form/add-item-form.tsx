'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { addItem } from '@/lib/actions/items'

const SELECT_CLASS = 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'

export function AddItemForm({
  types    = [],
  statuses = [],
}: {
  types?:    { value: string; label: string }[]
  statuses?: { value: string; label: string; type_filter?: string[] }[]
}) {
  const [open, setOpen]              = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])
  const [form, setForm] = useState({
    title:     '',
    image_url: '',
    url:       '',
    type:      types[0]?.value    ?? '',
    status:    statuses[0]?.value ?? '',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleTypeChange(newType: string) {
    const applicable = statuses.filter(s => !s.type_filter?.length || s.type_filter.includes(newType))
    setForm(f => ({
      ...f,
      type:   newType,
      status: applicable.find(s => s.value === f.status) ? f.status : (applicable[0]?.value ?? f.status),
    }))
  }

  const applicableStatuses = statuses.filter(
    s => !s.type_filter?.length || s.type_filter.includes(form.type)
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    startTransition(async () => {
      await addItem({
        title:     form.title.trim(),
        image_url: form.image_url.trim() || undefined,
        url:       form.url.trim()       || undefined,
        type:      form.type,
        status:    form.status,
      })
      setForm(f => ({ ...f, title: '', image_url: '', url: '' }))
      setOpen(false)
    })
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="bg-violet-600 hover:bg-violet-500 text-white shrink-0"
      >
        <Plus className="h-4 w-4 mr-1" /> Add
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
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
              <span className="text-sm font-semibold text-zinc-200">Add entry</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
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
              autoFocus
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
              </select>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className={`flex-1 min-w-[120px] ${SELECT_CLASS}`}
              >
                {applicableStatuses.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={isPending || !form.title.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white"
            >
              {isPending ? 'Adding…' : 'Add to list'}
            </Button>
          </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
