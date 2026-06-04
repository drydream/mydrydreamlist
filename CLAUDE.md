# myDryDrEaMlist — Claude Context

## Git Workflow
Always commit and push to a **new branch** (e.g. `feat/admin-categories`, `fix/image-fit`). Never push directly to `main`. Only merge to main when user explicitly says "merge to main".

## Stack
- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/base-ui components
- **DB:** Supabase PostgreSQL — service-role client (RLS not used), Realtime subscriptions active
- **Auth:** Single hardcoded password in `lib/actions/auth.ts` → sets `localStorage['session']` timestamp → 40-min idle timeout via `SessionGuard`
- **Deploy:** Vercel (auto-deploy from `main`), `vercel.json` sets `X-Frame-Options: ALLOWALL` for HA iframe

## Routes
| Path | Description |
|------|-------------|
| `/` | Password login page |
| `/home` | Main dashboard — protected by `SessionGuard` |
| `/admin` | Category/status manager — protected by `SessionGuard` |

## Key Files
```
app/
  page.tsx                  # Login page (client)
  home/page.tsx             # Dashboard page — fetches categories, passes to children
  admin/page.tsx            # Admin page — CRUD for categories/statuses

lib/
  actions/auth.ts           # verifyPassword() server action, password = 'Iydgtvot2'
  actions/items.ts          # addItem / updateItem / updateProgress / deleteItem
  actions/categories.ts     # getCategories / addCategory / updateCategory / deleteCategory
  colors.ts                 # COLOR_MAP (12 colors, static Tailwind classes — never use dynamic class names)
  session.ts                # IDLE_TIMEOUT_MS = 2_400_000 (40 min)
  supabase/client.ts        # Browser Supabase singleton
  supabase/server.ts        # createServiceClient() — used in all server actions

components/
  session-guard.tsx         # Client — checks localStorage, redirects to / if expired
  add-form/add-item-form.tsx        # Add item modal — receives types/statuses as props
  dashboard/dashboard.tsx           # Server — fetches items + passes categories down
  dashboard/realtime-dashboard.tsx  # Client — Realtime sub, filtering, dynamic groups, connection status
  dashboard/media-card.tsx          # Card UI — blurred bg + contained image, overlay title
  dashboard/filter-bar.tsx          # Type/status/year filter pills + debounced title search
  dashboard/edit-item-modal.tsx     # Edit item modal — receives types/statuses as props
  admin/category-manager.tsx        # Admin CRUD UI — inline add/edit/delete, color picker
```

## Database Tables
- **`items`** — `id, title, image_url, url, type(text), status(text), progress(numeric), total(numeric), updated_at`
- **`categories`** — `id, kind('type'|'status'), value(slug), label, color(key), sort_order, type_filter(text[]), created_at`
  - `type_filter = []` means applies to all types; non-empty scopes status to specific type values
  - `color` is a key into `COLOR_MAP` in `lib/colors.ts` (never store raw Tailwind class)

## Data Flow
```
app/home/page.tsx (server)
  → getCategories() → splits into types[] + statuses[]
  → <AddItemForm types statuses />        (client, modal)
  → <Dashboard filters categories />      (server)
      → fetches items from Supabase
      → <RealtimeDashboard initialItems typeCategories statusCategories filters />  (client)
          → Realtime subscription on items table (tracks SUBSCRIBED / CHANNEL_ERROR status)
          → builds colorMaps, groups, filter options from categories
          → <FilterBar typeOptions statusOptions availableYears />  (handles search + filter URL params)
          → <MediaCard item dotColor statusLabel statusText types statuses />
              → <EditItemModal item types statuses />
```

