import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  appointmentStatusLabels,
  type AppointmentStatus,
} from "@/lib/appointment-presentation";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus | null;
  variant?: BadgeProps["variant"];
  className?: string;
}

export default function AppointmentStatusBadge({
  status,
  variant = "outline",
  className,
}: AppointmentStatusBadgeProps) {
  return (
    <Badge variant={variant} className={className}>
      {status ? appointmentStatusLabels[status] : "Sin estado"}
    </Badge>
  );
}
