# Artist Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a public artist profile page at `/artist/:uid` showing the artist's photo, biography, and bento grid of their works.

**Architecture:** Single-file pattern matching existing pages (ShowImage, Gallery). `ArtistPage.tsx` handles data fetching and all rendering; `ArtistPage.module.css` holds all styles. Route added to `routes.tsx` via a wrapper component.

**Tech Stack:** React 19, TypeScript, Vite, CSS Modules, react-router-dom v6

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/pages/public/modules/ArtistPage/ArtistPage.tsx` | Data fetch, loading/error states, hero, works grid |
| Create | `src/pages/public/modules/ArtistPage/ArtistPage.module.css` | All styles for the page |
| Modify | `src/pages/public/routes.tsx` | Add `/artist/:uid` route + wrapper |

---

### Task 1: Scaffold component + add route

**Files:**
- Create: `src/pages/public/modules/ArtistPage/ArtistPage.tsx`
- Modify: `src/pages/public/routes.tsx`

- [ ] **Step 1: Create scaffold ArtistPage**

Create `src/pages/public/modules/ArtistPage/ArtistPage.tsx` with a minimal shell that compiles:

```tsx
export default function ArtistPage() {
  return <div>ArtistPage</div>;
}
```

- [ ] **Step 2: Add route to routes.tsx**

Open `src/pages/public/routes.tsx`. Replace the entire file with:

```tsx
import { Routes, Route, useParams } from "react-router-dom";
import WelcomePage from "./modules/Welcome/Welcome";
import GalleryPage from "./modules/Gallery/Gallery";
import ShowImagePage from "./modules/ShowImage/ShowImage";
import Events from "./modules/Events/Events";
import EventDetail from "./modules/EventDetail/EventDetail";
import ArtistPage from "./modules/ArtistPage/ArtistPage";

export default function MainPageRoutes() {
  return (
    <Routes>
      <Route index element={<WelcomePage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/show-picture/:uid" element={<ShowImagePageWrapper />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:uid" element={<EventDetail />} />
      <Route path="/artist/:uid" element={<ArtistPageWrapper />} />
    </Routes>
  );
}

function ShowImagePageWrapper() {
  const { uid } = useParams<{ uid: string }>();
  return <ShowImagePage key={uid} />;
}

function ArtistPageWrapper() {
  const { uid } = useParams<{ uid: string }>();
  return <ArtistPage key={uid} />;
}
```

- [ ] **Step 3: Verify build**

```bash
cd UstaGallery && bun run build 2>&1 | tail -10
```

Expected: `✓ built in` with no TypeScript errors.

- [ ] **Step 4: Commit scaffold**

```bash
git add src/pages/public/modules/ArtistPage/ArtistPage.tsx src/pages/public/routes.tsx
git commit -m "feat(routes): scaffold ArtistPage at /artist/:uid"
```

---

### Task 2: Create CSS module

**Files:**
- Create: `src/pages/public/modules/ArtistPage/ArtistPage.module.css`

- [ ] **Step 1: Create the full CSS module**

Create `src/pages/public/modules/ArtistPage/ArtistPage.module.css`:

```css
/* ═══════════════════════════════════════════════════════════════
   CONTAINER
   ═══════════════════════════════════════════════════════════════ */

.container {
  min-height: 100vh;
  background-color: #fafafa;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(0, 0, 0, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(119, 90, 25, 0.02) 0%, transparent 50%);
}

/* ═══════════════════════════════════════════════════════════════
   LOADING / ERROR STATES
   ═══════════════════════════════════════════════════════════════ */

.loadingState,
.errorState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #edeef0;
  border-top-color: #775a19;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.errorText {
  font-family: 'Manrope', sans-serif;
  font-size: 11px;
  letter-spacing: 0.15em;
  color: #ba1a1a;
}

.loadingText {
  font-family: 'Manrope', sans-serif;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #9a8f80;
}

.retryButton {
  padding: 12px 24px;
  background: #775a19;
  color: #fff;
  border: none;
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  transition: background 0.3s ease;
}

.retryButton:hover {
  background: #5d4201;
}

/* ═══════════════════════════════════════════════════════════════
   BACK BUTTON
   ═══════════════════════════════════════════════════════════════ */

.backButtonWrapper {
  padding: 32px 48px 0;
}

.backButton {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #775a19;
  font-family: 'Manrope', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0;
  transition: opacity 0.2s ease;
}

