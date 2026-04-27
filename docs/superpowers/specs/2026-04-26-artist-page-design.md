# Artist Page — Design Spec
**Date:** 2026-04-26  
**Branch:** feature/portafolio  
**Status:** Approved

---

## Overview

New public page that displays an artist's profile: portrait, biography, and gallery of their works. Based on `templates/portafolio_template.html`, converted to TSX + CSS Modules using the existing project design system.

---

## New Files

```
src/pages/public/modules/ArtistPage/ArtistPage.tsx
src/pages/public/modules/ArtistPage/ArtistPage.module.css
```

## Modified Files

```
src/pages/public/routes.tsx   →  add route /artist/:uid
```

---

## Routing

Route: `/artist/:uid`

Added to `MainPageRoutes` in `routes.tsx` via an `ArtistPageWrapper` component (same pattern as `ShowImagePageWrapper`) that extracts `uid` from `useParams` and passes `key={uid}` to force remount on artist navigation.

---

## Data Fetching

```ts
const { uid } = useParams<{ uid: string }>();

useEffect(() => {
  Promise.all([
    getAuthorDetail(uid),
    getProductByAuthor(uid),
  ])
}, [uid]);
```

**Services used:**
- `getAuthorDetail(uid)` → `AuthorDetail` (name, lastName, username, description, photo.url)
- `getProductByAuthor(uid)` → `Product[]` (works by the artist)

**States:**
- `author: AuthorDetail | null`
- `products: Product[]`
- `loading: boolean` — full-page spinner while fetching
- `error: string | null` — error message with retry button

---

## Design System Mapping

The template uses Instrument Serif/Sans and Material Design 3 gold tokens. These are mapped to the existing project tokens:

| Template | Project |
|---|---|
| `font-display` (Instrument Serif) | `'Newsreader', serif` |
| `font-body/label` (Instrument Sans) | `'Manrope', sans-serif` |
| `text-primary` (#775a19 gold) | `#775a19` (used directly in CSS module) |
| `bg-background` (#fafafa) | `#fafafa` (same as ShowImage) |
| `text-on-surface` | `#191c1e` (same as existing) |
| `veil-light` frosted glass | `rgba(255,255,255,0.9)` + `backdrop-filter: blur(12px)` |

No new fonts or Tailwind tokens added.

---

## Page Sections

### 1. Back Button
- Fixed top-left (below header)
- `navigate('/gallery')` on click
- Style: uppercase label + arrow icon

### 2. Hero Section
Two-column layout (responsive → stacked on mobile):

**Left column:**
- Artist name: large Newsreader italic display text (responsive: `clamp` or breakpoint sizes)
- Bio card: frosted glass panel (`veil-light`) with gold left-border accent, contains `author.description`
- If no description: card hidden

**Right column:**
- Artist photo: full-height container, `object-cover`, `filter: grayscale(0.3)`, `mix-blend-multiply`
- Fallback (no photo): centered initial of `author.name` on neutral background
- Decorative corner accent (CSS `::after` or simple div)

### 3. Selected Works Grid (Bento)
Grid: `grid-template-columns: repeat(3, 1fr)`, `auto-rows: 300px`

**Layout rules (≥4 products):**
- `products[0]`: `col-span-2 row-span-2` — featured large
- `products[1]`: `col-span-1 row-span-1`
- `products[2]`: `col-span-1 row-span-1`
- `products[3+]`: `col-span-3 row-span-1` (panoramic strip) for index 3, then back to standard 3-col for remainder

**Layout rules (<4 products):**
- Simple `repeat(3, 1fr)` uniform grid, each card `col-span-1`

**Card hover effect:**
- Grayscale image at rest → color on hover (`filter: grayscale(1)` → `grayscale(0)`)
- Frosted glass overlay slides up on hover
- Overlay shows: `product.name` (Newsreader) + year from `new Date(product.madeAt).getFullYear()` (Manrope uppercase)
- Click navigates to `/show-picture/${product.uid}`

**Empty state:**
- "Sin obras disponibles" centered message

### 4. Exhibition History
Entire section commented out pending backend endpoint:
```tsx
{/*
  TODO: Exhibition History — uncomment when getEventsByArtist endpoint is available
  <section>...</section>
*/}
```

### 5. Header / Footer
Rendered by `MainPageLayout` — not touched by this page.

---

## Responsive Behavior

| Breakpoint | Hero | Works Grid |
|---|---|---|
| Desktop (>1024px) | Two columns (50/50) | Full bento layout |
| Tablet (768–1024px) | Two columns (40/60) | Bento with reduced row heights |
| Mobile (<768px) | Stacked (photo first, text below) | Single column, uniform cards |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `uid` missing | Error state: "No se proporcionó un artista" |
| `getAuthorDetail` fails | Full error state with retry button |
| `getProductByAuthor` fails | Author shown, works section shows error message inline |
| Author has no photo | Fallback: first letter of `author.name` |
| Author has no description | Bio card hidden entirely |
| Author has 0 works | Works section shows "Sin obras disponibles" |
