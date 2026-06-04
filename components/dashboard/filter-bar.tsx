'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X } from 'lucide-react'

interface FilterBarProps {
  typeOptions:    { value: string; label: string }[]
  statusOptions:  { value: string; label: string }[]
  availableYears: number[]
}

export function FilterBar({ typeOptions, statusOptions, availableYears }: FilterBarProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const activeType   = searchParams.get('type')   ?? ''
  const activeStatus = searchParams.get('status') ?? ''
  const activeYear   = searchParams.get('year')   ?? ''
  const activeSearch = searchParams.get('search') ?? ''

  const [searchInput, setSearchInput] = useState(activeSearch)

  useEffect(() => {
    setSearchInput(activeSearch)
  }, [activeSearch])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const timer = setTimeout(() => {
      if (searchInput) params.set('search', searchInput)
      else params.delete('search')
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, 200)
    return () => clearTimeout(timer)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get(key) === value) params.delete(key)
    else params.set(key, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const hasFilterPills = typeOptions.length > 1 || statusOptions.length > 1 || availableYears.length > 1

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative w-full max-w-xs">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search titles…"
          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-1.5 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 pr-7"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {hasFilterPills && (
        <>
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
        </>
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
