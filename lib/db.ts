import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const SCHEMA = `
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
`

const ALL_TYPES = ['anime', 'manga', 'movie', 'other']
const SEED: [string, string, string, string, number, string[]][] = [
  ['type',   'anime',         'Anime',     'violet',  0, []],
  ['type',   'manga',         'Manga',     'emerald', 1, []],
  ['type',   'movie',         'Movie',     'blue',    2, []],
  ['type',   'other',         'Other',     'zinc',    3, []],
  ['status', 'watching',      'Watching',  'violet',  0, ['anime', 'movie']],
  ['status', 'reading',       'Reading',   'emerald', 1, ['manga']],
  ['status', 'completed',     'Completed', 'green',   2, ALL_TYPES],
  ['status', 'on_hold',       'On Hold',   'yellow',  3, ALL_TYPES],
  ['status', 'dropped',       'Dropped',   'red',     4, ALL_TYPES],
  ['status', 'plan_to_watch', 'Planning',  'zinc',    5, ALL_TYPES],
]

const g = globalThis as unknown as { __db?: DatabaseSync }

export function getDb(): DatabaseSync {
  if (!g.__db) {
    const path = process.env.DB_PATH ?? 'data/list.db'
    mkdirSync(dirname(path), { recursive: true })
    const db = new DatabaseSync(path)
    db.exec('PRAGMA journal_mode = WAL')
    db.exec(SCHEMA)

    const { n } = db.prepare('SELECT COUNT(*) AS n FROM categories').get() as { n: number }
    if (n === 0) {
      const insert = db.prepare(
        'INSERT INTO categories (id, kind, value, label, color, sort_order, type_filter, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      const now = new Date().toISOString()
      for (const [kind, value, label, color, sort_order, type_filter] of SEED) {
        insert.run(crypto.randomUUID(), kind, value, label, color, sort_order, JSON.stringify(type_filter), now)
      }
    }

    g.__db = db
  }
  return g.__db
}
