import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function Auth() {
  const { user, login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  if (user) return <Navigate to="/" replace />;
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const result =
        mode === "login"
          ? await login(fields.email, fields.password)
          : await register({ ...fields, userType: "patient" });
      if (!result.success)
        setError(result.error ?? "No se pudo completar la operación.");
      else if (result.needsConfirmation)
        setMessage(
          "Cuenta creada. Revisa tu correo y confirma tu cuenta antes de ingresar.",
        );
    } catch {
      setError(
        "No pudimos conectarnos. Comprueba tu conexión e intenta nuevamente.",
      );
    }
  }
  const update = (name: string, value: string) =>
    setFields({ ...fields, [name]: value });
  return (
    <div className="auth-layout">
      <section className="auth-story">
        <Link to="/auth" className="brand">
          <span className="brand-symbol">
            <Activity />
          </span>
          Medi<span>Citas</span>
        </Link>
        <div className="story-content">
          <span className="eyebrow light">TU SALUD, MÁS CERCA</span>
          <h1>
            El cuidado que necesitas.
            <br />
            <span>La tranquilidad que mereces.</span>
          </h1>
          <p>
            Organiza tus consultas, encuentra a tu especialista y lleva tu
            atención médica en un solo lugar.
          </p>
          <div className="health-illustration" aria-hidden="true">
            <div className="illustration-orbit" />
            <div className="illustration-cross">+</div>
            <div className="floating-card">
              <CalendarCheck size={26} />
              <div>
                <strong>Todo en orden</strong>
                <small>Tu próxima consulta, a un clic</small>
              </div>
              <span className="status-dot" />
            </div>
            <div className="floating-pill">
              <ShieldCheck size={17} />
              Tu información, protegida
            </div>
          </div>
          <div className="story-benefits">
            <span>
              <ShieldCheck size={18} />
              Acceso seguro
            </span>
            <span>
              <CalendarCheck size={18} />
              Citas sin complicaciones
            </span>
          </div>
        </div>
        <p className="story-footer">MediCitas · Hecho para cuidar de ti</p>
      </section>
      <section className="auth-form-area">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <Activity /> MediCitas
          </div>
          <span className="eyebrow">BIENVENIDO A TU ESPACIO DE SALUD</span>
          <h2>
            {mode === "login"
              ? "Qué bueno verte de nuevo"
              : "Empieza a cuidar de ti"}
          </h2>
          <p className="muted">
            {mode === "login"
              ? "Ingresa a tu cuenta para continuar."
              : "Crea tu cuenta de paciente en pocos pasos."}
          </p>
          <div className="auth-tabs">
            <button
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              className={mode === "login" ? "selected" : ""}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => {
                setMode("register");
                setError("");
                setMessage("");
              }}
              className={mode === "register" ? "selected" : ""}
            >
              Crear cuenta
            </button>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <fieldset disabled={isLoading} className="space-y-5">
              {mode === "register" && (
                <div className="field">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={fields.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="¿Cómo te llamas?"
                  />
                </div>
              )}
              <div className="field">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={fields.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="nombre@correo.com"
                />
              </div>
              <div className="field">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  {mode === "login" && (
                    <Link
                      className="text-sm text-teal-700 font-medium"
                      to="/recuperar"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Input
                    className="pr-12"
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                    minLength={mode === "register" ? 8 : 1}
                    value={fields.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder={
                      mode === "register"
                        ? "Mínimo 8 caracteres"
                        : "Tu contraseña"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={
                      show ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="absolute right-3 top-3 text-slate-400"
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {mode === "register" && (
                <div className="field">
                  <Label htmlFor="phone">Teléfono opcional</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={25}
                    pattern="[+0-9 ()-]{7,25}"
                    value={fields.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+51 999 000 000"
                  />
                </div>
              )}
              <Button className="w-full h-12" type="submit">
                {isLoading
                  ? "Un momento..."
                  : mode === "login"
                    ? "Ingresar a mi cuenta"
                    : "Crear mi cuenta"}
                <ArrowRight size={17} />
              </Button>
            </fieldset>
            {error && (
              <p className="notice error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="notice" role="status">
                {message}
              </p>
            )}
          </form>
          <p className="auth-help">
            <ShieldCheck size={16} /> La cuenta determina tu rol de acceso. El
            registro público es exclusivo para pacientes.
          </p>
        </div>
        <p className="auth-bottom">
          Tu bienestar comienza con una buena atención.
        </p>
      </section>
    </div>
  );
}
