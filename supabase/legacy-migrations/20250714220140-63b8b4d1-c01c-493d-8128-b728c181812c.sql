
-- Create patients table with credentials
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add patient_id column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN patient_id UUID REFERENCES public.patients(id);

-- Enable Row Level Security on patients table
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients
CREATE POLICY "Anyone can view patients" ON public.patients
  FOR SELECT USING (true);

CREATE POLICY "Patients can update their own profile" ON public.patients
  FOR UPDATE USING (auth.uid() = user_id);

-- Create some sample patients with sequential credentials
INSERT INTO public.patients (name, email, password, phone) VALUES
  ('Juan Pérez', 'patient1@gmail.com', 'patient1', '+51 999-111-111'),
  ('María González', 'patient2@gmail.com', 'patient2', '+51 999-222-222'),
  ('Carlos López', 'patient3@gmail.com', 'patient3', '+51 999-333-333'),
  ('Ana Martínez', 'patient4@gmail.com', 'patient4', '+51 999-444-444'),
  ('Roberto García', 'patient5@gmail.com', 'patient5', '+51 999-555-555');

-- Create trigger for updated_at column in patients table
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
