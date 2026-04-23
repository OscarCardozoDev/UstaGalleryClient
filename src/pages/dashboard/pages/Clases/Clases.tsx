import { useEffect, useState } from "react";
import { Trash2, Plus, CalendarDays, Clock, BookOpen, List } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { getSchedulesByGroup, createSchedule, deleteSchedule } from "../../../../services/schedule";
import { createManualClass, getClassesByGroup } from "../../../../services/classes";
import type { ScheduleItem } from "../../../../interfaces/schedule";
import type { CreateClassDto, ClassSession } from "../../../../interfaces/classes";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function TimeInput({ label, id, value, onChange }: { label: string; id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{msg}</p>;
}

function SuccessMsg({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="mt-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</p>;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ClasesPage() {
  const { user, currentGroup } = useAuth();

  const isProfessorOrAdmin =
    user?.isProfesor || user?.userType?.name === "Administrador";

  // ── Classes state ───────────────────────────────────────────
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // ── Schedule state ──────────────────────────────────────────
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const [schedDay, setSchedDay] = useState("1");
  const [schedStart, setSchedStart] = useState("14:00");
  const [schedEnd, setSchedEnd] = useState("16:00");
  const [schedLoading, setSchedLoading] = useState(false);
  const [schedError, setSchedError] = useState<string | null>(null);
  const [schedSuccess, setSchedSuccess] = useState<string | null>(null);

  // ── Manual class state ──────────────────────────────────────
  const [classDate, setClassDate] = useState("");
  const [classStart, setClassStart] = useState("14:00");
  const [classEnd, setClassEnd] = useState("16:00");
  const [classTopic, setClassTopic] = useState("");
  const [classLoading, setClassLoading] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);
  const [classSuccess, setClassSuccess] = useState<string | null>(null);

  // ── Load schedules + classes ────────────────────────────────
  useEffect(() => {
    if (!currentGroup) return;
    setLoadingSchedules(true);
    setLoadingClasses(true);
    getSchedulesByGroup(currentGroup)
      .then(setSchedules)
      .catch(() => {})
      .finally(() => setLoadingSchedules(false));
    getClassesByGroup(currentGroup)
      .then(setClasses)
      .catch(() => {})
      .finally(() => setLoadingClasses(false));
  }, [currentGroup]);

  // ── Create schedule ─────────────────────────────────────────
  const handleCreateSchedule = async () => {
    if (!currentGroup) return;
    if (!schedStart || !schedEnd) {
      setSchedError("Completa la hora de inicio y fin.");
      return;
    }
    if (schedStart >= schedEnd) {
      setSchedError("La hora de fin debe ser mayor a la de inicio.");
      return;
    }
    setSchedError(null);
    setSchedLoading(true);
    try {
      await createSchedule({
        groupId: currentGroup,
        dayOfWeek: Number(schedDay),
        startTime: schedStart,
        endTime: schedEnd,
      });
      // Reload full list — backend returns only { uid }, not the full object
      const [updated, updatedClasses] = await Promise.all([
        getSchedulesByGroup(currentGroup),
        getClassesByGroup(currentGroup),
      ]);
      setSchedules(updated);
      setClasses(updatedClasses);
      setSchedSuccess("Horario creado. Se generaron las clases del semestre.");
      setTimeout(() => setSchedSuccess(null), 4000);
    } catch (e) {
      setSchedError((e as Error).message);
    } finally {
      setSchedLoading(false);
    }
  };

  // ── Delete schedule ─────────────────────────────────────────
  const handleDeleteSchedule = async (uid: string) => {
    if (!confirm("¿Eliminar este horario? Se eliminarán las clases futuras sin asistencia.")) return;
    try {
      await deleteSchedule(uid);
      setSchedules((prev) => prev.filter((s) => s.uid !== uid));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  // ── Create manual class ─────────────────────────────────────
  const handleCreateClass = async () => {
    if (!currentGroup) return;
    if (!classDate) { setClassError("Selecciona una fecha."); return; }
    if (!classStart || !classEnd) { setClassError("Completa la hora de inicio y fin."); return; }
    if (classStart >= classEnd) { setClassError("La hora de fin debe ser mayor a la de inicio."); return; }

    const dto: CreateClassDto = {
      groupId: currentGroup,
      date: new Date(classDate).toISOString(),
      startTime: classStart,
      endTime: classEnd,
      ...(classTopic.trim() && { topic: classTopic.trim() }),
    };

    setClassError(null);
    setClassLoading(true);
    try {
      await createManualClass(dto);
      const updatedClasses = await getClassesByGroup(currentGroup);
      setClasses(updatedClasses);
      setClassSuccess("Clase creada correctamente.");
      setClassDate("");
      setClassStart("14:00");
      setClassEnd("16:00");
      setClassTopic("");
      setTimeout(() => setClassSuccess(null), 4000);
    } catch (e) {
      setClassError((e as Error).message);
    } finally {
      setClassLoading(false);
    }
  };

  // ── Guards ──────────────────────────────────────────────────
  if (!isProfessorOrAdmin) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">Selecciona un grupo para gestionar sus clases.</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Gestión de Clases</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra horarios recurrentes y clases puntuales del grupo.
        </p>
      </div>

      {/* ── Classes list (debug / overview) ── */}
      <SectionCard title="Clases del Grupo" icon={<List className="size-4" />}>
        {loadingClasses ? (
          <p className="text-sm text-muted-foreground">Cargando clases…</p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No hay clases registradas para este grupo.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Fecha</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Inicio</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Fin</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Temática</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.uid} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 text-foreground">{c.date.split("T")[0]}</td>
                    <td className="px-4 py-2 text-muted-foreground">{formatTime(c.startTime)}</td>
                    <td className="px-4 py-2 text-muted-foreground">{formatTime(c.endTime)}</td>
                    <td className="px-4 py-2 text-muted-foreground">{c.topic ?? "—"}</td>
                    <td className="px-4 py-2">
                      {c.scheduleId ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          Recurrente
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-700/10">
                          Manual
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-2 text-xs text-muted-foreground border-t">
              Total: {classes.length} clase(s) —{" "}
              {classes.filter((c) => c.scheduleId).length} recurrentes,{" "}
              {classes.filter((c) => !c.scheduleId).length} manuales
            </p>
          </div>
        )}
      </SectionCard>

      {/* ── Schedules section ── */}
      <SectionCard title="Horarios Recurrentes" icon={<Clock className="size-4" />}>

        {/* List */}
        {loadingSchedules ? (
          <p className="text-sm text-muted-foreground">Cargando horarios…</p>
        ) : schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No hay horarios configurados.</p>
        ) : (
          <div className="mb-5 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Día</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Inicio</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Fin</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.uid} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-medium text-foreground">{DAYS[s.dayOfWeek]}</td>
                    <td className="px-4 py-2 text-muted-foreground">{formatTime(s.startTime)}</td>
                    <td className="px-4 py-2 text-muted-foreground">{formatTime(s.endTime)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDeleteSchedule(s.uid)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create form */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="sched-day" className="text-sm font-medium text-foreground">Día de la semana</label>
            <select
              id="sched-day"
              value={schedDay}
              onChange={(e) => setSchedDay(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {DAYS.map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>

          <TimeInput label="Inicio" id="sched-start" value={schedStart} onChange={setSchedStart} />
          <TimeInput label="Fin"    id="sched-end"   value={schedEnd}   onChange={setSchedEnd}   />

          <button
            onClick={handleCreateSchedule}
            disabled={schedLoading}
            className="mt-auto inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Plus className="size-4" />
            {schedLoading ? "Creando…" : "Crear horario"}
          </button>
        </div>

        <ErrorMsg   msg={schedError}   />
        <SuccessMsg msg={schedSuccess} />
      </SectionCard>

      {/* ── Manual class section ── */}
      <SectionCard title="Clase Manual" icon={<CalendarDays className="size-4" />}>
        <p className="mb-4 text-sm text-muted-foreground">
          Crea una sesión puntual (reunión, recuperación, evento especial) sin asociarla a un horario.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          {/* Date */}
          <div className="flex flex-col gap-1">
            <label htmlFor="class-date" className="text-sm font-medium text-foreground">Fecha</label>
            <input
              id="class-date"
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <TimeInput label="Inicio" id="class-start" value={classStart} onChange={setClassStart} />
          <TimeInput label="Fin"    id="class-end"   value={classEnd}   onChange={setClassEnd}   />
        </div>

        {/* Topic */}
        <div className="mt-3 flex flex-col gap-1">
          <label htmlFor="class-topic" className="flex items-center gap-1 text-sm font-medium text-foreground">
            <BookOpen className="size-3.5" />
            Temática <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <input
            id="class-topic"
            type="text"
            placeholder="Ej. Técnica de acuarela, Ensayo general…"
            value={classTopic}
            onChange={(e) => setClassTopic(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <button
          onClick={handleCreateClass}
          disabled={classLoading}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Plus className="size-4" />
          {classLoading ? "Creando…" : "Crear clase"}
        </button>

        <ErrorMsg   msg={classError}   />
        <SuccessMsg msg={classSuccess} />
      </SectionCard>

    </div>
  );
}
