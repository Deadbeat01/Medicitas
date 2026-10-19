import { Users, Stethoscope, CalendarDays } from "lucide-react";
export default function AdminStats({
  patients,
  doctors,
  appointments,
}: {
  patients: number;
  doctors: number;
  appointments: number;
}) {
  return (
    <div className="stats-grid">
      {[
        { label: "Pacientes", value: patients, Icon: Users, color: "teal" },
        { label: "Médicos", value: doctors, Icon: Stethoscope, color: "blue" },
        {
          label: "Citas registradas",
          value: appointments,
          Icon: CalendarDays,
          color: "amber",
        },
      ].map(({ label, value, Icon, color }) => (
        <div className="stat-card" key={label}>
          <span className={"stat-icon " + color}>
            <Icon />
          </span>
          <div>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
