import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, clearBrowserSession } from "@/integrations/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";
import {
  AuthContext,
  type User,
  type Result,
  type RegisterData,
} from "@/hooks/useAuth";
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const revision = useRef(0);
  const loadUser = useCallback(async (authUser: AuthUser | null) => {
    const request = ++revision.current;
    if (!authUser) {
      setUser(null);
      setError("");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,email,phone,user_type")
      .eq("id", authUser.id)
      .single();
    if (request !== revision.current) return;
    if (error) {
      setUser(null);
      setError("No se pudo cargar tu perfil. Vuelve a iniciar sesión.");
    } else {
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone ?? undefined,
        userType: data.user_type,
      });
      setError("");
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    const requestRevision = revision;
    localStorage.removeItem("user");
    let active = true;
    let eventRevision = 0;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const event = ++eventRevision;
      // Invalidate profile requests immediately, before deferred auth work runs.
      ++requestRevision.current;
      setTimeout(() => {
        if (!active || event !== eventRevision) return;
        queryClient.clear();
        void loadUser(session?.user ?? null);
      }, 0);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active || eventRevision > 0) return;
      if (error) {
        setError("No se pudo recuperar la sesión.");
        setLoading(false);
      } else void loadUser(data.session?.user ?? null);
    });
    return () => {
      active = false;
      ++requestRevision.current;
      subscription.unsubscribe();
    };
  }, [loadUser, queryClient]);
  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
    await loadUser(data.user);
  };
  const login = async (email: string, password: string): Promise<Result> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setLoading(false);
        return {
          success: false,
          error:
            error.status === 429
              ? "Demasiados intentos. Espera antes de volver a intentar."
              : "Correo o contraseña incorrectos, o correo sin confirmar.",
        };
      }
      await loadUser(data.user);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };
  const register = async (data: RegisterData): Promise<Result> => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: { name: data.name.trim(), phone: data.phone?.trim() },
          emailRedirectTo: window.location.origin + "/auth",
        },
      });
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }
      if (result.session) await loadUser(result.user);
      else setLoading(false);
      return { success: true, needsConfirmation: !result.session };
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const { error } = await Promise.race([
        supabase.auth.signOut({ scope: "local" }),
        new Promise<never>((_resolve, reject) => {
          timeout = setTimeout(() => reject(new Error("Logout timeout")), 8000);
        }),
      ]);
      if (error) throw error;
    } catch {
      clearBrowserSession();
    } finally {
      clearTimeout(timeout);
    }
    ++revision.current;
    setUser(null);
    setError("");
    setLoading(false);
    queryClient.clear();
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUser,
        getCurrentUser: () => user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
