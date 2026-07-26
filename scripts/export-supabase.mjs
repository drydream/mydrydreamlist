// One-off migration: pull items + categories out of Supabase and write data/list.db.
// Run: node --env-file=.env.local scripts/export-supabase.mjs
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')

const headers = { apikey: key, Authorization: `Bearer ${key}` }

async function fetchTable(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*`, { headers })
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`)
  return res.json()
}

const [items, categories] = await Promise.all([fetchTable('items'), fetchTable('categories')])

mkdirSync('data', { recursive: true })
const db = new DatabaseSync('data/list.db')
db.exec(`
CREATE TABLE IF NOT EXISTS items (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  image_url  TEXT,
  url        TEXT,
  type       TEXT NOT NULL,
  status     TEXT NOT NULL,
  progress   REAL NOT NULL DEFAULT 0,
  total      REAL,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  value       TEXT NOT NULL,
  label       TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT 'zinc',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  type_filter TEXT NOT NULL DEFAULT '[]',
  created_at  TEXT NOT NULL,
  UNIQUE(kind, value)
);
`)

const insertItem = db.prepare(
  'INSERT OR REPLACE INTO items (id, title, image_url, url, type, status, progress, total, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
)
for (const row of items) {
  insertItem.run(
    row.id,
    row.title,
    row.image_url ?? null,
    row.url ?? null,
    row.type,
    row.status,
    row.progress ?? 0,
    row.total ?? null,
    row.updated_at ?? new Date().toISOString()
  )
}

const insertCategory = db.prepare(
  'INSERT OR REPLACE INTO categories (id, kind, value, label, color, sort_order, type_filter, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
)
for (const row of categories) {
  insertCategory.run(
    row.id,
    row.kind,
    row.value,
    row.label,
    row.color,
    row.sort_order,
    JSON.stringify(row.type_filter ?? []),
    row.created_at
  )
}

console.log(`items: ${items.length}, categories: ${categories.length}`)
