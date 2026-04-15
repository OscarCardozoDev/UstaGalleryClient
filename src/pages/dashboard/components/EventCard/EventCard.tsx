import { useState, useRef, useEffect } from "react";
import {
  updateEventStatus,
  deactivateEvent,
} from "../../../../services/events";
import type { EventSummary, EventStatus } from "../../../../interfaces/events";
import styles from "./EventCard.module.css";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface EventCardProps {
  event: EventSummary;
  isAdmin: boolean;
  onStatusChange: (uid: string, newStatus: EventStatus) => void;
  onDeactivate: (uid: string) => void;
  onToast: (message: string, type: "success" | "error") => void;
}

type ModalType = "approve" | "reject" | "cancel" | "deactivate" | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  EXHIBITION: "Exposición",
  WORKSHOP: "Taller",
  PERFORMANCE: "Presentación",
  CONFERENCE: "Conferencia",
  OTHER: "Otro",
};

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> =
  {
    PENDING: { label: "Pendiente", className: styles.statusPending },
    APPROVED: { label: "Aprobado", className: styles.statusApproved },
    REJECTED: { label: "Rechazado", className: styles.statusRejected },
    CANCELLED: { label: "Cancelado", className: styles.statusCancelled },
    COMPLETED: { label: "Completado", className: styles.statusCompleted },
  };

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EventCard({
  event,
  isAdmin,
  onStatusChange,
  onDeactivate,
  onToast,
}: EventCardProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const baseUrl = import.meta.env.VITE_API_URL;

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

  const sc = STATUS_CONFIG[event.status];
  const heroPhoto = event.photos.find((p) => p.photoType === "HERO");
  const imageUrl = heroPhoto?.photo.url ?? null;
  console.log(baseUrl + imageUrl);
  const isPending = event.status === "PENDING";
  const isApproved = event.status === "APPROVED";

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCloseDetail = () => {
    setIsPanelOpen(false);
    setModalType(null);
    setRejectFeedback("");
    setRejectError("");
  };

  const handleOpenModal = (type: ModalType) => {
    setModalType(type);
    setRejectFeedback("");
    setRejectError("");
  };

  const handleConfirmApprove = async () => {
    setIsProcessing(true);
    try {
      await updateEventStatus(event.uid, { status: "APPROVED" });
      onStatusChange(event.uid, "APPROVED");
      handleCloseDetail();
      onToast(`"${event.name}" fue aprobado exitosamente.`, "success");
    } catch (err) {
      onToast(
        err instanceof Error ? err.message : "Error al aprobar el evento",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectFeedback.trim()) {
      setRejectError("Por favor, escribe el motivo del rechazo.");
      return;
    }
    setIsProcessing(true);
    try {
      await updateEventStatus(event.uid, {
        status: "REJECTED",
        feedback: rejectFeedback.trim(),
      });
      onStatusChange(event.uid, "REJECTED");
      handleCloseDetail();
      onToast(`"${event.name}" fue rechazado.`, "error");
    } catch (err) {
      onToast(
        err instanceof Error ? err.message : "Error al rechazar el evento",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!rejectFeedback.trim()) {
      setRejectError("Por favor, escribe el motivo de la cancelación.");
      return;
    }
    setIsProcessing(true);
    try {
      await updateEventStatus(event.uid, {
        status: "CANCELLED",
        feedback: rejectFeedback.trim(),
      });
      onStatusChange(event.uid, "CANCELLED");
      handleCloseDetail();
      onToast(`"${event.name}" fue cancelado.`, "error");
    } catch (err) {
      onToast(
        err instanceof Error ? err.message : "Error al cancelar el evento",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    setIsProcessing(true);
    try {
      await deactivateEvent(event.uid);
      onDeactivate(event.uid);
      handleCloseDetail();
      onToast(`"${event.name}" fue desactivado.`, "success");
    } catch (err) {
      onToast(
        err instanceof Error ? err.message : "Error al desactivar el evento",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* ── Tarjeta ── */}
      <div className={styles.eventCard} onClick={() => setIsPanelOpen(true)}>
        {/* Menú de opciones — solo admin */}
        {isAdmin && (
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              className={styles.menuTrigger}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              aria-label="Opciones"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <div className={styles.menuDropdown}>
                {isApproved && (
                  <button
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      handleOpenModal("cancel");
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                    Cancelar evento
                  </button>
                )}
                <button
                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    handleOpenModal("deactivate");
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 6l-1 14H6L5 6"
                    />
                  </svg>
                  Desactivar evento
                </button>
              </div>
            )}
          </div>
        )}

        <div className={styles.cardImageWrapper}>
          {imageUrl ? (
            <img src={`${baseUrl}${imageUrl}`} alt={event.name} className={styles.cardImage} />
          ) : (
            <div className={styles.cardImagePlaceholder}>🗓️</div>
          )}
          <span className={`${styles.statusBadge} ${sc.className}`}>
            {sc.label}
          </span>
        </div>

        <div className={styles.cardInfo}>
          <div className={styles.cardMeta}>
            <span className={styles.cardType}>
              {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
            </span>
            <span className={styles.cardDate}>
              {formatDate(event.startDate)}
            </span>
          </div>
          <h3 className={styles.cardTitle}>{event.name}</h3>
        </div>
      </div>

      {/* ── Panel de detalle ── */}
      {isPanelOpen && (
        <div className={styles.overlay} onClick={handleCloseDetail}>
          <div
            className={styles.detailPanel}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.detailHeader}>
              <div>
                <h2 className={styles.detailTitle}>{event.name}</h2>
                <span
                  className={`${styles.statusBadge} ${sc.className}`}
                  style={{ position: "static", marginTop: 6 }}
                >
                  {sc.label}
                </span>
              </div>
              <button className={styles.closeBtn} onClick={handleCloseDetail}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className={styles.detailBody}>
              {/* Imagen */}
              <div className={styles.detailImageSection}>
                {imageUrl ? (
                  <img
                    src={`${baseUrl}${imageUrl}`}
                    alt={event.name}
                    className={styles.detailImage}
                  />
                ) : (
                  <div className={styles.detailImagePlaceholder}>🗓️</div>
                )}
              </div>

              {/* Info */}
              <div className={styles.detailInfoSection}>
                <div className={styles.infoBlock}>
                  <p className={styles.infoLabel}>Tipo</p>
                  <p className={styles.infoValue}>
                    {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                  </p>
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.infoBlock}>
                    <p className={styles.infoLabel}>Fecha de inicio</p>
                    <p className={styles.infoValue}>
                      {formatDate(event.startDate)}
                    </p>
                  </div>
                  {event.endDate && (
                    <div className={styles.infoBlock}>
                      <p className={styles.infoLabel}>Fecha de fin</p>
                      <p className={styles.infoValue}>
                        {formatDate(event.endDate)}
                      </p>
                    </div>
                  )}
                </div>

                {event.description && (
                  <div className={styles.infoBlock}>
                    <p className={styles.infoLabel}>Descripción</p>
                    <p className={styles.infoValue}>{event.description}</p>
                  </div>
                )}

                {event.groups?.length > 0 && (
                  <div className={styles.infoBlock}>
                    <p className={styles.infoLabel}>Grupos participantes</p>
                    <div className={styles.tagsRow}>
                      {event.groups.map(({ group }) => (
                        <span key={group.uid} className={styles.tag}>
                          {group.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones — solo admin + pending */}
                {isAdmin && isPending && (
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleOpenModal("approve")}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Aprobar
                    </button>
                    <button
                      className={styles.rejectBtn}
                      onClick={() => handleOpenModal("reject")}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 6L6 18M6 6l12 12"
                        />
                      </svg>
                      Rechazar
                    </button>
                  </div>
                )}

                {(!isAdmin || !isPending) && (
                  <div className={styles.reviewedNotice}>
                    {event.status === "APPROVED" &&
                      "✅ Este evento está aprobado y es visible al público."}
                    {event.status === "REJECTED" &&
                      "❌ Este evento fue rechazado."}
                    {event.status === "CANCELLED" &&
                      "🚫 Este evento fue cancelado."}
                    {event.status === "COMPLETED" &&
                      "🏁 Este evento ya ocurrió."}
                  </div>
                )}

                {/* Botón editar — siempre visible excepto CANCELLED */}
                {event.status !== "CANCELLED" && (
                  <a
                    href={`/dashboard/events/edit/${event.uid}`}
                    className={styles.editBtn}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                      />
                    </svg>
                    Editar evento
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Aprobar ── */}
      {modalType === "approve" && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setModalType(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrapper}>
              <div className={styles.modalIconApprove}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className={styles.modalTitle}>¿Aprobar este evento?</h3>
            <p className={styles.modalMessage}>
              Vas a <strong>aprobar</strong> <em>"{event.name}"</em>. El evento
              será visible al público.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setModalType(null)}
                disabled={isProcessing}
              >
                No, cancelar
              </button>
              <button
                className={styles.modalConfirmApproveBtn}
                onClick={handleConfirmApprove}
                disabled={isProcessing}
              >
                {isProcessing ? "Aprobando..." : "Sí, aprobar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Rechazar ── */}
      {modalType === "reject" && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setModalType(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrapper}>
              <div className={styles.modalIconReject}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h3 className={styles.modalTitle}>Rechazar evento</h3>
            <p className={styles.modalMessage}>
              Indica el motivo por el cual <em>"{event.name}"</em> no es
              aprobado. El profesor recibirá esta retroalimentación.
            </p>
            <div className={styles.rejectInputWrapper}>
              <label className={styles.rejectLabel}>
                Motivo del rechazo <span className={styles.required}>*</span>
              </label>
              <textarea
                className={`${styles.rejectTextarea} ${rejectError ? styles.rejectTextareaError : ""}`}
                placeholder="Ej: La fecha del evento coincide con otro evento aprobado…"
                value={rejectFeedback}
                onChange={(e) => {
                  setRejectFeedback(e.target.value);
                  if (rejectError) setRejectError("");
                }}
                rows={4}
                disabled={isProcessing}
              />
              {rejectError && (
                <p className={styles.rejectErrorMsg}>{rejectError}</p>
              )}
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setModalType(null)}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                className={styles.modalConfirmRejectBtn}
                onClick={handleConfirmReject}
                disabled={isProcessing}
              >
                {isProcessing ? "Enviando..." : "Confirmar rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Cancelar evento aprobado ── */}
      {modalType === "cancel" && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setModalType(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrapper}>
              <div className={styles.modalIconReject}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </div>
            </div>
            <h3 className={styles.modalTitle}>Cancelar evento</h3>
            <p className={styles.modalMessage}>
              Vas a <strong>cancelar</strong> <em>"{event.name}"</em>. Esta
              acción es permanente e irreversible.
            </p>
            <div className={styles.rejectInputWrapper}>
              <label className={styles.rejectLabel}>
                Motivo de cancelación <span className={styles.required}>*</span>
              </label>
              <textarea
                className={`${styles.rejectTextarea} ${rejectError ? styles.rejectTextareaError : ""}`}
                placeholder="Ej: El lugar fue cedido a otro evento institucional…"
                value={rejectFeedback}
                onChange={(e) => {
                  setRejectFeedback(e.target.value);
                  if (rejectError) setRejectError("");
                }}
                rows={4}
                disabled={isProcessing}
              />
              {rejectError && (
                <p className={styles.rejectErrorMsg}>{rejectError}</p>
              )}
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setModalType(null)}
                disabled={isProcessing}
              >
                No, volver
              </button>
              <button
                className={styles.modalConfirmRejectBtn}
                onClick={handleConfirmCancel}
                disabled={isProcessing}
              >
                {isProcessing ? "Cancelando..." : "Sí, cancelar evento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Desactivar ── */}
      {modalType === "deactivate" && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setModalType(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrapper}>
              <div className={styles.modalIconReject}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 6l-1 14H6L5 6"
                  />
                  <path strokeLinecap="round" d="M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
              </div>
            </div>
            <h3 className={styles.modalTitle}>¿Desactivar este evento?</h3>
            <p className={styles.modalMessage}>
              Vas a desactivar <em>"{event.name}"</em>. Dejará de aparecer en la
              plataforma pero los datos se conservan.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setModalType(null)}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                className={styles.modalConfirmRejectBtn}
                onClick={handleConfirmDeactivate}
                disabled={isProcessing}
              >
                {isProcessing ? "Desactivando..." : "Sí, desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
