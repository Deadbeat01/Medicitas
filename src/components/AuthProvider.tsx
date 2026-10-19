import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
    localStorage.removeItem("user");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        queryClient.clear();
        void loadUser(session?.user ?? null);
      }, 0);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setError("No se pudo recuperar la sesión.");
        setLoading(false);
      } else void loadUser(data.session?.user ?? null);
    });
    return () => {
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
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