.backButton:hover {
  opacity: 0.7;
}

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════ */

.hero {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 48px 48px 96px;
  gap: 48px;
  min-height: 800px;
  overflow: hidden;
  position: relative;
}

.heroLeft {
  flex: 1;
  max-width: 560px;
  position: relative;
  z-index: 1;
}

.artistName {
  font-family: 'Newsreader', serif;
  font-style: italic;
  font-size: clamp(4rem, 8vw, 7rem);
  line-height: 0.9;
  color: #131313;
  margin-bottom: 32px;
  letter-spacing: -0.02em;
}

.bioCard {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: 40px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  position: relative;
}

.bioCardAccent {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #775a19 0%, #5d4201 100%);
}

.bioDescription {
  font-family: 'Newsreader', serif;
  font-style: italic;
  font-size: 1.25rem;
  line-height: 1.7;
  color: #2a2a2a;
  margin: 0 0 16px;
}

.artistUsername {
  font-family: 'Manrope', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #775a19;
  margin: 0;
}

.heroRight {
  flex: 1;
  min-height: 600px;
  position: relative;
  align-self: stretch;
}

.photoContainer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: #e5e2e1;
}

.artistPhoto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.3);
  mix-blend-mode: multiply;
  opacity: 0.9;
}

.photoFallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Newsreader', serif;
  font-size: 8rem;
  color: rgba(0, 0, 0, 0.15);
  font-style: italic;
}

.photoAccent {
  position: absolute;
  bottom: -40px;
  left: -40px;
  width: 160px;
  height: 160px;
  border-top: 1px solid rgba(119, 90, 25, 0.2);
  border-left: 1px solid rgba(119, 90, 25, 0.2);
  pointer-events: none;
}

/* ═══════════════════════════════════════════════════════════════
   WORKS SECTION
   ═══════════════════════════════════════════════════════════════ */

.worksSection {
  padding: 96px 48px;
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.worksSectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 64px;
}

.worksSectionTitle {
  font-family: 'Newsreader', serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: #131313;
  line-height: 1;
  margin: 0;
}

.worksSectionMeta {
  font-family: 'Manrope', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #9a8f80;
}

.bentoGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 300px;
  gap: 32px;
}

.uniformGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 300px;
  gap: 32px;
}

.restGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 300px;
  gap: 32px;
  margin-top: 32px;
}

/* Work card base */
.workCard {
  position: relative;
  overflow: hidden;
  cursor: crosshair;
  background: #e5e2e1;
  display: block;
  text-decoration: none;
}

.workCardFeatured {
  grid-column: span 2;
  grid-row: span 2;
}

.workCardPanoramic {
  height: 400px;
  margin-top: 32px;
  display: block;
  position: relative;
  overflow: hidden;
  cursor: crosshair;
  background: #e5e2e1;
  text-decoration: none;
}

.workCardImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1);
  transition: filter 0.7s ease, transform 0.7s ease;
  display: block;
}

.workCard:hover .workCardImage,
.workCardPanoramic:hover .workCardImage {
  filter: grayscale(0);
  transform: scale(1.05);
}

.workCardOverlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.4);
  opacity: 0;
  transition: opacity 0.5s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px;
}

.workCard:hover .workCardOverlay,
.workCardPanoramic:hover .workCardOverlay {
  opacity: 1;
}

.workCardInfo {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(16px);
  transition: transform 0.5s ease;
}

.workCard:hover .workCardInfo,
.workCardPanoramic:hover .workCardInfo {
  transform: translateY(0);
}

.workCardTitle {
  font-family: 'Newsreader', serif;
  font-size: 1.5rem;
  color: #131313;
  margin: 0 0 8px;
}

.workCardYear {
  font-family: 'Manrope', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #9a8f80;
  margin: 0;
}

.noImagePlaceholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9a8f80;
  font-family: 'Manrope', sans-serif;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.emptyWorks {
  text-align: center;
  padding: 64px 0;
  font-family: 'Manrope', sans-serif;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #9a8f80;
  margin: 0;
}

