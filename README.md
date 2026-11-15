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

Proyecto: `qpkvjnykirgfgdljqirl`, región São Paulo. No utiliza el proyecto anterior de Chauca.

1. En Supabase Authentication → URL Configuration, fija Site URL en `http://localhost:8080` y agrega como Redirect URLs `http://localhost:8080/auth`, `http://localhost:8080/recuperar` y `http://localhost:8080/perfil`. Para usar 127.0.0.1, agrega también esas tres rutas con ese host.
2. Para esta demostración universitaria, Confirm email está desactivado: las cuentas nuevas ingresan directamente con correo y contraseña. Para recuperación y cambios de correo sigue siendo necesario recibir mensajes; configura SMTP propio si necesitas enviarlos a integrantes distintos del propietario.
3. Crea una cuenta desde la aplicación. El primer administrador lo autoriza el propietario en SQL Editor, usando el ID de su propia cuenta. No hay cuentas ni contraseñas universales de demostración.

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

Los documentos en `docs/perfil-paciente` son evidencia histórica de la primera entrega. Sus capturas son simuladas y no prueban esta integración.

## Ampliación del catálogo y temas

El directorio compartido ahora incluye seis médicos habilitados, distribuidos en seis centros. Consulta docs/catalogo-demostracion.md. El acceso y los paneles incluyen un interruptor de modo claro/oscuro; la preferencia se mantiene al recargar. Las cuentas y datos adicionales son ficticios para la demostración universitaria.


## Avance 3 – Distribución de responsabilidades del equipo

Durante el desarrollo del Avance 3 del proyecto MediCitas, se establecieron responsabilidades específicas para cada integrante del equipo, con el propósito de mejorar la calidad del código, optimizar las interfaces, organizar el repositorio y mantener actualizada la documentación técnica.

### 1. Angel – Optimización del frontend

**Responsabilidad:** Revisar y optimizar los componentes principales del frontend para mejorar la organización, legibilidad y mantenibilidad del código.

**Actividades asignadas:**
- Revisar los componentes principales del frontend.
- Identificar código repetido o innecesario.
- Mejorar la organización de los componentes.
- Optimizar el código para facilitar su lectura y mantenimiento.
- Verificar que los cambios no afecten el funcionamiento de las interfaces.

**Entregables:**
- Componentes optimizados.
- Evidencias del código antes y después de las mejoras.
- Registro de los cambios realizados en GitHub.

### 2. Chauca – Refactorización y organización del código

**Responsabilidad:** Mejorar la estructura interna del proyecto mediante la refactorización del código y la organización de las ramas de trabajo.

**Actividades asignadas:**
- Organizar las ramas de trabajo del proyecto.
- Revisar los componentes existentes para identificar oportunidades de refactorización.
- Mejorar la estructura del código y la reutilización de componentes.
- Corregir posibles duplicaciones o desorganización del código.
- Comprobar que las modificaciones mantengan el funcionamiento del sistema.

**Entregables:**
- Ramas organizadas.
- Código refactorizado.
- Commits y Pull Requests con los cambios realizados.

### 3. Mya – Documentación técnica

**Responsabilidad:** Mantener organizada y actualizada la documentación técnica del proyecto, registrando las mejoras y modificaciones realizadas durante el Avance 3.

**Actividades asignadas:**
- Actualizar la documentación general del proyecto.
- Describir las mejoras realizadas durante el Avance 3.
- Documentar los cambios en la estructura del sistema.
- Organizar las evidencias proporcionadas por los integrantes.
- Apoyar en la elaboración y revisión del informe final.

**Entregables:**
- Documentación técnica actualizada.
- Descripción de las mejoras implementadas.
- Organización de las evidencias para el informe.

### 4. Frank – Optimización de interfaces y estilos

**Responsabilidad:** Mejorar la presentación visual y la organización de los estilos del sistema, garantizando uniformidad y adaptabilidad en las interfaces.

**Actividades asignadas:**
- Revisar los estilos utilizados en las diferentes interfaces.
- Identificar estilos repetidos o elementos visuales innecesarios.
- Mejorar la organización de los estilos del proyecto.
- Verificar que las interfaces mantengan una presentación uniforme y adaptable.
- Actualizar el README con información técnica del proyecto.

**Entregables:**
- Estilos e interfaces optimizados.
- Evidencias de las mejoras visuales.
- README actualizado.

### 5. Crhistian – Pruebas técnicas y gestión del repositorio

**Responsabilidad:** Verificar la estabilidad del sistema después de las modificaciones y gestionar la organización de las ramas del repositorio GitHub.

**Actividades asignadas:**
- Verificar el funcionamiento general del sistema después de las modificaciones.
- Ejecutar las pruebas técnicas mediante los comandos `npm run lint` y `npm run build`.
- Registrar los resultados obtenidos durante las pruebas.
- Revisar las ramas existentes en GitHub e identificar aquellas que ya fueron integradas.
- Realizar la limpieza de ramas que ya no sean necesarias, previa verificación de sus cambios.
- Registrar evidencias del proceso de pruebas y organización del repositorio.

**Entregables:**
- Evidencias de ejecución de pruebas.
- Registro de resultados y posibles errores encontrados.
- Capturas de la organización de ramas antes y después de la limpieza.
- Actualización del apartado de pruebas y gestión del repositorio en el informe.

---

### Organización del trabajo colaborativo

Las actividades del Avance 3 se distribuyen en cinco áreas de trabajo complementarias:

| Integrante | Área de trabajo |
|---|---|
| Angel | Optimización del frontend |
| Chauca | Refactorización y organización del código |
| Mya | Documentación técnica |
| Frank | Optimización de interfaces y estilos |
| Crhistian | Pruebas técnicas y gestión del repositorio |

Cada integrante es responsable de desarrollar las actividades asignadas y proporcionar las evidencias correspondientes, permitiendo documentar los cambios y verificar los resultados obtenidos durante esta etapa del proyecto.