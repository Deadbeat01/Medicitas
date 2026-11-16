# Estructura del sistema

Descripción de las carpetas principales de MediCitas y de los componentes que se agregaron al integrar el trabajo del equipo.

- `src/components`: componentes de la interfaz. Se agregaron AdminStats, AdminRoleForm, AuthProvider, ProtectedRoute, PatientHistory, MedicalNotes, AppointmentEmailTemplate y ThemeToggle.
- `src/pages`: pantallas de la aplicación: AdminDashboard, Auth, Dashboard, ForgotPassword, Index, NotFound y PatientProfile.
- `src/hooks`: lógica reutilizable: use-mobile, use-toast, useAuth y useSupabaseData.
- `supabase/migrations`: esquema actual de la base de datos. Las migraciones anteriores quedaron en `supabase/legacy-migrations` como referencia.
- `scripts`: scripts de verificación, verify-anonymous.mjs y verify-integration.mjs.
- `docs`: documentación del proyecto.