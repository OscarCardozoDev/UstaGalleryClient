import { useEffect, useState } from "react";
import { Trash2, Plus, CalendarDays, Clock, BookOpen, List } from "lucide-react";
import { sileo } from "sileo";
import { useAuth } from "../../../../context/AuthContext";
import { getSchedulesByGroup, createSchedule, deleteSchedule } from "../../../../services/schedule";
import { createManualClass, getClassesByGroup } from "../../../../services/classes";
import type { ScheduleItem } from "../../../../interfaces/schedule";
import type { CreateClassDto, ClassSession } from "../../../../interfaces/classes";
import styles from "./Clases.module.css";

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
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>{icon}</span>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

function TimeInput({ label, id, value, onChange }: { label: string; id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.formLabel}>{label}</label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.timeInput}
      />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ClasesPage() {
  const { user, currentGroup } = useAuth();

  const isProfessorOrAdmin =
    user?.userType?.name === "admin" || user?.userType?.name === "professor";

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

  // ── Manual class state ──────────────────────────────────────
  const [classDate, setClassDate] = useState("");
  const [classStart, setClassStart] = useState("14:00");
  const [classEnd, setClassEnd] = useState("16:00");
  const [classTopic, setClassTopic] = useState("");
  const [classLoading, setClassLoading] = useState(false);

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
      sileo.warning({ title: "Completa la hora de inicio y fin." });
      return;
    }
    if (schedStart >= schedEnd) {
      sileo.warning({ title: "La hora de fin debe ser mayor a la de inicio." });
      return;
    }
    setSchedLoading(true);
    try {
      await createSchedule({
        groupId: currentGroup,
        dayOfWeek: Number(schedDay),
        startTime: schedStart,
        endTime: schedEnd,
      });
      const [updated, updatedClasses] = await Promise.all([
        getSchedulesByGroup(currentGroup),
        getClassesByGroup(currentGroup),
      ]);
      setSchedules(updated);
      setClasses(updatedClasses);
      sileo.success({ title: "Horario creado", description: "Se generaron las clases del semestre." });
    } catch (e) {
      sileo.error({ title: (e as Error).message });
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
      sileo.error({ title: (e as Error).message });
    }
  };

  // ── Create manual class ─────────────────────────────────────
  const handleCreateClass = async () => {
    if (!currentGroup) return;
    if (!classDate) { sileo.warning({ title: "Selecciona una fecha." }); return; }
    if (!classStart || !classEnd) { sileo.warning({ title: "Completa la hora de inicio y fin." }); return; }
    if (classStart >= classEnd) { sileo.warning({ title: "La hora de fin debe ser mayor a la de inicio." }); return; }

    const dto: CreateClassDto = {
      groupId: currentGroup,
      date: new Date(classDate).toISOString(),
      startTime: classStart,
      endTime: classEnd,
      ...(classTopic.trim() && { topic: classTopic.trim() }),
    };

    setClassLoading(true);
    try {
      await createManualClass(dto);
      const updatedClasses = await getClassesByGroup(currentGroup);
      setClasses(updatedClasses);
      setClassDate("");
      setClassStart("14:00");
      setClassEnd("16:00");
      setClassTopic("");
      sileo.success({ title: "Clase creada correctamente." });
    } catch (e) {
      sileo.error({ title: (e as Error).message });
    } finally {
      setClassLoading(false);
    }
  };

  // ── Guards ──────────────────────────────────────────────────
  if (!isProfessorOrAdmin) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "32px" }}>
        <p style={{ color: "#666" }}>No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "32px" }}>
        <p style={{ color: "#666" }}>Selecciona un grupo para gestionar sus clases.</p>
      </div>
    );
  }

  const manualClasses = classes.filter((c) => !c.scheduleId);

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      {/* Header */}
      <div>
        <h1 className={styles.pageTitle}>Gestión de Clases</h1>
        <p className={styles.pageSubtitle}>
          Administra horarios recurrentes y clases puntuales del grupo.
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className={styles.grid}>

        {/* ── LEFT: Add forms ── */}
        <div className={styles.column}>

          {/* Add recurring schedule */}
          <SectionCard title="Nuevo Horario Recurrente" icon={<Clock size={16} />}>
            <div className={styles.formStack}>
              <div className={styles.formGroup}>
                <label htmlFor="sched-day" className={styles.formLabel}>Día de la semana</label>
                <select
                  id="sched-day"
                  value={schedDay}
                  onChange={(e) => setSchedDay(e.target.value)}
                  className={styles.formSelect}
                >
                  {DAYS.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>

              <div className={styles.timeRow}>
                <TimeInput label="Inicio" id="sched-start" value={schedStart} onChange={setSchedStart} />
                <TimeInput label="Fin"    id="sched-end"   value={schedEnd}   onChange={setSchedEnd}   />
              </div>

              <button
                onClick={handleCreateSchedule}
                disabled={schedLoading}
                className={styles.submitBtn}
              >
                <Plus size={16} />
                {schedLoading ? "Creando…" : "Crear horario"}
              </button>
            </div>
          </SectionCard>

          {/* Add manual class */}
          <SectionCard title="Nueva Clase Manual" icon={<CalendarDays size={16} />}>
            <p className={styles.sectionDesc}>
              Sesión puntual (reunión, recuperación, evento especial) sin horario recurrente.
            </p>

            <div className={styles.formStack}>
              <div className={styles.formGroup}>
                <label htmlFor="class-date" className={styles.formLabel}>Fecha</label>
                <input
                  id="class-date"
                  type="date"
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.timeRow}>
                <TimeInput label="Inicio" id="class-start" value={classStart} onChange={setClassStart} />
                <TimeInput label="Fin"    id="class-end"   value={classEnd}   onChange={setClassEnd}   />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="class-topic" className={styles.formLabel}>
                  <BookOpen size={14} />
                  Temática{" "}
                  <span className={styles.formLabelMuted}>(opcional)</span>
                </label>
                <input
                  id="class-topic"
                  type="text"
                  placeholder="Ej. Técnica de acuarela, Ensayo general…"
                  value={classTopic}
                  onChange={(e) => setClassTopic(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <button
                onClick={handleCreateClass}
                disabled={classLoading}
                className={styles.submitBtn}
              >
                <Plus size={16} />
                {classLoading ? "Creando…" : "Crear clase"}
              </button>
            </div>
          </SectionCard>

        </div>

        {/* ── RIGHT: Scheduled classes ── */}
        <div className={styles.column}>

          {/* Recurring schedules */}
          <SectionCard title="Horarios Recurrentes" icon={<Clock size={16} />}>
            {loadingSchedules ? (
              <p className={styles.loadingText}>Cargando horarios…</p>
            ) : schedules.length === 0 ? (
              <p className={styles.emptyText}>No hay horarios configurados.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Inicio</th>
                      <th>Fin</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.uid}>
                        <td className={styles.tdPrimary}>{DAYS[s.dayOfWeek]}</td>
                        <td className={styles.tdMuted}>{formatTime(s.startTime)}</td>
                        <td className={styles.tdMuted}>{formatTime(s.endTime)}</td>
                        <td className={styles.tdAction}>
                          <button
                            onClick={() => handleDeleteSchedule(s.uid)}
                            className={styles.deleteBtn}
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Manual classes */}
          <SectionCard title="Clases Manuales" icon={<List size={16} />}>
            {loadingClasses ? (
              <p className={styles.loadingText}>Cargando clases…</p>
            ) : manualClasses.length === 0 ? (
              <p className={styles.emptyText}>No hay clases manuales registradas.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Inicio</th>
                      <th>Fin</th>
                      <th>Temática</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualClasses.map((c) => (
                      <tr key={c.uid}>
                        <td className={styles.tdPrimary}>{c.date.split("T")[0]}</td>
                        <td className={styles.tdMuted}>{formatTime(c.startTime)}</td>
                        <td className={styles.tdMuted}>{formatTime(c.endTime)}</td>
                        <td className={styles.tdMuted}>{c.topic ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

        </div>
      </div>

    </div>
  );
}
