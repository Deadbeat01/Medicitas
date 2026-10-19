import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  LayoutDashboard,
  UserRound,
  LogOut,
  ShieldCheck,
  Plus,
  Bell,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
export default function AppLayout() {
  const { user, logout } = useAuth();
  const [error, setError] = useState("");
  if (!user) return null;
  const role = {
    patient: "Paciente",
    doctor: "Profesional médico",
    admin: "Administración",
  }[user.userType];
  const items =
    user.userType === "admin"
      ? [{ to: "/admin", text: "Resumen general", Icon: LayoutDashboard }]
      : [
          {
            to: "/",
            text: user.userType === "doctor" ? "Agenda médica" : "Mi resumen",
            Icon: LayoutDashboard,
          },
          ...(user.userType === "patient"
            ? [
                { to: "/agendar", text: "Agendar consulta", Icon: Plus },
                { to: "/citas", text: "Mis citas", Icon: CalendarDays },
                { to: "/perfil", text: "Perfil e historial", Icon: UserRound },
              ]
            : []),
        ];
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-symbol">
            <Activity />
          </span>
          Medi<span>Citas</span>
        </NavLink>
        <div className="workspace-label">MI ESPACIO DE SALUD</div>
        <nav aria-label="Navegación principal">
          {items.map(({ to, text, Icon }) => (
            <NavLink
              end
              to={to}
              key={to}
              className={({ isActive }) =>
                "nav-item " + (isActive ? "active" : "")
              }
            >
              <Icon size={19} />
              {text}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="care-note">
            <ShieldCheck size={24} />
            <strong>Estás en buenas manos</strong>
            <p>Tu información solo está disponible según tu rol.</p>
          </div>
          <button
            className="nav-item logout"
            onClick={() =>
              void logout().catch(() =>
                setError("No se pudo cerrar sesión. Intenta de nuevo."),
              )
            }
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div>
            <span className="topbar-date">MediCitas / {role}</span>
            <p>Tu salud merece un lugar especial</p>
          </div>
          <div className="topbar-account">
            <span className="account-role">
              <ShieldCheck size={15} />
              {role}
            </span>
            <span className="avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="account-text">
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          MediCitas · Cuidamos lo que más importa{" "}
          <span>Atención cercana, gestión sencilla</span>
        </footer>
      </div>
    </div>
  );
}
