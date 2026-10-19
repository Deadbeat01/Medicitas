import { createContext, useContext } from "react";
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: "patient" | "doctor" | "admin";
}
export type Result = {
  success: boolean;
  error?: string;
  needsConfirmation?: boolean;
};
export type RegisterData = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  userType: "patient" | "doctor";
};
export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: string;
  login: (
    email: string,
    password: string,
    userType?: User["userType"],
  ) => Promise<Result>;
  register: (data: RegisterData) => Promise<Result>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getCurrentUser: () => User | null;
}
export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Falta AuthProvider");
  return context;
}
