import { useState } from "react";
import type { User } from "@/hooks/useAuth";
import { useAppointments, useUpdateAppointment } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Clock3, Check, X, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AppointmentEmailTemplate from "@/components/AppointmentEmailTemplate";
const labels = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};
export default function AppointmentsListWithSupabase({
  currentUser,
}: {
  currentUser: User;
}) {
  const appointments = useAppointments();
  const update = useUpdateAppointment();
  const [filter, setFilter] = useState("active");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  async function change(
    id: string,
    status: "confirmed" | "cancelled" | "completed",
  ) {
    setError("");
    try {
      await update.mutateAsync({ id, status });
    } catch {
      setError(
        "No se pudo cambiar el estado. Actualiza la lista y verifica los permisos de tu cuenta.",
      );
    }
  }
  if (appointments.isPending)
    return (
      <p role="status" className="empty-state">
        Cargando tus citas...
      </p>
    );
  if (appointments.isError)
    return (
      <div role="alert" className="notice error">
        No se pudieron cargar las citas.{" "}
        <Button variant="outline" onClick={() => appointments.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  const rows = appointments.data.filter(
    (a) =>
      filter === "all" ||
      (filter === "active"
        ? ["pending", "confirmed"].includes(a.status)
        : a.status === filter),
  );
  return (
    <section>
      <div className="appointment-filters" aria-label="Filtrar citas">
        {[
          { id: "active", name: "Activas" },
          { id: "completed", name: "Completadas" },
          { id: "cancelled", name: "Canceladas" },
          { id: "all", name: "Todas" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={filter === f.id ? "selected" : ""}
          >
            {f.name}
          </button>
        ))}
      </div>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {!rows.length ? (
        <div className="empty-state">
          <CalendarDays size={36} />
          <h3>No hay citas en esta sección</h3>
          <p>Las consultas que registres aparecerán aquí.</p>
        </div>
      ) : (
        <div className="appointment-list">
          {rows.map((a) => (
            <article key={a.id} className="appointment-row">
              <div className="appointment-date">
                <strong>{a.appointment_date.slice(-2)}</strong>
                <span>
                  {new Date(
                    a.appointment_date + "T12:00:00",
                  ).toLocaleDateString("es-PE", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="appointment-details">
                <div className="flex flex-wrap gap-3 items-center">
                  <h3>{a.specialty?.name ?? "Consulta médica"}</h3>
                  <Badge variant="outline" className={"status-" + a.status}>
                    {labels[a.status]}
                  </Badge>
                </div>
                <p>
                  {a.doctor?.name}
                  {currentUser.userType === "doctor"
                    ? " · " + a.patient_name
                    : ""}
                </p>
                <div className="appointment-meta">
                  <span>
                    <Clock3 size={14} />
                    {a.appointment_time.slice(0, 5)}
                  </span>
                  <span>
                    <MapPin size={14} />
                    {a.hospital?.name}
                  </span>
                </div>
                <p className="text-sm mt-2 text-slate-500">{a.reason}</p>
              </div>
              <div className="appointment-actions">
                {a.status === "pending" &&
                  currentUser.userType === "doctor" && (
                    <Button
                      size="sm"
                      disabled={update.isPending}
                      onClick={() => change(a.id, "confirmed")}
                    >
                      <Check size={15} />
                      Confirmar
                    </Button>
                  )}
                {a.status === "confirmed" &&
                  currentUser.userType === "doctor" && (
                    <Button
                      size="sm"
                      disabled={update.isPending}
                      onClick={() => change(a.id, "completed")}
                    >
                      Completar
                    </Button>
                  )}
                {["pending", "confirmed"].includes(a.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={update.isPending}
                    onClick={() => change(a.id, "cancelled")}
                  >
                    <X size={14} />
                    Cancelar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreview(preview === a.id ? null : a.id)}
                >
                  <FileText size={15} />
                  Comprobante
                </Button>
              </div>
              {preview === a.id && (
                <div className="w-full basis-full">
                  <AppointmentEmailTemplate appointment={a} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
