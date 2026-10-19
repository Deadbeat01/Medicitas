
-- Create enum types for better data integrity
CREATE TYPE user_type AS ENUM ('patient', 'doctor');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_type user_type NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create specialties table
CREATE TABLE public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty_id UUID REFERENCES public.specialties(id),
  hospital_id UUID REFERENCES public.hospitals(id),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id),
  specialty_id UUID REFERENCES public.specialties(id),
  hospital_id UUID REFERENCES public.hospitals(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  status appointment_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for specialties (public read access)
CREATE POLICY "Anyone can view specialties" ON public.specialties
  FOR SELECT USING (true);

-- Create RLS policies for hospitals (public read access)
CREATE POLICY "Anyone can view hospitals" ON public.hospitals
  FOR SELECT USING (true);

-- Create RLS policies for doctors (public read access)
CREATE POLICY "Anyone can view doctors" ON public.doctors
  FOR SELECT USING (true);

CREATE POLICY "Doctors can update their own profile" ON public.doctors
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for appointments
CREATE POLICY "Users can view appointments" ON public.appointments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Doctors can update appointments" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.doctors d 
      WHERE d.id = appointments.doctor_id 
      AND d.user_id = auth.uid()
    )
  );

-- Insert initial data for specialties
INSERT INTO public.specialties (name, description) VALUES
  ('Medicina General', 'Atención médica general y preventiva'),
  ('Cardiología', 'Especialidad en enfermedades del corazón'),
  ('Dermatología', 'Especialidad en enfermedades de la piel'),
  ('Pediatría', 'Especialidad en medicina infantil'),
  ('Ginecología', 'Especialidad en salud femenina');

-- Insert initial data for hospitals
INSERT INTO public.hospitals (name, address, phone) VALUES
  ('Hospital de V.E.S', 'Villa El Salvador, Lima', '01-2345678'),
  ('Hospital de Surquillo', 'Surquillo, Lima', '01-2345679'),
  ('Hospital de Jesús María', 'Jesús María, Lima', '01-2345680'),
  ('Hospital de Miraflores', 'Miraflores, Lima', '01-2345681'),
  ('Hospital de Chorrillos', 'Chorrillos, Lima', '01-2345682');

-- Create trigger function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_type)
  VALUES (NEW.id, NEW.email, 'patient');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
