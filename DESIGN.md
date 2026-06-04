---
name: myDryDrEaMlist
description: A personal media archive — atmospheric, private, and obsessively precise.
colors:
  void: "oklch(0.145 0 0)"
  surface: "oklch(0.205 0 0)"
  raised: "oklch(0.27 0 0)"
  border: "oklch(0.37 0 0)"
  ink: "oklch(0.967 0 0)"
  ink-muted: "oklch(0.70 0 0)"
  ink-dim: "oklch(0.44 0 0)"
  lamp: "oklch(0.541 0.281 293)"
  lamp-bright: "oklch(0.606 0.250 292)"
  lamp-glow: "oklch(0.702 0.197 292)"
  danger: "oklch(0.577 0.245 27)"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.05em"
  micro:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  pill: "9999px"
  card: "1rem"
  panel: "0.75rem"
  action: "0.5rem"
  control: "0.375rem"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "32px"
components:
  button-primary:
    backgroundColor: "{colors.lamp}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  button-primary-hover:
    backgroundColor: "{colors.lamp-bright}"
    textColor: "{colors.ink}"
  chip-filter:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  chip-filter-active:
    backgroundColor: "{colors.lamp}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  card-media:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "0"
  input-field:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
---

# Design System: myDryDrEaMlist

## 1. Overview

**Creative North Star: "The Archive at Midnight"**

This is a private library at 2am: dark, still, and full of cover art you collected deliberately. The interface is not chrome — it is a dark room that makes the posters glow. The `void` surface absorbs light. The `lamp` color is a single violet lamp in the corner. Every card is a title you chose.

The system rejects noise in every form. No social signals, no global rankings, no hero banners, no commercial carousels. Nothing reads as a streaming service selling you something or a community tracker where your taste is on display. It is a personal index — a notebook with images. The user is the only audience.

Atmosphere here is structural, not decorative. The blurred poster-fill behind each card, the gradient overlay that brings titles forward, the `lamp` accent that appears only on active states — these are load-bearing decisions. If an element does not intensify the imagery or serve the task, it does not belong in this product.

**Key Characteristics:**
- Near-black depth: page bg at lightness 0.145, cards at 0.205 — genuine darkness, not dark gray
- Single accent color: `lamp` (violet-600) used for primary CTAs, selected states, and focus rings only — rarity is the point
- Content-forward: poster art covers the entire card face; UI chrome overlays, never sits adjacent
- Micro typography on cards: 9–11px — compact, invisible until needed, never competing with imagery
- Flat by default: tonal layering separates surfaces; shadows appear only as state responses

## 2. Colors: The Midnight Palette

A monochromatic zinc foundation — genuine darkness without the blue-cool cast of slate or the warmth of stone — punctuated by one violet lamp that earns its place by appearing nowhere it isn't needed.

### Primary
- **The Lamp** (`oklch(0.541 0.281 293)` — violet-600): Used exclusively on primary action buttons, active filter pills, and focus rings. Its rarity is deliberate — it means "take action here" because it appears nowhere else. Never use as decoration, hover shimmer, or background tint.
- **The Lamp Bright** (`oklch(0.606 0.250 292)` — violet-500): Lamp hover state only. Lighter, same hue.
- **The Lamp Glow** (`oklch(0.702 0.197 292)` — violet-400): Text-weight accent — status label text color variant when a category is assigned violet in `COLOR_MAP`.

### Neutral
- **Void** (`oklch(0.145 0 0)` — zinc-950): The page background. Absolute dark. Cards float in it; nothing else does.
- **Surface** (`oklch(0.205 0 0)` — zinc-900): All card and panel surfaces — media cards, the login form, modal bodies.
- **Raised** (`oklch(0.27 0 0)` — zinc-800): Input backgrounds and elevated surfaces within panels.
- **Border** (`oklch(0.37 0 0)` — zinc-700): Card borders at rest, input strokes. Card border shifts lighter on hover.
- **Ink** (`oklch(0.967 0 0)` — zinc-100): Primary text — titles, form values, overlaid card text.
- **Ink Muted** (`oklch(0.70 0 0)` — zinc-400): Secondary text — status labels, filter pill text, secondary context.
- **Ink Dim** (`oklch(0.44 0 0)` — zinc-600): Tertiary — filter row labels, timestamps below absolute dates, hint text.

### Named Rules

**The One Lamp Rule.** The violet accent appears on ≤3 elements on any given screen: the primary CTA, the active filter pill, and the focus ring. A fourth violet element means one of those three should not be violet.

