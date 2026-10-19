
-- 1. Agregar el rol administrador al tipo existente.
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'admin';

-- 2. Evitar que un usuario cambie su propio rol
-- mediante una actualización normal desde la aplicación.
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_type IS DISTINCT FROM OLD.user_type
     AND auth.role() IS DISTINCT FROM 'service_role'
     AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'No está permitido cambiar el rol de usuario desde el cliente';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_user_type ON public.profiles;

CREATE TRIGGER protect_profile_user_type
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_self_role_escalation();