## Important Patterns
- **No `revalidatePath` on progress updates** — iOS Safari ITP blocks cross-site cookies inside HA iframe; optimistic UI handles it client-side (see Architecture trade-offs below)
- **Category fallback** — `getCategories()` returns hardcoded defaults if `categories` table missing (never throws)
- **Color classes** — All Tailwind color classes must exist statically in `lib/colors.ts`; DB stores color key (`'violet'`), not class string
- **`type_filter`** on statuses — filter statuses in forms with: `statuses.filter(s => !s.type_filter?.length || s.type_filter.includes(selectedType))`
- **Progress** — stored as NUMERIC(8,2), supports decimals (e.g. game version 0.7)
- **Total field** — removed from UI; column still exists in DB but not used
- **Dark theme** — `className="dark"` is set on `<html>` in `app/layout.tsx` so shadcn CSS vars resolve to dark-mode values; the UI also hardcodes zinc utility classes directly — both must stay in sync when adding shadcn components

## Architecture — Deliberate Trade-offs

- **Optimistic progress updates** — `handleIncrement` / `handleDecrement` in `media-card.tsx` call `setDisplayProgress` immediately and fire `updateProgress()` without awaiting the result. This keeps the UI responsive for continuous wall-panel use. iOS Safari ITP prevents cross-site cookies inside the HA iframe, making server-round-trip approaches unreliable. Consequence: a silent write failure will revert on next page load with no user signal. Accepted trade-off; do not add `await` or `revalidatePath` here.

- **Dashboard error fallback** — `dashboard.tsx` renders a friendly message ("Failed to load your list — check your connection and refresh.") with a `window.location.reload()` Retry button on Supabase fetch failure. Never render `error.message` directly — it can expose raw PostgreSQL or connection strings. If `dashboard.tsx` ever becomes a server component again, replace `window.location.reload()` with a server-action re-fetch.

- **Motion suppression** — `app/globals.css` includes a global `@media (prefers-reduced-motion: reduce)` block that collapses all transition and animation durations to `0.01ms`. All purposeful animations (card hover lift, realtime indicator pulse) are covered by this rule. New animations do not need individual reduced-motion overrides.

## HA Wall Panel Standards

The app runs as a Home Assistant iframe on a wall-mounted touch tablet. Pointer input is coarse, arm's-length, and one-handed. Apply these constraints to any new interactive element:

- **Touch targets** — High-frequency actions must be at least `h-7 w-7` (28×28px). The progress `+` / `−` buttons in the card bottom bar use this size. Lower-frequency actions (modal close `×`, filter pills) may be smaller but must still be tappable without zoom.

- **Touch visibility** — Card actions (edit, delete, external link) are hidden on hover-capable devices (`opacity-0 group-hover:opacity-100`) but permanently visible on touch-primary devices. Implemented via `[@media(hover:none)]:opacity-100` on the action group container. Use this pattern — not a breakpoint — whenever toggling hover-revealed elements: it targets pointer capability, not screen size.

- **Search** — Implemented as a 200ms debounced URL parameter (`?search=`). The input has an inline `×` clear button (rendered when `searchInput.length > 0`) that clears local state; the debounce handles the URL update automatically. The no-results empty state renders a contextual message quoting the current query. Filter pill rows remain separate from search and continue to be controlled by `?type=`, `?status=`, and `?year=` params.

- **Modals** — Both `AddItemForm` and `EditItemModal` close on `Escape` via a `keydown` listener (registered only when the modal is open, cleaned up on unmount). Click-outside on the backdrop also closes. This makes modals dismissible without reaching for an `×` button.

## Design Tooling

The project uses the **Impeccable** skill for design work. Key commands:

| Command | When to use |
|---------|-------------|
| `/impeccable document` | Regenerate `DESIGN.md` and `.impeccable/design.json` after visual changes to sync the design spec with the actual code |
| `/impeccable critique home` | Run a full heuristic UX audit against Nielsen's 10 heuristics + automated anti-pattern detection. Persists scores to `.impeccable/critique/` for trend tracking |
| `/impeccable live` | Start in-browser variant mode — pick elements, generate visual alternatives in-place via HMR. Requires `npm run dev` running first |

Design context lives in `PRODUCT.md` (strategy, register, anti-references) and `DESIGN.md` (tokens, components, named rules). Every Impeccable command reads these files before doing any work.
