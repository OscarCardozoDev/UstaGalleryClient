import { sileo } from "sileo";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { useAuth } from "../../../../context/AuthContext";
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
      } catch (err) {
        sileo.error({
          title: "Error al cargar datos",
          description: "Por favor, inténtalo de nuevo más tarde",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.uid]);

  // Datos mock
  const [attendanceCount] = useState(0);

  const notifications: Notification[] = [
    {
      id: "1",
      type: "comment",
      title: "Nuevo comentario en tu obra",
      message: "Carlos comentó en 'Astronauta Neon'",
      time: "Hace 5 min",
      read: false,
    },
    {
      id: "2",
      type: "event",
      title: "Recordatorio de evento",
      message: "Taller de Pintura mañana a las 10:00 AM",
      time: "Hace 1 hora",
      read: false,
    },
    {
      id: "3",
      type: "announcement",
      title: "Nuevo anuncio",
      message: "Convocatoria abierta para exposición de fin de semestre",
      time: "Hace 3 horas",
      read: true,
    },
    {
      id: "4",
      type: "mention",
      title: "Te mencionaron",
      message: "María te agregó al proyecto 'Mural Colaborativo'",
      time: "Hace 1 día",
      read: true,
    },
    {
      id: "5",
      type: "deadline",
      title: "Fecha límite próxima",
      message: "Entrega de proyecto final en 3 días",
      time: "Hace 2 días",
      read: true,
    },
  ];

  useEffect(() => {
    if (!currentGroup) {
      setCheckingClass(false);
      return;
    }
    getCurrentClass(currentGroup)
      .then((result) => {
        if (result.active && result.classId) {
          setCurrentClassId(result.classId);
        }
      })
      .catch(() => {
        /* silently ignore */
      })
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

  const handleArtworkClick = (artworkId: string) => {
    // navigate(`/obras/${artworkId}`);
  };

  const handleViewAllArtworks = () => {
    navigate("/home");
  };

  const handleUploadArtwork = () => {
    navigate("/dashboard/upload");
  };

  const handleEventClick = (eventId: string) => {
    console.log("Evento seleccionado:", eventId);
    // navigate(`/eventos/${eventId}`);
  };

  const handleNotificationClick = (notificationId: string) => {
    console.log("Notificación seleccionada:", notificationId);
    // navigate(`/notificaciones/${notificationId}`);
  };

  const handleViewAllNotifications = () => {
    console.log("Ver todas las notificaciones");
    // navigate("/notificaciones");
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} de ${date.getFullYear()}`;
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "comment":
        return "💬";
      case "event":
        return "📅";
      case "announcement":
        return "📢";
      case "mention":
        return "👤";
      case "deadline":
        return "⏰";
      default:
        return "🔔";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={styles.homeContainer}>
      {/* Header de bienvenida */}
      <div className={styles.welcomeSection}>
        {isLoading ? (
          <>
            <div className={styles.welcomeText}>
              <div
                className={`${styles.skeleton} ${styles.skeletonTitle}`}
              ></div>
              <div
                className={`${styles.skeleton} ${styles.skeletonText}`}
              ></div>
            </div>
            <div className={`${styles.skeleton} ${styles.skeletonHero}`}></div>
          </>
        ) : (
          <>
            <div className={styles.welcomeText}>
              <h1 className={styles.welcomeTitle}>
                Bienvenida, {user?.name || "Usuario"}
              </h1>
              <p className={styles.welcomeSubtitle}>
                Marca tu asistencia, explora tus obras y mantente al día con los
                eventos del semillero.
              </p>
            </div>
            <div className={styles.heroImage}>
              <img
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=300&h=150&fit=crop"
                alt="Arte"
                className={styles.heroImageElement}
              />
            </div>
          </>
        )}
      </div>

      {/* Grid principal - Nuevo Layout */}
      <div className={styles.mainGrid}>
        {/* div1 - Marcar Asistencia */}
        <div className={`${styles.gridItem} ${styles.div1}`}>
          {isLoading ? (
            <div className={styles.skeletonCard}>
              <div
                className={`${styles.skeleton} ${styles.skeletonCardTitle}`}
              ></div>
              <div
                className={`${styles.skeleton} ${styles.skeletonTime}`}
              ></div>
              <div
                className={`${styles.skeleton} ${styles.skeletonButton}`}
              ></div>
            </div>
          ) : (
            <div className={styles.attendanceCard}>
              <h2 className={styles.cardTitle}>Marcar Asistencia</h2>
              <div className={styles.timeDisplay}>
                <span className={styles.timeNumber}>
                  {formatTime(currentTime)}
                </span>
              </div>
              <p className={styles.dateText}>{formatDate(currentTime)}</p>

              <button
                className={`${styles.attendanceButton} ${attendanceTaken ? styles.attendanceButtonTaken : ""}`}
                onClick={handleTakeAttendance}
                disabled={attendanceTaken || !currentClassId || checkingClass}
              >
                {checkingClass ? (
                  <>Verificando clase...</>
                ) : attendanceTaken ? (
                  <>
                    <svg
                      className={styles.checkIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Asistencia Tomada
                  </>
                ) : currentClassId ? (
                  <>
                    <svg
                      className={styles.checkIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                    Tomar Asistencia
                  </>
                ) : (
                  <>No hay clase en el momento</>
                )}
              </button>

              <p className={styles.attendanceCount}>
                Asistencias este mes:{" "}
                <strong>
                  {attendanceTaken ? attendanceCount + 1 : attendanceCount}
                </strong>
              </p>
            </div>
          )}
        </div>

        {/* div2 - Mis Obras */}
        <div className={`${styles.gridItem} ${styles.div2}`}>
          {isLoading ? (
            <div className={styles.skeletonCard}>
              <div
                className={`${styles.skeleton} ${styles.skeletonCardTitle}`}
              ></div>
              <div className={styles.skeletonArtworksScroll}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonArtwork}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonArtwork}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonArtwork}`}
                ></div>
              </div>
            </div>
          ) : (
            <div className={styles.artworksSection}>
              <div className={styles.artworksHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Mis Obras</h2>
                  <p className={styles.artworksCount}>
                    <strong>{artworks.length}</strong> obras subidas
                  </p>
                </div>
                <button
                  className={styles.uploadButton}
                  onClick={handleUploadArtwork}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 3v10M3 8h10"
                    />
                  </svg>
                  Subir Obra
                </button>
              </div>

              <div className={styles.artworksScrollContainer}>
                {artworks.map((artwork) => (
                  <div
                    key={artwork.uid}
                    className={styles.artworkCardHorizontal}
                    onClick={() => handleArtworkClick(artwork.uid)}
                  >
                    <div className={styles.artworkImageHorizontal}>
                      <div className={styles.artworkPlaceholder}>
                        <img
                          key={artwork.name}
                          src={`${BASE_URL}${artwork.photos[0].photo.url}`}
                          alt="Arte"
                        />
                      </div>
                    </div>
                    <div className={styles.artworkInfoHorizontal}>
                      <h3 className={styles.artworkTitle}>{artwork.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* div3 - Notificaciones */}
        <div className={`${styles.gridItem} ${styles.div3}`}>
          {isLoading ? (
            <div className={styles.skeletonCard}>
              <div
                className={`${styles.skeleton} ${styles.skeletonCardTitle}`}
              ></div>
              <div className={styles.skeletonNotificationsList}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonNotification}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonNotification}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonNotification}`}
                ></div>
              </div>
            </div>
          ) : (
            <div className={styles.notificationsSection}>
              <div className={styles.notificationsHeader}>
                <h2 className={styles.cardTitle}>
                  Notificaciones
                  {unreadCount > 0 && (
                    <span className={styles.notificationBadge}>
                      {unreadCount}
                    </span>
                  )}
                </h2>
                <button
                  className={styles.viewAllButton}
                  onClick={handleViewAllNotifications}
                >
                  Ver todas
                </button>
              </div>

              <div className={styles.notificationsList}>
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.notificationItem} ${!notification.read ? styles.notificationUnread : ""}`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className={styles.notificationContent}>
                      <p className={styles.notificationTitle}>
                        {notification.title}
                      </p>
                      <p className={styles.notificationMessage}>
                        {notification.message}
                      </p>
                      <span className={styles.notificationTime}>
                        {notification.time}
                      </span>
                    </div>
                    {!notification.read && (
                      <div className={styles.notificationDot}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* div4 - Eventos */}
        <div className={`${styles.gridItem} ${styles.div4}`}>
          {isLoading ? (
            <div className={styles.skeletonCard}>
              <div
                className={`${styles.skeleton} ${styles.skeletonCardTitle}`}
              ></div>
              <div className={styles.skeletonEventsList}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonEvent}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonEvent}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonEvent}`}
                ></div>
              </div>
            </div>
          ) : (
            <div className={styles.eventsSection}>
              <h2 className={styles.cardTitle}>Próximos Eventos</h2>

              {upcomingEvents.length === 0 ? (
                <p className={styles.eventsEmpty}>No hay eventos próximos</p>
              ) : (
                <div className={styles.eventsTimeline}>
                  {upcomingEvents.map((event, index) => {
                    const date = new Date(event.startDate);
                    const dateLabel = date.toLocaleDateString("es-CO", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    });
                    const timeLabel = date.toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div
                        key={event.uid}
                        className={styles.eventTimelineItem}
                        onClick={() => handleEventClick(event.uid)}
                      >
                        <div className={styles.eventTimelineDot}></div>
                        {index < upcomingEvents.length - 1 && (
                          <div className={styles.eventTimelineLine}></div>
                        )}

                        <div className={styles.eventTimelineContent}>
                          <div className={styles.eventDate}>{dateLabel}</div>
                          <div className={styles.eventTimelineCard}>
                            <div className={styles.eventHeader}>
                              <span className={styles.eventBadge}>
                                {EVENT_TYPE_LABELS[event.eventType] ??
                                  event.eventType}
                              </span>
                              <span className={styles.eventTime}>
                                {timeLabel}
                              </span>
                            </div>
                            <h3 className={styles.eventTitle}>{event.name}</h3>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
