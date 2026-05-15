# Home Page Bento Grid Redesign

**Date:** 2026-04-30  
**Files affected:** `src/pages/dashboard/pages/Home/Home.tsx`, `src/pages/dashboard/pages/Home/Home.module.css`

---

## Goal

Replace the current Home page layout with a cleaner bento grid that looks good on both desktop and mobile. Same data, same logic — only layout and visual style change.

---

## Layout

### Desktop (≥1100px) — 4-column bento grid

```
grid-template-columns: 220px 1fr 1fr 220px
grid-template-rows: 150px 1fr 1fr
grid-template-areas:
  "attend  welcome  welcome  events"
  "attend  artworks artworks events"
  "attend  notifs   notifs   events"
```

Container height: `80dvh`, `overflow: hidden`. Each tile uses `min-height: 0` to respect grid constraints. Tiles with scrollable lists use `overflow-y: auto` internally.

### Tablet (750px–1099px) — 3 columns

```
grid-template-columns: 210px 1fr 210px
grid-template-areas:
  "attend  welcome  events"
  "attend  artworks events"
  "attend  notifs   events"
```

Same fixed height behavior.

### Mobile (<750px) — vertical scroll, 2-column partial

Container switches to `height: auto`, `overflow: visible`.

```
grid-template-columns: 1fr 1fr
grid-template-areas:
  "welcome   welcome"
  "attend    attend"
  "artworks  events"
  "notifs    notifs"
```

Tile heights become `auto` except attendance which has `min-height: 180px`.

---

## Visual Style (S1 — minimal)

All light tiles share:
- `background: #ffffff`
- `border: 1px solid #e8e8e8`
- `border-radius: 14px`
- `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04)`

The attendance tile is always dark:
- `background: #171717`
- `border-radius: 14px`
- No border, no shadow

---

## Tiles

### Attendance (dark, full left column)

Structure (top → middle → bottom, `justify-content: space-between`):

**Top:** label "Semillero de Arte" (uppercase, dimmed) + status row with dot indicator
- Dot: green `#4ade80` with glow when class active, gray `#555` when inactive

**Middle (flex: 1):** large time display
- Time: `font-size: clamp(2.8rem, 4vw, 3.5rem)`, `font-weight: 700`, white
- Date: small, `rgba(255,255,255,0.4)`

**Bottom:** CTA button + attendance count
- Button states:
  - Active class, not taken: white bg, dark text — "Tomar asistencia"
  - Taken: `background: #2a2a2a`, dimmed text — "Asistencia tomada"
  - No class / checking: `background: #252525`, very dimmed — "Sin clase activa" or "Verificando…"
- Count: `rgba(255,255,255,0.3)`, centered below button

**Mobile:** collapses to horizontal band. Time on left, button on right (compact). Dot + status inline under time.

### Welcome (top center, row-direction)

Left: greeting text (small muted "Bienvenida,") + name (large bold) + subtitle (small, 2-line clamp).  
Right: decorative 56×56px rounded square with 🎨 emoji, `background: #f5f5f5`.

**Mobile:** same row layout (deco still visible).

### Artworks (center middle)

Header: title "Mis Obras" + meta count (left) + "Subir obra" action button (right, `background: #f2f2f2`).  
Body: horizontal scroll container (`overflow-x: auto`, `flex: 1`, `min-height: 0`).

Each artwork card: `width: 120px`, `border-radius: 10px`, overflow hidden.
- Image area: `height: 90px`, `object-fit: cover`
- Name: truncated, `font-size: 0.73rem`
- Hover: `translateY(-3px)` + shadow

Empty state: centered muted text "Aún no has subido obras".

### Events (right column, `background: #fafafa`)

Header: title only.  
Body: scrollable list of event cards.

Each event card (`background: #fff`, `border: 1px solid #ebebeb`, `border-radius: 10px`):
- Date: uppercase, muted, small (`#bbb`, letter-spacing)
- Meta row: type badge (pill, `background: #f0f0f0`) + time (right-aligned, muted)
- Name: `font-size: 0.83rem`, `font-weight: 600`, dark

Hover: `translateY(-1px)` + border darkens to `#d0d0d0`.  
Empty state: centered muted text.

### Notifications (center bottom)

Header: title + unread badge (dark pill) + "Ver todas" ghost button.  
Body: scrollable list.

Each notification row:
- Emoji icon (left, `font-size: 1rem`)
- Title (bold, truncated) + message (muted, truncated)
- Right: time (small, `#c0c0c0`) + unread dot (`#171717`, 6px circle) when unread
- Unread rows: `background: #fafafa`
- Read rows: transparent background
- Hover: `background: #f7f7f7`

---

## Skeleton Loading

While `isLoading` is true, each tile shows shimmer blocks matching its content shape.

- Light tiles: `background` gradient cycling `#f2f2f2 → #e8e8e8 → #f2f2f2`, `animation: shimmer 1.4s infinite`
- Dark tile (attendance): same gradient but darker `#2a2a2a → #333 → #2a2a2a`

---

## Responsive Breakpoints Summary

| Breakpoint | Columns | Height behavior |
|---|---|---|
| ≥1100px | 4 cols (220px 1fr 1fr 220px) | `80dvh`, no outer scroll |
| 750–1099px | 3 cols (210px 1fr 210px) | `80dvh`, no outer scroll |
| <750px | 2 cols partial (see template) | `auto`, vertical scroll |

---

## What Does NOT Change

- All state, effects, handlers, and API calls remain identical
- `EVENT_TYPE_LABELS`, `Notification` interface, mock notifications data
- `formatTime`, `formatDate`, `getNotificationIcon` helpers
- All service imports and type imports
- The `currentTime` useState (time doesn't tick — existing behavior preserved)
