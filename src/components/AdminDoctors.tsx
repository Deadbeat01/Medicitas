import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Pencil, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useHospitals, useSpecialties } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { doctorCode, matchesDoctor } from "@/lib/doctorDirectory";

export default function AdminDoctors({ profiles }: { profiles: { id: string; name: string; email: string; user_type: string }[] }) {
  const client = useQueryClient();
  const hospitals = useHospitals();
  const specialties = useSpecialties();
  const doctors = useQuery({
    queryKey: ["doctors", "administration"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors")
        .select("id,name,email,hospital_id,specialty_id,available,specialty:specialties(name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [doctorId, setDoctorId] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const registered = profiles.filter((p) => p.user_type === "doctor").map((p) => {
    const doctor = doctors.data?.find((d) => d.id === p.id);
    return { ...p, hospital_id: doctor?.hospital_id ?? null, specialty_id: doctor?.specialty_id ?? null,
      specialty: doctor?.specialty ?? null, available: doctor?.available ?? false };
  }).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const active = registered.filter((d) => d.available);
  const filtered = registered.filter((d) => (!filter || (d.available && d.hospital_id === filter)) && matchesDoctor(d, search));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * 8, (currentPage + 1) * 8);
  function selectDoctor(id: string) {
    const doctor = registered.find((d) => d.id === id);
    setDoctorId(id);
    setHospitalId(doctor?.hospital_id ?? "");
    setSpecialtyId(doctor?.specialty_id ?? "");
    setError(""); setMessage("");
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(""); setMessage("");
    if (!doctorId || !hospitalId || !specialtyId) {
      setError("Selecciona un médico, su sede y especialidad."); return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.rpc("admin_assign_role", {
        target_id: doctorId, new_role: "doctor", hospital: hospitalId, specialty: specialtyId,
      });
      if (error) throw error;
      await Promise.all([
        client.invalidateQueries({ queryKey: ["doctors"] }),
        client.invalidateQueries({ queryKey: ["admin-summary"] }),
      ]);
      setMessage("Sede y especialidad actualizadas. El médico ya aparece en el catálogo de esa sede.");
    } catch {
      setError("No se pudo guardar la asignación. Revisa tu conexión y vuelve a intentarlo.");
    } finally { setBusy(false); }
  }
  if (hospitals.isPending || specialties.isPending || doctors.isPending)
    return <section className="surface" role="status">Cargando médicos y sedes...</section>;
  if (hospitals.isError || specialties.isError || doctors.isError)
    return <section className="surface notice error" role="alert">
      No se pudo cargar la gestión de médicos.
      <Button variant="outline" onClick={() => { void hospitals.refetch(); void specialties.refetch(); void doctors.refetch(); }}>Reintentar</Button>
    </section>;
  return <section className="surface space-y-6" aria-labelledby="doctors-heading">
    <div className="section-heading">
      <div><h2 id="doctors-heading">Médicos por sede</h2>
        <p>Organiza el equipo de cada centro y asigna la sede de atención de sus médicos.</p></div>
      <span className="role-badge"><Users size={15} /> {active.length} asignados · {registered.length - active.length} pendientes</span>
    </div>
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {hospitals.data.map((h) => <button key={h.id} type="button"
        aria-pressed={filter === h.id} onClick={() => { setFilter(filter === h.id ? "" : h.id); setPage(0); }}
        className={`rounded-xl border p-4 text-left transition-colors ${filter === h.id ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted"}`}>
        <Building2 className="text-primary mb-2" size={20} />
        <span className="block font-semibold">{h.name}</span>
        <span className="text-sm text-muted-foreground">{active.filter((d) => d.hospital_id === h.id).length} médicos asignados</span>
      </button>)}
    </div>
    <div className="grid md:grid-cols-2 gap-4">
    <div className="field"><Label htmlFor="doctor-search">Buscar médico por nombre o código</Label>
      <Input id="doctor-search" type="search" value={search} placeholder="Ej. Valeria o MED-3805F822" onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
      <small className="text-muted-foreground">También puedes buscar por correo. No necesitas escribir tildes.</small>
    </div>
    <div className="field"><Label htmlFor="doctor-site-filter">Filtrar por sede</Label>
      <select id="doctor-site-filter" className="form-select" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0); }}>
        <option value="">Todas las sedes</option>
        {hospitals.data.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
      </select>
    </div></div>
    <div className="max-h-96 overflow-auto"><table className="users-table" aria-label="Directorio de médicos por sede">
      <thead><tr><th>Médico</th><th>Especialidad</th><th>Sede actual</th><th>Gestión</th></tr></thead>
      <tbody>{visible.map((d) => <tr key={d.id}>
        <td><strong>{d.name}</strong><small className="block text-primary" title={d.id}>{doctorCode(d.id)}</small><small className="block text-muted-foreground">{d.email}</small></td>
        <td>{d.specialty?.name ?? "Sin especialidad"}</td>
        <td>{d.available ? hospitals.data.find((h) => h.id === d.hospital_id)?.name ?? "Sin sede" : "Pendiente de asignación"}</td>
        <td><Button type="button" variant="outline" size="sm" onClick={() => selectDoctor(d.id)} aria-label={`Editar sede de ${d.name}`}><Pencil size={14} className="mr-2" />Editar sede</Button></td>
      </tr>)}</tbody>
    </table></div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p role="status" className="text-sm text-muted-foreground">{filtered.length ? `${currentPage * 8 + 1}–${Math.min((currentPage + 1) * 8, filtered.length)} de ${filtered.length} médicos` : "No se encontraron médicos con esos filtros."}</p>
      <div className="flex items-center gap-2">
        {(search || filter) && <Button type="button" variant="ghost" onClick={() => { setSearch(""); setFilter(""); setPage(0); }}>Limpiar filtros</Button>}
        {pageCount > 1 && <><Button type="button" variant="outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</Button>
          <span className="text-sm">{currentPage + 1} / {pageCount}</span>
          <Button type="button" variant="outline" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Siguiente</Button></>}
      </div>
    </div>
    <form onSubmit={save} className="space-y-4">
      <h3 className="font-semibold">Asignar o cambiar la sede de un médico</h3>
      <p className="text-sm text-muted-foreground">Cada médico tiene una sede de atención. Las citas ya registradas conservan su centro original. Para habilitar un médico nuevo, utiliza «Asignar un rol».</p>
      <fieldset disabled={busy} className="grid md:grid-cols-3 gap-4">
        <div className="field"><Label htmlFor="assignment-doctor">Médico registrado</Label>
          <select id="assignment-doctor" className="form-select" required value={doctorId} onChange={(e) => selectDoctor(e.target.value)}>
            <option value="">Selecciona un médico</option>
            {registered.filter((d) => d.id === doctorId || matchesDoctor(d, search)).map((d) => <option key={d.id} value={d.id}>{d.name} · {doctorCode(d.id)}{!d.available ? " · Sin asignación activa" : ""}</option>)}
          </select></div>
        <div className="field"><Label htmlFor="assignment-hospital">Sede de atención</Label>
          <select id="assignment-hospital" className="form-select" required value={hospitalId} onChange={(e) => { setHospitalId(e.target.value); setMessage(""); }}>
            <option value="">Selecciona una sede</option>
            {hospitals.data.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select></div>
        <div className="field"><Label htmlFor="assignment-specialty">Especialidad del médico</Label>
          <select id="assignment-specialty" className="form-select" required value={specialtyId} onChange={(e) => { setSpecialtyId(e.target.value); setMessage(""); }}>
            <option value="">Selecciona una especialidad</option>
            {specialties.data.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select></div>
        <Button type="submit" className="justify-self-start" disabled={!doctorId}>{busy ? "Guardando…" : "Guardar asignación"}</Button>
      </fieldset>
      {error && <p role="alert" className="notice error">{error}</p>}
      {message && <p role="status" className="notice">{message}</p>}
    </form>
  </section>;
}
