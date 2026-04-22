import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { getPendingInvitations, respondInvitation } from "../../../../services/events";
import type { PendingInvitation } from "../../../../interfaces/events";
import styles from "./Invitations.module.css";

const EVENT_TYPE_LABELS: Record<string, string> = {
  EXHIBITION: "Exposición",
  WORKSHOP: "Taller",
  PERFORMANCE: "Presentación",
  CONFERENCE: "Conferencia",
  OTHER: "Otro",
};

export default function InvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadInvitations = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getPendingInvitations(user.uid);
      setInvitations(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Error al cargar las invitaciones");
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { loadInvitations(); }, [loadInvitations]);

  const handleRespond = async (invitationId: string, status: "ACCEPTED" | "REJECTED") => {
    setResponding(invitationId);
    try {
      await respondInvitation(invitationId, { status });
      setInvitations((prev) => prev.filter((inv) => inv.uid !== invitationId));
      showToast(
        status === "ACCEPTED" ? "Invitación aceptada" : "Invitación rechazada",
        "success",
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al responder la invitación",
        "error",
      );
    } finally {
      setResponding(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`} />
          </div>
        </div>
        <div className={styles.invitationsList}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`} />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>⚠️</span>
          <p className={styles.errorTitle}>No se pudieron cargar las invitaciones</p>
          <p className={styles.errorMessage}>{fetchError}</p>
          <button className={styles.retryBtn} onClick={loadInvitations}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Invitaciones</h1>
          <p className={styles.pageSubtitle}>
            Invitaciones a eventos pendientes de respuesta
          </p>
        </div>
        {invitations.length > 0 && (
          <div className={styles.pendingBadge}>
            <span className={styles.pendingDot} />
            {invitations.length} pendiente{invitations.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {invitations.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <p className={styles.emptyText}>No tienes invitaciones pendientes</p>
        </div>
      ) : (
        <div className={styles.invitationsList}>
          {invitations.map((invitation) => (
            <div key={invitation.uid} className={styles.invitationCard}>
              <div className={styles.cardLeft}>
                {invitation.event.photos?.[0] ? (
                  <img
                    src={invitation.event.photos[0].photo.url}
                    alt={invitation.event.name}
                    className={styles.eventImage}
                  />
                ) : (
                  <div className={styles.eventImagePlaceholder}>
                    <span>🎨</span>
                  </div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <span className={styles.eventTypeBadge}>
                    {EVENT_TYPE_LABELS[invitation.event.eventType] ?? invitation.event.eventType}
                  </span>
                  <span className={styles.groupName}>{invitation.group.name}</span>
                </div>

                <h2 className={styles.eventName}>{invitation.event.name}</h2>

                <p className={styles.eventDate}>
                  📅 {formatDate(invitation.event.startDate)}
                </p>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.acceptBtn}
                  disabled={responding === invitation.uid}
                  onClick={() => handleRespond(invitation.uid, "ACCEPTED")}
                >
                  {responding === invitation.uid ? "..." : "Aceptar"}
                </button>
                <button
                  className={styles.rejectBtn}
                  disabled={responding === invitation.uid}
                  onClick={() => handleRespond(invitation.uid, "REJECTED")}
                >
                  {responding === invitation.uid ? "..." : "Rechazar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type === "success" ? "Success" : "Error"}`]}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
