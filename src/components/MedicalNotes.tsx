import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
export default function MedicalNotes() {
  const { user } = useAuth();
  const notes = useQuery({
    queryKey: ["medical-notes", user?.id],
    enabled: user?.userType === "doctor",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_notes")
        .select("id,body,created_at,patient:patients(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (user?.userType !== "doctor") return null;
  return (
    <section className="surface mt-7">
      <h2 className="card-heading">Notas médicas</h2>
      <p className="muted mb-5">
        Notas de los pacientes asignados a tu atención.
      </p>
      {notes.isPending ? (
        <p role="status">Cargando notas...</p>
      ) : notes.isError ? (
        <p role="alert">
          No se pudieron cargar las notas.{" "}
          <button className="underline" onClick={() => notes.refetch()}>
            Reintentar
          </button>
        </p>
      ) : !notes.data.length ? (
        <p>No hay notas médicas disponibles.</p>
      ) : (
        notes.data.map((n) => (
          <article key={n.id} className="notice mb-3">
            <strong>{n.patient?.name ?? "Paciente"}</strong>
            <p>{n.body}</p>
            <small>
              {new Date(n.created_at).toLocaleDateString("es-PE")}
            </small>
          </article>
        ))
      )}
    </section>
  );
}
