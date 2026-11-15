import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseline = "8f76545";
const originals = new Set([
  "src/components/AppointmentsListWithSupabase.tsx",
  "src/components/PatientHistory.tsx",
  "src/components/AppointmentEmailTemplate.tsx",
  "src/pages/Dashboard.tsx",
  "src/pages/AdminDashboard.tsx",
  "src/pages/PatientProfile.tsx",
]);

// No network requests: the same synthetic data feeds both versions.
const fixture = {
  user: { id: "patient-demo", name: "Paciente Demo", email: "demo@example.test", userType: "patient" },
  query: {}, update: {}, states: null, stateIndex: 0, setters: [], calls: [],
};
function loader(before) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const relative = path.relative(root, file).replaceAll("\\", "/");
    const source = before && originals.has(relative)
      ? execFileSync("git", ["show", `${baseline}:${relative}`], { cwd: root, encoding: "utf8" })
      : readFileSync(file, "utf8");
    const module = { exports: {} };
    cache.set(file, module);
    const localRequire = (id) => {
      if (id === "react") return {
        ...React,
        useState(initial) {
          const index = fixture.stateIndex++;
          const value = fixture.states?.[index] ?? (typeof initial === "function" ? initial() : initial);
          fixture.setters[index] = (next) => { fixture.calls.push({ state: index, value: next }); };
          return [value, fixture.setters[index]];
        },
      };
      if (id === "@/hooks/useSupabaseData") return {
        useAppointments: () => fixture.query,
        useUpdateAppointment: () => fixture.update,
      };
      if (id === "@/hooks/useAuth") return { useAuth: () => ({ user: fixture.user }) };
      if (id === "@/integrations/supabase/client") return { supabase: {} };
      if (id === "@tanstack/react-query") return {
        useQuery: () => fixture.query,
        useQueryClient: () => ({}),
      };
      if (id === "react-router-dom") return {
        Link: ({ to, children, ...props }) => React.createElement("a", { href: to, ...props }, children),
        Navigate: ({ to }) => React.createElement("span", { "data-redirect": to }),
      };
      // Isolate page layout; the appointment list is tested independently below.
      if (["MedicalNotes", "AppointmentFormWithSupabase", "AdminRoleForm"].some((name) => id === `@/components/${name}`)) {
        return { __esModule: true, default: () => React.createElement("div", { "data-fixture": id }) };
      }
      if (id.startsWith("@/") || id.startsWith(".")) {
        const base = id.startsWith("@/") ? path.join(root, "src", id.slice(2)) : path.resolve(path.dirname(file), id);
        const resolved = [base, base + ".ts", base + ".tsx", base + ".js"].find((candidate) => existsSync(candidate));
        if (!resolved) throw new Error(`Unresolved source import: ${id}`);
        return load(resolved);
      }
      return require(id);
    };
    const js = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
      fileName: file,
    }).outputText;
    new Function("require", "module", "exports", js)(localRequire, module, module.exports);
    return module.exports;
  }
  return (relative) => load(path.join(root, relative));
}
const before = loader(true);
const after = loader(false);
let checks = 0;
function reset() { fixture.stateIndex = 0; fixture.calls = []; }
function render(Component, props) {
  reset();
  return renderToStaticMarkup(React.createElement(Component, props));
}
function same(relative, props, label) {
  let expected = render(before(relative).default, props);
  if (["src/components/PatientHistory.tsx", "src/pages/PatientProfile.tsx"].includes(relative)) {
    expected = expected.replace("Notas médicas · demostración", "Notas médicas")
      .replace("Estructura inicial con datos ficticios. No ingresar información clínica real.", "Las notas de atención son gestionadas por el personal médico asignado.");
  }
  assert.equal(render(after(relative).default, props), expected, label);
  checks++;
}
const statuses = ["pending", "confirmed", "completed", "cancelled"];
const rows = statuses.map((status, index) => ({
  id: `appointment-${index}`, status, patient_name: "Paciente Demo",
  appointment_date: "2026-11-20", appointment_time: "09:30:00", reason: "Consulta de demostración",
  doctor: { name: "Médico Demo" }, specialty: { name: "Medicina general" }, hospital: { name: "Centro Demo" },
}));
fixture.update = { isPending: false, mutateAsync: async (value) => fixture.calls.push({ mutation: value }) };
const list = "src/components/AppointmentsListWithSupabase.tsx";
for (const role of ["patient", "doctor"]) {
  fixture.user.userType = role;
  for (const filter of ["active", "completed", "cancelled", "all"]) {
    for (const busy of [false, true]) {
      for (const preview of [null, "appointment-0"]) {
        fixture.states = [filter, "", preview];
        fixture.query = { data: rows, isPending: false, isError: false };
        fixture.update.isPending = busy;
        same(list, { currentUser: fixture.user }, `${role}/${filter}/busy=${busy}/preview=${preview}`);
      }
    }
  }
}
for (const query of [
  { isPending: true }, { isError: true }, { data: [] },
  { data: rows.map((row) => ({ ...row, doctor: null, specialty: null, hospital: null })) },
]) {
  fixture.query = query;
  fixture.states = ["all", "", null];
  same(list, { currentUser: fixture.user }, "Loading, error, empty or nullable relations");
}
fixture.states = null;
for (const role of ["patient", "doctor"]) {
  fixture.user.userType = role;
  for (const query of [{ isPending: true }, { isError: true }, { data: [] }, { data: [...rows, { ...rows[0], status: null }] }]) {
    fixture.query = query;
    same("src/components/PatientHistory.tsx", { currentUser: fixture.user }, `History/${role}`);
  }
}
fixture.query = { data: rows };
for (const role of ["patient", "doctor", "admin"]) {
  fixture.user.userType = role;
  for (const view of [undefined, "book", "appointments"]) {
    same("src/pages/Dashboard.tsx", { view }, `Dashboard heading/${role}/${view}`);
  }
}
fixture.query = { data: { profiles: [{ id: "1", name: "Demo", email: "demo@example.test", user_type: "patient", created_at: "2026-11-14T18:00:00Z" }], count: 4 } };
const adminHtml = render(after("src/pages/AdminDashboard.tsx").default, {});
assert.match(adminHtml, /Cuentas registradas/);
assert.match(adminHtml, /Día de registro/);
checks++;
fixture.user.userType = "patient";
fixture.query = { data: { id: "patient-demo", name: "Paciente Demo", phone: "" } };
same("src/pages/PatientProfile.tsx", {}, "Profile heading");

