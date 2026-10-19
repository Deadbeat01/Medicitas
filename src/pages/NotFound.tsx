import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="public-theme-toggle"><ThemeToggle /></div>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">No encontramos esta página</p>
        <a href="/" className="text-primary underline">
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;
