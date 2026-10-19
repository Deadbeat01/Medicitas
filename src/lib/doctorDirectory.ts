export const doctorCode = (id: string) => `MED-${id.slice(0, 8).toUpperCase()}`;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function matchesDoctor(doctor: { id: string; name: string; email: string }, search: string) {
  const text = normalize(`${doctor.name} ${doctor.email} ${doctorCode(doctor.id)} ${doctor.id}`);
  return normalize(search).trim().split(/\s+/).every((term) => text.includes(term));
}
