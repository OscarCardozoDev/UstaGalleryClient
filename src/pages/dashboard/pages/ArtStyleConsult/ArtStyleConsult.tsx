import { useEffect, useState, useRef, useCallback } from "react";
import { getArtStyles, type ArtStyle } from "../../../../services/PublicApi/artStyles";
import styles from "./ArtStylesConsult.module.css";

const PAGE_SIZE = 10;

export default function ArtStyles() {
  const [allStyles, setAllStyles] = useState<ArtStyle[]>([]);
  const [visibleStyles, setVisibleStyles] = useState<ArtStyle[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const observerRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Load initial data
  useEffect(() => {
    const load = async () => {
      const data = await getArtStyles();
      setAllStyles(data);
      setVisibleStyles(data.slice(0, PAGE_SIZE));
      setLoading(false);
    };

    load();
  }, []);

  // 🔹 Infinite scroll
  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    const nextItems = allStyles.slice(0, nextPage * PAGE_SIZE);

    setVisibleStyles(nextItems);
    setPage(nextPage);
  }, [page, allStyles]);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <main className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <h1 className={styles.title}>Estilos del Arte</h1>
        <p className={styles.subtitle}>
          Explora los movimientos que definieron la historia del arte.
        </p>
      </header>

      {/* SEARCH */}
      <div className={styles.searchWrapper}>
        <input placeholder="Search art styles..." className={styles.search} />
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))
          : visibleStyles.map((style, index) => (
              <ArtCard key={style.name} style={style} index={index} />
            ))}
      </div>

      {/* OBSERVER */}
      <div ref={observerRef} className={styles.loaderTrigger} />
    </main>
  );
}

// ─────────────────────────────
// CARD COMPONENT
// ─────────────────────────────

function ArtCard({ style, index }: { style: ArtStyle; index: number }) {
  const variant = index % 6;

  return (
    <div className={`${styles.card} ${styles[`variant${variant}`]}`}>
      
      {style.image && (
        <img src={style.image} alt={style.name} className={styles.image} />
      )}

      {/* capa oscura suave */}
      <div className={styles.overlay} />

      {/* PANEL BLANCO (CLAVE) */}
      <div className={styles.panel}>
        <h3 className={styles.cardTitle}>{style.name}</h3>

        <p className={styles.cardDescription}>
          {style.description || "Art movement"}
        </p>

        <button className={styles.cardAction}>
          Explore →
        </button>
      </div>
    </div>
  );
}