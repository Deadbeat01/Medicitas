
import { useAuth } from "@/hooks/useAuth";
import PatientHistory from "@/components/PatientHistory";

export default function PatientHistoryPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-7">
      <div className="page-heading">
        <span className="eyebrow">TU ATENCIÓN MÉDICA</span>
        <h1>Mi historial</h1>
        <p>Consulta tus citas médicas anteriores y su información.</p>
      </div>

      <PatientHistory currentUser={user} />
    </div>
  );
}
