import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { useAuth } from "../../../../context/AuthContext";
import { getCurrentClass, attendClass } from "../../../../services/classes";

interface Event {
  id: string;
  title: string;
  time: string;
  location: string;
  type: "PRÁCTICA DIRIGIDA" | "CHARLA ABIERTA";
  attendees: number;
  maxAttendees?: number;
  description: string;
  image: string;
  date: string;
}

interface Artwork {
  id: string;
  title: string;
  category: string;
  image: string;
  uploadDate: string;
}

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
  const { currentGroup } = useAuth();
  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [currentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const [checkingClass, setCheckingClass] = useState(true);

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Datos mock
  const userName = "Antonella";
  const [attendanceCount] = useState(0);
  
  const artworks: Artwork[] = [
    {
      id: "1",
      title: "Astronauta Neon",
      category: "Arte Digital",
      image: "🚀",
      uploadDate: "2024-04-15"
    },
    {
      id: "2",
      title: "Lazos Humanos",
      category: "Arte Conceptual",
      image: "🤝",
      uploadDate: "2024-04-15"
    },
    {
      id: "3",
      title: "Paisaje Urbano",
      category: "Fotografía",
      image: "🌆",
      uploadDate: "2024-04-10"
    },
    {
      id: "4",
      title: "Retrato Abstracto",
      category: "Pintura",
      image: "🎨",
      uploadDate: "2024-04-08"
    },
    {
      id: "5",
      title: "Escultura Moderna",
      category: "Escultura",
      image: "🗿",
      uploadDate: "2024-04-05"
    }
  ];

  const notifications: Notification[] = [
    {
      id: "1",
      type: "comment",
      title: "Nuevo comentario en tu obra",
      message: "Carlos comentó en 'Astronauta Neon'",
      time: "Hace 5 min",
      read: false
    },
    {
      id: "2",
      type: "event",
      title: "Recordatorio de evento",
      message: "Taller de Pintura mañana a las 10:00 AM",
      time: "Hace 1 hora",
      read: false
    },
    {
      id: "3",
      type: "announcement",
      title: "Nuevo anuncio",
      message: "Convocatoria abierta para exposición de fin de semestre",
      time: "Hace 3 horas",
      read: true
    },
    {
      id: "4",
      type: "mention",
      title: "Te mencionaron",
      message: "María te agregó al proyecto 'Mural Colaborativo'",
      time: "Hace 1 día",
      read: true
    },
    {
      id: "5",
      type: "deadline",
      title: "Fecha límite próxima",
      message: "Entrega de proyecto final en 3 días",
      time: "Hace 2 días",
      read: true
    }
  ];

  const upcomingEvents: Event[] = [
    {
      id: "1",
      title: "Taller de Acuarela",
      time: "10:00 AM",
      location: "Aula de Artes",
      type: "PRÁCTICA DIRIGIDA",
      attendees: 15,
      description: "Técnicas avanzadas de acuarela con la profesora Sandra.",
      image: "🎨",
      date: "Mañana"
    },
    {
      id: "2",
      title: "Exposición Semestral",
      time: "6:00 PM",
      location: "Galería Principal",
      type: "CHARLA ABIERTA",
      attendees: 45,
      description: "Inauguración de la exposición de trabajos del semestre.",
      image: "🖼️",
      date: "Viernes 16"
    },
    {
      id: "3",
      title: "Crítica de Obra Grupal",
      time: "2:00 PM",
      location: "Sala 102",
      type: "PRÁCTICA DIRIGIDA",
      attendees: 12,
      description: "Sesión de retroalimentación entre compañeros.",
      image: "💬",
      date: "Lunes 19"
    },
    {
      id: "4",
      title: "Conferencia: Arte Urbano",
      time: "4:00 PM",
      location: "Auditorio Central",
      type: "CHARLA ABIERTA",
      attendees: 80,
      description: "Charla con el artista urbano reconocido Juan Pérez.",
      image: "🎭",
      date: "Mar 21"
    }
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
      .catch(() => { /* silently ignore */ })
      .finally(() => setCheckingClass(false));
  }, [currentGroup]);

  const handleTakeAttendance = async () => {
    if (!currentClassId) return;
    try {
      await attendClass(currentClassId);
      setAttendanceTaken(true);
    } catch {
      setAttendanceTaken(true);
    }
  };

  const handleArtworkClick = (artworkId: string) => {
    console.log("Obra seleccionada:", artworkId);
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
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} de ${date.getFullYear()}`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return '💬';
      case 'event':
        return '📅';
      case 'announcement':
        return '📢';
      case 'mention':
        return '👤';
      case 'deadline':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.homeContainer}>
      {/* Header de bienvenida */}
      <div className={styles.welcomeSection}>
        {isLoading ? (
          <>
            <div className={styles.welcomeText}>
              <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
            </div>
            <div className={`${styles.skeleton} ${styles.skeletonHero}`}></div>
          </>
        ) : (
          <>
            <div className={styles.welcomeText}>
              <h1 className={styles.welcomeTitle}>Bienvenida, {userName}</h1>
              <p className={styles.welcomeSubtitle}>
                Marca tu asistencia, explora tus obras y mantente al día con los eventos del semillero.
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
              <div className={`${styles.skeleton} ${styles.skeletonCardTitle}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonTime}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
            </div>
          ) : (
            <div className={styles.attendanceCard}>
              <h2 className={styles.cardTitle}>Marcar Asistencia</h2>
              <div className={styles.timeDisplay}>
                <span className={styles.timeNumber}>{formatTime(currentTime)}</span>
              </div>
              <p className={styles.dateText}>{formatDate(currentTime)}</p>
              
              <button
                className={`${styles.attendanceButton} ${attendanceTaken ? styles.attendanceButtonTaken : ''}`}
                onClick={handleTakeAttendance}
                disabled={attendanceTaken || !currentClassId || checkingClass}
              >
                {checkingClass ? (
                  <>Verificando clase...</>
                ) : attendanceTaken ? (
                  <>
                    <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Asistencia Tomada
                  </>
                ) : currentClassId ? (
                  <>
                    <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    Tomar Asistencia
                  </>
                ) : (
                  <>No hay clase en el momento</>
                )}
              </button>

              <p className={styles.attendanceCount}>
                Asistencias este mes: <strong>{attendanceTaken ? attendanceCount + 1 : attendanceCount}</strong>
              </p>
            </div>
          )}
        </div>

        {/* div2 - Mis Obras */}
        <div className={`${styles.gridItem} ${styles.div2}`}>
          {isLoading ? (
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeleton} ${styles.skeletonCardTitle}`}></div>
              <div className={styles.skeletonArtworksScroll}>
                <div className={`${styles.skeleton} ${styles.skeletonArtwork}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonArtwork}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonArtwork}`}></div>
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
                <button className={styles.uploadButton} onClick={handleUploadArtwork}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v10M3 8h10" />
                  </svg>
                  Subir Obra
                </button>
              </div>

              <div className={styles.artworksScrollContainer}>
                {artworks.map((artwork) => (
                  <div 
                    key={artwork.id} 
                    className={styles.artworkCardHorizontal}
                    onClick={() => handleArtworkClick(artwork.id)}
                  >
                    <div className={styles.artworkImageHorizontal}>
                      <div className={styles.artworkPlaceholder}>
                        {artwork.image}
                      </div>
                    </div>
                    <div className={styles.artworkInfoHorizontal}>
                      <h3 className={styles.artworkTitle}>{artwork.title}</h3>
                      <p className={styles.artworkCategory}>{artwork.category}</p>
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
              <div className={`${styles.skeleton} ${styles.skeletonCardTitle}`}></div>
              <div className={styles.skeletonNotificationsList}>
                <div className={`${styles.skeleton} ${styles.skeletonNotification}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonNotification}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonNotification}`}></div>
              </div>
            </div>
          ) : (
            <div className={styles.notificationsSection}>
              <div className={styles.notificationsHeader}>
                <h2 className={styles.cardTitle}>
                  Notificaciones
                  {unreadCount > 0 && (
                    <span className={styles.notificationBadge}>{unreadCount}</span>
                  )}
                </h2>
                <button className={styles.viewAllButton} onClick={handleViewAllNotifications}>
                  Ver todas
                </button>
              </div>

              <div className={styles.notificationsList}>
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`${styles.notificationItem} ${!notification.read ? styles.notificationUnread : ''}`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className={styles.notificationContent}>
                      <p className={styles.notificationTitle}>{notification.title}</p>
                      <p className={styles.notificationMessage}>{notification.message}</p>
                      <span className={styles.notificationTime}>{notification.time}</span>
                    </div>
                    {!notification.read && <div className={styles.notificationDot}></div>}
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
              <div className={`${styles.skeleton} ${styles.skeletonCardTitle}`}></div>
              <div className={styles.skeletonEventsList}>
                <div className={`${styles.skeleton} ${styles.skeletonEvent}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonEvent}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonEvent}`}></div>
              </div>
            </div>
          ) : (
            <div className={styles.eventsSection}>
              <h2 className={styles.cardTitle}>Próximos Eventos</h2>
              
              <div className={styles.eventsTimeline}>
                {upcomingEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className={styles.eventTimelineItem}
                    onClick={() => handleEventClick(event.id)}
                  >
                    <div className={styles.eventTimelineDot}></div>
                    {index < upcomingEvents.length - 1 && <div className={styles.eventTimelineLine}></div>}
                    
                    <div className={styles.eventTimelineContent}>
                      <div className={styles.eventDate}>{event.date}</div>
                      <div className={styles.eventTimelineCard}>
                        <div className={styles.eventHeader}>
                          <span className={`${styles.eventBadge} ${styles[event.type.replace(' ', '')]}`}>
                            {event.type}
                          </span>
                          <span className={styles.eventTime}>{event.time}</span>
                        </div>
                        <h3 className={styles.eventTitle}>{event.title}</h3>
                        <p className={styles.eventLocation}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 6c0 3-4 6.5-4 6.5S3 9 3 6a4 4 0 018 0z" />
                          </svg>
                          {event.location}
                        </p>
                        <p className={styles.eventAttendees}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 12v-1a2 2 0 00-2-2H5a2 2 0 00-2 2v1M6.5 7a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                          {event.attendees} asistentes
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}