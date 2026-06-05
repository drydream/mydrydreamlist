'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import {
  addCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '@/lib/actions/categories'
import { COLOR_MAP, COLORS } from '@/lib/colors'

type AddForm  = { kind: 'type' | 'status'; value: string; label: string; color: string; type_filter: string[] }
type EditForm = { id: string; kind: 'type' | 'status'; label: string; color: string; sort_order: number; type_filter: string[] }

export function CategoryManager({
  initialCategories,
  migrationNeeded = false,
}: {
  initialCategories: Category[]
  migrationNeeded?:  boolean
}) {
  const [add,     setAdd]  = useState<AddForm | null>(null)
  const [edit,    setEdit] = useState<EditForm | null>(null)
  const [delId,   setDel]  = useState<string | null>(null)
  const [err,     setErr]  = useState<string | null>(null)
  const [pending, trans]   = useTransition()

  const types    = initialCategories.filter(c => c.kind === 'type')
  const statuses = initialCategories.filter(c => c.kind === 'status')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!add || !add.value.trim() || !add.label.trim()) return
    if (add.kind === 'status' && add.type_filter.length === 0) {
      setErr('Assign at least one type under "Applies to".')
      return
    }
    const base = add.kind === 'type' ? types : statuses
    setErr(null)
    trans(async () => {
      try {
        await addCategory({
          kind:        add.kind,
          value:       add.value.trim().toLowerCase().replace(/[\s-]+/g, '_'),
          label:       add.label.trim(),
          color:       add.color,
          sort_order:  base.length,
          type_filter: add.kind === 'status' ? add.type_filter : [],
        })
        setAdd(null)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Failed to add')
      }
    })
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!edit) return
    if (edit.kind === 'status' && edit.type_filter.length === 0) {
      setErr('Assign at least one type under "Applies to".')
      return
    }
    setErr(null)
    trans(async () => {
      try {
        await updateCategory(edit.id, {
          label:       edit.label.trim(),
          color:       edit.color,
          sort_order:  edit.sort_order,
          type_filter: edit.type_filter,
        })
        setEdit(null)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Failed to update')
      }
    })
  }

  function handleDelete() {
    if (!delId) return
    setErr(null)
    trans(async () => {
      try {
        await deleteCategory(delId)
        setDel(null)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Failed to delete')
      }
    })
  }

  function toggleTypeFilter(
    current: string[],
    typeValue: string,
    setter: (fn: (f: AddForm | null) => AddForm | null) => void | ((fn: (f: EditForm | null) => EditForm | null) => void)
  ) {
    const next = current.includes(typeValue)
      ? current.filter(v => v !== typeValue)
      : [...current, typeValue]
    return next
  }

  function renderSection(title: string, kind: 'type' | 'status', items: Category[]) {
    return (
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-zinc-200">{title}</h2>
          <div className="flex-1 h-px bg-zinc-800" />
          <button
            onClick={() => { setAdd({ kind, value: '', label: '', color: 'zinc', type_filter: [] }); setEdit(null); setDel(null) }}
            disabled={pending || migrationNeeded}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 overflow-hidden divide-y divide-zinc-800">
          {items.length === 0 && !add && (
            <p className="px-3 py-4 text-sm text-zinc-600 text-center">No entries yet.</p>
          )}

          {items.map(cat => (
            edit?.id === cat.id ? (
              <form key={cat.value} onSubmit={handleEdit} className="p-3 bg-zinc-900 space-y-2.5">
                <div className="flex gap-2">
                  <input
                    value={edit.label}
                    onChange={e => setEdit(f => f && { ...f, label: e.target.value })}
                    placeholder="Label"
                    autoFocus
                    className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="number"
                    value={edit.sort_order}
                    onChange={e => setEdit(f => f && { ...f, sort_order: parseInt(e.target.value) || 0 })}
                    title="Sort order"
                    className="w-16 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={pending || !edit.label.trim()}
                    className="h-8 w-8 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 flex items-center justify-center text-white transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEdit(null)}
                    className="h-8 w-8 rounded-md border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <ColorPicker value={edit.color} onChange={c => setEdit(f => f && { ...f, color: c })} />
                {kind === 'status' && (
                  <TypeFilterPicker
                    types={types}
                    value={edit.type_filter}
                    onChange={next => setEdit(f => f && { ...f, type_filter: next })}
                  />
                )}
              </form>
            ) : (
              <div key={cat.value} className="flex items-center gap-3 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800/40 transition-colors">
                <div className={`h-3 w-3 rounded-full flex-shrink-0 ${COLOR_MAP[cat.color]?.dot ?? 'bg-zinc-600'}`} />
                <span className="text-sm text-zinc-200 flex-1">{cat.label}</span>
                <span className="text-xs text-zinc-600 font-mono">{cat.value}</span>
                {kind === 'status' && cat.type_filter.length > 0 && (
                  <span className="text-[10px] text-zinc-500 border border-zinc-700 rounded-full px-2 py-0.5">
                    {cat.type_filter.join(', ')}
                  </span>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEdit({ id: cat.id, kind: cat.kind, label: cat.label, color: cat.color, sort_order: cat.sort_order, type_filter: cat.type_filter })
                      setAdd(null)
                      setDel(null)
                    }}
                    className="h-6 w-6 rounded-md hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>

                  {delId === cat.id ? (
                    <>
                      <button
                        onClick={handleDelete}
                        disabled={pending}
                        className="h-6 w-6 rounded-md bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
                        title="Confirm delete"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setDel(null)}
                        className="h-6 w-6 rounded-md border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"
                        title="Cancel"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setDel(cat.id); setEdit(null) }}
                      className="h-6 w-6 rounded-md hover:bg-red-600/20 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          ))}

          {add?.kind === kind && (
            <form onSubmit={handleAdd} className="p-3 bg-zinc-950 space-y-2.5">
              <div className="flex gap-2">
                <input
                  value={add.value}
                  onChange={e => setAdd(f => f && { ...f, value: e.target.value })}
                  placeholder="Slug (e.g. playing)"
                  autoFocus
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  value={add.label}
                  onChange={e => setAdd(f => f && { ...f, label: e.target.value })}
                  placeholder="Label"
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  disabled={pending || !add.value.trim() || !add.label.trim()}
                  className="h-8 w-8 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 flex items-center justify-center text-white transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAdd(null)}
                  className="h-8 w-8 rounded-md border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <ColorPicker value={add.color} onChange={c => setAdd(f => f && { ...f, color: c })} />
              {kind === 'status' && (
                <TypeFilterPicker
                  types={types}
                  value={add.type_filter}
                  onChange={next => setAdd(f => f && { ...f, type_filter: next })}
                />
              )}
            </form>
          )}
        </div>
      </section>
    )
  }

  // suppress unused warning — toggleTypeFilter is inlined via TypeFilterPicker
  void toggleTypeFilter

  return (
    <div className="space-y-10">
      {err && (
        <div className="flex items-center justify-between rounded-lg border border-red-800 bg-red-900/20 px-3 py-2">
          <p className="text-xs text-red-400">{err}</p>
          <button onClick={() => setErr(null)} className="text-red-600 hover:text-red-400 ml-3">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {renderSection('Categories (type)', 'type', types)}
      {renderSection('Statuses', 'status', statuses)}
    </div>
  )
}

function TypeFilterPicker({
  types,
  value,
  onChange,
}: {
  types:    Category[]
  value:    string[]
  onChange: (next: string[]) => void
}) {
  function toggle(typeValue: string) {
    onChange(
      value.includes(typeValue)
        ? value.filter(v => v !== typeValue)
        : [...value, typeValue]
    )
  }

  const allSelected = types.length > 0 && types.every(t => value.includes(t.value))

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Applies to <span className="text-zinc-600 normal-case">(required)</span></p>
      <div className="flex gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onChange(allSelected ? [] : types.map(t => t.value))}
          className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
            allSelected
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
          }`}
        >
          All
        </button>
        {types.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => toggle(t.value)}
            className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
              value.includes(t.value)
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          title={c}
          className={`h-5 w-5 rounded-full transition-all ${COLOR_MAP[c].dot} ring-2 ring-offset-2 ring-offset-zinc-900 ${
            value === c ? 'ring-white scale-110' : 'ring-transparent hover:scale-105'
          }`}
        />
      ))}
    </div>
  )
}
