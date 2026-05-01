# Home Bento Grid Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Home.module.css and Home.tsx with a clean bento grid (Layout A, Mobile M1, Style S1 minimal) — same data and logic, new layout.

**Architecture:** Two-file change only. CSS module defines the grid via `grid-template-areas` for three breakpoints. TSX restructures JSX into 5 named tile regions; all state/effects/handlers/API calls are preserved verbatim.

**Tech Stack:** React 19, CSS Modules, Vite, lucide-react

---

### Task 1: Rewrite Home.module.css

**Files:**
- Modify: `src/pages/dashboard/pages/Home/Home.module.css`

- [ ] **Step 1: Replace the entire CSS file**

Overwrite `src/pages/dashboard/pages/Home/Home.module.css` with:

```css
/* ─── Container ─────────────────────────────────────────────────────────── */

.homeContainer {
  width: 100%;
  height: 80dvh;
  overflow: hidden;
}

/* ─── Bento grid ─────────────────────────────────────────────────────────── */

.bentoGrid {
  display: grid;
  width: 100%;
  height: 100%;
  gap: 14px;
  grid-template-columns: 220px 1fr 1fr 220px;
  grid-template-rows: 150px 1fr 1fr;
  grid-template-areas:
    "attend welcome  welcome  events"
    "attend artworks artworks events"
    "attend notifs   notifs   events";
}

/* ─── Base tile ──────────────────────────────────────────────────────────── */

.tile {
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* ─── Attendance tile (dark) ─────────────────────────────────────────────── */

.tileAttend {
  grid-area: attend;
  background: #171717;
  color: #fff;
  padding: 22px 20px;
  justify-content: space-between;
}

.attendTop {
  flex-shrink: 0;
}

.attendLabel {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 5px 0;
}

.attendStatusRow {
  display: flex;
  align-items: center;
  gap: 6px;
}

.attendDot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #555;
  flex-shrink: 0;
  transition: background 0.3s;
}

.attendDotActive {
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.5);
}

.attendStatusText {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.attendTimeBlock {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px 0;
}

.attendTime {
  font-size: clamp(2.4rem, 3.5vw, 3.2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #fff;
  margin: 0;
  line-height: 1;
}

.attendDate {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 6px 0 0 0;
}

.attendBottom {
  flex-shrink: 0;
}

.attendBtn {
  width: 100%;
  padding: 12px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: background 0.18s, opacity 0.18s;
}

.attendBtnActive {
  background: #fff;
  color: #171717;
}

.attendBtnActive:hover {
  background: #f0f0f0;
}

.attendBtnTaken {
  background: #2a2a2a;
  color: rgba(255, 255, 255, 0.55);
  cursor: default;
}

.attendBtnDisabled {
  background: #252525;
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.attendCount {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  margin: 8px 0 0 0;
}

.attendCount strong {
  color: rgba(255, 255, 255, 0.6);
}

/* ─── Welcome tile ───────────────────────────────────────────────────────── */

.tileWelcome {
  grid-area: welcome;
  background: #fff;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 20px 26px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.welcomeText {
  flex: 1;
  min-width: 0;
}

.welcomeGreeting {
  font-size: 0.78rem;
  color: #bbb;
  font-weight: 500;
  margin: 0 0 2px 0;
}

.welcomeName {
  font-size: 1.5rem;
  font-weight: 700;
  color: #171717;
  margin: 0 0 5px 0;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.welcomeSub {
  font-size: 0.8rem;
  color: #999;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.welcomeDeco {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

/* ─── Shared tile header ─────────────────────────────────────────────────── */

.tileHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 12px;
}

.tileTitle {
  font-size: 0.9rem;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.tileMeta {
  font-size: 0.72rem;
  color: #bbb;
  margin: 2px 0 0 0;
}

.actionBtn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  font-size: 0.78rem;
  font-weight: 500;
  font-family: inherit;
  color: #171717;
  background: #f2f2f2;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.12s;
}

.actionBtn:hover {
  background: #e6e6e6;
}

/* ─── Artworks tile ──────────────────────────────────────────────────────── */

.tileArtworks {
  grid-area: artworks;
  background: #fff;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 18px 22px 14px;
}

.artworksScroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  flex: 1;
  min-height: 0;
  padding-bottom: 4px;
  align-items: flex-start;
}

.artworksScroll::-webkit-scrollbar { height: 4px; }
.artworksScroll::-webkit-scrollbar-track { background: transparent; }
.artworksScroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 2px; }

.artworkCard {
  flex-shrink: 0;
  width: 120px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f5f5;
  transition: transform 0.18s, box-shadow 0.18s;
}

.artworkCard:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.artworkImg {
  width: 120px;
  height: 90px;
  overflow: hidden;
  background: #e5e5e5;
}

.artworkImg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.artworkName {
  font-size: 0.73rem;
  font-weight: 500;
  color: #333;
  padding: 7px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.artworksEmpty {
  font-size: 0.82rem;
  color: #bbb;
  margin: auto;
}

/* ─── Events tile ────────────────────────────────────────────────────────── */

.tileEvents {
  grid-area: events;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 18px;
}

.eventsList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.eventsList::-webkit-scrollbar { width: 4px; }
.eventsList::-webkit-scrollbar-track { background: transparent; }
.eventsList::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 2px; }

.eventItem {
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.12s, box-shadow 0.12s, transform 0.12s;
}

.eventItem:hover {
  border-color: #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.eventItemDate {
  font-size: 0.68rem;
  font-weight: 600;
  color: #bbb;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 5px 0;
}

.eventItemMeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 3px;
}

.eventTypeBadge {
  font-size: 0.63rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f0f0f0;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.eventItemTime {
  font-size: 0.7rem;
  color: #aaa;
  font-weight: 500;
}

.eventItemName {
  font-size: 0.83rem;
  font-weight: 600;
  color: #171717;
  margin: 0;
  line-height: 1.35;
}

.eventsEmpty {
  font-size: 0.82rem;
  color: #bbb;
  margin: auto;
  text-align: center;
}

/* ─── Notifications tile ─────────────────────────────────────────────────── */

.tileNotifs {
  grid-area: notifs;
  background: #fff;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 18px 22px;
}

.notifsList {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  gap: 1px;
}

.notifsList::-webkit-scrollbar { width: 4px; }
.notifsList::-webkit-scrollbar-track { background: transparent; }
.notifsList::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 2px; }

.notifItem {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.1s;
}

.notifItem:hover { background: #f7f7f7; }
.notifItemUnread { background: #fafafa; }

.notifIcon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.notifBody {
  flex: 1;
  min-width: 0;
}

.notifTitle {
  font-size: 0.78rem;
  font-weight: 600;
  color: #171717;
  margin: 0 0 1px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notifMsg {
  font-size: 0.73rem;
  color: #888;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notifRight {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.notifTime {
  font-size: 0.68rem;
  color: #ccc;
  white-space: nowrap;
}

.notifDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #171717;
}

.notifBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #171717;
  color: #fff;
  font-size: 0.63rem;
  font-weight: 700;
  border-radius: 9px;
  margin-left: 6px;
  vertical-align: middle;
}

.viewAllBtn {
  background: none;
  border: none;
  font-size: 0.75rem;
  font-family: inherit;
  color: #bbb;
  cursor: pointer;
  padding: 0;
  transition: color 0.12s;
  flex-shrink: 0;
}

.viewAllBtn:hover { color: #171717; }

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

.skelBlock {
  background: linear-gradient(90deg, #f2f2f2 0%, #e8e8e8 50%, #f2f2f2 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 6px;
}

.skelAttendBlock {
  background: linear-gradient(90deg, #2a2a2a 0%, #333 50%, #2a2a2a 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Responsive ─────────────────────────────────────────────────────────── */

@media (max-width: 1099px) {
  .bentoGrid {
    grid-template-columns: 210px 1fr 210px;
    grid-template-areas:
      "attend welcome  events"
      "attend artworks events"
      "attend notifs   events";
  }
}

@media (max-width: 749px) {
  .homeContainer {
    height: auto;
    overflow: visible;
  }

  .bentoGrid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "welcome   welcome"
      "attend    attend"
      "artworks  events"
      "notifs    notifs";
    height: auto;
  }

  .tileAttend {
    flex-direction: row;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    min-height: 100px;
  }

  .attendTop { display: none; }

  .attendTimeBlock {
    flex: 1;
    padding: 0;
  }

  .attendTime { font-size: 2rem; }
  .attendDate { display: none; }

  .attendBottom { flex-shrink: 0; }
  .attendCount { display: none; }

  .tileArtworks { min-height: 160px; }
  .tileEvents   { min-height: 200px; max-height: 340px; }
  .tileNotifs   { min-height: 180px; max-height: 300px; }
}
```

