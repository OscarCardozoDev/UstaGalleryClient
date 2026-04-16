import { useEffect, useState } from "react";
import { CalendarProvider } from "../../components/Calendar/calendar/contexts/calendar-context";
import { ClientContainer } from "../../components/Calendar/calendar/components/client-container";
import { ChangeBadgeVariantInput } from "../../components/Calendar/calendar/components/change-badge-variant-input";

import { getCalendarEvents, getCalendarUsers } from "../../components/Calendar/Calendar.mock";
import type { IEvent, IUser } from "../../components/Calendar/calendar/interfaces";

export default function CalendarPage() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getCalendarEvents(),
            getCalendarUsers()
        ]).then(([eventsData, usersData]) => {
            setEvents(eventsData);
            setUsers(usersData);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Cargando...</div>;

    console.log(events);
  return (
    <CalendarProvider events={events} users={users}>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 p-4">
        <ClientContainer view="month" />
        <ChangeBadgeVariantInput />
      </div>
    </CalendarProvider>
  );
}