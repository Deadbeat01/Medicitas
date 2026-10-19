# MediCitas

Aplicación React y TypeScript conectada al proyecto Supabase independiente **Medicitas**, administrado en la organización del usuario. Rama de integración: `feature/integracion-supabase`.

## Abrir la aplicación

Requisitos: Node.js 20 o superior y npm. No necesitas Git si descargas el ZIP de la rama.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Abre http://localhost:8080. La clave de `.env.example` es pública y solo permite las operaciones autorizadas por las políticas de la base. Nunca agregues claves secretas ni service_role a variables VITE.

## Funciones

- Inicio de sesión y registro de pacientes con Supabase Auth, registro directo sin confirmación de correo para la demostración universitaria y sesión compartida entre pantallas. No se almacenan contraseñas en tablas públicas.
- Recuperación por enlace y actualización de contraseña. El enlace debe regresar a `/recuperar`.
- Reservas con validación de motivo entre 10 y 300 caracteres, fecha futura, médico y centro correspondientes, y unicidad de horarios activos en la base.
- El médico asignado confirma, completa o cancela sus citas; el paciente solo puede cancelar sus reservas activas.
- Perfil con persistencia de nombre y teléfono. El cambio de correo se solicita mediante Auth y necesita confirmación.
- Historial de citas pasadas. Notas médicas como estructura ficticia, protegidas por rol y relación médico paciente en la base.
- Administración con estadísticas reales, tabla de cuentas y asignación de roles. Un administrador puede habilitar una cuenta como médico y asignarle especialidad y centro. No es posible autoasignarse roles desde el registro.
- Vista previa de plantilla de confirmación de citas en Comprobante. No envía correo ni finge un envío.
- Interfaz adaptable con navegación, panel de resumen, estados de carga/error y diseño para móvil.

## Configuración inicial del propietario

Proyecto: `qpkvjnykirgfgdljqirl`, región São Paulo. 

1. En Supabase Authentication → URL Configuration, fija Site URL en `http://localhost:8080` y agrega como Redirect URLs `http://localhost:8080/auth`, `http://localhost:8080/recuperar` y `http://localhost:8080/perfil`. Para usar 127.0.0.1, agrega también esas tres rutas con ese host.
2. Confirm email está desactivado: las cuentas nuevas ingresan directamente con correo y contraseña. Para recuperación y cambios de correo sigue siendo necesario recibir mensajes; configura SMTP propio si necesitas enviarlos a integrantes distintos del propietario.
3. Crea una cuenta desde la aplicación. El primer administrador lo autoriza el propietario en SQL Editor, usando el ID de su propia cuenta. 

```sql
-- Sustituye el UUID por el de TU cuenta confirmada.
update public.profiles set user_type = 'admin'
where id = 'UUID_DE_TU_CUENTA';
```

4. Vuelve a iniciar sesión. Desde Administración, autoriza las cuentas médicas registradas y asigna centro/especialidad. Para probar como paciente, usa otra cuenta de paciente.

La herramienta conectada permite crear la base pero no editar la configuración de correos del panel. Esos ajustes deben verificarse en el panel del propietario antes de dar por probado el correo real.

## Base y permisos

`supabase/migrations/20261019033915_medicitas_independiente.sql` reproduce el esquema nuevo en un proyecto vacío. Las migraciones heredadas de la base anterior están en `supabase/legacy-migrations` como referencia y no deben aplicarse en la nueva.

El registro crea perfiles con rol paciente en un trigger privado. No toma el rol de metadatos editables. Las políticas usan auth.uid y un helper privado para comprobar roles. Las funciones de trigger no son ejecutables por usuarios. La única función pública de administración verifica la sesión y el rol en el servidor. Las citas solo permiten modificar la columna status; el trigger valida las transiciones. Un índice único parcial impide reservas simultáneas para el mismo médico y horario.

## Comprobaciones

```powershell
npx tsc -p tsconfig.app.json --noEmit
npm run build
node scripts/verify-anonymous.mjs
```

`verify-anonymous.mjs` verifica rechazos reales de lectura sin sesión en la nueva base. Para las pruebas de integración con cuentas de prueba, configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY más TEST_PATIENT_EMAIL/PASSWORD, TEST_OTHER_PATIENT_EMAIL/PASSWORD y TEST_DOCTOR_EMAIL/PASSWORD como variables de entorno locales. TEST_ADMIN_EMAIL/PASSWORD es opcional; si no se proporciona, el script indica SKIP para el login administrador, que se comprueba en la sesión real del propietario. TEST_EXPECT_NOTES=true activa la comprobación de una nota ficticia previamente preparada. Ejecuta `node scripts/verify-integration.mjs`. No guardes esas contraseñas en Git.

La prueba de integración modifica y restaura el nombre del paciente y deja una cita ficticia completada, a 120 días, como evidencia. Usa cuentas dedicadas de prueba. Comprueba persistencia, aislamiento, rechazo de escalada de rol, dos reservas concurrentes y transiciones por rol. No verifica entrega de correos, que requiere confirmar recepción en la bandeja del destinatario.

## Trabajo integrado del equipo

- Mya: se tomó como referencia la validación por campo y motivo de `feature/gestion-citas`; se añadió la restricción definitiva en base.
- Frank: se revisaron la recuperación y la plantilla de `feature/recuperacion-notificaciones`; se sustituyeron los pasos simulados por el flujo Auth de recuperación y se mantiene la plantilla como vista previa sin envío.
- Crhistian: se revisó el panel de `feature/rol-administrador`; se conectaron estadísticas y roles al esquema nuevo.
- Ángel: se integró `feature/perfil-paciente` y se sustituyó la sesión manual para permitir persistencia autorizada.
- Chauca: `feature/autenticacion` no tenía avances sobre el login original al revisar; esta rama implementa la migración a Supabase Auth que faltaba.



## Ampliación del catálogo y temas

El directorio compartido incluye 24 médicos ficticios habilitados, distribuidos en seis centros con cuatro médicos por sede. El acceso y los paneles incluyen un interruptor de modo claro/oscuro; la preferencia se mantiene al recargar. Las cuentas y datos adicionales son ficticios para la demostración universitaria.

## Médicos por sede y organización de cuentas

En Administración, la sección Médicos por sede permite consultar los equipos, buscar por nombre, correo o código MED, filtrar por sede y cambiar sede o especialidad mediante Guardar asignación. Se muestran ocho resultados por página. También se incluyen las cuentas médicas pendientes de asignación; para autorizar un profesional nuevo se utiliza Asignar un rol.

Cada médico tiene una sede actual. Los cambios no modifican el centro guardado en las citas anteriores. La operación utiliza admin_assign_role, que comprueba el rol administrador en el servidor; un paciente no puede asignar médicos. No se cambió el esquema ni se relajaron políticas.

Los códigos MED y USR son referencias derivadas del identificador UUID de cada cuenta; no son números de colegiatura. El identificador completo aparece al colocar el cursor sobre el código. En Cuentas registradas, la búsqueda funciona por nombre, correo o código y el registro muestra Hoy, Ayer o Hace X días, con fecha exacta en hora de Perú.

El catálogo se amplió mediante 18 registros ficticios adicionales en el Supabase compartido. Las cuentas y sus contraseñas no forman parte de las migraciones ni del repositorio; los compañeros que usan el mismo Supabase verán el catálogo existente. En una base nueva hay que registrar las cuentas y asignarlas desde Administración.

Para comprobar el catálogo y el rechazo de asignaciones desde un paciente, configura VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, TEST_PATIENT_EMAIL y TEST_PATIENT_PASSWORD y ejecuta node scripts/verify-directory.mjs.
