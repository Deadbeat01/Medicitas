import AccountFilters from "@/components/AccountFilters";
import AccountPagination from "@/components/AccountPagination";
import { accountRoles, emptyAccountFilters, filterAccounts, type Account } from "@/lib/account-filters";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHospitals, useSpecialties } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
export default function AdminRoleForm({
  profiles,
}: {
  profiles: Account[];
}) {
  const client = useQueryClient();
  const hospitals = useHospitals();
  const specialties = useSpecialties();
  const [target, setTarget] = useState("");
  const [filters, setFilters] = useState({ ...emptyAccountFilters });
  const [requestedPage, setPage] = useState(1);
  const hasFilters = Boolean(filters.search.trim() || filters.role !== "all" || filters.day);
  const matches = hasFilters ? filterAccounts(profiles, filters) : [];
  const pages = Math.max(1, Math.ceil(matches.length / 5));
  const page = Math.min(requestedPage, pages);
  const candidates = matches.slice((page - 1) * 5, page * 5);
  const selectedAccount = profiles.find((account) => account.id === target);
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
    if (!selectedAccount) {
      setError("Busca y selecciona una cuenta antes de guardar el rol.");
      return;
    }
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
        Primero la persona crea su cuenta de paciente. Después puedes autorizar
        su acceso profesional.
      </p>
      <form onSubmit={save} className="space-y-5">
        <fieldset disabled={busy} className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <AccountFilters id="role-account" value={filters} onChange={(next) => {
              setFilters(next);
              setPage(1);
              setTarget("");
              setMessage("");
              setError("");
            }} />
            {!hasFilters ? (
              <p className="muted">Busca por nombre, correo o código, o aplica un filtro para seleccionar una cuenta.</p>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-3" role="status">{matches.length} cuentas encontradas</p>
                <div className="space-y-2" role="group" aria-label="Seleccionar cuenta para asignar rol">
                  {candidates.map((account) => (
                    <label key={account.id} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
                      <input type="radio" name="role-account" value={account.id} checked={target === account.id} onChange={() => {
                        setTarget(account.id);
                        setRole(account.user_type);
                        setHospital("");
                        setSpecialty("");
                        setMessage("");
                        setError("");
                      }} />
                      <span className="min-w-0"><strong className="block">{account.name}</strong><span className="block text-sm break-all">{account.email}</span><span className="text-sm text-slate-500">{accountRoles[account.user_type]}</span></span>
                    </label>
                  ))}
                  {!candidates.length && <p role="status">No hay cuentas que coincidan con estos filtros.</p>}
                </div>
                <AccountPagination page={page} pages={pages} onChange={setPage} />
              </>
            )}
            {selectedAccount && <p className="notice mt-4" role="status">Cuenta seleccionada: <strong>{selectedAccount.name}</strong> · {selectedAccount.email}</p>}
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
          <Button className="justify-self-start" type="submit" disabled={!selectedAccount}>
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
