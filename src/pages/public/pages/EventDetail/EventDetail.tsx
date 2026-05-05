import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById } from "../../../../services/events";
import type { Event, EventPhoto, EventProductItem } from "../../../../interfaces/events";
import styles from "./EventDetail.module.css";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<string, string> = {
  EXHIBITION: "Exposición",
  WORKSHOP: "Taller",
  PERFORMANCE: "Presentación",
  CONFERENCE: "Conferencia",
  OTHER: "Otro",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPhotosByType(photos: EventPhoto[], type: EventPhoto["photoType"]) {
  return photos.filter((p) => p.photoType === type);
}

function isPastEvent(event: Event): boolean {
  return event.status === "COMPLETED";
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

// ── Carrusel de fotos (MEMORY o PROMO) ──────────────────────

interface PhotoCarouselProps {
  photos: EventPhoto[];
  label: string;
  sublabel: string;
}

function PhotoCarousel({ photos, label, sublabel }: PhotoCarouselProps) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  if (!photos.length) return null;

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;
    const amount = trackRef.current.clientWidth * 0.7;
    trackRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollLeft.current = trackRef.current?.scrollLeft ?? 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };
  const stopDrag = () => { isDragging.current = false; };

  return (
    <section className={styles.carouselSection}>
      <div className={styles.carouselHeader}>
        <div>
          <span className={styles.sectionLabel}>{sublabel}</span>
          <h2 className={styles.carouselTitle}>{label}</h2>
        </div>
        <div className={styles.carouselControls}>
          <button className={styles.carouselBtn} onClick={() => scroll("left")}
            aria-label="Anterior">
            <span className="material-symbols-outlined">&lt;</span>
          </button>
          <button className={styles.carouselBtn} onClick={() => scroll("right")}
            aria-label="Siguiente">
            <span className="material-symbols-outlined">&gt;</span>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className={styles.carouselTrack}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {photos.map((p, i) => (
          <div key={i} className={styles.carouselItem}>
            <img src={BASE_URL + p.photo.url} alt={`Foto ${i + 1}`} className={styles.carouselImage} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Grid de obras ────────────────────────────────────────────

interface ArtworksGridProps {
  products: EventProductItem[];
  onNavigate: (uid: string) => void;
}

function ArtworksGrid({ products, onNavigate }: ArtworksGridProps) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  if (!products.length) return null;

  return (
    <section className={styles.artworksSection}>
      <div className={styles.artworksHeader}>
        <div>
          <span className={styles.sectionLabel}>The Collection</span>
          <h2 className={styles.artworksTitle}>Obras a Exhibir</h2>
        </div>
        <p className={styles.artworksSubtitle}>Piezas seleccionadas</p>
      </div>

      <div className={styles.artworksGrid}>
        {products.map(({ product }, index) => {
          const heroUrl = `${BASE_URL}${product.photos[0]?.photo.url ?? ""}`;
          // Alterna tamaños: el primero es wide (8 cols), el resto narrow (4 cols)
          const isWide = index === 0 || index % 5 === 0;

          return (
            <div
              key={product.uid}
              className={`${styles.artworkCard} ${isWide ? styles.artworkWide : styles.artworkNarrow}`}
              onClick={() => onNavigate(product.uid)}
            >
              <div className={`${styles.artworkImageWrapper} ${isWide ? styles.artworkImageWide : styles.artworkImageNarrow}`}>
                <img src={heroUrl} alt={product.name} className={styles.artworkImage} />
                <div className={styles.artworkOverlay} />
              </div>
              <div className={styles.artworkInfo}>
                <h3 className={styles.artworkName}>{product.name}</h3>
                <p className={styles.artworkAuthors}>
                  {product.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

const EventDetail = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEventById(uid);
        setEvent(data);
      } catch (err) {
        setError((err as Error).message || "Error al cargar el evento");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [uid]);

  // ─── Render states ────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingMessage}>Cargando evento…</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.page}>
        <div className={styles.errorMessage}>
          {error ?? "Evento no encontrado"}
          <button onClick={() => navigate("/events")}>Volver a eventos</button>
        </div>
      </div>
    );
  }

  const isPast = isPastEvent(event);
  const heroPhoto = getPhotosByType(event.photos, "HERO")[0];
  const promoPhotos = getPhotosByType(event.photos, "PROMO");
  const memoryPhotos = getPhotosByType(event.photos, "MEMORY");

  // ─── Main render ──────────────────────────────────────────

  return (
    <div className={styles.page}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg}>
          {heroPhoto && (
            <img
              src={`${BASE_URL}${heroPhoto.photo.url}`}
              alt={event.name}
              className={styles.heroBgImage}
            />
          )}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroVeil}>

            {/* Badges */}
            <div className={styles.heroBadges}>
              <span className={styles.typeBadge}>
                {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
              </span>
              <span className={styles.locationBadge}>
                <span className="material-symbols-outlined">
                  {event.isVirtual ? 
                    <img src="/public/logos/art.public.png" alt="virtual" className="logo"/> : 
                    <img src="/public/logos/ubication.public.png" alt="presencial" className="logo"/>
                  }
                </span>
                {event.isVirtual ? "Virtual" : "Presencial"}
              </span>
              {isPast && (
                <span className={styles.archiveBadge}>Evento pasado</span>
              )}
            </div>

            {/* Título */}
            <h1 className={styles.heroTitle}>{event.name}</h1>

            {/* Descripción */}
            <p className={styles.heroDescription}>{event.description}</p>

            {/* Meta row */}
            <div className={styles.heroMeta}>
              <div className={styles.heroMetaItem}>
                <span className={styles.heroMetaLabel}>Fecha</span>
                <span className={styles.heroMetaValue}>
                  {formatDate(event.startDate)}
                </span>
              </div>

              {event.endDate && (
                <>
                  <div className={styles.heroMetaDivider} />
                  <div className={styles.heroMetaItem}>
                    <span className={styles.heroMetaLabel}>Horario</span>
                    <span className={styles.heroMetaValue}>
                      {formatTime(event.startDate)} — {formatTime(event.endDate)}
                    </span>
                  </div>
                </>
              )}

              {event.groups.length > 0 && (
                <>
                  <div className={styles.heroMetaDivider} />
                  <div className={styles.heroMetaItem}>
                    <span className={styles.heroMetaLabel}>Grupos</span>
                    <span className={styles.heroMetaValue}>
                      {event.groups.map((g) => g.group.name).join(", ")}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* CTA — solo eventos futuros */}
            {!isPast && (
              <div className={styles.heroCtas}>
                {event.locationUrl && (
                  <a
                    href={event.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaPrimary}
                  >
                    Ver ubicación
                    <span className="material-symbols-outlined">&gt;</span>
                  </a>
                )}
                {event.isVirtual && event.streamingUrl && (
                  <a
                    href={event.streamingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaSecondary}
                  >
                    Unirse al evento
                    <span className="material-symbols-outlined">open_in_new</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Sección de contexto / grupos ─────────────────── */}
      <section className={styles.contextSection}>
        <div className={styles.contextInner}>
          <div className={styles.contextLeft}>
            <h2 className={styles.contextLabel}>Grupos participantes</h2>
            <div className={styles.contextGroups}>
              {event.groups.map(({ group }) => (
                <div key={group.uid} className={styles.contextGroupItem}>
                  <span className={styles.contextGroupName}>{group.name}</span>
                  <div className={styles.contextGroupMeta}>
                    <span className={styles.contextGroupLine} />
                    <span className={styles.contextGroupCategory}>
                      {group.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {event.createdBy && (
            <div className={styles.contextRight}>
              <h2 className={styles.contextLabel}>Coordinado por</h2>
              <p className={styles.contextCoordinator}>
                {event.createdBy.name} {event.createdBy.lastName}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Obras ────────────────────────────────────────── */}
      {event.products.length > 0 && (
        <ArtworksGrid
          products={event.products}
          onNavigate={(productUid) => navigate(`/products/${productUid}`)}
        />
      )}

      {/* ── Fotos promocionales (eventos futuros o sin memory) */}
      {promoPhotos.length > 0 && (
        <PhotoCarousel
          photos={promoPhotos}
          label="Recorrido Visual"
          sublabel="Gallery Experience"
        />
      )}

      {/* ── Fotos del recuerdo (solo eventos pasados) ─────── */}
      {isPast && memoryPhotos.length > 0 && (
        <PhotoCarousel
          photos={memoryPhotos}
          label="Momentos del Evento"
          sublabel="Memories in Time"
        />
      )}

      {/* ── Quote / cierre editorial ──────────────────────── */}
      <section className={styles.quoteSection}>
        <div className={styles.quoteInner}>
          <span className={styles.quoteLabel}>
            {isPast ? "Perspectiva de Archivo" : "Sobre el Evento"}
          </span>
          <blockquote className={styles.quoteText}>
            {isPast
              ? "El arte que fue permanece — transformado en memoria colectiva."
              : "Un espacio donde la creación cobra vida frente a quienes la contemplan."}
          </blockquote>
          <div className={styles.quoteLine} />
        </div>
      </section>

    </div>
  );
};

export default EventDetail;
