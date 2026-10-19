import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
// Capture recovery intent before Auth consumes and removes the URL fragment.
const authFragment = new URLSearchParams(window.location.hash.slice(1));
export const recoveryLinkState = {
  isRecovery: authFragment.get("type") === "recovery",
  error: authFragment.get("error_description")
    ? "El enlace ha caducado o no es válido. Solicita uno nuevo."
    : "",
};
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key)
  throw new Error(
    "Copia .env.example a .env.local antes de iniciar MediCitas.",
  );
export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
