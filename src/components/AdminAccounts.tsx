import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { doctorCode, matchesDoctor } from "@/lib/doctorDirectory";
import { registrationDate } from "@/lib/registrationDate";
type Profile = { id: string; name: string; email: string; user_type: "patient" | "doctor" | "admin"; created_at: string | null };
const roles = { patient: "Paciente", doctor: "Médico", admin: "Administrador" };
const accountCode = (p: Profile) => p.user_type === "doctor" ? doctorCode(p.id) : `USR-${p.id.slice(0, 8).toUpperCase()}`;
export default function AdminAccounts({ profiles }: { profiles: Profile[] }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(0);
  const filtered = profiles.filter((p) => (!role || p.user_type === role) && matchesDoctor({ ...p, name: `${p.name} ${accountCode(p)}` }, search));
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages - 1);
  return <section className="surface space-y-5" aria-labelledby="accounts-heading">
    <div className="section-heading"><div><h2 id="accounts-heading">Cuentas registradas</h2><p>Busca una cuenta y consulta cuándo se registró. Fechas en hora de Perú.</p></div><span className="text-sm text-muted-foreground">{profiles.length} cuentas</span></div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="field"><Label htmlFor="account-search">Buscar cuenta por nombre o código</Label><Input id="account-search" type="search" value={search} placeholder="Nombre, correo, USR-… o MED-…" onChange={(e) => { setSearch(e.target.value); setPage(0); }} /></div>
      <div className="field"><Label htmlFor="account-role-filter">Filtrar cuentas por rol</Label><select id="account-role-filter" className="form-select" value={role} onChange={(e) => { setRole(e.target.value); setPage(0); }}><option value="">Todos los roles</option><option value="patient">Paciente</option><option value="doctor">Médico</option><option value="admin">Administrador</option></select></div>
    </div>
    <div className="overflow-x-auto"><table className="users-table" aria-label="Cuentas registradas y fechas de registro">
      <thead><tr><th>Nombre y código</th><th>Correo electrónico</th><th>Rol</th><th>Registro</th></tr></thead>
      <tbody>{filtered.slice(current * 8, (current + 1) * 8).map((p) => {
        const date = registrationDate(p.created_at);
        return <tr key={p.id}><td><strong>{p.name}</strong><small className="block text-primary" title={p.id}>{accountCode(p)}</small></td><td>{p.email}</td><td><span className="role-badge">{roles[p.user_type]}</span></td><td>{p.created_at && date.exact ? <time dateTime={p.created_at}><strong className="block">{date.relative}</strong><small className="block whitespace-nowrap text-muted-foreground">{date.exact}</small></time> : date.relative}</td></tr>;
      })}</tbody>
    </table></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm text-muted-foreground">{filtered.length ? `${current * 8 + 1}–${Math.min((current + 1) * 8, filtered.length)} de ${filtered.length} cuentas` : "No se encontraron cuentas con esos filtros."}</p><div className="flex items-center gap-2">
      {(search || role) && <Button type="button" variant="ghost" onClick={() => { setSearch(""); setRole(""); setPage(0); }}>Limpiar búsqueda de cuentas</Button>}
      {pages > 1 && <><Button type="button" variant="outline" disabled={current === 0} onClick={() => setPage(current - 1)}>Cuentas anteriores</Button><span className="text-sm">{current + 1} / {pages}</span><Button type="button" variant="outline" disabled={current + 1 >= pages} onClick={() => setPage(current + 1)}>Cuentas siguientes</Button></>}
    </div></div>
  </section>;
}
