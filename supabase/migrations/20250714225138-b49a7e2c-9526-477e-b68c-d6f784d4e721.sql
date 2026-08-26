
-- Agregar columnas email y password a la tabla doctors
ALTER TABLE public.doctors 
ADD COLUMN email TEXT UNIQUE,
ADD COLUMN password TEXT;

-- Actualizar los doctores existentes con credenciales
UPDATE public.doctors 
SET email = 'doctor' || 
  CASE 
    WHEN name = 'Dr. Juan Pérez' THEN '1@gmail.com'
    WHEN name = 'Dra. María González' THEN '2@gmail.com'
    WHEN name = 'Dr. Carlos López' THEN '3@gmail.com'
    WHEN name = 'Dra. Ana Martínez' THEN '4@gmail.com'
    WHEN name = 'Dr. Roberto García' THEN '5@gmail.com'
    ELSE '1@gmail.com'
  END,
  password = 'doctor' || 
  CASE 
    WHEN name = 'Dr. Juan Pérez' THEN '1'
    WHEN name = 'Dra. María González' THEN '2'
    WHEN name = 'Dr. Carlos López' THEN '3'
    WHEN name = 'Dra. Ana Martínez' THEN '4'
    WHEN name = 'Dr. Roberto García' THEN '5'
    ELSE '1'
  END;

-- Permitir INSERT en la tabla patients para el registro
CREATE POLICY "Anyone can register as patient" ON public.patients
  FOR INSERT WITH CHECK (true);

-- Permitir INSERT en la tabla doctors para el registro (si es necesario)
CREATE POLICY "Anyone can register as doctor" ON public.doctors
  FOR INSERT WITH CHECK (true);
