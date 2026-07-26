# myDryDrEaMlist — Claude Context

## Git Workflow
Always commit and push to a **new branch** (e.g. `feat/admin-categories`, `fix/image-fit`). Never push directly to `main`. Only merge to main when user explicitly says "merge to main".

## Stack
- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/base-ui components
- **DB:** SQLite via Node's built-in `node:sqlite` (`DatabaseSync`), single file at `data/list.db` (path from `DB_PATH` env var). No dependency — Node 24+ required.
- **Auth:** None — single-user app, LAN-only. Never expose this app outside the LAN (no tunnels/reverse proxies to the public internet).
- **Deploy:** Self-hosted Docker container on NAS (`docker-compose.yml`), `next.config.ts` sets `output: 'standalone'` and `X-Frame-Options: ALLOWALL` for HA iframe embedding.

## Routes
| Path | Description |
|------|-------------|
| `/` | Redirects to `/home` |
| `/home` | Main dashboard |
| `/admin` | Category/status manager |

## Key Files
```
app/
  page.tsx                  # Redirects to /home
  home/page.tsx             # Dashboard page — fetches categories, passes to children
  admin/page.tsx            # Admin page — CRUD for categories/statuses

lib/
  db.ts                     # getDb() — lazy-opened node:sqlite singleton, schema + seed
  actions/items.ts          # addItem / updateItem / updateProgress / deleteItem
  actions/categories.ts     # getCategories / addCategory / updateCategory / deleteCategory
  colors.ts                 # COLOR_MAP (12 colors, static Tailwind classes — never use dynamic class names)

components/
  add-form/add-item-form.tsx        # Add item modal — receives types/statuses as props
  dashboard/dashboard.tsx           # Server — fetches items + passes categories down
  dashboard/realtime-dashboard.tsx  # Client — 30s polling refresh, filtering, dynamic groups
  dashboard/media-card.tsx          # Card UI — blurred bg + contained image, overlay title
  dashboard/filter-bar.tsx          # Type/status/year filter pills + debounced title search
  dashboard/edit-item-modal.tsx     # Edit item modal — receives types/statuses as props
  admin/category-manager.tsx        # Admin CRUD UI — inline add/edit/delete, color picker
```

## Database Tables
- **`items`** — `id, title, image_url, url, type(text), status(text), progress(numeric), total(numeric), updated_at`
- **`categories`** — `id, kind('type'|'status'), value(slug), label, color(key), sort_order, type_filter(JSON text array), created_at`
  - `type_filter` is the set of type values a status applies to (**strict** — empty means the status applies to *no* type and is required non-empty for statuses)
  - `color` is a key into `COLOR_MAP` in `lib/colors.ts` (never store raw Tailwind class)
  - `type_filter` is stored as a JSON string column in SQLite; `lib/actions/categories.ts` parses/stringifies it at the boundary — the TS `Category` type still exposes `type_filter: string[]`

## Data Flow
```
app/home/page.tsx (server)
  → getCategories() → splits into types[] + statuses[]
  → <AddItemForm types statuses />        (client, modal)
  → <Dashboard filters categories />      (server)
      → fetches items from SQLite via lib/db.ts
      → <RealtimeDashboard initialItems typeCategories statusCategories filters />  (client)
          → 30s poll (router.refresh()) + refresh on tab visibilitychange
          → builds colorMaps, groups, filter options from categories
          → <FilterBar typeOptions statusOptions availableYears />  (handles search + filter URL params)
          → <MediaCard item dotColor statusLabel statusText types statuses />
              → <EditItemModal item types statuses />
```

