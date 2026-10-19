import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key)
  throw new Error(
    "Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
const client = () =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
async function login(prefix) {
  const email = process.env[prefix + "_EMAIL"],
    password = process.env[prefix + "_PASSWORD"];
  if (!email || !password)
    throw new Error("Faltan " + prefix + "_EMAIL y " + prefix + "_PASSWORD");
  const c = client();
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { c, id: data.user.id };
}
const [patient, other, doctor, admin] = await Promise.all(
  ["TEST_PATIENT", "TEST_OTHER_PATIENT", "TEST_DOCTOR", "TEST_ADMIN"].map(
    login,
  ),
);
const p = patient.c;
const original = await p
  .from("profiles")
  .select("name,phone,user_type")
  .eq("id", patient.id)
  .single();
assert.ifError(original.error);
assert.equal(original.data.user_type, "patient");
const changed = await p
  .from("profiles")
  .update({ name: original.data.name + " prueba" })
  .eq("id", patient.id)
  .select("name")
  .single();
assert.ifError(changed.error);
const persisted = await p
  .from("profiles")
  .select("name")
  .eq("id", patient.id)
  .single();
assert.equal(persisted.data.name, original.data.name + " prueba");
assert.ifError(
  (
    await p
      .from("profiles")
      .update({ name: original.data.name })
      .eq("id", patient.id)
  ).error,
);
console.log("PASS profile persisted and restored");
const foreign = await other.c
  .from("profiles")
  .select("id")
  .eq("id", patient.id);
assert.ifError(foreign.error);
assert.equal(foreign.data.length, 0);
console.log("PASS profile isolation");
assert.ok(
  (await p.from("profiles").update({ user_type: "admin" }).eq("id", patient.id))
    .error,
);
assert.ok(
  (
    await p.rpc("admin_assign_role", {
      target_id: patient.id,
      new_role: "admin",
    })
  ).error,
);
console.log("PASS role escalation denied");
const notes = await p.from("medical_notes").select("id");
assert.ifError(notes.error);
assert.equal(notes.data.length, 0);
console.log("PASS notes denied to patients");
const { data: d, error: doctorError } = await p
  .from("doctors")
  .select("id,hospital_id,specialty_id")
  .eq("id", doctor.id)
  .single();
assert.ifError(doctorError);
const date = new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10);
const row = {
  patient_id: patient.id,
  doctor_id: d.id,
  hospital_id: d.hospital_id,
  specialty_id: d.specialty_id,
  patient_name: "Se completa en el servidor",
  email: "no-usado@example.com",
  phone: "",
  reason: "Prueba automatizada ficticia de reserva",
  appointment_date: date,
  appointment_time: "17:00",
  status: "pending",
};
// Use dedicated disposable accounts. This leaves a completed test appointment as evidence.
const results = await Promise.all([
  p.from("appointments").insert(row).select().single(),
  p.from("appointments").insert(row).select().single(),
]);
const success = results.filter((r) => !r.error);
assert.equal(success.length, 1);
assert.equal(results.find((r) => r.error).error.code, "23505");
const appointment = success[0].data;
console.log("PASS concurrent duplicate reservation denied");
const leaked = await other.c
  .from("appointments")
  .select("id")
  .eq("id", appointment.id);
assert.ifError(leaked.error);
assert.equal(leaked.data.length, 0);
console.log("PASS appointment isolation");
assert.ok(
  (
    await p
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", appointment.id)
  ).error,
);
console.log("PASS patient cannot confirm");
assert.ifError(
  (
    await doctor.c
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", appointment.id)
      .select()
      .single()
  ).error,
);
assert.ifError(
  (
    await doctor.c
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", appointment.id)
      .select()
      .single()
  ).error,
);
console.log("PASS assigned doctor confirms and completes");
const adminRows = await admin.c.from("profiles").select("id");
assert.ifError(adminRows.error);
assert.ok(adminRows.data.length >= 4);
console.log("PASS admin sees registered accounts");
await Promise.all(
  [patient, other, doctor, admin].map((x) => x.c.auth.signOut()),
);
console.log("Integration checks passed with real Supabase requests.");
