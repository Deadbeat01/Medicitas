import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function load(file) {
  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const context = { exports: {} }; vm.runInNewContext(code, context); return context.exports;
}
const { doctorCode, matchesDoctor } = load("../src/lib/doctorDirectory.ts");
const { registrationDate } = load("../src/lib/registrationDate.ts");
const doctor = { id: "3805f822-2810-437b-b782-6862a8bb63c0", name: "Dra. Valéria Montes", email: "valeria.montes@medicitas.test" };
assert.equal(doctorCode(doctor.id), "MED-3805F822");
for (const query of ["valeria", "MONTES", "med-3805f822", "valeria montes", "  valeria  ", doctor.email, doctor.id]) assert.ok(matchesDoctor(doctor, query));
assert.equal(matchesDoctor(doctor, "sin coincidencia"), false);
const now = new Date("2026-10-20T04:30:00Z"); // 19 de octubre a las 23:30 en Perú.
assert.equal(registrationDate("2026-10-20T00:10:00Z", now).relative, "Hoy");
assert.equal(registrationDate("2026-10-19T04:50:00Z", now).relative, "Ayer");
assert.equal(registrationDate("2026-10-18T04:50:00Z", now).relative, "Hace 2 días");
assert.equal(registrationDate(null, now).relative, "Sin fecha registrada");
assert.equal(registrationDate("invalid", now).exact, "");
console.log("PASS: búsqueda por nombre, código, correo, tildes y fechas de registro en hora de Perú");
