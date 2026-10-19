
-- Add email and password columns to doctors table
ALTER TABLE public.doctors 
ADD COLUMN email TEXT,
ADD COLUMN password TEXT;

-- Update existing doctors with sequential email and password
UPDATE public.doctors 
SET 
  email = 'doctor' || ROW_NUMBER() OVER (ORDER BY created_at) || '@gmail.com',
  password = 'doctor' || ROW_NUMBER() OVER (ORDER BY created_at)
WHERE email IS NULL;

-- Make email column unique and not null for future records
ALTER TABLE public.doctors 
ALTER COLUMN email SET NOT NULL,
ADD CONSTRAINT doctors_email_unique UNIQUE (email);
