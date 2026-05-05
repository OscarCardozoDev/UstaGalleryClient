import { useState, useEffect, useCallback, useMemo } from "react";
import { sileo } from "sileo";
import { getProductByGroup, approveManyProducts } from "../../../../services/products";
import { getStudentsByGroup } from "../../../../services/groups";
import type { Product, ProductStatus } from "../../../../interfaces/products";
import type { GroupStudent } from "../../../../interfaces/groups";
import { useAuth } from "../../../../context/AuthContext";
import ArtworkCard from "../../components/artworkCard/ArtworkCard";
import styles from "./ReviewArtWorks.module.css";

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ReviewArtWorks() {
  const { currentGroup } = useAuth();

  const [cards, setCards]                 = useState<Product[]>([]);
  const [students, setStudents]           = useState<GroupStudent[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [fetchError, setFetchError]       = useState<string | null>(null);

  // Filtros
  const [searchName, setSearchName]       = useState("");
  const [filterAuthor, setFilterAuthor]   = useState<string>("all");

  // Selección masiva
  const [isSelectionMode, setIsSelectionMode]   = useState(false);
  const [selectedUids, setSelectedUids]         = useState<Set<string>>(new Set());
  const [isProcessingMany, setIsProcessingMany] = useState(false);
  const [showConfirmMany, setShowConfirmMany]   = useState(false);

  // ── Carga ────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!currentGroup) return;
    setIsLoadingList(true);
    setFetchError(null);

    try {
      const [products, groupStudents] = await Promise.all([
        getProductByGroup(currentGroup),
        getStudentsByGroup(currentGroup),
      ]);
      setCards(products);
      setStudents(groupStudents);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Error al cargar las obras");
    } finally {
      setIsLoadingList(false);
    }
  }, [currentGroup]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filtrado ─────────────────────────────────────────────────────────────

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const matchesName   = c.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesAuthor = filterAuthor === "all" || (c.authors?.map((a) => a.userId) ?? []).includes(filterAuthor);
      return matchesName && matchesAuthor;
    });
  }, [cards, searchName, filterAuthor]);

  // Secciones sobre las cards ya filtradas
  const needsAttention = [
    ...filteredCards.filter((c) => c.status === "REJECTED"),
    ...filteredCards.filter((c) => c.status === "PENDING"),
  ];
  const approved = filteredCards.filter((c) => c.status === "APPROVED");

  // Para la barra de selección masiva (solo pendientes visibles)
  const pendingCards       = filteredCards.filter((c) => c.status === "PENDING");
  const pendingCount       = cards.filter((c) => c.status === "PENDING").length;
  const allPendingSelected = pendingCards.length > 0 && pendingCards.every((c) => selectedUids.has(c.uid));

  // ── Toast ────────────────────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: "success" | "error") => {
    if (type === "success") sileo.success({ title: message });
    else sileo.error({ title: message });
  }, []);

  // ── Callbacks de selección ────────────────────────────────────────────────

  const toggleSelectionMode = () => { setIsSelectionMode((v) => !v); setSelectedUids(new Set()); };

  const handleToggleSelect = (uid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUids((prev) => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const uids = pendingCards.map((c) => c.uid);
    if (allPendingSelected) {
      setSelectedUids((prev) => { const next = new Set(prev); uids.forEach((u) => next.delete(u)); return next; });
    } else {
      setSelectedUids((prev) => { const next = new Set(prev); uids.forEach((u) => next.add(u)); return next; });
    }
  };

  const handleStatusChange = (uid: string, newStatus: ProductStatus) => {
    setCards((prev) => prev.map((c) => c.uid === uid ? { ...c, status: newStatus } : c));
  };

  // ── Aprobar seleccionadas ─────────────────────────────────────────────────

  const handleConfirmApproveMany = async () => {
    const uids = Array.from(selectedUids);
    if (uids.length === 0) return;
    setIsProcessingMany(true);
    try {
      const { count } = await approveManyProducts(uids);
      setCards((prev) => prev.map((c) => selectedUids.has(c.uid) ? { ...c, status: "APPROVED" } : c));
      setSelectedUids(new Set());
      setIsSelectionMode(false);
      setShowConfirmMany(false);
      showToast(`${count} obra${count !== 1 ? "s" : ""} aprobada${count !== 1 ? "s" : ""} exitosamente.`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al aprobar las obras", "error");
    } finally { setIsProcessingMany(false); }
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
        <div className={`${styles.skeleton} ${styles.skeletonFilters}`} />
        <div className={styles.artworksGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={`${styles.skeleton} ${styles.skeletonCardImage}`} />
              <div className={styles.skeletonCardBody}>
                <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                <div className={`${styles.skeleton} ${styles.skeletonLineShort}`} />
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
          <button className={styles.retryBtn} onClick={loadData}>Reintentar</button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.pageContainer}>

      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Revisión de Obras</h1>
          <p className={styles.pageSubtitle}>Gestiona las obras enviadas por los estudiantes del semillero</p>
        </div>
        {pendingCount > 0 && (
          <div className={styles.headerActions}>
            <div className={styles.pendingBadge}>
              <span className={styles.pendingDot} />
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
            </div>
            <button
              className={`${styles.selectionModeBtn} ${isSelectionMode ? styles.selectionModeBtnActive : ""}`}
              onClick={toggleSelectionMode}
            >
              {isSelectionMode ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Cancelar
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="4" height="4" rx="0.5" />
                    <rect x="3" y="15" width="4" height="4" rx="0.5" />
                    <line x1="10" y1="7" x2="21" y2="7" />
                    <line x1="10" y1="17" x2="21" y2="17" />
                  </svg>
                  Seleccionar obras
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Filtros ── */}
      <div className={styles.filtersRow}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre de obra..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          {searchName && (
            <button className={styles.clearSearch} onClick={() => setSearchName("")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.selectWrapper}>
          <svg className={styles.selectIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <select
            className={styles.authorSelect}
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
          >
            <option value="all">Todos los autores</option>
            {students.map((s) => (
              <option key={s.user.uid} value={s.user.uid}>
                {s.user.name} {s.user.lastName}
              </option>
            ))}
          </select>
          <svg className={styles.selectChevron} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {(searchName || filterAuthor !== "all") && (
          <button className={styles.clearFiltersBtn} onClick={() => { setSearchName(""); setFilterAuthor("all"); }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Barra de selección masiva ── */}
      {isSelectionMode && (
        <div className={styles.selectionBar}>
          <div className={styles.selectionBarLeft}>
            <button
              className={`${styles.selectAllBtn} ${allPendingSelected ? styles.selectAllBtnActive : ""}`}
              onClick={toggleSelectAll}
            >
              <span className={`${styles.customCheckbox} ${allPendingSelected ? styles.customCheckboxChecked : ""}`}>
                {allPendingSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {allPendingSelected ? "Deseleccionar todas" : "Seleccionar todas las pendientes"}
            </button>
            <span className={styles.selectionCount}>
              {selectedUids.size > 0
                ? `${selectedUids.size} seleccionada${selectedUids.size !== 1 ? "s" : ""}`
                : "Selecciona las obras que quieres aprobar"}
            </span>
          </div>
          {selectedUids.size > 0 && (
            <button className={styles.approveManyBtn} onClick={() => setShowConfirmMany(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Aprobar seleccionadas ({selectedUids.size})
            </button>
          )}
        </div>
      )}

      {/* ══ Obras en Revisión ══ */}
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
                isTeacher={true}
                isSelectionMode={isSelectionMode}
                isSelected={selectedUids.has(card.uid)}
                onToggleSelect={handleToggleSelect}
                onStatusChange={handleStatusChange}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      )}

      {/* ══ Galería (APPROVED) ══ */}
      {approved.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Galería del Grupo</h2>
            <span className={styles.sectionCount}>{approved.length}</span>
          </div>
          <div className={styles.artworksGrid}>
            {approved.map((card) => (
              <ArtworkCard
                key={card.uid}
                product={card}
                isTeacher={true}
                isSelectionMode={false}
                isSelected={false}
                onToggleSelect={handleToggleSelect}
                onStatusChange={handleStatusChange}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      )}

      {/* Estado vacío con filtros activos */}
      {filteredCards.length === 0 && cards.length > 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <p className={styles.emptyText}>No hay obras que coincidan con los filtros</p>
          <button className={styles.clearFiltersBtn} onClick={() => { setSearchName(""); setFilterAuthor("all"); }}>
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Estado vacío total */}
      {cards.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎨</div>
          <p className={styles.emptyText}>Aún no hay obras registradas en este grupo</p>
        </div>
      )}

      {/* ── Modal: Aprobar seleccionadas ── */}
      {showConfirmMany && (
        <div className={styles.modalBackdrop} onClick={() => setShowConfirmMany(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrapper}>
              <div className={styles.modalIconApprove}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className={styles.modalTitle}>¿Estás segura?</h3>
            <p className={styles.modalMessage}>
              Vas a <strong>aprobar {selectedUids.size} obra{selectedUids.size !== 1 ? "s" : ""}</strong> de
              una sola vez. Esta acción las hará visibles en la galería.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setShowConfirmMany(false)} disabled={isProcessingMany}>
                No, cancelar
              </button>
              <button className={styles.modalConfirmApproveBtn} onClick={handleConfirmApproveMany} disabled={isProcessingMany}>
                {isProcessingMany ? "Aprobando..." : `Sí, aprobar ${selectedUids.size}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
