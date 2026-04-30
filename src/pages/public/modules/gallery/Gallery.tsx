import { useState, useEffect, useRef } from "react";
import GalleryCard from "../../components/GalleryCard/GalleryCard";
import { getGalleryProducts } from "../../../../services/products";
import { getAllStylesByGroup } from "../../../../services/styles";
import type { ProductGallery } from "../../../../interfaces/products";
import type { Style } from "../../../../interfaces/styles";
import styles from "./Gallery.module.css";

// ─────────────────────────────────────────────────────────────
// Grid patterns - Mantiene tus patrones originales
// ─────────────────────────────────────────────────────────────

const PATTERNS = [
  {
    name: "pattern1",
    itemsCount: 8,
    gridConfig: {
      columns: "repeat(12, 1fr)",
      rows: "auto",
      gap: "24px",
    },
  },
  {
    name: "pattern2",
    itemsCount: 7,
    gridConfig: {
      columns: "repeat(12, 1fr)",
      rows: "auto",
      gap: "24px",
    },
  },
  {
    name: "pattern3",
    itemsCount: 5,
    gridConfig: {
      columns: "repeat(12, 1fr)",
      rows: "auto",
      gap: "24px",
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
  const [allStyles, setAllStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState("todos");

  const loadingRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────────────
  // Fetch styles
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const data = await getAllStylesByGroup("ARTES");
        setAllStyles(data);
      } catch (err) {
        console.error("Error al cargar estilos:", err);
      }
    };

    fetchStyles();
  }, []);

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
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p className="text-tertiary-600 font-sans text-sm tracking-wider">
            Cargando colección...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        
        <div className={styles.errorState}>
          <p className="text-red-600 font-sans mb-4">{"Error al cargar la galería"}</p>
          <button
            onClick={() => fetchProducts(1, true)}
            className={styles.retryButton}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const groups = groupProducts(products);

  // ─────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      {/* Suminagashi Background */}
      <div className={styles.suminagashiBg}></div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header & Filter Section */}
        <section className={styles.headerSection}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Colección</h1>
            <p className={styles.pageSubtitle}>
              Un diálogo curado entre forma y vacío. Explora los archivos
              permanentes del Grupo de Arte Universitario.
            </p>
          </div>

          {/* Filter System */}
          <div className={styles.filterSystem}>
            <button
              className={`${styles.filterButton} ${
                selectedStyle === "todos" ? styles.filterButtonActive : ""
              }`}
              onClick={() => setSelectedStyle("todos")}
            >
              Todas las Obras
            </button>

            {allStyles.map((style) => (
              <button
                key={style.uid}
                className={`${styles.filterButton} ${
                  selectedStyle === style.uid ? styles.filterButtonActive : ""
                }`}
                onClick={() => setSelectedStyle(style.uid)}
              >
                {style.name}
              </button>
            ))}
          </div>
        </section>

        {/* Scrollable Artwork Grid */}
        <section className={styles.artworkGrid}>
          <div className={styles.galleryContainer}>
            {groups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className={`${styles.gridContainer} ${styles[group.pattern]}`}
                style={{
                  gridTemplateColumns: group.gridConfig.columns,
                  gap: group.gridConfig.gap,
                }}
              >
                {group.items.map((product, itemIndex) => {
                  return (
                    <GalleryCard
                      key={product.uid}
                      product={product}
                      gridAreaClassName={
                        styles[`${group.pattern}Item${itemIndex + 1}`]
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {hasMore && (
            <div ref={loadingRef} className={styles.loadingIndicator}>
              {loadingMore && (
                <>
                  <div className={styles.spinner}></div>
                  <p className="text-tertiary-600 font-sans text-sm">
                    Cargando más obras...
                  </p>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Gallery;