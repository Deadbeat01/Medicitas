const zone = "America/Lima";
const dayFormat = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" });
function localDay(date: Date) {
  const parts = dayFormat.formatToParts(date);
  const value = (name: string) => Number(parts.find((p) => p.type === name)?.value);
  return Date.UTC(value("year"), value("month") - 1, value("day"));
}
export function registrationDate(value: string | null, now = new Date()) {
  if (!value || Number.isNaN(new Date(value).getTime())) return { relative: "Sin fecha registrada", exact: "" };
  const date = new Date(value);
  const days = Math.round((localDay(now) - localDay(date)) / 86400000);
  const exact = new Intl.DateTimeFormat("es-PE", { timeZone: zone, dateStyle: "medium", timeStyle: "short" }).format(date);
  const relative = days === 0 ? "Hoy" : days === 1 ? "Ayer" : days > 1 ? `Hace ${days} días` : "Fecha de registro";
  return { relative, exact };
}