**The Rarity Rule.** Never tint hover states, idle borders, or card backgrounds toward violet. The lamp matters because it is the only chromatic element in the UI chrome. Category dots and status text use `COLOR_MAP` colors — these are content signals, not brand signals. They live on the data, not the chrome.

## 3. Typography

**Primary Font:** Geist Sans (with `system-ui, sans-serif` fallback)
**Mono Font:** Geist Mono (with `ui-monospace, monospace` fallback)

**Character:** Clean geometric sans — legible at micro sizes, neutral at text sizes. The mono variant carries progress counters with tabular alignment, preventing number columns from jumping as values change.

### Hierarchy

- **Display** (700 weight, 1.5rem / 24px, leading 1.2): App title "myDryDrEaMlist" in the page header. One instance per view; not reused for section headings.
- **Title** (600 weight, 1rem / 16px, leading 1.4): Section group headings ("Anime", "Manga"). Paired with the colored accent pill; never used for card titles.
- **Body** (400 weight, 0.875rem / 14px, leading 1.5): Form labels, modal text, inline error messages, the "Add entry" modal header.
- **Label** (400 weight, 0.75rem / 12px, tracking 0.05em): Filter pill text, select option labels, small UI chrome. Uppercase only for filter row labels ("TYPE", "STATUS") — never for content.
- **Micro** (600 weight, 0.6875rem / 11px, leading 1.3): Card title overlays. Semibold so it reads against poster-blur at small scale. Two-line max via `line-clamp-2`.
- **Mono** (600 weight, 0.6875rem / 11px, tabular-nums): Progress counters. Geist Mono, not Geist Sans. Tabular alignment so the counter column holds position.

### Named Rules

**The Micro Ceiling Rule.** The absolute readable floor in this system is 9px (0.5625rem), used only for purely secondary context (relative timestamps: "Today", "3d ago"). Never use sub-9px for interactive or actionable text. Never use micro weight below 600 against a dark background — it disappears.

## 4. Elevation

This system uses tonal layering as its depth language. Surfaces are separated by discrete lightness steps (void 0.145 → surface 0.205 → raised 0.27), not by shadows. Shadows are state-exclusive.

### Shadow Vocabulary

- **Card hover lift** (`box-shadow: 0 25px 50px -12px oklch(0 0 0 / 60%)`): Applied on card `:hover` only. Not present at rest. Paired with a -2px vertical translate. Signals interactivity; does not imply permanent hierarchy.
- **Modal drop** (`box-shadow: 0 25px 50px -12px oklch(0 0 0 / 60%)`): Modal panel above the `black/70 backdrop-blur-sm` overlay. The backdrop does more work than the shadow; the shadow adds the final lift.

### Named Rules

**The Flat-by-Default Rule.** Every surface is flat at rest. A card with a shadow at rest is trying to be more important than its content. Shadows respond to state; they do not establish hierarchy.

## 5. Components

### Buttons

The system has one primary button shape: the violet CTA.

- **Shape:** Gently curved edges (0.375rem / 6px — `rounded-md`)
- **Primary:** Lamp violet background (`oklch(0.541 0.281 293)`), white text (`oklch(0.985 0 0)`), 6px / 12px padding, 0.875rem body weight 500
- **Hover:** Shifts to lamp-bright (`oklch(0.606 0.250 292)`), 150ms `transition-colors`
- **Disabled:** 50% opacity, cursor not-allowed, no other visual change
- **Ghost / Icon buttons (card overlays):** `black/70` backdrop-blur surface, 24×24px, 0.5rem radius, zinc-300 icon color; hover → `black/90`. These exist only on card hover; opacity-0 at rest.

### Chips (Filter Pills)

The primary navigation affordance on the dashboard. State is URL-driven (search params), not local state — the filter row re-renders from the URL.

- **Inactive:** Transparent background, zinc-700 border (1px), ink-muted text, `rounded-full`, 2px / 10px padding
- **Active:** Lamp violet background, matching border, white text — identical padding and radius
- **Hover (inactive only):** Border → zinc-500, text → zinc-200

### Cards (Media Card — Signature Component)

The visual anchor of the system. Every design decision in this component serves the poster art.

