import { useState } from "react";
import type { User } from "@/hooks/useAuth";
import { useAppointments, useUpdateAppointment } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import AppointmentCard from "@/components/AppointmentCard";
import {
  appointmentFilters,
  filterAppointments,
  type AppointmentFilter,
} from "@/lib/appointment-presentation";
export default function AppointmentsListWithSupabase({
  currentUser,
}: {
  currentUser: User;
}) {
  const appointments = useAppointments();
  const update = useUpdateAppointment();
  const [filter, setFilter] = useState<AppointmentFilter>("active");
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
  const rows = filterAppointments(appointments.data, filter);
  return (
    <section>
      <div className="appointment-filters" aria-label="Filtrar citas">
        {appointmentFilters.map((f) => (
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
            <AppointmentCard
              key={a.id}
              appointment={a}
              userType={currentUser.userType}
              isUpdating={update.isPending}
              isPreviewOpen={preview === a.id}
              onStatusChange={change}
              onTogglePreview={() => setPreview(preview === a.id ? null : a.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