const presentation = after("src/lib/appointment-presentation.ts");
for (const filter of ["active", "completed", "cancelled", "all"]) {
  const expected = filter === "all" ? rows : rows.filter((row) => filter === "active" ? ["pending", "confirmed"].includes(row.status) : row.status === filter);
  assert.deepEqual(presentation.filterAppointments(rows, filter), expected);
  checks++;
}
assert.deepEqual(rows.map((row) => row.status), statuses, "Filtering must not mutate source data");
checks++;

// Exercise actual callbacks from the extracted card, including every role/status.
function elements(node, result = []) {
  if (Array.isArray(node)) { node.forEach((child) => elements(child, result)); return result; }
  if (!node || typeof node !== "object" || !node.props) return result;
  result.push(node);
  elements(node.props.children, result);
  return result;
}
function text(node) {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(text).join("");
  return node?.props ? text(node.props.children) : "";
}
const Card = after("src/components/AppointmentCard.tsx").default;
for (const userType of ["patient", "doctor"]) {
  for (const appointment of rows) {
    const calls = [];
    const tree = Card({ appointment, userType, isUpdating: false, isPreviewOpen: false,
      onStatusChange: (...args) => calls.push(args), onTogglePreview: () => calls.push("preview") });
    const buttons = elements(tree).filter((node) => typeof node.props.onClick === "function");
    const expected = userType === "doctor" && appointment.status === "pending" ? ["Confirmar", "Cancelar", "Comprobante"]
      : userType === "doctor" && appointment.status === "confirmed" ? ["Completar", "Cancelar", "Comprobante"]
      : ["pending", "confirmed"].includes(appointment.status) ? ["Cancelar", "Comprobante"] : ["Comprobante"];
    assert.deepEqual(buttons.map((node) => text(node.props.children)), expected);
    for (const button of buttons) button.props.onClick();
    assert.deepEqual(calls, expected.map((label) => label === "Comprobante" ? "preview" : [appointment.id, { Confirmar: "confirmed", Completar: "completed", Cancelar: "cancelled" }[label]]));
    checks++;
  }
}

