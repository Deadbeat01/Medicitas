import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHospitals, useSpecialties } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
export default function AdminRoleForm({
  profiles,
}: {
  profiles: { id: string; name: string; email: string }[];
}) {
  const client = useQueryClient();
  const hospitals = useHospitals();
  const specialties = useSpecialties();
  const [target, setTarget] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient");
  const [hospital, setHospital] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { error } = await supabase.rpc("admin_assign_role", {
        target_id: target,
        new_role: role,
        hospital: role === "doctor" ? hospital : null,
        specialty: role === "doctor" ? specialty : null,
      });
      if (error) throw error;
      await client.invalidateQueries({ queryKey: ["admin-summary"] });
      await client.invalidateQueries({ queryKey: ["doctors"] });
      setMessage(
        "Rol actualizado. La cuenta verá sus permisos al volver a ingresar.",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : ((e as { message?: string }).message ??
              "No se pudo actualizar el rol."),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="surface">
      <h2 className="card-heading">Asignar un rol</h2>
      <p className="muted mb-6">
        Primero la persona crea y confirma su cuenta de paciente. Después puedes
        autorizar su acceso profesional.
      </p>
      <form onSubmit={save} className="space-y-5">
        <fieldset disabled={busy} className="grid md:grid-cols-2 gap-5">
          <div className="field">
            <Label htmlFor="role-account">Cuenta</Label>
            <select
              id="role-account"
              className="form-select"
              required
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="">Selecciona una cuenta</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.email}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <Label htmlFor="role-type">Rol autorizado</Label>
            <select
              id="role-type"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
            >
              <option value="patient">Paciente</option>
              <option value="doctor">Médico</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {role === "doctor" && (
            <>
              <div className="field">
                <Label htmlFor="role-specialty">Especialidad</Label>
                <select
                  id="role-specialty"
                  required
                  className="form-select"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option value="">Selecciona especialidad</option>
                  {specialties.data?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <Label htmlFor="role-hospital">Centro médico</Label>
                <select
                  id="role-hospital"
                  required
                  className="form-select"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                >
                  <option value="">Selecciona centro</option>
                  {hospitals.data?.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <Button className="justify-self-start" type="submit">
            {busy ? "Guardando..." : "Guardar rol"}
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
    </section>
  );
}
