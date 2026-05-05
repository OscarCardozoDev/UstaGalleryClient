import { useState, useEffect, useCallback } from "react";
import { getProductByAuthor } from "../../../../services/products";
import type { Product, ProductStatus } from "../../../../interfaces/products";
import { useAuth } from "../../../../context/AuthContext";
import ArtworkCard from "../../components/artworkCard/ArtworkCard";
import styles from "./YourGalleryReview.module.css";

// ─── Componente ───────────────────────────────────────────────────────────────
export default function YourGalleryReview() {
  const { user } = useAuth();

  const [cards, setCards]                 = useState<Product[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [fetchError, setFetchError]       = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ── Carga ────────────────────────────────────────────────────────────────

  const loadCards = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingList(true);
    setFetchError(null);
    try {
      const products = await getProductByAuthor(user.uid);
      setCards(products);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Error al cargar las obras");
    } finally {
      setIsLoadingList(false);
    }
  }, [user?.uid]);

  useEffect(() => { loadCards(); }, [loadCards]);

  // ── Secciones ────────────────────────────────────────────────────────────

  const needsAttention = [
    ...cards.filter((c) => c.status === "REJECTED"),
    ...cards.filter((c) => c.status === "PENDING"),
  ];
  const approved = cards.filter((c) => c.status === "APPROVED");

  // ── Toast ────────────────────────────────────────────────────────────────

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatusChange = (uid: string, newStatus: ProductStatus) => {
    setCards((prev) => prev.map((c) => c.uid === uid ? { ...c, status: newStatus } : c));
  };

  // ── Skeleton ─────────────────────────────────────────────────────────────

  if (isLoadingList) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`} />
          </div>
        </div>
        <div className={styles.artworksGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={`${styles.skeleton} ${styles.skeletonCardImage}`} />
              <div className={styles.skeletonCardBody}>
                <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorTitle}>No se pudieron cargar las obras</p>
          <p className={styles.errorMessage}>{fetchError}</p>
          <button className={styles.retryBtn} onClick={loadCards}>Reintentar</button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.pageContainer}>

      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Mis Obras</h1>
          <p className={styles.pageSubtitle}>Aquí puedes ver el estado de tus obras enviadas</p>
        </div>
      </div>

      {needsAttention.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Obras en Revisión</h2>
            <span className={styles.sectionCount}>{needsAttention.length}</span>
          </div>
          <div className={styles.artworksGrid}>
            {needsAttention.map((card) => (
              <ArtworkCard
                key={card.uid}
                product={card}
                isMainAuthor={card.authors.some((a) => a.userId === user?.uid)}
                isTeacher={false}
                isSelectionMode={false}
                isSelected={false}
                onToggleSelect={() => {}}
                onStatusChange={handleStatusChange}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      )}

      {approved.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tu Galería</h2>
            <span className={styles.sectionCount}>{approved.length}</span>
          </div>
          <div className={styles.artworksGrid}>
            {approved.map((card) => (
              <ArtworkCard
                key={card.uid}
                product={card}
                isTeacher={false}
                isMainAuthor={card.authors.some((a) => a.userId === user?.uid && a.isAuthor)}
                isSelectionMode={false}
                isSelected={false}
                onToggleSelect={() => {}}
                onStatusChange={handleStatusChange}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      )}

      {needsAttention.length === 0 && approved.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎨</div>
          <p className={styles.emptyText}>Aún no tienes obras registradas</p>
        </div>
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}
    </div>
  );
}