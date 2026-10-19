# Estado de verificación de la integración

Fecha de trabajo: 18 de octubre de 2026, America/Lima.

## Verificado

- Proyecto Medicitas creado en la organización opoku08's Org, ref qpkvjnykirgfgdljqirl.
- Esquema aplicado en la base nueva. No se modificó la base de Chauca.
- Tablas públicas con RLS y permisos explícitos; sin campos de contraseña en perfiles, pacientes o médicos.
- Peticiones reales sin sesión a profiles, patients, appointments y medical_notes rechazadas con código 42501.
- TypeScript, ESLint de todos los módulos modificados y compilación de producción sin errores.
- Revisión visual del acceso en la aplicación local con el diseño nuevo.
- Verificado en el panel de Supabase: Site URL localhost:8080 y las seis rutas exactas de confirmación, perfil y recuperación para localhost y 127.0.0.1 guardadas.

## Pendiente de comprobar con cuentas confirmadas

- Inicio de sesión con cuenta real, persistencia del perfil después de recargar y cambio de correo confirmado.
- Reservar, rechazar reservas concurrentes y confirmar/completar desde la cuenta médica asignada.
- Aislamiento entre dos pacientes autenticados y permisos del administrador mediante solicitudes reales.
- Entrega del correo de recuperación, apertura del enlace y cambio de contraseña.
- Revisión visual de los paneles autenticados con datos reales de prueba y en móvil.

scripts/verify-integration.mjs prepara esas comprobaciones automatizadas, pero no se ejecutó todavía: requiere cuentas de prueba confirmadas. No se presenta una prueba preparada como prueba aprobada.

## Avisos conocidos

El analizador de Supabase señala admin_assign_role por ser SECURITY DEFINER y ejecutable por usuarios autenticados. Es intencional: verifica auth.uid y el rol admin al inicio, restringe el cambio de rol propio y no acepta llamadas anónimas. Debe comprobarse su rechazo con una cuenta paciente en las pruebas de integración.
Referencia: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

La compilación informa avisos de tamaño de paquete y datos de Browserslist antiguos. La plantilla de correo de citas se puede previsualizar, pero no se conecta a un proveedor de envío. La distribución original pedía preparar una plantilla; no se afirma que exista un envío de confirmaciones o recordatorios.

No hay cuentas universales ni contraseñas de demostración precreadas. No se desplegó una función de creación de cuentas.

## Configuración para la demostración universitaria

Por solicitud explícita del usuario, se desactivó Confirm email en Authentication → Sign In / Providers. Se comprobó tras recargar el panel y consultando /auth/v1/settings: mailer_autoconfirm=true y disable_signup=false. Los registros nuevos pueden iniciar sesión sin abrir un correo. Esto no habilita el inicio de sesión anónimo ni cambia los permisos de rol.

La cuenta del propietario está confirmada y su rol administrador fue autorizado explícitamente y comprobado en el panel real. La cuenta paciente creada antes del cambio seguía sin confirmar al comprobarla; no se realizó una confirmación masiva de cuentas anteriores.
