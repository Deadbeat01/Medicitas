# Perfil e historial del paciente

Rama: feature/perfil-paciente. Ruta: /perfil, disponible desde el panel del paciente.

Incluye PatientProfile.tsx y PatientHistory.tsx: perfil consultado por ID, formulario limitado a nombre/correo/teléfono, validación, confirmación de escritura, descarte, estados de carga/error/reintento y citas anteriores ordenadas de más reciente a más antigua. El historial consulta por patient_id e incluye estados completado/cancelado, sin reutilizar el listado de citas activas.

Notas médicas: ejemplo exclusivamente ficticio, sin almacenamiento ni edición. El componente solo muestra el ejemplo al rol doctor; la página de perfil es exclusiva de pacientes. La rama doctor queda preparada para integrarse posteriormente en una vista médica autorizada.

## Limitación heredada de autenticación
El inicio de sesión original consulta tablas con correo/contraseña y guarda el usuario en localStorage; no crea una sesión de Supabase Auth. La política existente de UPDATE en patients requiere auth.uid() = user_id. Por tanto, con el login original el servidor puede rechazar el guardado: la pantalla informa el error y nunca lo presenta como exitoso. No se ha debilitado la política para eludir esta restricción.

Antes de usar datos reales se requiere migrar el login a Supabase Auth, vincular patients.user_id, aplicar autorización por titular y rol en el servidor y reemplazar las políticas públicas de lectura heredadas. El filtro por patient_id y la comprobación de rol en el navegador no constituyen controles de seguridad del servidor. Esta entrega no ejecuta migraciones ni modifica una base remota.

## Verificación manual
1. Sin sesión, abrir /perfil: redirige a /auth. Con doctor, redirige al panel.
2. Con paciente, abrir Mi perfil e historial; comprobar datos y ausencia de citas ajenas.
3. Probar nombre vacío, correo inválido y teléfono inválido; comprobar rechazo.
4. Modificar campos y descartar: recupera datos guardados.
5. Con una sesión Auth y vinculación user_id válidas, guardar y recargar para comprobar persistencia. Con login heredado sin permisos, comprobar error y ausencia de falso éxito.
6. Comprobar historial vacío, error/reintento, citas pasadas completadas/canceladas y exclusión de citas futuras.
7. El paciente ve el aviso de notas restringidas; el ejemplo médico es ficticio.
