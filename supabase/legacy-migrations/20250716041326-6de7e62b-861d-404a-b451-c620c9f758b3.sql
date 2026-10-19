
-- Add email and password columns to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS password TEXT;

-- Update existing doctors with sequential email and password using a different approach
WITH numbered_doctors AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.doctors
  WHERE email IS NULL
)
UPDATE public.doctors 
SET 
  email = 'doctor' || nd.rn || '@gmail.com',
  password = 'doctor' || nd.rn
FROM numbered_doctors nd
WHERE public.doctors.id = nd.id;

-- Make email column unique and not null for future records
ALTER TABLE public.doctors 
ALTER COLUMN email SET NOT NULL,
ADD CONSTRAINT doctors_email_unique UNIQUE (email);
