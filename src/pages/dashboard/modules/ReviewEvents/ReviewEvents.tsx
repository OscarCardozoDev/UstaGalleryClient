import { useState, useEffect, useCallback, useMemo } from "react";
import { sileo } from "sileo";
import { getAllEvents } from "../../../../services/events";
import type { EventSummary, EventStatus, EventType } from "../../../../interfaces/events";
import EventCard from "../../components/eventCard/EventCard";
import styles from "./ReviewEvents.module.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  EXHIBITION: "Exposición",
  WORKSHOP:   "Taller",
  PERFORMANCE: "Presentación",
  CONFERENCE: "Conferencia",
  OTHER:      "Otro",
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ReviewEvents() {
  const [events, setEvents]               = useState<EventSummary[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [fetchError, setFetchError]       = useState<string | null>(null);

  // Filtros
  const [searchName, setSearchName]           = useState("");
  const [filterStatus, setFilterStatus]       = useState<EventStatus | "all">("all");
  const [filterType, setFilterType]           = useState<EventType | "all">("all");

  // ── Carga ─────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setIsLoadingList(true);
    setFetchError(null);
    try {
      const data = await getAllEvents({ page: 1, limit: 100 });
      setEvents(data);
      console.log("Eventos cargados:", data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Error al cargar los eventos");
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filtrado ──────────────────────────────────────────────────────────────

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesName   = e.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesStatus = filterStatus === "all" || e.status === filterStatus;
      const matchesType   = filterType === "all"   || e.eventType === filterType;
      return matchesName && matchesStatus && matchesType;
    });
  }, [events, searchName, filterStatus, filterType]);

  // Secciones
  const pendingEvents   = filteredEvents.filter((e) => e.status === "PENDING");
  const approvedEvents  = filteredEvents.filter((e) => e.status === "APPROVED");
  const pastEvents      = filteredEvents.filter((e) => e.status === "COMPLETED");
  const rejectedEvents  = filteredEvents.filter((e) => e.status === "REJECTED" || e.status === "CANCELLED");

  const pendingCount = events.filter((e) => e.status === "PENDING").length;

  // ── Toast ─────────────────────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: "success" | "error") => {
    if (type === "success") sileo.success({ title: message });
    else sileo.error({ title: message });
  }, []);

  // ── Callbacks ─────────────────────────────────────────────────────────────

  const handleStatusChange = (uid: string, newStatus: EventStatus) => {
    setEvents((prev) =>
      prev.map((e) => (e.uid === uid ? { ...e, status: newStatus } : e))
    );
  };

  const handleDeactivate = (uid: string) => {
    setEvents((prev) => prev.filter((e) => e.uid !== uid));
  };

  const clearFilters = () => {
    setSearchName("");
    setFilterStatus("all");
    setFilterType("all");
  };

  const hasActiveFilters =
    searchName !== "" || filterStatus !== "all" || filterType !== "all";

  // ── Skeleton ──────────────────────────────────────────────────────────────

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
        <div className={styles.eventsGrid}>
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
          <p className={styles.errorTitle}>No se pudieron cargar los eventos</p>
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
          <h1 className={styles.pageTitle}>Gestión de Eventos</h1>
          <p className={styles.pageSubtitle}>
            Revisa, aprueba o rechaza los eventos enviados por los profesores
          </p>
        </div>
        {pendingCount > 0 && (
          <div className={styles.pendingBadge}>
            <span className={styles.pendingDot} />
            {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Filtros ── */}
      <div className={styles.filtersRow}>

        {/* Búsqueda por nombre */}
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre de evento..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          {searchName && (
            <button className={styles.clearSearch} onClick={() => setSearchName("")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filtro por status */}
        <div className={styles.selectWrapper}>
          <svg className={styles.selectIcon} width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as EventStatus | "all")}
          >
            <option value="all">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="APPROVED">Aprobados</option>
            <option value="REJECTED">Rechazados</option>
            <option value="CANCELLED">Cancelados</option>
            <option value="COMPLETED">Completados</option>
          </select>
          <svg className={styles.selectChevron} width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Filtro por tipo */}
        <div className={styles.selectWrapper}>
          <svg className={styles.selectIcon} width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <select
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as EventType | "all")}
          >
            <option value="all">Todos los tipos</option>
            {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((key) => (
              <option key={key} value={key}>{EVENT_TYPE_LABELS[key]}</option>
            ))}
          </select>
          <svg className={styles.selectChevron} width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {hasActiveFilters && (
          <button className={styles.clearFiltersBtn} onClick={clearFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ══ Eventos Pendientes ══ */}
      {pendingEvents.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pendientes de revisión</h2>
            <span className={styles.sectionCount}>{pendingEvents.length}</span>
          </div>
          <div className={styles.eventsGrid}>
            {pendingEvents.map((event) => (
              <EventCard
                key={event.uid}
                event={event}
                isAdmin={true}
                onStatusChange={handleStatusChange}
                onDeactivate={handleDeactivate}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      )}

      {/* ══ Eventos Aprobados ══ */}
      {approvedEvents.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Eventos aprobados</h2>
            <span className={styles.sectionCount}>{approvedEvents.length}</span>
          </div>
          <div className={styles.eventsGrid}>
            {approvedEvents.map((event) => (
              <EventCard
                key={event.uid}
                event={event}
                isAdmin={true}
                onStatusChange={handleStatusChange}
                onDeactivate={handleDeactivate}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      )}

      {/* ══ Eventos Pasados ══ */}
      {pastEvents.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Eventos pasados</h2>
            <span className={styles.sectionCount}>{pastEvents.length}</span>
          </div>
          <div className={styles.eventsGrid}>
            {pastEvents.map((event) => (
              <EventCard
                key={event.uid}
                event={event}
                isAdmin={true}
                onStatusChange={handleStatusChange}
                onDeactivate={handleDeactivate}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      )}

      {/* ══ Rechazados / Cancelados ══ */}
      {rejectedEvents.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Rechazados y cancelados</h2>
            <span className={styles.sectionCount}>{rejectedEvents.length}</span>
          </div>
          <div className={styles.eventsGrid}>
            {rejectedEvents.map((event) => (
              <EventCard
                key={event.uid}
                event={event}
                isAdmin={true}
                onStatusChange={handleStatusChange}
                onDeactivate={handleDeactivate}
                onToast={showToast}
              />
            ))}
          </div>
        </section>
      )}

      {/* Estado vacío con filtros */}
      {filteredEvents.length === 0 && events.length > 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <p className={styles.emptyText}>No hay eventos que coincidan con los filtros</p>
          <button className={styles.clearFiltersBtn} onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Estado vacío total */}
      {events.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🗓️</div>
          <p className={styles.emptyText}>Aún no hay eventos registrados en la plataforma</p>
        </div>
      )}

    </div>
  );
}
