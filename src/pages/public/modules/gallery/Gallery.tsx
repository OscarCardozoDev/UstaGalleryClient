import { useState, useEffect, useRef } from "react";
import GalleryCard from "../../components/GalleryCard/GalleryCard";
import { getGalleryProducts } from "../../../../services/products";
import type { ProductGallery } from "../../../../interfaces/products";
import styles from "./Gallery.module.css";

// ─────────────────────────────────────────────────────────────
// Grid patterns
// ─────────────────────────────────────────────────────────────

const PATTERNS = [
  {
    name: "pattern1",
    itemsCount: 8,
    gridConfig: {
      columns: "repeat(4, 1fr)",
      rows: "repeat(5, 1fr)",
      gap: "15px",
    },
  },
  {
    name: "pattern2",
    itemsCount: 7,
    gridConfig: {
      columns: "repeat(4, 1fr)",
      rows: "repeat(4, 1fr)",
      gap: "15px",
    },
  },
  {
    name: "pattern3",
    itemsCount: 5,
    gridConfig: {
      columns: "repeat(4, 1fr)",
      rows: "repeat(4, 1fr)",
      gap: "15px",
    },
  },
] as const;

const PAGE_LIMIT = 8;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ProductGroup {
  pattern: string;
  gridConfig: { columns: string; rows: string; gap: string };
  items: ProductGallery[];
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function groupProducts(products: ProductGallery[]): ProductGroup[] {
  const groups: ProductGroup[] = [];
  let currentIndex = 0;
  let patternIndex = 0;

  while (currentIndex < products.length) {
    const pattern = PATTERNS[patternIndex % PATTERNS.length];
    const slice = products.slice(
      currentIndex,
      currentIndex + pattern.itemsCount,
    );

    if (slice.length) {
      groups.push({
        pattern: pattern.name,
        gridConfig: pattern.gridConfig,
        items: slice,
      });
    }

    currentIndex += pattern.itemsCount;
    patternIndex++;
  }

  return groups;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const Gallery = () => {
  const [products, setProducts] = useState<ProductGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [styles_filter] = useState<string[]>(["todos"]);
  const [selectedStyle, setSelectedStyle] = useState("todos");

  const loadingRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────────────
  // Fetch products
  // ─────────────────────────────────────────────────────────────

  const fetchProducts = async (nextPage: number, reset = false) => {
    try {
      nextPage === 1 ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const data = await getGalleryProducts({
        page: nextPage,
        limit: PAGE_LIMIT,
      });

      if (data.length < PAGE_LIMIT) {
        setHasMore(false);
      }

      setProducts((prev) => (reset ? data : [...prev, ...data]));
    } catch (err) {
      setError((err as Error).message || "Error al cargar la galería");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Initial load
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchProducts(1, true);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Infinite scroll
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const sentinel = loadingRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage);
        }
      },
      { rootMargin: "150px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, hasMore, loadingMore]);

  // ─────────────────────────────────────────────────────────────
  // Render states
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.homePage}>
        <div className={styles.loadingMessage}>Cargando galería…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.homePage}>
        <div className={styles.errorMessage}>
          {error}
          <button onClick={() => fetchProducts(1, true)}>Reintentar</button>
        </div>
      </div>
    );
  }

  const groups = groupProducts(products);

  // ─────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className={styles.homePage}>
      <div className={styles.filtersSection}>
        <h2>Galería de Artes</h2>

        <div className={styles.filters}>
          <label>Filtrar por estilo: </label>
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
          >
            {styles_filter.map((style) => (
              <option key={style} value={style}>
                {style === "todos" ? "Todos los estilos" : style}
              </option>
            ))}
          </select>
        </div>
      </div>

      <main className={styles.mainContent}>
        <div className={styles.galleryContainer}>
          {groups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className={`${styles.gridContainer} ${styles[group.pattern]}`}
              style={{
                gridTemplateColumns: group.gridConfig.columns,
                gridTemplateRows: group.gridConfig.rows,
                gap: group.gridConfig.gap,
              }}
            >
              {group.items.map((product, itemIndex) => {
                return (
                  <GalleryCard
                    key={product.uid}
                    product={product}
                    gridAreaClassName={styles[`${group.pattern}Item${itemIndex + 1}`]}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {hasMore && (
          <div ref={loadingRef} className={styles.loadingIndicator}>
            {loadingMore ? "Cargando más obras…" : ""}
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;