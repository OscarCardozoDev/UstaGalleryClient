import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUpcomingEvents, getPastEvents } from "../../../../services/events";
import type { EventSummary, EventType } from "../../../../interfaces/events";
import styles from "./Events.module.css";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  EXHIBITION: "Exposición",
  WORKSHOP: "Taller",
  PERFORMANCE: "Presentación",
  CONFERENCE: "Conferencia",
  OTHER: "Otro",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getHeroUrl(event: EventSummary): string {
  return event.photos.find((p) => p.photoType === "HERO")?.photo.url ?? "";
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

interface EventCardWideProps {
  event: EventSummary;
  isPast?: boolean;
  onNavigate: (uid: string) => void;
}

function EventCardWide({ event, isPast, onNavigate }: EventCardWideProps) {
  return (
    <div
      className={`${styles.eventCardWide} ${isPast ? styles.pastCard : ""}`}
      onClick={() => onNavigate(event.uid)}
    >
      <div className={styles.wideImageWrapper}>
        <img
          src={getHeroUrl(event)}
          alt={event.name}
          className={styles.wideImage}
        />
        <div className={styles.statusBadge}>
          {isPast ? "Archivo" : "Próximamente"}
        </div>
      </div>

      <div className={styles.wideInfo}>
        <p className={styles.eventMeta}>
          {formatDate(event.startDate)} &bull;{" "}
          {EVENT_TYPE_LABELS[event.eventType]}
        </p>
        <h3 className={styles.wideTitle}>{event.name}</h3>
        {event.description && (
          <p className={styles.wideDescription}>{event.description}</p>
        )}
        <span className={styles.detailLink}>
          {isPast ? "Ver archivo" : "Ver detalles"}
        </span>
      </div>
    </div>
  );
}

interface EventCardNarrowProps {
  event: EventSummary;
  isPast?: boolean;
  onNavigate: (uid: string) => void;
}

function EventCardNarrow({ event, isPast, onNavigate }: EventCardNarrowProps) {
  return (
    <div
      className={`${styles.eventCardNarrow} ${isPast ? styles.pastCard : ""}`}
      onClick={() => onNavigate(event.uid)}
    >
      <div className={styles.narrowImageWrapper}>
        <img
          src={getHeroUrl(event)}
          alt={event.name}
          className={styles.narrowImage}
        />
        <div className={styles.statusBadge}>
          {isPast ? "Archivo" : "Próximamente"}
        </div>
      </div>
      <div className={styles.narrowInfo}>
        <p className={styles.eventMeta}>
          {formatDate(event.startDate)} &bull;{" "}
          {EVENT_TYPE_LABELS[event.eventType]}
        </p>
        <h3 className={styles.narrowTitle}>{event.name}</h3>
        {event.description && (
          <p className={styles.narrowDescription}>{event.description}</p>
        )}
        <span className={styles.detailLink}>
          {isPast ? "Ver archivo" : "Ver detalles"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const PAGE_LIMIT = 6;

const Events = () => {
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState<EventSummary[]>([]);
  const [past, setPast] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paginación independiente
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);
  const [hasMorePast, setHasMorePast] = useState(true);
  const [loadingMoreUpcoming, setLoadingMoreUpcoming] = useState(false);
  const [loadingMorePast, setLoadingMorePast] = useState(false);

  // ─── Fetch inicial ──────────────────────────────────────────

  const fetchInitial = async () => {
    try {
      setLoading(true);
      setError(null);

      const [upcomingData, pastData] = await Promise.all([
        getUpcomingEvents({ page: 1, limit: PAGE_LIMIT }),
        getPastEvents({ page: 1, limit: PAGE_LIMIT }),
      ]);

      setUpcoming(upcomingData);
      setPast(pastData);
      setHasMoreUpcoming(upcomingData.length >= PAGE_LIMIT);
      setHasMorePast(pastData.length >= PAGE_LIMIT);
    } catch (err) {
      setError((err as Error).message || "Error al cargar los eventos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  // ─── Load more ──────────────────────────────────────────────

  const loadMoreUpcoming = async () => {
    if (loadingMoreUpcoming || !hasMoreUpcoming) return;
    setLoadingMoreUpcoming(true);
    try {
      const nextPage = upcomingPage + 1;
      const data = await getUpcomingEvents({ page: nextPage, limit: PAGE_LIMIT });
      setUpcoming((prev) => [...prev, ...data]);
      setUpcomingPage(nextPage);
      if (data.length < PAGE_LIMIT) setHasMoreUpcoming(false);
    } catch {
      // silencioso — no interrumpe el render
    } finally {
      setLoadingMoreUpcoming(false);
    }
  };

  const loadMorePast = async () => {
    if (loadingMorePast || !hasMorePast) return;
    setLoadingMorePast(true);
    try {
      const nextPage = pastPage + 1;
      const data = await getPastEvents({ page: nextPage, limit: PAGE_LIMIT });
      setPast((prev) => [...prev, ...data]);
      setPastPage(nextPage);
      if (data.length < PAGE_LIMIT) setHasMorePast(false);
    } catch {
      // silencioso
    } finally {
      setLoadingMorePast(false);
    }
  };

  const handleNavigate = (uid: string) => navigate(`/events/${uid}`);

  // ─── Featured event (primer upcoming) ──────────────────────

  const featured = upcoming[0] ?? null;
  const restUpcoming = upcoming.slice(1);

  // ─── Render states ──────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingMessage}>Cargando eventos…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorMessage}>
          {error}
          <button onClick={fetchInitial}>Reintentar</button>
        </div>
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────────

  return (
    <div className={styles.page}>

      {/* ── Hero: evento destacado ─────────────────────────── */}
      {featured && (
        <section
          className={styles.heroSection}
          onClick={() => handleNavigate(featured.uid)}
        >
          <div className={styles.heroImageWrapper}>
            <img
              src={getHeroUrl(featured)}
              alt={featured.name}
              className={styles.heroImage}
            />
          </div>

          <div className={styles.heroOverlay}>
            <div className={styles.heroVeil}>
              <span className={styles.heroLabel}>
                Evento destacado — Próximamente
              </span>
              <h1 className={styles.heroTitle}>{featured.name}</h1>
              <div className={styles.heroDateRow}>
                <span className={styles.heroDateItem}>
                  <span className="material-symbols-outlined">calendar_today</span>
                  {formatDate(featured.startDate)}
                </span>
                {featured.isVirtual && (
                  <span className={styles.heroDateItem}>
                    <span className="material-symbols-outlined">videocam</span>
                    Virtual
                  </span>
                )}
              </div>
              {featured.description && (
                <p className={styles.heroDescription}>{featured.description}</p>
              )}
              <div className={styles.heroCtaWrapper}>
                <button className={styles.heroCta}>VER EVENTO</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Sección: Próximos eventos ──────────────────────── */}
      <section className={styles.eventsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Exhibition Schedule</h2>
          <p className={styles.sectionSubtitle}>Próximos &amp; Pasados</p>
        </div>

        {restUpcoming.length === 0 && past.length === 0 ? (
          <p className={styles.emptyMessage}>
            No hay más eventos disponibles por el momento.
          </p>
        ) : (
          <div className={styles.eventsGrid}>

            {/* Upcoming: wide + narrow alternados */}
            {restUpcoming.map((event, index) =>
              index % 3 === 0 ? (
                <EventCardWide
                  key={event.uid}
                  event={event}
                  onNavigate={handleNavigate}
                />
              ) : (
                <EventCardNarrow
                  key={event.uid}
                  event={event}
                  onNavigate={handleNavigate}
                />
              )
            )}

            {/* Past events */}
            {past.map((event) => (
              <EventCardNarrow
                key={event.uid}
                event={event}
                isPast
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}

        {/* Load more buttons */}
        <div className={styles.loadMoreRow}>
          {hasMoreUpcoming && (
            <button
              className={styles.loadMoreBtn}
              onClick={loadMoreUpcoming}
              disabled={loadingMoreUpcoming}
            >
              {loadingMoreUpcoming
                ? "Cargando…"
                : "Explorar más eventos próximos"}
            </button>
          )}
          {hasMorePast && (
            <button
              className={styles.loadMoreBtn}
              onClick={loadMorePast}
              disabled={loadingMorePast}
            >
              {loadingMorePast ? "Cargando…" : "Explorar archivo completo"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;
