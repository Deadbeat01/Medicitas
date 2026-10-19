import { useAppointments } from "@/hooks/useSupabaseData";
export default function AppointmentEmailTemplate({
  appointment,
}: {
  appointment: NonNullable<ReturnType<typeof useAppointments>["data"]>[number];
}) {
  return (
    <div className="notice mt-4">
      <strong>MediCitas · Resumen de tu cita</strong>
      <p>
        Hola, {appointment.patient_name}. Tu consulta de{" "}
        {appointment.specialty?.name} con {appointment.doctor?.name} está
        registrada para el {appointment.appointment_date} a las{" "}
        {appointment.appointment_time.slice(0, 5)}, en{" "}
        {appointment.hospital?.name}.
      </p>
      <p className="text-xs mt-2">
        Vista previa de la plantilla de confirmación. No representa un correo
        enviado.
      </p>
    </div>
  );
}
