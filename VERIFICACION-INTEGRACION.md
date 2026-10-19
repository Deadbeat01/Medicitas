# Verificación final de MediCitas

Fecha de trabajo: 18 de octubre de 2026, America/Lima.
Rama de entrega: feature/integracion-supabase.
Proyecto independiente: qpkvjnykirgfgdljqirl, organización opoku08's Org.

## Comprobado contra la base real

- Registro sin confirmación de correo: tres cuentas ficticias autorizadas creadas mediante signUp, con sesión inmediata. Contraseñas aleatorias almacenadas solo en archivos locales fuera del repositorio.
- Inicio de sesión con contraseña mediante Supabase Auth y carga del rol desde profiles.
- Nombre y teléfono guardados desde el formulario y conservados al recargar la pantalla. Escritura y lectura verificadas también por API.
- Aislamiento entre pacientes, notas invisibles para pacientes y rechazo de escalada de rol por UPDATE y por RPC.
- Rechazo de motivo corto, fecha pasada, estado inicial confirmado y médico que no corresponde al centro.
- Dos peticiones concurrentes para el mismo médico y horario: solo una reserva aceptada; la otra rechazada con 23505.
- El paciente no puede confirmar ni cancelar citas ajenas. Puede cancelar su propia cita activa, sin reabrir estados cerrados.
- El médico asignado confirma y completa la consulta. Puede leer la nota ficticia de su paciente asignado.
- Acceso sin sesión rechazado en profiles, patients, appointments y medical_notes con 42501.
- Administrador: cuenta del propietario autorizada explícitamente; panel real muestra cuentas y estadísticas de Supabase. Su contraseña no se usa en scripts; la comprobación del panel se realizó con su sesión del navegador.
- Plantilla de confirmación visible desde Comprobante. Es una vista previa, sin afirmación de correo enviado.
- Solicitud de recuperación a opokugaaa@gmail.com autorizada por el usuario y aceptada por Supabase desde el formulario real. Recepción del correo y cambio de contraseña quedan en manos del propietario; no se cambió su contraseña.

## Interfaz y entrega

Revisión visual del resumen, perfil, formulario de reserva, agenda médica, notas ficticias, comprobante y administración con datos reales de prueba. CSS adaptable para pantallas estrechas; no se realizó una revisión visual en un dispositivo móvil físico.

TypeScript, ESLint de los archivos modificados y compilación de producción verificados en la entrega. Las capturas en docs/integracion-supabase son de solicitudes reales a Supabase con datos ficticios, sin respuestas simuladas.

El historial filtra citas anteriores usando la hora de Perú y muestra un estado vacío cuando no existen. Las reservas ficticias creadas son futuras; no se desactivaron controles para fabricar citas pasadas.

## Configuración y límites de la demostración

Confirm email desactivado por solicitud explícita del usuario. Comprobado tras recargar el panel y mediante /auth/v1/settings: mailer_autoconfirm=true y disable_signup=false. No se habilitó el acceso anónimo.

Site URL localhost:8080 y seis rutas exactas de autenticación, recuperación y perfil verificadas para localhost y 127.0.0.1. El cambio de correo continúa por Supabase Auth; no se probó con un buzón alternativo. SMTP propio es necesario para enviar correos sin las restricciones del servicio de prueba de Supabase.

El analizador de seguridad advierte que admin_assign_role es SECURITY DEFINER y ejecutable por authenticated. Es intencional: comprueba auth.uid y rol administrador, rechaza pacientes y no permite retirar el propio rol admin. El rechazo con cuenta paciente se comprobó por API.
Referencia: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

Vite informa avisos de tamaño del paquete y datos de Browserslist antiguos. No impiden compilar. No hay envío automático de recordatorios; el alcance original solicita preparar una plantilla.

La versión anterior docs/perfil-paciente conserva evidencia histórica de una entrega con capturas simuladas. El informe de integración nuevo sustituye esa evidencia para evaluar la aplicación actual.

## Ampliación posterior

Verificados seis médicos disponibles, con roles doctor, especialidad y centro asignados, y seis centros en Supabase. Se añadieron cinco cuentas ficticias y cuatro centros; sus contraseñas aleatorias permanecen fuera de Git. Interruptor de tema comprobado en el panel y preferencia oscura conservada tras recargar; captura en outputs para la entrega local. TypeScript y ESLint de los archivos del tema sin errores.
