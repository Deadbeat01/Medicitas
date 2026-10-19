import { createClient } from "@supabase/supabase-js";
const client = createClient(
  "https://qpkvjnykirgfgdljqirl.supabase.co",
  "sb_publishable_1Qey3Db4Z_SBpeqbXXzDIA_qYO0vZu3",
  { auth: { persistSession: false } },
);
for (const table of ["profiles", "patients", "appointments", "medical_notes"]) {
  const { error } = await client.from(table).select("*");
  if (!error)
    throw new Error("Anonymous access unexpectedly allowed: " + table);
  console.log("PASS anonymous denied:", table, error.code);
}