- [ ] **Step 2: Verify CSS compiles (dev server)**

```bash
cd UstaGallery && bun run dev
```

Expected: terminal shows no CSS parse errors. Browser console shows no errors. Page layout may look broken until Task 2 — that is expected.

---

### Task 2: Rewrite Home.tsx

**Files:**
- Modify: `src/pages/dashboard/pages/Home/Home.tsx`

- [ ] **Step 1: Replace the entire TSX file**

Overwrite `src/pages/dashboard/pages/Home/Home.tsx` with:

```tsx
import { sileo } from "sileo";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Upload } from "lucide-react";
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
  const [attendanceCount] = useState(0);

  const notifications: Notification[] = [
    { id: "1", type: "comment",      title: "Nuevo comentario en tu obra",  message: "Carlos comentó en 'Astronauta Neon'",                      time: "Hace 5 min",   read: false },
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

  const handleArtworkClick = (_artworkId: string) => {};
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
              <div className={styles.welcomeDeco}>🎨</div>
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
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`${styles.notifItem} ${!n.read ? styles.notifItemUnread : ""}`}
                    onClick={() => handleNotificationClick(n.id)}
                  >
                    <span className={styles.notifIcon}>{getNotificationIcon(n.type)}</span>
                    <div className={styles.notifBody}>
                      <p className={styles.notifTitle}>{n.title}</p>
                      <p className={styles.notifMsg}>{n.message}</p>
                    </div>
                    <div className={styles.notifRight}>
                      <span className={styles.notifTime}>{n.time}</span>
                      {!n.read && <span className={styles.notifDot} />}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

With dev server running, open `http://localhost:5173` and navigate to Dashboard Home.

Desktop (window ≥1100px) — verify:
- [ ] 4-column bento grid fills `80dvh`
- [ ] Attendance tile dark (`#171717`), full left column, time large, button white
- [ ] Welcome tile top center: name + 🎨 deco, row layout
- [ ] Artworks tile center middle: horizontal scroll, "Subir obra" button
- [ ] Notifications tile center bottom: unread badge, "Ver todas"
- [ ] Events tile right column, full height, cards with date/badge/name

Tablet (window 750–1099px) — resize browser:
- [ ] 3-column grid: attendance left, 1 center column, events right

Mobile (window <750px) — resize browser or use DevTools device mode:
- [ ] Welcome full width
- [ ] Attendance as horizontal dark band (time left, button right)
- [ ] Artworks + Events side by side (2 cols)
- [ ] Notifications full width

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/pages/Home/Home.tsx src/pages/dashboard/pages/Home/Home.module.css
git commit -m "feat(home): redesign bento grid with minimal style"
```

Expected output: `[develop <hash>] feat(home): redesign bento grid with minimal style` with 2 files changed.
