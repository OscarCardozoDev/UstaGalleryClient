import { sileo } from "sileo";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User, BookOpen, ClipboardList } from "lucide-react";

import { Button } from "../../../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog";
import { getClassAttendance, updateClassTopic } from "../../../../../../../services/classes";
import { useAuth } from "../../../../../../../context/AuthContext";
import type { AttendanceRecord } from "../../../../../../../interfaces/classes";
import type { IEvent } from "../../interfaces";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const { user } = useAuth();
  const isProfessor = user?.userType?.name === 'professor';

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [topic, setTopic] = useState(event.title !== "Clase" ? event.title : "");
  const [review, setReview] = useState(event.description ?? "");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  useEffect(() => {
    if (!open || !isProfessor) return;
    setLoadingAttendance(true);
    getClassAttendance(event.id)
      .then(setAttendance)
      .catch(() => setAttendance([]))
      .finally(() => setLoadingAttendance(false));
  }, [open, event.id, isProfessor]);

  const handleSaveTopic = async () => {
    setSaving(true);
    try {
      await updateClassTopic(event.id, { topic: topic || undefined, review: review || undefined });
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo actualizar el tema de la clase' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <User className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Profesor</p>
              <p className="text-sm text-muted-foreground">{event.user.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Fecha</p>
              <p className="text-sm text-muted-foreground">{format(startDate, "d 'de' MMMM yyyy")}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Horario</p>
              <p className="text-sm text-muted-foreground">
                {format(startDate, "h:mm a")} – {format(endDate, "h:mm a")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <BookOpen className="mt-1 size-4 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Temática</p>
              {isProfessor ? (
                <textarea
                  className="w-full text-sm border rounded p-2 resize-none"
                  rows={2}
                  placeholder="Tema planificado para esta clase..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{topic || "Sin tema registrado"}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Text className="mt-1 size-4 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Reseña de la clase</p>
              {isProfessor ? (
                <textarea
                  className="w-full text-sm border rounded p-2 resize-none"
                  rows={3}
                  placeholder="¿Qué se hizo en esta clase?"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{review || "Sin reseña registrada"}</p>
              )}
            </div>
          </div>

          {isProfessor && (
            <div className="flex items-start gap-2">
              <ClipboardList className="mt-1 size-4 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">
                  Asistencia ({attendance.length} estudiantes)
                </p>
                {loadingAttendance ? (
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                ) : attendance.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin asistencia registrada</p>
                ) : (
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 pr-2 font-medium">Nombre</th>
                        <th className="text-left py-1 font-medium">Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => (
                        <tr key={record.uid} className="border-b last:border-0">
                          <td className="py-1 pr-2 text-muted-foreground">
                            {record.user.name} {record.user.lastName}
                          </td>
                          <td className="py-1 text-muted-foreground">
                            {format(parseISO(record.takenAt), "h:mm a")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isProfessor && (
            <Button type="button" onClick={handleSaveTopic} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
