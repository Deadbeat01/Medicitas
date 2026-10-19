import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
export type SupabaseAppointment = Tables<"appointments">;
export type SupabaseDoctor = Tables<"doctors">;
export type SupabaseSpecialty = Tables<"specialties">;
export type SupabaseHospital = Tables<"hospitals">;
export const useSpecialties = () =>
  useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialties")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
export const useHospitals = () =>
  useQuery({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
export const useDoctors = () =>
  useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*,specialty:specialties(name),hospital:hospitals(name)")
        .eq("available", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
export const useAppointments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["appointments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "*,doctor:doctors(name),specialty:specialties(name),hospital:hospitals(name)",
        )
        .order("appointment_date")
        .order("appointment_time");
      if (error) throw error;
      return data;
    },
  });
};
export const useCreateAppointment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (appointment: TablesInsert<"appointments">) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert(appointment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["appointments"] });
      client.invalidateQueries({ queryKey: ["patient-history"] });
    },
  });
};
export const useUpdateAppointment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: SupabaseAppointment["status"];
    }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["appointments"] });
      client.invalidateQueries({ queryKey: ["patient-history"] });
    },
  });
};
