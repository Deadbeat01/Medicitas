import RegisteredAccounts from "@/components/RegisteredAccounts";
import PageHeading from "@/components/PageHeading";
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
          .select("id,email,name,user_type,created_at")
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
      <PageHeading
        eyebrow="VISIÓN GENERAL"
        title="Panel de administración"
        description="Las personas y la atención que hacen posible MediCitas."
      />
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
          <RegisteredAccounts profiles={query.data.profiles} />
          <AdminRoleForm profiles={query.data.profiles} />
        </>
      )}
    </div>
  );
}
