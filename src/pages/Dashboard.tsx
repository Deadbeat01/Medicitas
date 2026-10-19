import MedicalNotes from "@/components/MedicalNotes";
import { Link, Navigate } from "react-router-dom";
import {
  CalendarDays,
  ArrowUpRight,
  Stethoscope,
  HeartPulse,
  Clock3,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useSupabaseData";
import AppointmentFormWithSupabase from "@/components/AppointmentFormWithSupabase";
import AppointmentsListWithSupabase from "@/components/AppointmentsListWithSupabase";
export default function Dashboard({
  view,
}: {
  view?: "book" | "appointments";
}) {
  const { user } = useAuth();
  const appointments = useAppointments();
  if (!user) return null;
  if (user.userType === "admin") return <Navigate to="/admin" replace />;
  if (view === "book")
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">UN PASO HACIA TU BIENESTAR</span>
          <h1>Agenda tu próxima consulta</h1>
          <p>
            Elige el centro, especialista y horario que mejor se adapten a ti.
          </p>
        </div>
        <AppointmentFormWithSupabase currentUser={user} />
      </>
    );
  if (view === "appointments")
    return (
      <>
        <div className="page-heading">
          <span className="eyebrow">TU ATENCIÓN, ORGANIZADA</span>
          <h1>Mis citas</h1>
          <p>
            Consulta el estado de tus reservas y administra tus próximas
            visitas.
          </p>
        </div>
        <AppointmentsListWithSupabase currentUser={user} />
      </>
    );
  const active =
    appointments.data?.filter((a) =>
      ["pending", "confirmed"].includes(a.status),
    ) ?? [];
  const completed =
    appointments.data?.filter((a) => a.status === "completed").length ?? 0;
  return (
    <div className="space-y-7">
      <div className="page-heading">
        <span className="eyebrow">
          {user.userType === "doctor"
            ? "TU AGENDA DE HOY"
            : "TU ESPACIO DE BIENESTAR"}
        </span>
        <h1>
          Hola, {user.name.split(" ")[0]}{" "}
          <span className="greeting-dot">.</span>
        </h1>
        <p>
          {user.userType === "doctor"
            ? "Cada consulta es una oportunidad para cuidar."
            : "Qué bueno que te tomes un momento para cuidar de ti."}
        </p>
      </div>
      <section className="welcome-banner">
        <div>
          <span className="eyebrow light">CUIDARTE ES LO PRIMERO</span>
          <h2>
            {user.userType === "doctor"
              ? "Una atención más cercana, una agenda más clara."
              : "Tu próxima consulta, sin complicaciones."}
          </h2>
          <p>
            {user.userType === "doctor"
              ? "Revisa y confirma las citas de tus pacientes desde un solo lugar."
              : "Encuentra a tu especialista y reserva el momento ideal para tu salud."}
          </p>
          {user.userType === "patient" && (
            <Link className="banner-button" to="/agendar">
              Agendar una consulta
              <ArrowUpRight size={18} />
            </Link>
          )}
        </div>
        <div className="banner-art" aria-hidden="true">
          <HeartPulse size={110} strokeWidth={1} />
          <div className="banner-circle" />
        </div>
      </section>
      <section className="stats-grid" aria-label="Resumen de citas">
        {[
          {
            label: "Citas activas",
            value: active.length,
            icon: CalendarDays,
            color: "teal",
          },
          {
            label: "Por confirmar",
            value: active.filter((a) => a.status === "pending").length,
            icon: Clock3,
            color: "amber",
          },
          {
            label: "Consultas completadas",
            value: completed,
            icon: Stethoscope,
            color: "blue",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div className="stat-card" key={label}>
            <span className={"stat-icon " + color}>
              <Icon size={23} />
            </span>
            <div>
              <p>{label}</p>
              <strong>{appointments.isPending ? "—" : value}</strong>
            </div>
          </div>
        ))}
      </section>
      <div className="section-heading">
        <div>
          <h2>
            {user.userType === "doctor"
              ? "Agenda de pacientes"
              : "Tus consultas"}
          </h2>
          <p>Todo lo que necesitas saber sobre tu atención.</p>
        </div>
        {user.userType === "patient" && (
          <Link
            to="/agendar"
            className="text-teal-700 font-semibold text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            Nueva cita
          </Link>
        )}
      </div>
      <AppointmentsListWithSupabase currentUser={user} />
      <MedicalNotes />
    </div>
  );
}
