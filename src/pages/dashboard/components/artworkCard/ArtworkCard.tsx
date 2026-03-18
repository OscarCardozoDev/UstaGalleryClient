import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ImageViewer from "../../../components/ImageViewer";
import { updateProductStatus, deleteProduct } from "../../../../services/products";
import type { Product, ProductStatus } from "../../../../interfaces/products";
import styles from "./ArtworkCard.module.css";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ArtworkCardProps {
  /** Producto completo — se pasa directamente desde el grid sin mapper */
  product: Product;
  /** true = profesor: ve botones de acción, checkboxes y modales */
  isTeacher: boolean;
  /** true = el usuario autenticado es el autor principal (solo para estudiantes) */
  isMainAuthor?: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (uid: string, e: React.MouseEvent) => void;
  onStatusChange: (uid: string, newStatus: ProductStatus) => void;
  onDelete?: (uid: string) => void;
  onToast: (message: string, type: "success" | "error") => void;
}

type ModalType = "approve" | "reject" | "delete" | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

function formatPrice(price: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(Number(price));
}

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  PENDING:  { label: "Pendiente", className: styles.statusPending },
  APPROVED: { label: "Aprobada",  className: styles.statusApproved },
  REJECTED: { label: "Rechazada", className: styles.statusRejected },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ArtworkCard({
  product, isTeacher, isMainAuthor, isSelectionMode, isSelected,
  onToggleSelect, onStatusChange, onDelete, onToast,
}: ArtworkCardProps) {
  const navigate = useNavigate();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [modalType, setModalType]     = useState<ModalType>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [rejectError, setRejectError]       = useState("");
  const [isProcessing, setIsProcessing]     = useState(false);

  // Menú de opciones (⋮)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef                 = useRef<HTMLDivElement>(null);

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const baseUrl    = import.meta.env.VITE_API_URL;
  const sc         = STATUS_CONFIG[product.status];
  const isPending  = product.status === "PENDING";
  const mainPhoto  = product.photos.find((ph) => ph.isMain) ?? product.photos[0];
  const imageUrl   = mainPhoto?.photo.url ?? null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCardClick = () => { if (!isSelectionMode) setIsPanelOpen(true); };

  const handleCloseDetail = () => {
    setIsPanelOpen(false);
    setModalType(null);
    setRejectFeedback("");
    setRejectError("");
  };

  const handleOpenModal  = (type: ModalType) => { setModalType(type); setRejectFeedback(""); setRejectError(""); };
  const handleCloseModal = () => { setModalType(null); setRejectFeedback(""); setRejectError(""); };

  const handleConfirmApprove = async () => {
    setIsProcessing(true);
    try {
      await updateProductStatus(product.uid, { status: "APPROVED" });
      onStatusChange(product.uid, "APPROVED");
      handleCloseModal();
      handleCloseDetail();
      onToast(`"${product.name}" fue aprobada exitosamente.`, "success");
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error al aprobar la obra", "error");
    } finally { setIsProcessing(false); }
  };

  const handleConfirmReject = async () => {
    if (!rejectFeedback.trim()) { setRejectError("Por favor, escribe el motivo del rechazo."); return; }
    setIsProcessing(true);
    try {
      await updateProductStatus(product.uid, { status: "REJECTED", feedback: rejectFeedback.trim() });
      onStatusChange(product.uid, "REJECTED");
      handleCloseModal();
      handleCloseDetail();
      onToast(`"${product.name}" fue rechazada.`, "error");
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error al rechazar la obra", "error");
    } finally { setIsProcessing(false); }
  };

  const handleConfirmDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteProduct(product.uid);
      setModalType(null);
      onDelete?.(product.uid);
      onToast(`"${product.name}" fue eliminada.`, "success");
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error al eliminar la obra", "error");
    } finally { setIsProcessing(false); }
  };

  return (
    <>
      {/* ── Tarjeta ── */}
      <div
        className={`${styles.artworkCard} ${isSelected ? styles.cardSelected : ""}`}
        onClick={handleCardClick}
      >
        <div className={styles.cardImageWrapper}>
          {imageUrl
            ? <img src={`${baseUrl}${imageUrl}`} alt={product.name} className={styles.cardImage} />
            : <div className={styles.imagePlaceholder}><span>🖼️</span></div>
          }
          <span className={`${styles.statusBadge} ${sc.className}`}>{sc.label}</span>

          {/* Checkbox — solo profesor + modo selección */}
          {isTeacher && isSelectionMode && isPending && (
            <button
              className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ""}`}
              onClick={(e) => onToggleSelect(product.uid, e)}
              aria-label={isSelected ? "Deseleccionar" : "Seleccionar"}
            >
              {isSelected && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )}
        </div>

        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>{product.name}</h3>

          {/* ── Menú de opciones (⋮) ── */}
          {(isTeacher || isMainAuthor) && !isSelectionMode && (
            <div className={styles.menuWrapper} ref={menuRef}>
              <button
                className={styles.menuTrigger}
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                aria-label="Opciones"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5"  r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {menuOpen && (
                <div className={styles.menuDropdown}>
                    <button
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setModalType("delete"); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
                        <path strokeLinecap="round" d="M10 11v6M14 11v6M9 6V4h6v2" />
                      </svg>
                      Eliminar obra
                    </button>
                  {!isTeacher ? (
                    <button
                      className={styles.menuItem}
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); navigate(`/dashboard/update/${product.uid}`); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editar obra
                    </button>
                  ): ""}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Panel de detalle ── */}
      {isPanelOpen && (
        <div className={styles.overlay} onClick={handleCloseDetail}>
          <div className={styles.detailPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <div>
                <h2 className={styles.detailTitle}>{product.name}</h2>
                <span
                  className={`${styles.statusBadge} ${STATUS_CONFIG[product.status].className}`}
                  style={{ position: "static", marginTop: 6 }}
                >
                  {STATUS_CONFIG[product.status].label}
                </span>
              </div>
              <button className={styles.closeBtn} onClick={handleCloseDetail}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.detailBody}>
              <div className={styles.detailImageSection}>
                <ImageViewer images={product.photos} baseUrl={baseUrl} />
              </div>
              <div className={styles.detailInfoSection}>
                <div className={styles.infoBlock}>
                  <p className={styles.infoLabel}>Descripción</p>
                  <p className={styles.infoValue}>{product.description}</p>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoBlock}>
                    <p className={styles.infoLabel}>Fecha de creación</p>
                    <p className={styles.infoValue}>{formatDate(product.madeAt)}</p>
                  </div>
                  {product.price && Number(product.price) > 0 && (
                    <div className={styles.infoBlock}>
                      <p className={styles.infoLabel}>Precio</p>
                      <p className={styles.infoValue}>{formatPrice(product.price)}</p>
                    </div>
                  )}
                </div>

                {product.status === "REJECTED" && product.feedback && (
                  <div className={styles.feedbackBlock}>
                    <p className={styles.infoLabel}>Motivo de rechazo</p>
                    <p className={styles.feedbackText}>{product.feedback}</p>
                  </div>
                )}

                {isTeacher && isPending && (
                  <div className={styles.actionButtons}>
                    <button className={styles.approveBtn} onClick={() => handleOpenModal("approve")}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Aceptar obra
                    </button>
                    <button className={styles.rejectBtn} onClick={() => handleOpenModal("reject")}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                      </svg>
                      No aceptar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Aprobar ── */}
      {modalType === "approve" && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
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
              Vas a <strong>aprobar</strong> la obra <em>"{product.name}"</em>. Esta acción la hará visible en la galería.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={handleCloseModal} disabled={isProcessing}>
                No, cancelar
              </button>
              <button className={styles.modalConfirmApproveBtn} onClick={handleConfirmApprove} disabled={isProcessing}>
                {isProcessing ? "Aprobando..." : "Sí, aprobar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Rechazar ── */}
      {modalType === "reject" && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrapper}>
              <div className={styles.modalIconReject}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h3 className={styles.modalTitle}>No aceptar obra</h3>
            <p className={styles.modalMessage}>
              Indica el motivo por el cual <em>"{product.name}"</em> no es aceptada. El estudiante recibirá esta retroalimentación.
            </p>
            <div className={styles.rejectInputWrapper}>
              <label className={styles.rejectLabel}>
                Motivo del rechazo <span className={styles.required}>*</span>
              </label>
              <textarea
                className={`${styles.rejectTextarea} ${rejectError ? styles.rejectTextareaError : ""}`}
                placeholder="Ej: La imagen no cumple con la resolución mínima requerida…"
                value={rejectFeedback}
                onChange={(e) => { setRejectFeedback(e.target.value); if (rejectError) setRejectError(""); }}
                rows={4}
                disabled={isProcessing}
              />
              {rejectError && <p className={styles.rejectErrorMsg}>{rejectError}</p>}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={handleCloseModal} disabled={isProcessing}>
                Cancelar
              </button>
              <button className={styles.modalConfirmRejectBtn} onClick={handleConfirmReject} disabled={isProcessing}>
                {isProcessing ? "Enviando..." : "Confirmar rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Eliminar (profesor) ── */}
      {modalType === "delete" && (
        <div className={styles.modalBackdrop} onClick={() => setModalType(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrapper}>
              <div className={styles.modalIconReject}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
                  <path strokeLinecap="round" d="M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
              </div>
            </div>
            <h3 className={styles.modalTitle}>¿Eliminar esta obra?</h3>
            <p className={styles.modalMessage}>
              Vas a eliminar <em>"{product.name}"</em> de forma permanente. Esta acción no se puede deshacer.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setModalType(null)} disabled={isProcessing}>
                Cancelar
              </button>
              <button className={styles.modalConfirmRejectBtn} onClick={handleConfirmDelete} disabled={isProcessing}>
                {isProcessing ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}