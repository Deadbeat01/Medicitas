
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Stethoscope,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  user_type: "patient" | "doctor" | "admin";
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Esta comprobación de localStorage NO autoriza el acceso.
        // La autorización real debe verificarse en el servidor/RLS.
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (!session) {
          navigate("/auth", { replace: true });
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();

        if (profileError || profile?.user_type !== "admin") {
          navigate("/", { replace: true });
          return;
        }

        const { data: profileRows, error: profilesError } = await supabase
          .from("profiles")
          .select("id, email, user_type")
          .order("created_at", { ascending: false });

        if (profilesError) throw profilesError;

        const { count, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true });

        if (appointmentsError) throw appointmentsError;

        setProfiles((profileRows ?? []) as Profile[]);
        setAppointmentsCount(count ?? 0);
      } catch (err) {
        console.error("Error cargando panel administrador:", err);
        setError(
          "No se pudieron cargar los datos. Verifica la conexión y los permisos de Supabase."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const patients = profiles.filter(
    (profile) => profile.user_type === "patient"
  ).length;

  const doctors = profiles.filter(
    (profile) => profile.user_type === "doctor"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-slate-950 text-white md:flex">
        <div className="flex items-center gap-3 border-b border-slate-800 p-6">
          <div className="rounded-xl bg-cyan-500 p-2">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-bold">MediCitas</h1>
            <p className="text-xs text-slate-400">Administración</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-cyan-500/15 px-4 py-3 text-cyan-300">
            <LayoutDashboard size={19} />
            <span>Panel principal</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-slate-300">
            <Users size={19} />
            <span>Cuentas</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-slate-300">
            <CalendarCheck size={19} />
            <span>Citas</span>
          </div>
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
        >
          <LogOut size={19} />
          Cerrar sesión
        </button>
      </aside>

      <main className="md:ml-64">
        <header className="flex items-center justify-between border-b bg-white px-6 py-5 md:px-10">
          <div>
            <p className="text-sm text-slate-500">MediCitas / Administración</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Panel principal
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800">
            <ShieldCheck size={17} />
            Administrador
          </div>
        </header>

        <section className="space-y-8 p-6 md:p-10">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Resumen general
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Indicadores de las cuentas y las citas registradas.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Pacientes"
              value={patients}
              description="Perfiles registrados"
              icon={<Users size={23} />}
            />
            <StatCard
              title="Doctores"
              value={doctors}
              description="Perfiles registrados"
              icon={<Stethoscope size={23} />}
            />
            <StatCard
              title="Citas registradas"
              value={appointmentsCount}
              description="Total consultado en la base de datos"
              icon={<CalendarCheck size={23} />}
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h3 className="font-semibold text-slate-900">
                Gestión de cuentas
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Usuarios registrados en MediCitas.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Correo electrónico</th>
                    <th className="px-6 py-4 font-medium">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-700">
                        {profile.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {profile.user_type === "admin"
                            ? "Administrador"
                            : profile.user_type === "doctor"
                              ? "Doctor"
                              : "Paciente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {profiles.length === 0 && !error && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No hay cuentas para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">{icon}</div>
    </div>
    <p className="mt-4 text-xs text-slate-500">{description}</p>
  </div>
);

export default AdminDashboard;
    