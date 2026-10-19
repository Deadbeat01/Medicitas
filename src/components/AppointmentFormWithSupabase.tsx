import { useState, type FormEvent } from "react";
import { CalendarDays, ShieldCheck } from "lucide-react";
import type { User } from "@/hooks/useAuth";
import {
  useHospitals,
  useDoctors,
  useCreateAppointment,
} from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
const slots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];
export default function AppointmentFormWithSupabase({
  currentUser,
}: {
  currentUser: User;
}) {
  const hospitals = useHospitals();
  const doctors = useDoctors();
  const create = useCreateAppointment();
  const [fields, setFields] = useState({
    hospitalId: "",
    doctorId: "",
    date: "",
    time: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const available =
    doctors.data?.filter((d) => d.hospital_id === fields.hospitalId) ?? [];
  const doctor = doctors.data?.find((d) => d.id === fields.doctorId);
  function change(field: string, value: string) {
    setFields((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "hospitalId" ? { doctorId: "" } : {}),
    }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
    setMessage("");
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setFailure("");
    setMessage("");
    const issues: Record<string, string> = {};
    if (!fields.hospitalId) issues.hospitalId = "Selecciona un centro médico.";
    if (!fields.doctorId) issues.doctorId = "Selecciona un especialista.";
    if (!fields.date) issues.date = "Elige una fecha.";
    if (!fields.time) issues.time = "Elige un horario.";
    if (
      fields.date &&
      fields.time &&
      new Date(fields.date + "T" + fields.time + "-05:00") <= new Date()
    )
      issues.time = "La fecha y hora deben ser futuras.";
    const reason = fields.reason.trim();
    if (reason.length < 10 || reason.length > 300)
      issues.reason = "El motivo debe tener entre 10 y 300 caracteres.";
    setErrors(issues);
    if (Object.keys(issues).length) return;
    if (!doctor?.specialty_id || !doctor.hospital_id) {
      setFailure("El especialista no está disponible. Vuelve a seleccionarlo.");
      return;
    }
    try {
      await create.mutateAsync({
        patient_id: currentUser.id,
        doctor_id: doctor.id,
        hospital_id: doctor.hospital_id,
        specialty_id: doctor.specialty_id,
        patient_name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone ?? "",
        reason,
        appointment_date: fields.date,
        appointment_time: fields.time,
        status: "pending",
      });
      setMessage("Tu cita quedó registrada. El médico confirmará la reserva.");
      setFields({
        hospitalId: "",
        doctorId: "",
        date: "",
        time: "",
        reason: "",
      });
    } catch (e) {
      setFailure(
        (e as { code?: string }).code === "23505"
          ? "Este médico ya tiene una cita en ese horario. Elige otro."
          : "No se pudo reservar. Revisa los datos o vuelve a intentarlo.",
      );
    }
  }
  if (hospitals.isPending || doctors.isPending)
    return <p role="status">Buscando centros y especialistas...</p>;
  if (hospitals.isError || doctors.isError)
    return (
      <p role="alert" className="notice error">
        No se pudo cargar el catálogo.{" "}
        <button
          className="underline"
          onClick={() => {
            hospitals.refetch();
            doctors.refetch();
          }}
        >
          Reintentar
        </button>
      </p>
    );
  return (
    <div className="booking-grid">
      <section className="surface">
        <h2 className="card-heading">
          <CalendarDays size={21} />
          Una consulta a tu medida
        </h2>
        <p className="muted mb-7">
          Completa los datos de tu próxima visita. Horarios de Perú.
        </p>
        <form onSubmit={submit} noValidate className="space-y-6">
          <fieldset disabled={create.isPending} className="space-y-6">
            <div className="field">
              <Label htmlFor="booking-hospital">Centro médico</Label>
              <select
                id="booking-hospital"
                className="form-select"
                aria-invalid={!!errors.hospitalId}
                aria-describedby="hospital-error"
                value={fields.hospitalId}
                onChange={(e) => change("hospitalId", e.target.value)}
              >
                <option value="">Selecciona un centro</option>
                {hospitals.data.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
              {errors.hospitalId && (
                <p id="hospital-error" className="field-error">
                  {errors.hospitalId}
                </p>
              )}
            </div>
            <div className="field">
              <Label htmlFor="booking-doctor">Especialista</Label>
              <select
                id="booking-doctor"
                className="form-select"
                disabled={!fields.hospitalId}
                aria-invalid={!!errors.doctorId}
                aria-describedby="doctor-error"
                value={fields.doctorId}
                onChange={(e) => change("doctorId", e.target.value)}
              >
                <option value="">
                  {fields.hospitalId
                    ? "Selecciona un especialista"
                    : "Primero elige un centro médico"}
                </option>
                {available.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.specialty?.name}
                  </option>
                ))}
              </select>
              {fields.hospitalId && !available.length && (
                <p className="muted">
                  No hay médicos disponibles en este centro todavía.
                </p>
              )}
              {errors.doctorId && (
                <p id="doctor-error" className="field-error">
                  {errors.doctorId}
                </p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="field">
                <Label htmlFor="booking-date">Fecha de consulta</Label>
                <Input
                  id="booking-date"
                  type="date"
                  min={new Intl.DateTimeFormat("en-CA", {
                    timeZone: "America/Lima",
                  }).format(new Date())}
                  value={fields.date}
                  onChange={(e) => change("date", e.target.value)}
                  aria-invalid={!!errors.date}
                  aria-describedby="date-error"
                />
                {errors.date && (
                  <p id="date-error" className="field-error">
                    {errors.date}
                  </p>
                )}
              </div>
              <div className="field">
                <Label htmlFor="booking-time">Horario</Label>
                <select
                  id="booking-time"
                  className="form-select"
                  value={fields.time}
                  onChange={(e) => change("time", e.target.value)}
                  aria-invalid={!!errors.time}
                  aria-describedby="time-error"
                >
                  <option value="">Selecciona una hora</option>
                  {slots.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                {errors.time && (
                  <p id="time-error" className="field-error">
                    {errors.time}
                  </p>
                )}
              </div>
            </div>
            <div className="field">
              <Label htmlFor="booking-reason">Motivo de consulta</Label>
              <Textarea
                id="booking-reason"
                placeholder="Cuéntanos brevemente el motivo de tu visita"
                value={fields.reason}
                maxLength={300}
                rows={4}
                aria-invalid={!!errors.reason}
                aria-describedby="reason-error"
                onChange={(e) => change("reason", e.target.value)}
              />
              <span className="text-xs text-slate-400">
                {fields.reason.length}/300 caracteres · Mínimo 10
              </span>
              {errors.reason && (
                <p id="reason-error" className="field-error">
                  {errors.reason}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full h-12">
              {create.isPending
                ? "Registrando tu cita..."
                : "Reservar mi consulta"}
            </Button>
          </fieldset>
          {failure && (
            <p role="alert" className="notice error">
              {failure}
            </p>
          )}
          {message && (
            <div className="notice" role="status">
              {message}{" "}
              <Link to="/citas" className="underline font-semibold">
                Ver mis citas
              </Link>
            </div>
          )}
        </form>
      </section>
      <aside className="surface booking-info">
        <div className="recovery-icon">
          <ShieldCheck />
        </div>
        <h2 className="card-heading">Tu atención comienza aquí</h2>
        <p className="muted">
          Una vez registrada tu cita, el profesional médico podrá confirmarla.
          Consulta su estado en Mis citas.
        </p>
        <div className="booking-checklist">
          <p>
            <span>01</span>Elige tu centro y especialista
          </p>
          <p>
            <span>02</span>Encuentra tu mejor horario
          </p>
          <p>
            <span>03</span>Espera la confirmación médica
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-7">
          Evita incluir información clínica sensible en el motivo. Los horarios
          están sujetos a disponibilidad.
        </p>
      </aside>
    </div>
  );
}
