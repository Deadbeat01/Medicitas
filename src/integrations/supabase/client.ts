import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
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
