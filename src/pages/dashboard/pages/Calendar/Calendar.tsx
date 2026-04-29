import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { CalendarProvider } from "../../components/Calendar/calendar/contexts/calendar-context";
import { ClientContainer } from "../../components/Calendar/calendar/components/client-container";
import { getClassesByGroup } from "../../../../services/classes";
import { getSchedulesByGroup } from "../../../../services/schedule";
import type { IEvent, IUser } from "../../components/Calendar/calendar/interfaces";
import type { ClassSession } from "../../../../interfaces/classes";
import type { ScheduleItem } from "../../../../interfaces/schedule";
import type { TEventColor } from "../../components/Calendar/calendar/types";

// ─── Color helpers ────────────────────────────────────────────────────────────

const GROUP_COLORS: Record<string, TEventColor> = {};
const COLOR_PALETTE: TEventColor[] = ["blue", "green", "purple", "orange", "red", "yellow"];

function getGroupColor(groupId: string): TEventColor {
  if (!GROUP_COLORS[groupId]) {
    const idx = Object.keys(GROUP_COLORS).length % COLOR_PALETTE.length;
    GROUP_COLORS[groupId] = COLOR_PALETTE[idx];
  }
  return GROUP_COLORS[groupId];
}

// ─── Converters ───────────────────────────────────────────────────────────────

/** Real ClassSession (stored in DB) → IEvent */
function classToEvent(cls: ClassSession): IEvent {
  const dateStr = cls.date.split("T")[0];
  const profesor = cls.group?.profesor;
  return {
    id: cls.uid,
    startDate: `${dateStr}T${cls.startTime}:00`,
    endDate: `${dateStr}T${cls.endTime}:00`,
    title: cls.topic ?? "Clase",
    color: getGroupColor(cls.groupId),
    description: cls.review ?? "",
    user: {
      id: profesor?.uid ?? cls.groupId,
      name: profesor ? `${profesor.name} ${profesor.lastName}` : "Profesor",
      picturePath: null,
    },
  };
}

/**
 * ScheduleItem (recurring pattern) → IEvent[]
 *
 * Expands dayOfWeek into individual occurrences from today until semester end.
 * Skips dates already covered by a real ClassSession (matched by scheduleId + date).
 */
function scheduleToEvents(
  schedule: ScheduleItem,
  coveredKeys: Set<string>,
): IEvent[] {
  const semesterEnd = new Date(new Date().getFullYear(), 11, 15); // Dec 15 current year
  const events: IEvent[] = [];

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Advance to first occurrence of dayOfWeek
  while (cursor.getDay() !== schedule.dayOfWeek) {
    cursor.setDate(cursor.getDate() + 1);
  }

  while (cursor <= semesterEnd) {
    const dateStr = cursor.toISOString().split("T")[0];
    const key = `${schedule.uid}-${dateStr}`;

    if (!coveredKeys.has(key)) {
      events.push({
        id: `virtual-${key}`,
        startDate: `${dateStr}T${schedule.startTime}:00`,
        endDate: `${dateStr}T${schedule.endTime}:00`,
        title: "Clase",
        color: "red",
        description: "",
        user: {
          id: schedule.groupId,
          name: "Profesor",
          picturePath: null,
        },
      });
    }

    cursor.setDate(cursor.getDate() + 7);
  }

  return events;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { currentGroup } = useAuth();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentGroup) {
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      getClassesByGroup(currentGroup),
      getSchedulesByGroup(currentGroup),
    ])
      .then(([classes, schedules]) => {
        // Real session events
        const realEvents = classes.map(classToEvent);

        // Keys of real sessions that came from a schedule: "scheduleId-YYYY-MM-DD"
        const coveredKeys = new Set<string>(
          classes
            .filter((c) => c.scheduleId)
            .map((c) => `${c.scheduleId}-${c.date.split("T")[0]}`),
        );

        // Virtual events from recurring schedules (only dates not already in DB)
        const virtualEvents = schedules.flatMap((s) =>
          scheduleToEvents(s, coveredKeys),
        );

        setEvents([...realEvents, ...virtualEvents]);

        // Build users list from real classes only (schedules have no profesor data)
        const professorMap = new Map<string, IUser>();
        classes.forEach((c) => {
          const p = c.group?.profesor;
          if (p && !professorMap.has(p.uid)) {
            professorMap.set(p.uid, {
              id: p.uid,
              name: `${p.name} ${p.lastName}`,
              picturePath: null,
            });
          }
        });
        setUsers(Array.from(professorMap.values()));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [currentGroup]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!currentGroup) return <div>Selecciona un grupo para ver el calendario.</div>;

  return (
    <CalendarProvider events={events} users={users}>
      <div className="mx-auto flex h-full max-w-screen-2xl flex-col gap-4 p-4">
        <ClientContainer />
      </div>
    </CalendarProvider>
  );
}