.worksErrorText {
  text-align: center;
  padding: 32px 0;
  font-family: 'Manrope', sans-serif;
  font-size: 11px;
  letter-spacing: 0.15em;
  color: #ba1a1a;
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE — TABLET
   ═══════════════════════════════════════════════════════════════ */

@media (max-width: 1024px) {
  .hero {
    padding: 32px 32px 64px;
    gap: 32px;
  }

  .backButtonWrapper {
    padding: 24px 32px 0;
  }

  .worksSection {
    padding: 64px 32px;
  }

  .bentoGrid,
  .uniformGrid,
  .restGrid {
    grid-auto-rows: 240px;
    gap: 24px;
  }
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE — MOBILE
   ═══════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .hero {
    flex-direction: column-reverse;
    padding: 24px 24px 48px;
    min-height: auto;
    gap: 32px;
  }

  .heroLeft {
    max-width: 100%;
    width: 100%;
  }

  .heroRight {
    width: 100%;
    min-height: 400px;
    align-self: auto;
  }

  .photoContainer {
    position: relative;
    height: 400px;
  }

  .backButtonWrapper {
    padding: 16px 24px 0;
  }

  .worksSection {
    padding: 48px 24px;
  }

  .bentoGrid,
  .uniformGrid,
  .restGrid {
    grid-template-columns: 1fr;
    grid-auto-rows: 280px;
  }

  .workCardFeatured {
    grid-column: span 1;
    grid-row: span 1;
  }

  .workCardPanoramic {
    height: 280px;
  }

  .worksSectionHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 32px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/public/modules/ArtistPage/ArtistPage.module.css
git commit -m "feat(ArtistPage): add CSS module"
```

---

### Task 3: Implement full ArtistPage component

**Files:**
- Modify: `src/pages/public/modules/ArtistPage/ArtistPage.tsx`

- [ ] **Step 1: Replace scaffold with full implementation**

Replace the entire content of `src/pages/public/modules/ArtistPage/ArtistPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuthorDetail } from "../../../../services/users";
import { getProductByAuthor } from "../../../../services/products";
import type { AuthorDetail } from "../../../../interfaces/users";
import type { Product } from "../../../../interfaces/products";
import styles from "./ArtistPage.module.css";

const BASE_URL = import.meta.env.VITE_API_URL;

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ArtistPage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const [author, setAuthor] = useState<AuthorDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [worksError, setWorksError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!uid) {
      setError("No se proporcionó un artista");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setWorksError(null);

    const [authorResult, productsResult] = await Promise.allSettled([
      getAuthorDetail(uid),
      getProductByAuthor(uid),
    ]);

    if (authorResult.status === "rejected") {
      setError((authorResult.reason as Error).message || "Error al cargar el artista");
      setLoading(false);
      return;
    }

    setAuthor(authorResult.value);

    if (productsResult.status === "rejected") {
      setWorksError("Error al cargar las obras");
    } else {
      const data = productsResult.value;
      setProducts(Array.isArray(data) ? data : [data]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [uid]);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Cargando artista...</p>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorText}>{error || "Artista no encontrado"}</p>
        <button className={styles.retryButton} onClick={fetchData}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backButtonWrapper}>
        <button className={styles.backButton} onClick={() => navigate("/gallery")}>
          ← Back to directory
        </button>
      </div>

      <HeroSection author={author} />
      <WorksSection products={products} worksError={worksError} />

      {/*
        TODO: Exhibition History — uncomment when getEventsByArtist endpoint is available

        <section className={styles.exhibitionsSection}>
          <div className={styles.exhibitionsSectionHeader}>
            <h2>Exhibition History</h2>
            <div className={styles.dividerLine}></div>
          </div>
          <div className={styles.exhibitionsList}>
            List of exhibitions with year, title, venue...
          </div>
        </section>
      */}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection({ author }: { author: AuthorDetail }) {
  const photoUrl = author.photo?.url ? `${BASE_URL}${author.photo.url}` : null;

  return (
    <section className={styles.hero}>
      <div className={styles.heroLeft}>
        <h1 className={styles.artistName}>
          {author.name}
          <br />
          {author.lastName}
        </h1>

        {author.description && (
          <div className={styles.bioCard}>
            <div className={styles.bioCardAccent} />
            <p className={styles.bioDescription}>"{author.description}"</p>
            <p className={styles.artistUsername}>@{author.username}</p>
          </div>
        )}
      </div>

      <div className={styles.heroRight}>
        <div className={styles.photoContainer}>
          {photoUrl ? (
            <img
              className={styles.artistPhoto}
              src={photoUrl}
              alt={`${author.name} ${author.lastName}`}
            />
          ) : (
            <div className={styles.photoFallback}>{author.name[0]}</div>
          )}
        </div>
        <div className={styles.photoAccent} />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Works Section
// ─────────────────────────────────────────────────────────────────────────────

function WorksSection({
  products,
  worksError,
}: {
  products: Product[];
  worksError: string | null;
}) {
  return (
    <section className={styles.worksSection}>
      <div className={styles.worksSectionHeader}>
        <h2 className={styles.worksSectionTitle}>Selected Works</h2>
        <span className={styles.worksSectionMeta}>
          {products.length} {products.length === 1 ? "obra" : "obras"}
        </span>
      </div>

      {worksError ? (
        <p className={styles.worksErrorText}>{worksError}</p>
      ) : products.length === 0 ? (
        <p className={styles.emptyWorks}>Sin obras disponibles</p>
      ) : products.length >= 4 ? (
        <BentoWorks products={products} />
      ) : (
        <div className={styles.uniformGrid}>
          {products.map((p) => (
            <WorkCard key={p.uid} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bento Grid (≥4 products)
// ─────────────────────────────────────────────────────────────────────────────

function BentoWorks({ products }: { products: Product[] }) {
  const [featured, second, third, panoramic, ...rest] = products;

  return (
    <>
      <div className={styles.bentoGrid}>
        <WorkCard product={featured} variant="featured" />
        {second && <WorkCard key={second.uid} product={second} />}
        {third && <WorkCard key={third.uid} product={third} />}
      </div>

      <WorkCard product={panoramic} variant="panoramic" />

      {rest.length > 0 && (
        <div className={styles.restGrid}>
          {rest.map((p) => (
            <WorkCard key={p.uid} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Work Card
// ─────────────────────────────────────────────────────────────────────────────

interface WorkCardProps {
  product: Product;
  variant?: "featured" | "panoramic" | "normal";
}

function WorkCard({ product, variant = "normal" }: WorkCardProps) {
  const photo = product.photos?.[0]?.photo;
  const imageSrc = photo?.url ? `${BASE_URL}${photo.url}` : null;
  const year = new Date(product.madeAt).getFullYear();

  if (variant === "panoramic") {
    return (
      <Link to={`/show-picture/${product.uid}`} className={styles.workCardPanoramic}>
        {imageSrc ? (
          <img className={styles.workCardImage} src={imageSrc} alt={product.name} loading="lazy" />
        ) : (
          <div className={styles.noImagePlaceholder}>Sin imagen</div>
        )}
        <div className={styles.workCardOverlay}>
          <div className={styles.workCardInfo}>
            <h3 className={styles.workCardTitle}>{product.name}</h3>
            <p className={styles.workCardYear}>{year}</p>
          </div>
        </div>
      </Link>
    );
  }

  const cardClass = [
    styles.workCard,
    variant === "featured" ? styles.workCardFeatured : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link to={`/show-picture/${product.uid}`} className={cardClass}>
      {imageSrc ? (
        <img className={styles.workCardImage} src={imageSrc} alt={product.name} loading="lazy" />
      ) : (
        <div className={styles.noImagePlaceholder}>Sin imagen</div>
      )}
      <div className={styles.workCardOverlay}>
        <div className={styles.workCardInfo}>
          <h3 className={styles.workCardTitle}>{product.name}</h3>
          <p className={styles.workCardYear}>{year}</p>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify TypeScript build**

```bash
cd UstaGallery && bun run build 2>&1 | tail -15
```

Expected: `✓ built in` with no errors.

- [ ] **Step 3: Start dev server and verify page manually**

```bash
bun run dev
```

Test the following at `http://localhost:5173`:

1. Navigate to `/artist/<valid-uid>` (use a UID from the backend's `/user/author/:uid` endpoint)
2. Verify loading spinner → resolves to full page
3. Hero: large italic name, frosted bio card with gold left accent, artist photo (grayscale)
4. Works: bento layout if ≥4 products (0=large 2×2, 1+2=normal, 3=full-width panoramic); uniform 3-col if <4
5. Hover a work card: image goes to color, frosted overlay slides up with name + year
6. Click a work card: navigates to `/show-picture/:uid`
7. Back button: navigates to `/gallery`
8. Navigate to `/artist/<uid-with-no-photo>`: fallback initial letter renders
9. Mobile (resize to <768px): photo stacks above bio, grid collapses to 1-col

- [ ] **Step 4: Commit**

```bash
git add src/pages/public/modules/ArtistPage/ArtistPage.tsx
git commit -m "feat(public): add ArtistPage — hero, bio, bento works grid"
```
