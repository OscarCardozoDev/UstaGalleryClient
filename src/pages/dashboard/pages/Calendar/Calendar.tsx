import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { CalendarProvider } from "../../components/Calendar/calendar/contexts/calendar-context";
import { ClientContainer } from "../../components/Calendar/calendar/components/client-container";
import { ChangeBadgeVariantInput } from "../../components/Calendar/calendar/components/change-badge-variant-input";
import { getClassesByGroup } from "../../../../services/classes";
import type { IEvent, IUser } from "../../components/Calendar/calendar/interfaces";
import type { ClassSession } from "../../../../interfaces/classes";
import type { TEventColor } from "../../components/Calendar/calendar/types";

const GROUP_COLORS: Record<string, TEventColor> = {};
const COLOR_PALETTE: TEventColor[] = ["blue", "green", "purple", "orange", "red", "yellow"];

function getGroupColor(groupId: string): TEventColor {
  if (!GROUP_COLORS[groupId]) {
    const idx = Object.keys(GROUP_COLORS).length % COLOR_PALETTE.length;
    GROUP_COLORS[groupId] = COLOR_PALETTE[idx];
  }
  return GROUP_COLORS[groupId];
}

function classToEvent(cls: ClassSession): IEvent {
  const dateStr = cls.date.split("T")[0];
  return {
    id: cls.uid,
    startDate: `${dateStr}T${cls.startTime}:00`,
    endDate: `${dateStr}T${cls.endTime}:00`,
    title: cls.topic ?? "Clase",
    color: getGroupColor(cls.groupId),
    description: cls.review ?? "",
    user: {
      id: cls.group.profesor.uid,
      name: `${cls.group.profesor.name} ${cls.group.profesor.lastName}`,
      picturePath: null,
    },
  };
}

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
    console.log(currentGroup);
    getClassesByGroup(currentGroup)
      .then((classes) => {
        const mapped = classes.map(classToEvent);
        setEvents(mapped);

        const professorMap = new Map<string, IUser>();
        classes.forEach((c) => {
          if (!professorMap.has(c.group.profesor.uid)) {
            professorMap.set(c.group.profesor.uid, {
              id: c.group.profesor.uid,
              name: `${c.group.profesor.name} ${c.group.profesor.lastName}`,
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
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 p-4">
        <ClientContainer />
        <ChangeBadgeVariantInput />
      </div>
    </CalendarProvider>
  );
}
