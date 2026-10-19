import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type User } from "@/hooks/useAuth";
export default function ProtectedRoute({
  roles,
}: {
  roles?: User["userType"][];
}) {
  const { user, isLoading, error } = useAuth();
  if (isLoading)
    return (
      <div className="p-12 text-center" role="status">
        Preparando tu espacio de salud...
      </div>
    );
  if (error)
    return (
      <div role="alert" className="p-12 text-center">
        {error}{" "}
        <a href="/auth" className="underline">
          Ir al inicio de sesión
        </a>
      </div>
    );
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.userType))
    return <Navigate to="/" replace />;
  return <Outlet />;
}
