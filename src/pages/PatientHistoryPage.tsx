import PageHeading from "@/components/PageHeading";

import { useAuth } from "@/hooks/useAuth";
import PatientHistory from "@/components/PatientHistory";

export default function PatientHistoryPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="TU ATENCIÓN MÉDICA"
        title="Mi historial"
        description="Consulta tus citas médicas anteriores y su información."
      />

      <PatientHistory currentUser={user} />
    </div>
  );
}
