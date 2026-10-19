import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowLeft, Mail } from "lucide-react";
import { supabase, recoveryLinkState } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recovery, setRecovery] = useState(recoveryLinkState.isRecovery);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(recoveryLinkState.error);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    if (window.location.hash.includes("type=recovery")) setRecovery(true);
    return () => subscription.unsubscribe();
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (recovery) {
        if (password !== confirm)
          throw new Error("Las contraseñas no coinciden.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        await supabase.auth.signOut();
        setRecovery(false);
        setMessage("Contraseña actualizada. Ya puedes iniciar sesión.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/recuperar",
        });
        if (error) throw error;
        setMessage(
          "Si existe una cuenta con ese correo, recibirás un enlace para recuperar el acceso. Revisa también spam.",
        );
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo completar la solicitud.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="recovery-page">
      <section className="recovery-card">
        <Link to="/auth" className="brand text-slate-900">
          <span className="brand-symbol">
            <Activity />
          </span>
          MediCitas
        </Link>
        <div className="recovery-icon">
          <Mail />
        </div>
        <h1>
          {recovery ? "Elige una nueva contraseña" : "Recupera tu acceso"}
        </h1>
        <p className="muted">
          {recovery
            ? "Usa al menos 8 caracteres."
            : "Te enviaremos un enlace seguro a tu correo electrónico."}
        </p>
        <form onSubmit={submit} className="space-y-5 mt-8">
          {recovery ? (
            <>
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </>
          ) : (
            <>
              <Label htmlFor="recovery-email">Correo electrónico</Label>
              <Input
                id="recovery-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@correo.com"
              />
            </>
          )}
          <Button disabled={busy} className="w-full" type="submit">
            {busy
              ? "Procesando..."
              : recovery
                ? "Actualizar contraseña"
                : "Enviar enlace de recuperación"}
          </Button>
          {message && (
            <p role="status" className="notice">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="notice error">
              {error}
            </p>
          )}
        </form>
        <Link
          to="/auth"
          className="flex justify-center items-center gap-2 mt-7 text-sm text-teal-700"
        >
          <ArrowLeft size={16} />
          Volver al inicio de sesión
        </Link>
      </section>
    </main>
  );
}
