import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
const env = process.env;
for (const name of ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY", "TEST_PATIENT_EMAIL", "TEST_PATIENT_PASSWORD"])
  assert.ok(env[name], `Falta ${name}`);
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
try {
  const login = await client.auth.signInWithPassword({ email: env.TEST_PATIENT_EMAIL, password: env.TEST_PATIENT_PASSWORD });
  assert.ifError(login.error);
  const [hospitals, doctors] = await Promise.all([
    client.from("hospitals").select("id,name"),
    client.from("doctors").select("id,name,hospital_id,specialty_id").eq("available", true),
  ]);
  assert.ifError(hospitals.error); assert.ifError(doctors.error);
  assert.ok(hospitals.data.length >= 6);
  const codes = doctors.data.map((d) => `MED-${d.id.slice(0, 8).toUpperCase()}`);
  assert.equal(new Set(codes).size, codes.length, "Códigos de referencia duplicados");
  for (const site of hospitals.data) {
    const team = doctors.data.filter((d) => d.hospital_id === site.id);
    assert.ok(team.length >= 4, `${site.name} necesita al menos cuatro médicos`);
    assert.ok(new Set(team.map((d) => d.specialty_id)).size >= 3, "Faltan especialidades");
    console.log(`PASS ${site.name}: ${team.length} médicos`);
  }
  const doctor = doctors.data[0];
  const denied = await client.rpc("admin_assign_role", { target_id: doctor.id, new_role: "doctor", hospital: doctor.hospital_id, specialty: doctor.specialty_id });
  assert.equal(denied.error?.code, "42501", "El paciente no debe gestionar médicos");
  console.log("PASS: catálogo accesible al paciente, códigos únicos y asignación solo para administrador");
} finally { await client.auth.signOut({ scope: "local" }); }
