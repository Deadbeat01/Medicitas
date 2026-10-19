
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'patient' | 'doctor';
  phone?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = async (email: string, password: string, userType: 'patient' | 'doctor') => {
    setIsLoading(true);
    
    try {
      if (userType === 'patient') {
        const { data: patients, error } = await supabase
          .from('patients')
          .select('*')
          .eq('email', email)
          .eq('password', password);

        if (error || !patients || patients.length === 0) {
          setIsLoading(false);
          return { success: false, error: 'Credenciales incorrectas' };
        }

        const patient = patients[0];
        const userData: User = {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          userType: 'patient',
          phone: patient.phone || undefined
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoading(false);
        return { success: true };

      } else if (userType === 'doctor') {
        const { data: doctors, error } = await supabase
          .from('doctors')
          .select('id, name, email, password')
          .eq('email', email)
          .eq('password', password);

        if (error || !doctors || doctors.length === 0) {
          setIsLoading(false);
          return { success: false, error: 'Credenciales incorrectas' };
        }

        const doctor = doctors[0];
        const userData: User = {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          userType: 'doctor'
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Tipo de usuario no válido' };

    } catch (error) {
      console.error('Error en login:', error);
      setIsLoading(false);
      return { success: false, error: 'Error en el servidor' };
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    userType: 'patient' | 'doctor';
  }) => {
    setIsLoading(true);
    
    try {
      if (userData.userType === 'patient') {
        // Verificar si ya existe un paciente con ese email
        const { data: existingPatients } = await supabase
          .from('patients')
          .select('id')
          .eq('email', userData.email);

        if (existingPatients && existingPatients.length > 0) {
          setIsLoading(false);
          return { success: false, error: 'Ya existe un paciente con este email' };
        }

        const { data: newPatient, error } = await supabase
          .from('patients')
          .insert({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone || null
          })
          .select()
          .single();

        if (error) {
          console.error('Error registrando paciente:', error);
          setIsLoading(false);
          return { success: false, error: 'Error al registrar paciente' };
        }

        const user: User = {
          id: newPatient.id,
          name: newPatient.name,
          email: newPatient.email,
          userType: 'patient',
          phone: newPatient.phone || undefined
        };

        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        setIsLoading(false);
        return { success: true };

      } else if (userData.userType === 'doctor') {
        // Verificar si ya existe un doctor con ese email
        const { data: existingDoctors } = await supabase
          .from('doctors')
          .select('id')
          .eq('email', userData.email);

        if (existingDoctors && existingDoctors.length > 0) {
          setIsLoading(false);
          return { success: false, error: 'Ya existe un doctor con este email' };
        }

        const { data: newDoctor, error } = await supabase
          .from('doctors')
          .insert({
            name: userData.name,
            email: userData.email,
            password: userData.password
          })
          .select()
          .single();

        if (error) {
          console.error('Error registrando doctor:', error);
          setIsLoading(false);
          return { success: false, error: 'Error al registrar doctor' };
        }

        const user: User = {
          id: newDoctor.id,
          name: newDoctor.name,
          email: newDoctor.email,
          userType: 'doctor'
        };

        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Tipo de usuario no válido' };

    } catch (error) {
      console.error('Error en registro:', error);
      setIsLoading(false);
      return { success: false, error: 'Error en el servidor' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const getCurrentUser = (): User | null => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  };

  return {
    user,
    login,
    register,
    logout,
    getCurrentUser,
    isLoading
  };
};
