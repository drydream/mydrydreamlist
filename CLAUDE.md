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
  dashboard/realtime-dashboard.tsx  # Client — Realtime sub, filtering, dynamic groups
  dashboard/media-card.tsx          # Card UI — blurred bg + contained image, overlay title
  dashboard/filter-bar.tsx          # Type/status/year filter pills
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
      → <RealtimeDashboard initialItems typeCategories statusCategories />  (client)
          → Realtime subscription on items table
          → builds colorMaps, groups, filter options from categories
          → <FilterBar typeOptions statusOptions availableYears />
          → <MediaCard item dotColor statusLabel statusText types statuses />
              → <EditItemModal item types statuses />
```

## Important Patterns
- **No `revalidatePath` on progress updates** — iOS Safari ITP blocks cross-site cookies inside HA iframe; optimistic UI handles it client-side
- **Category fallback** — `getCategories()` returns hardcoded defaults if `categories` table missing (never throws)
- **Color classes** — All Tailwind color classes must exist statically in `lib/colors.ts`; DB stores color key (`'violet'`), not class string
- **`type_filter`** on statuses — filter statuses in forms with: `statuses.filter(s => !s.type_filter?.length || s.type_filter.includes(selectedType))`
- **Progress** — stored as NUMERIC(8,2), supports decimals (e.g. game version 0.7)
- **Total field** — removed from UI; column still exists in DB but not used
