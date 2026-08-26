
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type SupabaseAppointment = Tables<'appointments'>;
export type SupabaseDoctor = Tables<'doctors'>;
export type SupabaseSpecialty = Tables<'specialties'>;
export type SupabaseHospital = Tables<'hospitals'>;

// Hook para obtener especialidades
export const useSpecialties = () => {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener hospitales
export const useHospitals = () => {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener doctores con especialidad
export const useDoctors = () => {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          specialty:specialties(name),
          hospital:hospitals(name)
        `)
        .eq('available', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener citas
export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(name),
          specialty:specialties(name),
          hospital:hospitals(name)
        `)
        .not('status', 'in', '(cancelled,completed)') 
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error("Error al obtener citas:", error);
        throw error;
      }

      return data;
    },
  });
};


// Hook para crear citas
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointment: TablesInsert<'appointments'>) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// Hook para actualizar estado de citas
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SupabaseAppointment['status'] }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
