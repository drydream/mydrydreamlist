---
target: home
total_score: 29
p0_count: 0
p1_count: 0
timestamp: 2026-06-04T16-24-14Z
slug: app-home-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Realtime WebSocket has no connection indicator |
| 2 | Match System / Real World | 3 | Natural language throughout; Admin link now readable |
| 3 | User Control and Freedom | 3 | Esc + click-outside + X on modals; no reset-all-filters |
| 4 | Consistency and Standards | 3 | Dark CSS vars now match hardcoded UI; disabled - button stabilizes layout |
| 5 | Error Prevention | 3 | Delete confirmation good; no URL validation |
| 6 | Recognition Rather Than Recall | 3 | Search makes titles findable; Admin link visible at zinc-400 |
| 7 | Flexibility and Efficiency | 3 | Search implemented; no keyboard shortcut to open Add; no sort |
| 8 | Aesthetic and Minimalist Design | 3 | Search integrates cleanly; gallery is poster-forward |
| 9 | Error Recovery | 3 | Friendly error message + Retry button |
| 10 | Help and Documentation | 2 | Good empty state; no help otherwise (appropriate) |
| **Total** | | **29/40** | **Acceptable** |

## Anti-Patterns Verdict

LLM: Not AI-generated in feel. Poster gallery remains distinctive. Search input lands cleanly without chrome weight.

Detector: Same 2 false positives as run 1 (hover-state class matching, not real issues). Lines shifted due to - button edit.

## Overall Impression

Three P2 issues fixed. Score moved 26->29. Meaningful jump from search, friendly errors, and Esc modal dismiss. One remaining meaningful gap: HA wall panel touch targets are too small for the primary interaction (progress +/-).

## What's Working

1. Search lands right — max-w-xs input, 200ms debounce, contextual empty state. Clean.
2. Error state is a complete interaction — friendly copy + Retry button.
3. Disabled - button — visible and dimmed at progress=0 eliminates layout shift.

## Priority Issues

**[P2] Touch targets too small for HA wall panel context**
- Progress +/- buttons: h-5 w-5 (20x20px) - below 44pt/48dp minimum.
- Card actions (edit/delete/link): hover-only, two taps needed on touch.
- Fix: Bump +/- to h-7 w-7 (28px). Use @media (hover: none) to show card actions statically on touch devices.
- Command: /impeccable adapt home

**[P3] Search has no clear affordance**
- No x button to clear search. On wall tablet, deleting input text is friction.
- Fix: Render x button inside input when searchInput.length > 0. setSearchInput('') on click.
- Command: /impeccable polish

**[P3] Realtime subscription has no connection indicator**
- Silent disconnect in HA iframe proxy environment.
- Fix: Track channel.subscribe status. Show amber dot on CHANNEL_ERROR/CLOSED.
- Command: /impeccable harden

## Persona Red Flags

Alex: Search available now. Esc works. Still: no keyboard shortcut to open Add; no bulk progress update.

Casey/Wall Panel: Search input usable. 20x20px +/- buttons still undersized for primary daily interaction. Card edit/delete hover-only = two taps minimum.

## Minor Observations

- EditItemModal useEffect Esc handler: onClose intentionally not in dep array (correct behavior). ESLint exhaustive-deps will flag it.
- window.location.reload() in Retry safe now (onClick only), would fail SSR if dashboard.tsx ever becomes a Server Component again.
