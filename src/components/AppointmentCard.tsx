import type { User } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { MapPin, Clock3, Check, X, FileText } from "lucide-react";
import AppointmentEmailTemplate from "@/components/AppointmentEmailTemplate";
import AppointmentStatusBadge from "@/components/AppointmentStatusBadge";
import {
  isActiveAppointment,
  type AppointmentListItem,
  type AppointmentStatus,
} from "@/lib/appointment-presentation";

interface AppointmentCardProps {
  appointment: AppointmentListItem;
  userType: User["userType"];
  isUpdating: boolean;
  isPreviewOpen: boolean;
  onStatusChange: (
    id: string,
    status: Exclude<AppointmentStatus, "pending">,
  ) => void;
  onTogglePreview: () => void;
}

export default function AppointmentCard({
  appointment,
  userType,
  isUpdating,
  isPreviewOpen,
  onStatusChange,
  onTogglePreview,
}: AppointmentCardProps) {
  return (
    <article className="appointment-row">
      <div className="appointment-date">
        <strong>{appointment.appointment_date.slice(-2)}</strong>
        <span>
          {new Date(
            appointment.appointment_date + "T12:00:00",
          ).toLocaleDateString("es-PE", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="appointment-details">
        <div className="flex flex-wrap gap-3 items-center">
          <h3>{appointment.specialty?.name ?? "Consulta médica"}</h3>
          <AppointmentStatusBadge
            status={appointment.status}
            className={"status-" + appointment.status}
          />
        </div>
        <p>
          {appointment.doctor?.name}
          {userType === "doctor" ? " · " + appointment.patient_name : ""}
        </p>
        <div className="appointment-meta">
          <span>
            <Clock3 size={14} />
            {appointment.appointment_time.slice(0, 5)}
          </span>
          <span>
            <MapPin size={14} />
            {appointment.hospital?.name}
          </span>
        </div>
        <p className="text-sm mt-2 text-slate-500">{appointment.reason}</p>
      </div>
      <div className="appointment-actions">
        {appointment.status === "pending" && userType === "doctor" && (
            <Button
              size="sm"
              disabled={isUpdating}
              onClick={() => onStatusChange(appointment.id, "confirmed")}
            >
              <Check size={15} />
              Confirmar
            </Button>
        )}
        {appointment.status === "confirmed" && userType === "doctor" && (
            <Button
              size="sm"
              disabled={isUpdating}
              onClick={() => onStatusChange(appointment.id, "completed")}
            >
              Completar
            </Button>
        )}
        {isActiveAppointment(appointment.status) && (
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating}
            onClick={() => onStatusChange(appointment.id, "cancelled")}
          >
            <X size={14} />
            Cancelar
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onTogglePreview}>
          <FileText size={15} />
          Comprobante
        </Button>
      </div>
      {isPreviewOpen && (
        <div className="w-full basis-full">
          <AppointmentEmailTemplate appointment={appointment} />
        </div>
      )}
    </article>
  );
}
