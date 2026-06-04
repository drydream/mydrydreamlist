---
target: home
total_score: 26
p0_count: 0
p1_count: 0
timestamp: 2026-06-04T16-16-28Z
slug: app-home-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Progress update has no save confirmation; realtime WebSocket has no connection indicator |
| 2 | Match System / Real World | 3 | Natural language throughout; "Admin" for category management is slightly opaque |
| 3 | User Control and Freedom | 3 | Modal exits work well; no reset-all-filters shortcut; no bulk undo |
| 4 | Consistency and Standards | 3 | Mostly cohesive; Edit modal uses text input for progress while card uses +/- |
| 5 | Error Prevention | 3 | Delete confirmation step exists; no URL validation on image/link fields |
| 6 | Recognition Rather Than Recall | 2 | Admin link near-invisible; type dots unlabeled at card level |
| 7 | Flexibility and Efficiency | 2 | No title search, no keyboard shortcuts, no sort control, no bulk operations |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and poster-forward; minor: filter row uppercase labels add noise |
| 9 | Error Recovery | 2 | Raw Supabase error.message exposed; no retry action |
| 10 | Help and Documentation | 2 | Empty state teaches the Add action; no other help (appropriate for personal tool) |
| **Total** | | **26/40** | **Acceptable** |

## Anti-Patterns Verdict

LLM assessment: Not obviously AI-generated. The blurred poster fill + object-contain technique is distinctive. The violet-on-zinc palette is used with restraint. Main tell: section group header pattern (colored pill + label + h-px divider line) reads as a common dark-mode template even though it works here.

Deterministic scan: 2 findings, both false positives. text-zinc-300 on bg-red-600 (line 148) and text-zinc-500 on bg-violet-600 (line 196) — both have hover:text-white overrides so the gray text never appears on the colored background simultaneously.

## Overall Impression

The poster gallery is the right affordance for this content. What undermines it most is the missing search function and the CSS vars/hardcoded-utilities split.

## What's Working

1. The blurred poster fill — two-layer image stack (blurred fill + object-contain) makes cards feel cinematic.
2. Hover-reveal for card actions — opacity-0 at rest preserves the gallery feel.
3. Optimistic progress update — instant +/- feedback with no spinner.

## Priority Issues

**[P2] No title search**
- Why: Browse-only navigation breaks at 80+ items. Can't find a specific title without scrolling.
- Fix: Add search input to filter bar, URL-param driven (?search=). Filter items by title in RealtimeDashboard before grouping.
- Command: /impeccable craft search

**[P2] CSS vars describe a light theme that's never applied**
- Why: globals.css :root sets --background: oklch(1 0 0) (pure white). html element never gets .dark class. Any shadcn component added without explicit overrides renders white on near-black.
- Fix: Add className="dark" to the html element in app/layout.tsx (line 25).
- Command: /impeccable polish

**[P2] Raw database error message exposed**
- Why: dashboard.tsx:29 renders {error.message} — could show PostgreSQL internals.
- Fix: Replace with "Failed to load your list - check your connection and refresh." Add retry button.
- Command: /impeccable harden

**[P3] Admin link near-invisible**
- Why: text-xs text-zinc-500 on bg-zinc-950 fails WCAG AA contrast for small text.
- Fix: Bump to text-zinc-400 minimum.
- Command: /impeccable polish

**[P3] No Esc key dismissal on modals**
- Why: Standard UX expectation for a frequently used tool.
- Fix: Add keydown Escape listener in both AddItemForm and EditItemModal.
- Command: /impeccable harden

## Persona Red Flags

Alex (Power User): No keyboard shortcuts; progress +/- requires individual hover-then-click per card; no search; no sort.

Casey (HA Panel User): Progress +/- buttons 20x20px (below 44pt minimum); card actions hover-only (requires two taps on touch); Admin link untappable; + Add button in top-right (poor thumb zone).

Project persona (Owner at Wall Panel): 20x20px touch targets for most frequent action; hover-dependent card editing; no search.

## Minor Observations

- Conditional - button causes layout shift at progress=0; disabled state would be cleaner.
- Filter bar appears/disappears as options change — could be jarring on mobile.
- No prefers-reduced-motion handling for card hover transitions.
- Metadata description may drift if custom categories expand beyond anime/manga/series.
