# MediCitas: proyecto integrado para la presentación

Actualización: 16 de noviembre de 2026. Esta entrega reúne el frontend, los filtros administrativos, la documentación de Mya, las vistas separadas de perfil e historial y la corrección de las notas médicas.

## Abrir sin instalar dependencias

1. Extraer el ZIP completo. No ejecutar desde la ventana de WinRAR.
2. Entrar en la carpeta `Medicitas`.
3. Ejecutar `ABRIR-PROYECTO.cmd` o escribir `npm.cmd start` en CMD.
4. Abrir la dirección que imprime la terminal, normalmente `http://127.0.0.1:8090`.
5. Mantener esa terminal abierta.

Esta opción utiliza la compilación incluida en `dist` y necesita Node.js 20 o superior. No necesita instalar Vite. La autenticación y los datos siguen conectados a Supabase remoto, por lo que necesitan Internet y que ese servicio esté disponible.

## Abrir y editar el código

Ejecutar `INICIAR-DESARROLLO.cmd`. Instala dependencias con `npm ci` cuando faltan y luego inicia Vite. También se puede ejecutar desde CMD:

```cmd
npm.cmd ci
npm.cmd run dev
```

Usar la dirección Local que indique Vite. El puerto puede cambiar si ya hay otro servidor abierto. `.env.local` contiene solamente la configuración pública del cliente; no incluye claves administrativas.

## Recorrido sugerido de exposición

### Ángel: frontend y administración

Mostrar la tarjeta de una cita, los filtros Activas/Completadas/Canceladas/Todas y el comprobante. En la cuenta administradora, abrir `/admin`, buscar por nombre o correo y combinar rol con fecha. Probar Registrados hoy y Limpiar filtros. En Asignar rol, localizar una cuenta y seleccionarla. Cambiar la búsqueda para mostrar que se elimina la selección anterior y se bloquea Guardar rol. No es necesario cambiar permisos para explicar el filtro.

### Chauca: estructura y vistas separadas

Mostrar `src/components`, `src/pages`, `src/hooks` y `src/lib`. Explicar que el listado conserva la consulta y delega la presentación en AppointmentCard. En la cuenta paciente, abrir Mi perfil y luego Historial. Ahora tienen rutas separadas: `/perfil` y `/historial`. Los commits conservan la autoría registrada de cada aporte del equipo.

### Mya: documentación

Abrir README y `docs/ESTRUCTURA-SISTEMA.md`. Relacionar cada carpeta con una vista. Mostrar los PR #7 y #8 integrados en develop y el registro de la rama de esta entrega.

### Frank: presentación visual

Cambiar entre modo claro y oscuro. Recargar una vista para comprobar la preferencia. Mostrar los mismos encabezados, tarjetas y estados en diferentes páginas. Para mostrar adaptabilidad, reducir manualmente el ancho de la ventana y revisar que se pueda navegar.

### Crhistian: verificaciones y repositorio

Abrir los logs incluidos en `Evidencias`. Ejecutar `VERIFICAR-PROYECTO.cmd` para repetir las comprobaciones en esta máquina. Mostrar la captura aportada del antes y después de las ramas y explicar qué integración respalda cada eliminación.

## Acceso y datos para presentar

Las cuentas de paciente y médico creadas para las pruebas se entregan por separado en el archivo privado del paquete. Para `/admin`, utilizar la cuenta administradora habitual del propietario. El registro público crea pacientes y no otorga permisos administrativos.

La compilación incluida no lleva una copia de la base de datos ni evita la autenticación. Las migraciones del esquema están incluidas como código del proyecto. Los resultados automatizados usan datos controlados y no sustituyen una prueba integral de todos los flujos del servidor.

## Qué se comprobó en esta versión

- 89 comprobaciones del frontend, incluidos perfil e historial separados.
- Revisión de tipos con TypeScript.
- Lint sin errores, conservando siete advertencias de Fast Refresh en componentes de UI.
- Compilación de producción. Conserva avisos de Browserslist y del tamaño del paquete JavaScript.
- Inicio sencillo mediante un servidor local de la compilación.

Los detalles del recorrido real de navegador y los resultados se encuentran en las evidencias del paquete. Los documentos y el PowerPoint anteriores describen el estado previo a esta integración: esta entrega incorpora la corrección posterior del lint y cuatro comprobaciones adicionales.
