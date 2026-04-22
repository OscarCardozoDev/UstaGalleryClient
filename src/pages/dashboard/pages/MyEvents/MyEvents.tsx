import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { getEventsByGroup } from "../../../../services/events";
import type { EventSummary, EventStatus } from "../../../../interfaces/events";
import EventCard from "../../components/EventCard/EventCard";
import styles from "./MyEvents.module.css";

const STATUS_LABELS: Record<EventStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
};

export default function MyEventsPage() {
  const { user, currentGroup } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<EventStatus | "all">("all");
  const [searchName, setSearchName] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const activeGroupName = useMemo(
    () => user?.groups?.find((g) => g.uid === currentGroup)?.name ?? null,
    [user?.groups, currentGroup],
  );

  const loadEvents = useCallback(async () => {
    if (!currentGroup) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getEventsByGroup(currentGroup, { limit: 50 });
      setEvents(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Error al cargar eventos");
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesName = e.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesStatus = filterStatus === "all" || e.status === filterStatus;
      return matchesName && matchesStatus;
    });
  }, [events, searchName, filterStatus]);

  if (!currentGroup) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🎭</span>
          <p className={styles.emptyText}>Selecciona un grupo en el panel lateral para ver sus eventos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Mis Eventos</h1>
          <p className={styles.pageSubtitle}>
            {activeGroupName ? `Grupo: ${activeGroupName}` : "Eventos de tu grupo"}
          </p>
        </div>
        {!isLoading && (
          <div className={styles.countBadge}>
            {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Buscar evento…"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          {searchName && (
            <button className={styles.clearSearch} onClick={() => setSearchName("")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.selectWrapper}>
          <svg className={styles.selectIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M3 6h18M7 12h10M11 18h2" />
          </svg>
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as EventStatus | "all")}
          >
            <option value="all">Todos los estados</option>
            {(Object.keys(STATUS_LABELS) as EventStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <svg className={styles.selectChevron} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {(filterStatus !== "all" || searchName) && (
          <button className={styles.clearFiltersBtn} onClick={() => { setFilterStatus("all"); setSearchName(""); }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.eventsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={`${styles.skeleton} ${styles.skeletonCardImage}`} />
              <div className={styles.skeletonCardBody}>
                <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                <div className={`${styles.skeleton} ${styles.skeletonLineShort}`} />
              </div>
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>⚠️</span>
          <p className={styles.errorTitle}>No se pudieron cargar los eventos</p>
          <p className={styles.errorMessage}>{fetchError}</p>
          <button className={styles.retryBtn} onClick={loadEvents}>Reintentar</button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <p className={styles.emptyText}>
            {events.length === 0 ? "Este grupo no tiene eventos aún" : "Ningún evento coincide con los filtros"}
          </p>
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {filteredEvents.map((event) => (
            <EventCard
              key={event.uid}
              event={event}
              isAdmin={false}
              onStatusChange={() => {}}
              onDeactivate={() => {}}
              onToast={showToast}
            />
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
