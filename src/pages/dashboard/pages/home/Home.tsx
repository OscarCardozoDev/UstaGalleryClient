import { sileo } from "sileo";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Upload } from "lucide-react";
import styles from "./Home.module.css";
import { useAuth } from "../../../../context/AuthContext";
import AnimatedList from "../../../../components/AnimatedList/AnimatedList"
import { getCurrentClass, attendClass } from "../../../../services/classes";
import type { ProductGallery } from "../../../../interfaces/products";
import { getProductByAuthor } from "../../../../services/products";
import { getHomeEvents } from "../../../../services/events";
import type { EventHome } from "../../../../interfaces/events";

const EVENT_TYPE_LABELS: Record<string, string> = {
  EXHIBITION: "Exposición",
  WORKSHOP: "Taller",
  PERFORMANCE: "Presentación",
  CONFERENCE: "Conferencia",
  OTHER: "Otro",
};

interface Notification {
  id: string;
  type: "comment" | "event" | "announcement" | "mention" | "deadline";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Home() {
  const navigate = useNavigate();
  const { user, currentGroup } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [artworks, setArtworks] = useState<ProductGallery[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventHome[]>([]);
  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [currentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const [checkingClass, setCheckingClass] = useState(true);
  const [attendanceCount] = useState(0);

  const notifications: Notification[] = [
    { id: "1", type: "comment",      title: "Nuevo comentario en tu obra",   message: "Carlos comentó en 'Astronauta Neon'",                      time: "Hace 5 min",   read: false },
    { id: "2", type: "event",        title: "Recordatorio de evento",        message: "Taller de Pintura mañana a las 10:00 AM",                  time: "Hace 1 hora",  read: false },
    { id: "3", type: "announcement", title: "Nuevo anuncio",                 message: "Convocatoria abierta para exposición de fin de semestre",  time: "Hace 3 horas", read: true  },
    { id: "4", type: "mention",      title: "Te mencionaron",                message: "María te agregó al proyecto 'Mural Colaborativo'",         time: "Hace 1 día",   read: true  },
    { id: "5", type: "deadline",     title: "Fecha límite próxima",          message: "Entrega de proyecto final en 3 días",                      time: "Hace 2 días",  read: true  },
  ];

  useEffect(() => {
    setIsLoading(true);
    const loadData = async () => {
      try {
        const [artworksData, eventsData] = await Promise.all([
          getProductByAuthor(user?.uid || ""),
          getHomeEvents({ limit: 4 }),
        ]);
        setArtworks(artworksData);
        setUpcomingEvents(eventsData);
      } catch {
        sileo.error({ title: "Error al cargar datos", description: "Por favor, inténtalo de nuevo más tarde" });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.uid]);

  useEffect(() => {
    if (!currentGroup) { setCheckingClass(false); return; }
    getCurrentClass(currentGroup)
      .then((result) => { if (result.active && result.classId) setCurrentClassId(result.classId); })
      .catch(() => {})
      .finally(() => setCheckingClass(false));
  }, [currentGroup]);

  const handleTakeAttendance = async () => {
    if (!currentClassId) return;
    try {
      await attendClass({ classId: currentClassId });
      setAttendanceTaken(true);
    } catch {
      setAttendanceTaken(true);
    }
  };

  const handleArtworkClick = (artworkId: string) => {};
  const handleUploadArtwork  = () => navigate("/dashboard/upload");
  const handleEventClick     = (eventId: string)       => { console.log("Evento seleccionado:", eventId); };
  const handleNotificationClick   = (id: string) => { console.log("Notificación seleccionada:", id); };
  const handleViewAllNotifications = ()           => { console.log("Ver todas las notificaciones"); };

  const formatTime = (date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
  };

  const formatDate = (date: Date) => {
    const days   = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} de ${date.getFullYear()}`;
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    const icons = { comment: "💬", event: "📅", announcement: "📢", mention: "👤", deadline: "⏰" };
    return icons[type] ?? "🔔";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const attendBtnClass = attendanceTaken
    ? styles.attendBtnTaken
    : currentClassId && !checkingClass
    ? styles.attendBtnActive
    : styles.attendBtnDisabled;

  return (
    <div className={styles.homeContainer}>
      <div className={styles.bentoGrid}>

        {/* ── Attendance ──────────────────────────────────────────── */}
        <div className={`${styles.tile} ${styles.tileAttend}`}>
          {isLoading ? (
            <>
              <div className={styles.attendTimeBlock}>
                <div className={styles.skelAttendBlock} style={{ width: "70%", height: 52, marginBottom: 8 }} />
                <div className={styles.skelAttendBlock} style={{ width: "55%", height: 12 }} />
              </div>
              <div className={styles.skelAttendBlock} style={{ height: 44, borderRadius: 10 }} />
            </>
          ) : (
            <>
              <div className={styles.attendTop}>
                <p className={styles.attendLabel}>Semillero de Arte</p>
                <div className={styles.attendStatusRow}>
                  <span className={`${styles.attendDot} ${currentClassId ? styles.attendDotActive : ""}`} />
                  <span className={styles.attendStatusText}>
                    {checkingClass ? "Verificando…" : currentClassId ? "Clase en curso" : "Sin clase activa"}
                  </span>
                </div>
              </div>

              <div className={styles.attendTimeBlock}>
                <p className={styles.attendTime}>{formatTime(currentTime)}</p>
                <p className={styles.attendDate}>{formatDate(currentTime)}</p>
              </div>

              <div className={styles.attendBottom}>
                <button
                  className={`${styles.attendBtn} ${attendBtnClass}`}
                  onClick={handleTakeAttendance}
                  disabled={attendanceTaken || !currentClassId || checkingClass}
                >
                  {attendanceTaken ? (
                    <><CheckCircle2 size={15} /> Asistencia tomada</>
                  ) : (
                    <><Clock size={15} /> {checkingClass ? "Verificando…" : currentClassId ? "Tomar asistencia" : "Sin clase activa"}</>
                  )}
                </button>
                <p className={styles.attendCount}>
                  Asistencias este mes:{" "}
                  <strong>{attendanceTaken ? attendanceCount + 1 : attendanceCount}</strong>
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Welcome ─────────────────────────────────────────────── */}
        <div className={`${styles.tile} ${styles.tileWelcome}`}>
          {isLoading ? (
            <div className={styles.welcomeText}>
              <div className={styles.skelBlock} style={{ width: "35%", height: 12, marginBottom: 6 }} />
              <div className={styles.skelBlock} style={{ width: "55%", height: 26, marginBottom: 10 }} />
              <div className={styles.skelBlock} style={{ width: "90%", height: 12 }} />
            </div>
          ) : (
            <>
              <div className={styles.welcomeText}>
                <p className={styles.welcomeGreeting}>Bienvenida,</p>
                <h1 className={styles.welcomeName}>{user?.name || "Usuario"}</h1>
                <p className={styles.welcomeSub}>
                  Marca tu asistencia, explora tus obras y mantente al día con los eventos del semillero.
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Artworks ────────────────────────────────────────────── */}
        <div className={`${styles.tile} ${styles.tileArtworks}`}>
          {isLoading ? (
            <>
              <div className={styles.tileHeader}>
                <div className={styles.skelBlock} style={{ width: 80, height: 16 }} />
                <div className={styles.skelBlock} style={{ width: 70, height: 28, borderRadius: 7 }} />
              </div>
              <div style={{ display: "flex", gap: 10, flex: 1 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.skelBlock}
                    style={{ width: 120, flexShrink: 0, height: "100%", borderRadius: 10 }} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.tileHeader}>
                <div>
                  <h2 className={styles.tileTitle}>Mis Obras</h2>
                  <p className={styles.tileMeta}>{artworks.length} obras subidas</p>
                </div>
                <button className={styles.actionBtn} onClick={handleUploadArtwork}>
                  <Upload size={13} /> Subir obra
                </button>
              </div>
              <div className={styles.artworksScroll}>
                {artworks.length === 0 ? (
                  <p className={styles.artworksEmpty}>Aún no has subido obras</p>
                ) : (
                  artworks.map((artwork) => (
                    <div key={artwork.uid} className={styles.artworkCard}
                      onClick={() => handleArtworkClick(artwork.uid)}>
                      <div className={styles.artworkImg}>
                        <img src={`${BASE_URL}${artwork.photos[0].photo.url}`} alt={artwork.name} />
                      </div>
                      <p className={styles.artworkName}>{artwork.name}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Events ──────────────────────────────────────────────── */}
        <div className={`${styles.tile} ${styles.tileEvents}`}>
          {isLoading ? (
            <>
              <div className={styles.tileHeader}>
                <div className={styles.skelBlock} style={{ width: 110, height: 16 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.skelBlock} style={{ height: 70, borderRadius: 10 }} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.tileHeader}>
                <h2 className={styles.tileTitle}>Próximos Eventos</h2>
              </div>
              {upcomingEvents.length === 0 ? (
                <p className={styles.eventsEmpty}>No hay eventos próximos</p>
              ) : (
                
                <div className={styles.eventsList}>
                  {upcomingEvents.map((event) => {
                    const date = new Date(event.startDate);

                    <>

                    </>
                    return (
                      <div key={event.uid} className={styles.eventItem}
                        onClick={() => handleEventClick(event.uid)}>
                          
                        <p className={styles.eventItemDate}>
                          {date.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        <div className={styles.eventItemMeta}>
                          <span className={styles.eventTypeBadge}>
                            {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                          </span>
                          <span className={styles.eventItemTime}>
                            {date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className={styles.eventItemName}>{event.name}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Notifications ───────────────────────────────────────── */}
        <div className={`${styles.tile} ${styles.tileNotifs}`}>
          {isLoading ? (
            <>
              <div className={styles.tileHeader}>
                <div className={styles.skelBlock} style={{ width: 90, height: 16 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.skelBlock} style={{ height: 44, borderRadius: 8 }} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.tileHeader}>
                <h2 className={styles.tileTitle}>
                  Notificaciones
                  {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
                </h2>
                <button className={styles.viewAllBtn} onClick={handleViewAllNotifications}>
                  Ver todas
                </button>
              </div>
              <div className={styles.notifsList}>
                  <AnimatedList
                    items={upcomingEvents.map(e => `${e.name} - ${new Date(e.startDate).toLocaleDateString("es-CO")}`)}
                    onItemSelect={(upcomingEvents) => console.log(upcomingEvents.date)}
                    showGradients
                    enableArrowNavigation
                    displayScrollbar
                  />

              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
