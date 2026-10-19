import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import PatientHistory from "@/components/PatientHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRound, Mail, ShieldCheck } from "lucide-react";
import { z } from "zod";
type Profile = { id: string; name: string; phone: string | null };
const schema = z.object({
  name: z.string().trim().min(2, "Escribe al menos 2 caracteres.").max(100),
  phone: z
    .string()
    .trim()
    .refine(
      (v) =>
        !v || (/^[+\d ()-]{7,25}$/.test(v) && v.replace(/\D/g, "").length >= 7),
      "Ingresa un teléfono válido.",
    ),
});
function DetailsForm({ profile }: { profile: Profile }) {
  const { refreshUser } = useAuth();
  const client = useQueryClient();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const parsed = schema.safeParse({ name, phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ name: parsed.data.name, phone: parsed.data.phone || null })
        .eq("id", profile.id)
        .select("id,name,phone")
        .single();
      if (error) throw error;
      client.setQueryData(["patient-profile", profile.id], data);
      await refreshUser();
      setMessage("Tu perfil se actualizó correctamente.");
    } catch {
      setError("No se pudieron guardar los cambios. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="space-y-5">
      <fieldset disabled={busy} className="space-y-5">
        <div className="field">
          <Label htmlFor="patient-name">Nombre completo</Label>
          <Input
            id="patient-name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <Label htmlFor="patient-phone">Teléfono</Label>
          <Input
            id="patient-phone"
            type="tel"
            maxLength={25}
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">
            {busy ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setName(profile.name);
              setPhone(profile.phone ?? "");
              setError("");
              setMessage("");
            }}
          >
            Descartar cambios
          </Button>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </form>
  );
}
function EmailForm() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser(
        { email: email.trim() },
        { emailRedirectTo: window.location.origin + "/perfil" },
      );
      if (error) throw error;
      setMessage(
        "Solicitud enviada. Confirma el cambio en los correos que recibirás. Tu dirección actual seguirá activa hasta completar la confirmación.",
      );
    } catch {
      setError(
        "No se pudo solicitar el cambio de correo. Inténtalo nuevamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="field">
        <Label htmlFor="patient-email">Correo electrónico</Label>
        <Input
          id="patient-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <p className="text-sm text-slate-500">
        El cambio de correo necesita confirmación para proteger tu cuenta.
      </p>
      <Button
        type="submit"
        variant="outline"
        disabled={busy || email.trim() === user?.email}
      >
        {busy ? "Enviando..." : "Solicitar cambio de correo"}
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
  );
}
export default function PatientProfile() {
  const { user } = useAuth();
  const profile = useQuery({
    queryKey: ["patient-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,name,phone")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
  if (!user) return null;
  return (
    <div className="space-y-7">
      <div className="page-heading">
        <span className="eyebrow">CONOCERTE ES CUIDARTE MEJOR</span>
        <h1>Mi perfil e historial</h1>
        <p>Tus datos al día, tu atención en un solo lugar.</p>
      </div>
      <div className="profile-grid">
        <aside className="surface profile-summary">
          <div className="profile-avatar">{user.name.slice(0, 1)}</div>
          <h2>{user.name}</h2>
          <span className="role-badge">Paciente</span>
          <p className="mt-4 text-sm break-all text-slate-500">{user.email}</p>
          <div className="profile-secure">
            <ShieldCheck size={18} />
            Cuenta protegida con Supabase Auth
          </div>
        </aside>
        <div className="space-y-6">
          <section className="surface">
            <h2 className="card-heading">
              <UserRound size={20} />
              Datos personales
            </h2>
            <p className="muted mb-6">Así podremos comunicarnos contigo.</p>
            {profile.isPending ? (
              <p role="status">Cargando perfil...</p>
            ) : profile.isError ? (
              <p role="alert">
                No se pudo cargar el perfil.{" "}
                <button className="underline" onClick={() => profile.refetch()}>
                  Reintentar
                </button>
              </p>
            ) : (
              <DetailsForm profile={profile.data} />
            )}
          </section>
          <section className="surface">
            <h2 className="card-heading">
              <Mail size={20} />
              Correo de acceso
            </h2>
            <EmailForm />
          </section>
        </div>
      </div>
      <PatientHistory currentUser={user} />
    </div>
  );
}
