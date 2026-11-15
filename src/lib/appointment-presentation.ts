import type { useAppointments } from "@/hooks/useSupabaseData";

export type AppointmentListItem = NonNullable<
  ReturnType<typeof useAppointments>["data"]
>[number];
export type AppointmentStatus = AppointmentListItem["status"];

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

export const appointmentFilters = [
  { id: "active", name: "Activas" },
  { id: "completed", name: "Completadas" },
  { id: "cancelled", name: "Canceladas" },
  { id: "all", name: "Todas" },
] as const;

export type AppointmentFilter = (typeof appointmentFilters)[number]["id"];

export function isActiveAppointment(status: AppointmentStatus) {
  return status === "pending" || status === "confirmed";
}

export function filterAppointments(
  appointments: AppointmentListItem[],
  filter: AppointmentFilter,
) {
  return appointments.filter((appointment) =>
    filter === "all" ||
    (filter === "active"
      ? isActiveAppointment(appointment.status)
      : appointment.status === filter),
  );
}