// Failure path remains visible, retry and filter controls still call their handlers.
fixture.query = { data: rows };
fixture.states = ["active", "", null];
fixture.update = { isPending: false, mutateAsync: async () => { throw new Error("synthetic failure"); } };
reset();
const List = after(list).default;
const tree = List({ currentUser: fixture.user });
const card = elements(tree).find((node) => node.type === Card);
await card.props.onStatusChange(rows[0].id, "cancelled");
assert.match(fixture.calls.at(-1).value, /No se pudo cambiar el estado/);
checks++;
elements(tree).find((node) => node.type === "button" && text(node.props.children) === "Todas").props.onClick();
assert.deepEqual(fixture.calls.at(-1), { state: 0, value: "all" });
checks++;
let retried = false;
fixture.query = { isError: true, refetch: () => { retried = true; } };
reset();
elements(List({ currentUser: fixture.user })).find((node) => typeof node.props.onClick === "function").props.onClick();
assert.equal(retried, true);
checks++;
const accountsLib = after("src/lib/account-filters.ts");
const accounts = [
  { id: "code-1", name: "Ángel Aguirre", email: "angel@example.test", user_type: "patient", created_at: "2026-11-15T03:00:00Z" },
  { id: "code-2", name: "Médico Demo", email: "doctor@example.test", user_type: "doctor", created_at: "2026-11-15T06:00:00Z" },
];
assert.equal(accountsLib.registrationDay(accounts[0].created_at), "2026-11-14"); checks++;
assert.equal(accountsLib.registrationDay(accounts[1].created_at), "2026-11-15"); checks++;
for (const [filters, ids] of [
  [{ search: "angel", role: "all", day: "" }, ["code-1"]],
  [{ search: "example.test", role: "doctor", day: "" }, ["code-2"]],
  [{ search: "", role: "all", day: "2026-11-14" }, ["code-1"]],
  [{ search: "code-1", role: "doctor", day: "" }, []],
  [{ search: "aguirre angel", role: "patient", day: "2026-11-14" }, ["code-1"]],
  [{ search: "", role: "all", day: "" }, ["code-2", "code-1"]],
]) {
  assert.deepEqual(accountsLib.filterAccounts(accounts, filters).map((p) => p.id), ids); checks++;
}
assert.deepEqual(accounts.map((a) => a.id), ["code-1", "code-2"]); checks++;
const Registered = after("src/components/RegisteredAccounts.tsx").default;
const manyAccounts = Array.from({ length: 23 }, (_, index) => ({ ...accounts[0], id: String(index), name: `Persona ${index}` }));
fixture.states = [{ ...accountsLib.emptyAccountFilters }, 1];
assert.equal((render(Registered, { profiles: manyAccounts }).match(/<tr>/g) ?? []).length, 11); checks++;
fixture.states = [{ ...accountsLib.emptyAccountFilters }, 3];
assert.equal((render(Registered, { profiles: manyAccounts }).match(/<tr>/g) ?? []).length, 4); checks++;
fixture.states = [{ search: "no-existe", role: "all", day: "" }, 3];
assert.match(render(Registered, { profiles: manyAccounts }), /No hay cuentas/); checks++;
fixture.user.userType = "doctor";
fixture.states = null;
fixture.query = { data: [], isPending: false };
const MedicalNotes = after("src/components/MedicalNotes.tsx").default;
const notesHtml = render(MedicalNotes, {});
assert.match(notesHtml, /No hay notas médicas disponibles/);
assert.doesNotMatch(notesHtml, /demostración|ficticio/i); checks++;
fixture.user.userType = "patient";
assert.equal(render(MedicalNotes, {}), ""); checks++;
console.log(`PASS: ${checks} frontend checks. Appointment regressions, shared headings, account filters, Peru dates, pagination and medical notes verified. Synthetic data; no live Supabase operations.`);
