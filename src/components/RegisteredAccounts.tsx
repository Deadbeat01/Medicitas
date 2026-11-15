import { useState } from "react";
import AccountFilters from "@/components/AccountFilters";
import AccountPagination from "@/components/AccountPagination";
import { accountRoles, emptyAccountFilters, filterAccounts, formatRegistration, type Account } from "@/lib/account-filters";

const PAGE_SIZE = 10;
export default function RegisteredAccounts({ profiles }: { profiles: Account[] }) {
  const [filters, setFilters] = useState({ ...emptyAccountFilters });
  const [requestedPage, setPage] = useState(1);
  const matches = filterAccounts(profiles, filters);
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pages);
  const rows = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <section className="surface">
      <div className="section-heading">
        <div><h2>Cuentas registradas</h2><p>Busca personas o consulta quién se registró en un día específico.</p></div>
        <span className="text-sm text-slate-500" role="status">{matches.length} de {profiles.length} cuentas</span>
      </div>
      <AccountFilters id="accounts" value={filters} onChange={(next) => { setFilters(next); setPage(1); }} />
      <p className="text-sm text-slate-500 mb-3">Más recientes primero · Fechas y horas de Perú</p>
      <div className="overflow-x-auto">
        <table className="users-table">
          <thead><tr><th scope="col">Nombre</th><th scope="col">Correo electrónico</th><th scope="col">Rol</th><th scope="col">Registro</th></tr></thead>
          <tbody>{rows.map((account) => (
            <tr key={account.id}><td>{account.name}</td><td>{account.email}</td><td><span className="role-badge">{accountRoles[account.user_type]}</span></td><td><time dateTime={account.created_at}>{formatRegistration(account.created_at)}</time></td></tr>
          ))}</tbody>
        </table>
      </div>
      {!rows.length && <p className="empty-state" role="status">No hay cuentas que coincidan con estos filtros.</p>}
      <AccountPagination page={page} pages={pages} onChange={setPage} />
    </section>
  );
}
