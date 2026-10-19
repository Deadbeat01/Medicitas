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
const storageKey = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
// Reload discards the SDK's in-memory session as well as outstanding requests.
// This fallback signs out this browser; it does not claim server-side revocation.
export function clearBrowserSession() {
  localStorage.removeItem(storageKey);
  localStorage.removeItem(`${storageKey}-code-verifier`);
  localStorage.removeItem(`${storageKey}-user`);
  window.location.replace("/auth");
}
export const supabase = createClient<Database>(url, key, {
  auth: {
    storageKey,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
