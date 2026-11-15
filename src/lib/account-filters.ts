import type { Tables } from "@/integrations/supabase/types";

export type Account = Pick<Tables<"profiles">, "id" | "name" | "email" | "user_type" | "created_at">;
export const accountRoles = { patient: "Paciente", doctor: "Médico", admin: "Administrador" };
export interface AccountFilterValues { search: string; role: string; day: string }
export const emptyAccountFilters: AccountFilterValues = { search: "", role: "all", day: "" };

const limaDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit",
});
export function registrationDay(value: string) {
  const parts = limaDay.formatToParts(new Date(value));
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function formatRegistration(value: string) {
  return new Date(value).toLocaleString("es-PE", {
    timeZone: "America/Lima", dateStyle: "medium", timeStyle: "short",
  });
}
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function filterAccounts(accounts: Account[], filters: AccountFilterValues) {
  const words = normalize(filters.search).split(/\s+/).filter(Boolean);
  return accounts.filter((account) => {
    const text = normalize(`${account.name} ${account.email} ${account.id}`);
    return words.every((word) => text.includes(word)) &&
      (filters.role === "all" || account.user_type === filters.role) &&
      (!filters.day || registrationDay(account.created_at) === filters.day);
  }).sort((a, b) => b.created_at.localeCompare(a.created_at) || a.name.localeCompare(b.name, "es"));
}
