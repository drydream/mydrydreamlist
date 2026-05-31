'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const TYPE_OPTIONS = [
  { value: 'anime', label: 'Anime' },
  { value: 'manga', label: 'Manga' },
  { value: 'movie', label: 'Movie' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'watching',      label: 'Watching' },
  { value: 'reading',       label: 'Reading' },
  { value: 'completed',     label: 'Completed' },
  { value: 'on_hold',       label: 'On Hold' },
  { value: 'dropped',       label: 'Dropped' },
  { value: 'plan_to_watch', label: 'Planning' },
]

interface FilterBarProps {
  availableTypes:    string[]
  availableStatuses: string[]
  availableYears:    number[]
}

export function FilterBar({ availableTypes, availableStatuses, availableYears }: FilterBarProps) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  const activeType   = searchParams.get('type')   ?? ''
  const activeStatus = searchParams.get('status') ?? ''
  const activeYear   = searchParams.get('year')   ?? ''

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get(key) === value) params.delete(key)
    else params.set(key, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const typeOptions   = TYPE_OPTIONS.filter(o => availableTypes.includes(o.value))
  const statusOptions = STATUS_OPTIONS.filter(o => availableStatuses.includes(o.value))

  if (typeOptions.length <= 1 && statusOptions.length <= 1 && availableYears.length <= 1) return null

  return (
    <div className="flex flex-col gap-2.5">
      {typeOptions.length > 1 && (
        <FilterRow
          label="Type"
          options={typeOptions}
          active={activeType}
          onToggle={v => toggle('type', v)}
        />
      )}
      {statusOptions.length > 1 && (
        <FilterRow
          label="Status"
          options={statusOptions}
          active={activeStatus}
          onToggle={v => toggle('status', v)}
        />
      )}
      {availableYears.length > 1 && (
        <FilterRow
          label="Year"
          options={availableYears.map(y => ({ value: String(y), label: String(y) }))}
          active={activeYear}
          onToggle={v => toggle('year', v)}
        />
      )}
    </div>
  )
}

function FilterRow({ label, options, active, onToggle }: {
  label:    string
  options:  { value: string; label: string }[]
  active:   string
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] text-zinc-600 uppercase tracking-wider w-10 shrink-0">{label}</span>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onToggle(o.value)}
          className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
            active === o.value
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
