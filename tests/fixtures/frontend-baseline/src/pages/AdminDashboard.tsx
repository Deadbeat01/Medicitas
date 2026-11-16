import AdminRoleForm from "@/components/AdminRoleForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminStats from "@/components/AdminStats";
export default function AdminDashboard() {
  const query = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () => {
      const [profiles, appointments] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,email,name,user_type")
          .order("created_at", { ascending: false }),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true }),
      ]);
      if (profiles.error) throw profiles.error;
      if (appointments.error) throw appointments.error;
      return { profiles: profiles.data, count: appointments.count ?? 0 };
    },
  });
  return (
    <div className="space-y-7">
      <div className="page-heading">
        <span className="eyebrow">VISIÓN GENERAL</span>
        <h1>Panel de administración</h1>
        <p>Las personas y la atención que hacen posible MediCitas.</p>
      </div>
      {query.isPending ? (
        <p role="status">Cargando estadísticas...</p>
      ) : query.isError ? (
        <div role="alert" className="notice error">
          No se pudo cargar el panel.{" "}
          <button onClick={() => query.refetch()} className="underline">
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <AdminStats
            patients={
              query.data.profiles.filter((p) => p.user_type === "patient")
                .length
            }
            doctors={
              query.data.profiles.filter((p) => p.user_type === "doctor").length
            }
            appointments={query.data.count}
          />
          <section className="surface">
            <div className="section-heading">
              <div>
                <h2>Cuentas registradas</h2>
                <p>Los roles se administran de forma segura en el servidor.</p>
              </div>
              <span className="text-sm text-slate-500">
                {query.data.profiles.length} cuentas
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo electrónico</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.profiles.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>
                        <span className="role-badge">
                          {
                            {
                              patient: "Paciente",
                              doctor: "Médico",
                              admin: "Administrador",
                            }[p.user_type]
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <AdminRoleForm profiles={query.data.profiles} />
        </>
      )}
    </div>
  );
}
