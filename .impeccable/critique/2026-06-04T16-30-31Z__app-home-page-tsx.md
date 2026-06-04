---
target: home
total_score: 30
p0_count: 0
p1_count: 0
timestamp: 2026-06-04T16-30-31Z
slug: app-home-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Realtime indicator closes WebSocket gap; optimistic progress is deliberate (CLAUDE.md) |
| 2 | Match System / Real World | 3 | Natural language throughout |
| 3 | User Control and Freedom | 3 | Touch card actions; no reset-all-filters, no undo-delete |
| 4 | Consistency and Standards | 3 | Dark vars aligned; Edit modal progress input vs card +/- |
| 5 | Error Prevention | 3 | Delete confirmation; no URL validation |
| 6 | Recognition Rather Than Recall | 3 | Search + clear button; Admin link visible |
| 7 | Flexibility and Efficiency | 3 | Search + touch access; no keyboard shortcut for Add; no sort |
| 8 | Aesthetic and Minimalist Design | 3 | Gallery clean; realtime indicator appropriately subtle |
| 9 | Error Recovery | 3 | Friendly error + Retry |
| 10 | Help and Documentation | 2 | Good empty state; no help (appropriate) |
| **Total** | | **30/40** | **Good** |

Correction from run 2: 29/40 is "Good" band (28-35), not "Acceptable". That label was wrong.

## Anti-Patterns Verdict

LLM: Not AI-generated. Realtime indicator: amber dot + one-line sentence. Correct restraint.

Detector: Same 2 false positives for third consecutive run. Hover-state class conflicts, not real issues.

## Overall Impression

Three rounds: 26 -> 29 -> 30. Search + clear, visible touch actions, larger progress buttons, realtime status indicator, dark CSS var alignment all shipped. What remains is optional improvements.

## What's Working

1. Realtime indicator: amber dot + minimal copy, visible only when broken. Right ratio of alarm to signal.
2. Touch access on card actions: @media(hover:none) targets pointer-coarse devices without a breakpoint.
3. Progress buttons at 28px: 40% larger hit area for wall panel use.

## Priority Issues

**[P3] No keyboard shortcut to open Add modal**
- Why: Mouse-required action in the core loop. n or / key would let power users add without lifting hands.
- Fix: useEffect keydown on document, check e.key === 'n' when no modal open and no input focused.
- Command: /impeccable harden

**[P3] Optimistic progress save has no failure surface**
- Why: updateProgress called without awaiting result. Silent failure would revert on page reload with no user signal.
- Fix: try/catch in handleIncrement/handleDecrement. On catch, revert displayProgress and show brief inline error state.
- Command: /impeccable harden

**[P3] No sort control**
- Why: Always updated_at desc. Bumping old title jumps it to top. Grows in friction as list expands.
- Fix: Sort selector in filter bar, URL-param driven (?sort=alpha|updated|progress).
- Command: /impeccable craft sort control

## Persona Red Flags

Alex: Improved significantly. Remaining: no keyboard shortcut for Add; no sort.

Wall Panel Owner: 28px progress buttons better. Card actions touch-accessible. + Add button still in top-right (hardest thumb-zone position). Floating + in bottom-right would serve the primary use case better.

## Minor Observations

- animate-pulse suppressed by prefers-reduced-motion (global CSS). Static amber dot in reduced-motion contexts is still communicative.
- window.location.reload() would need replacement if dashboard.tsx ever moves to client-side fetch.
- + Add button in top-right is the most-used action in the least-reachable position for one-handed wall panel use.