## Important Patterns
- **Category fallback** — none needed; `getDb()` creates the schema and seeds default categories on first run if the table is empty
- **Color classes** — All Tailwind color classes must exist statically in `lib/colors.ts`; DB stores color key (`'violet'`), not class string
- **`type_filter`** on statuses — **strict scoping**: a status applies to a type *only* if `type_filter.includes(type)`. There is no "empty = all" escape hatch. Filter statuses in forms with: `statuses.filter(s => s.type_filter?.includes(selectedType))`; filter pills with `!filters.type || c.type_filter.includes(filters.type)`. Admin requires ≥1 type per status (the "All" button sets every type value explicitly). Consequence: a status scoped to "all" via explicit list will *not* auto-include a type added later — re-assign it in Admin.
- **Progress** — stored as REAL, supports decimals (e.g. game version 0.7)
- **Total field** — removed from UI; column still exists in DB but not used
- **Dark theme** — `className="dark"` is set on `<html>` in `app/layout.tsx` so shadcn CSS vars resolve to dark-mode values; the UI also hardcodes zinc utility classes directly — both must stay in sync when adding shadcn components
- **`node:sqlite` binds** — throws on `undefined` bind values; partial updates in `items.ts`/`categories.ts` filter out `undefined` entries before building the dynamic `SET` clause
- **`force-dynamic`** — `/home` and `/admin` export `dynamic = 'force-dynamic'` so `next build` never prerenders them and opens/bakes a DB into the Docker image

## Architecture — Deliberate Trade-offs

- **Polling instead of realtime** — the app is single-user/LAN-only now, so cross-device sync (wall panel + phone) is handled by a 30s `router.refresh()` interval plus a refresh on `visibilitychange` in `realtime-dashboard.tsx`, instead of a push-based subscription. Optimistic local state in `media-card.tsx` keeps the UI snappy between polls.

- **Optimistic progress updates** — `handleIncrement` / `handleDecrement` in `media-card.tsx` call `setDisplayProgress` immediately and fire `updateProgress()` without awaiting the result, keeping the UI responsive for continuous wall-panel use. `updateProgress` deliberately skips `revalidatePath` — rapid taps would otherwise trigger a burst of RSC refetches whose out-of-order responses can snap the counter backward mid-tap. The 30s poll covers cross-device sync instead. `addItem`/`updateItem`/`deleteItem` still revalidate immediately since those aren't rapid-fire actions.

- **Motion suppression** — `app/globals.css` includes a global `@media (prefers-reduced-motion: reduce)` block that collapses all transition and animation durations to `0.01ms`. All purposeful animations (card hover lift, realtime indicator pulse) are covered by this rule. New animations do not need individual reduced-motion overrides.

## Deploy (NAS)
- Container lives at `/volume1/docker/myprivatelist` on the NAS, port `3210`, data volume mounted at `./data:/data`.
- Redeploy: `git pull && docker compose up -d --build` from that directory.
- The SQLite file (`data/list.db`) **is** the app's entire data store — back it up.

## HA Wall Panel Standards

The app runs as a Home Assistant iframe on a wall-mounted touch tablet (LAN-only, pointed at `http://<nas-lan-ip>:3210/home`). Pointer input is coarse, arm's-length, and one-handed. Apply these constraints to any new interactive element:

- **Touch targets** — High-frequency actions must be at least `h-7 w-7` (28×28px). The progress `+` / `−` buttons in the card bottom bar use this size. Lower-frequency actions (modal close `×`, filter pills) may be smaller but must still be tappable without zoom.

- **Touch visibility** — Card actions (edit, delete, external link) are hidden on hover-capable devices (`opacity-0 group-hover:opacity-100`) but permanently visible on touch-primary devices. Implemented via `[@media(hover:none)]:opacity-100` on the action group container. Use this pattern — not a breakpoint — whenever toggling hover-revealed elements: it targets pointer capability, not screen size.

- **Search** — Implemented as a 200ms debounced URL parameter (`?search=`). The input has an inline `×` clear button (rendered when `searchInput.length > 0`) that clears local state; the debounce handles the URL update automatically. The no-results empty state renders a contextual message quoting the current query. Filter pill rows remain separate from search and continue to be controlled by `?type=`, `?status=`, and `?year=` params.

- **Modals** — Both `AddItemForm` and `EditItemModal` close on `Escape` via a `keydown` listener (registered only when the modal is open, cleaned up on unmount). Click-outside on the backdrop also closes. This makes modals dismissible without reaching for an `×` button.
