# Estructura del sistema

Descripción de las carpetas principales de MediCitas y de los componentes que se agregaron al integrar el trabajo del equipo.

- `src/components`: componentes de la interfaz. Se agregaron AdminStats, AdminRoleForm, AuthProvider, ProtectedRoute, PatientHistory, MedicalNotes, AppointmentEmailTemplate y ThemeToggle.
- `src/pages`: pantallas de la aplicación: AdminDashboard, Auth, Dashboard, ForgotPassword, Index, NotFound y PatientProfile.
- `src/hooks`: lógica reutilizable: use-mobile, use-toast, useAuth y useSupabaseData.
- `supabase/migrations`: esquema actual de la base de datos. Las migraciones anteriores quedaron en `supabase/legacy-migrations` como referencia.
- `scripts`: scripts de verificación, verify-anonymous.mjs y verify-integration.mjs.
- `docs`: documentación del proyecto.

## Integración para la presentación

- `src/lib`: catálogos, tipos y filtros compartidos.
- `src/pages/PatientHistoryPage.tsx`: vista independiente del historial en `/historial`. El perfil permanece en `/perfil`.
- `tests/fixtures/frontend-baseline`: fuentes originales congeladas para pruebas sin Git.
- `scripts/verify-frontend-refactor.mjs`: 89 comprobaciones con datos controlados.
- `scripts/serve-built.mjs`: servidor local de la compilación incluida en el ZIP.
- `GUIA-PARA-EXPONER.md`: recorrido por estudiante, inicio y alcance de las verificaciones.
