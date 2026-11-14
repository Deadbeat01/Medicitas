import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { accountRoles, emptyAccountFilters, registrationDay, type AccountFilterValues } from "@/lib/account-filters";

interface Props {
  id: string;
  value: AccountFilterValues;
  onChange: (value: AccountFilterValues) => void;
}
export default function AccountFilters({ id, value, onChange }: Props) {
  return (
    <div className="space-y-3 mb-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="field">
          <Label htmlFor={`${id}-search`}>Buscar cuenta</Label>
          <Input id={`${id}-search`} type="search" placeholder="Nombre, correo o código" value={value.search} onChange={(e) => onChange({ ...value, search: e.target.value })} />
        </div>
        <div className="field">
          <Label htmlFor={`${id}-role`}>Rol actual</Label>
          <select id={`${id}-role`} className="form-select" value={value.role} onChange={(e) => onChange({ ...value, role: e.target.value })}>
            <option value="all">Todos los roles</option>
            {Object.entries(accountRoles).map(([role, label]) => <option key={role} value={role}>{label}</option>)}
          </select>
        </div>
        <div className="field">
          <Label htmlFor={`${id}-day`}>Día de registro (Perú)</Label>
          <Input id={`${id}-day`} type="date" value={value.day} onChange={(e) => onChange({ ...value, day: e.target.value })} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...value, day: registrationDay(new Date().toISOString()) })}>Registrados hoy</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...emptyAccountFilters })}>Limpiar filtros</Button>
      </div>
    </div>
  );
}