- **Shape:** Generously curved (1rem / 16px — `rounded-2xl`)
- **Aspect ratio:** 2:3 (portrait) — enforces poster-art orientation; never landscape
- **Background:** Surface (`oklch(0.205 0 0)`)
- **Border:** zinc-800/60 at rest, zinc-600 on hover; 300ms transition. The subtle at-rest border separates card from the void without competing with the poster.
- **Hover:** -2px vertical lift (`-translate-y-0.5`), deep shadow, action button reveal (200ms opacity)
- **Poster fill:** Two-layer image stack. Layer 1: blurred fill (`scale-110`, `blur-xl`, `opacity-50`) — ambient color from the poster. Layer 2: main image (`object-contain`, `drop-shadow-2xl`) — the actual art, never cropped. On hover, blur layer scales to `scale-125`.
- **Overlay gradient:** 112px bottom gradient `from-black/95 via-black/60 to-transparent`. This is structural: it is what makes card text readable. Never thin it.
- **Type dot:** 8×8px circle, `rounded-full`, color from `COLOR_MAP[type].dot`, top-left corner with `ring-2 ring-black/50`. Indicates media type without label text.
- **Bottom bar:** `bg-zinc-900`, holds Geist Mono progress counter and last-updated date (absolute + relative). Separated from the poster by the card's outer boundary, not a border.

### Inputs / Fields

- **Style:** Raised background (`oklch(0.27 0 0)`), Border stroke (zinc-700, 1px), Ink text, 0.375rem radius (`rounded-md`), ink-dim placeholder
- **Focus:** 2px violet-500 ring, no offset. The ring is the only violet element on a form at rest.
- **Native `<select>`:** Same surface and border treatment. Native appearance — no custom dropdown arrow. Keeps the shadow DOM interaction model intact for the HA iframe context.
- **Error / Disabled:** Error text at `text-red-400` (0.875rem, below the field); disabled at 50% opacity.

### Section Group Header

Separates content groups on the dashboard. Three elements in a single flex row:

- **Accent pill:** 4×20px `rounded-full` in the category's accent color (`COLOR_MAP[type].accent`) — compact, not a full-width stripe
- **Label:** Title weight (600, 1rem), ink-muted text (`oklch(0.922 0 0)` — zinc-200 in practice)
- **Count:** Body weight (400, 0.875rem), ink-dim text — present but visually suppressed
- **Divider line:** 1px `bg-zinc-800`, flex-grows to fill remaining width

### Modal / Overlay

- **Backdrop:** `fixed inset-0 bg-black/70 backdrop-blur-sm` — the blur preserves mental context; the user knows they are still on their list, not navigating away
- **Panel:** Surface background, zinc-700 border, `rounded-xl` (0.75rem), `shadow-2xl`, max-width 28rem

## 6. Do's and Don'ts

### Do:
- **Do** use `{colors.lamp}` (violet-600) for primary actions, active filter pills, and focus rings only. Its scarcity makes it meaningful.
- **Do** use tonal layering (void → surface → raised) to express depth at rest. Lightness steps do the work; shadows are reserved for state.
- **Do** let poster art fill the entire card face. The blurred fill + contained main image + gradient overlay pattern is the system's signature — preserve it exactly.
- **Do** keep interactive controls on cards hidden until hover (`opacity-0 → opacity-100`). The dashboard should look like a gallery at rest, not a control panel.
- **Do** use `object-contain` for poster images — preserve the art's intended composition. Never `object-cover` or crop.
- **Do** use Geist Mono and `tabular-nums` for progress counters — column stability matters as numbers change.

### Don't:
- **Don't** use MAL / AniList patterns: no cluttered data tables, no forum-style layout, no visible community stats, no public-facing rating displays.
- **Don't** use Letterboxd patterns: no review excerpts, no follow counts, no diary-style entry format, no social framing of any kind.
- **Don't** use generic shadcn dark defaults as the identity. The shadcn CSS vars are the scaffold. If a component reads as "could belong to any admin SaaS," it needs a decision applied to it.
- **Don't** use Netflix / streaming UI patterns: no autoplay indicators, no hero banners, no carousel arrows, no "Continue Watching" metadata strips.
- **Don't** add a second accent color to the UI chrome. Category dots and status text colors come from `COLOR_MAP` — these are content signals, not brand signals. The chrome is achromatic except for the single lamp.
- **Don't** apply shadows to surfaces at rest. Flat-by-Default is a load-bearing rule here.
- **Don't** use `border-left` greater than 1px as a colored stripe on cards or list items. The group header accent pill already carries the category color. A left-border stripe on top of it is redundant.
- **Don't** scale up card micro-type (9–11px) to "improve readability." The micro scale works because it gets out of the poster's way. If text is too small, the fix is contrast or weight — not size.
